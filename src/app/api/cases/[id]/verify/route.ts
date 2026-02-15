import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { searchAll } from '@/lib/pinecone/search'
import OpenAI from 'openai'

const openai = new OpenAI()

export const maxDuration = 120

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _VerificationResult = {
  claim: string
  status: 'verified' | 'contradicted' | 'unverified' | 'partially_verified'
  confidence: number
  sources: Array<{
    document: string
    excerpt: string
    relevance: number
  }>
  notes: string
}

const VERIFICATION_PROMPT = `You are a legal fact-checker with zero tolerance for hallucination. Your job is to verify claims against provided source documents.

For each claim:
1. Search the provided documents for supporting or contradicting evidence
2. Mark status:
   - verified: Direct support found in documents
   - contradicted: Document evidence contradicts the claim
   - partially_verified: Some support but incomplete or qualified
   - unverified: No relevant evidence found in documents
3. Quote exact excerpts that support your determination
4. Be CONSERVATIVE - if evidence is ambiguous, mark as partially_verified or unverified

CRITICAL RULES:
- Never fabricate sources or excerpts
- If you can't find evidence, say "unverified" - don't guess
- Quote exact text from documents when citing
- Note page numbers or section references when available

Output as JSON:
{
  "results": [
    {
      "claim": "The original claim text",
      "status": "verified|contradicted|unverified|partially_verified",
      "confidence": 0-100,
      "sources": [
        {
          "document": "Source document name",
          "excerpt": "Exact quote from document",
          "relevance": 0-100
        }
      ],
      "notes": "Explanation of determination"
    }
  ],
  "summary": {
    "verified_count": 0,
    "contradicted_count": 0,
    "unverified_count": 0,
    "overall_credibility": 0-100
  }
}`

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { claims } = body

    if (!claims || !Array.isArray(claims) || claims.length === 0) {
      return NextResponse.json({ error: 'Claims array required' }, { status: 400 })
    }

    // Get case documents
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select(`
        *,
        documents(id, name, doc_type, content_text)
      `)
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Build document context
    const docsContext = caseData.documents
      ?.filter((d: { content_text: string | null }) => d.content_text)
      .map((d: { name: string; content_text: string }) => 
        `=== DOCUMENT: ${d.name} ===\n${d.content_text}`)
      .join('\n\n---\n\n')
      .substring(0, 30000) || ''

    // Search Pinecone for additional context
    const allClaimsText = claims.join(' ')
    const pineconeResults = await searchAll(allClaimsText, { topK: 20, minScore: 0.5 })
    
    const pineconeContext = pineconeResults
      .map(r => `=== SOURCE: ${r.source} ===\n${r.content}`)
      .join('\n\n---\n\n')
      .substring(0, 20000)

    // Build verification prompt
    const verificationPrompt = `Verify the following claims against the provided documents:

## CLAIMS TO VERIFY
${claims.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

## CASE DOCUMENTS
${docsContext || 'No case documents available.'}

## ADDITIONAL SOURCES (Knowledge Base)
${pineconeContext || 'No additional sources available.'}

---

For EACH claim above, determine if it can be verified, contradicted, or remains unverified based ONLY on the provided documents.

Return your verification as valid JSON.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: VERIFICATION_PROMPT },
        { role: 'user', content: verificationPrompt }
      ],
      temperature: 0.2, // Low temperature for factual accuracy
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content || '{}'
    
    let result
    try {
      result = JSON.parse(content)
    } catch {
      result = { results: [], summary: { overall_credibility: 0 } }
    }

    return NextResponse.json({
      success: true,
      caseId,
      caseName: caseData.name,
      verification: result,
      documentsChecked: caseData.documents?.length || 0,
      pineconeSourcesUsed: pineconeResults.length,
      timestamp: new Date().toISOString(),
    })

  } catch (err) {
    console.error('Verification error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
