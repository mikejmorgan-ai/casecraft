import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { searchAll } from '@/lib/pinecone/search'
import OpenAI from 'openai'

const openai = new OpenAI()

export const maxDuration = 120

interface Weakness {
  id: string
  category: 'evidence' | 'legal' | 'procedural' | 'strategic'
  severity: 'critical' | 'major' | 'minor'
  title: string
  description: string
  impact: string
  fixes: Fix[]
  citations: string[]
}

interface Fix {
  action: string
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  deadline?: string
  details: string
}

const WEAKNESS_SYSTEM_PROMPT = `You are a senior litigation strategist analyzing a legal case for weaknesses and vulnerabilities.

Your job is to:
1. Identify gaps in evidence
2. Find weak legal arguments
3. Spot procedural vulnerabilities
4. Anticipate opposing counsel's attacks
5. Recommend specific fixes

For each weakness, provide:
- Clear description of the problem
- Why it matters (impact on case outcome)
- Specific, actionable fixes ranked by effort/impact
- Supporting citations when available

Categories:
- evidence: Missing documents, weak testimony, authentication issues
- legal: Statutory interpretation problems, unfavorable precedent, jurisdictional issues
- procedural: Deadline risks, filing errors, standing questions
- strategic: Poor positioning, missed opportunities, credibility concerns

Severity:
- critical: Could lose the case
- major: Significantly weakens position
- minor: Should address but not urgent

Output as JSON:
{
  "weaknesses": [
    {
      "id": "w1",
      "category": "evidence|legal|procedural|strategic",
      "severity": "critical|major|minor",
      "title": "Brief title",
      "description": "What the weakness is",
      "impact": "Why it matters",
      "fixes": [
        {
          "action": "What to do",
          "effort": "low|medium|high",
          "impact": "low|medium|high",
          "deadline": "When (if applicable)",
          "details": "How to implement"
        }
      ],
      "citations": ["Source documents or cases"]
    }
  ],
  "summary": {
    "critical_count": 0,
    "major_count": 0,
    "minor_count": 0,
    "top_priority": "The most important thing to address",
    "overall_risk": "low|medium|high"
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
    const { focusAreas = [] } = body

    // Get case data
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select(`
        *,
        case_facts(*),
        documents(id, name, doc_type, content_text)
      `)
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Build context
    const factsContext = caseData.case_facts
      ?.map((f: { category: string; fact_text: string; is_disputed: boolean }) => 
        `[${f.category}${f.is_disputed ? ' - DISPUTED' : ''}] ${f.fact_text}`)
      .join('\n') || 'No facts documented.'

    const docsContext = caseData.documents
      ?.map((d: { name: string; doc_type: string }) => `- ${d.name} (${d.doc_type})`)
      .join('\n') || 'No documents uploaded.'

    // Search for relevant legal context
    const searchQuery = `${caseData.name} weaknesses vulnerabilities counterarguments opposing arguments`
    const pineconeResults = await searchAll(searchQuery, { topK: 15, minScore: 0.5 })
    
    const legalContext = pineconeResults
      .map(r => `[${r.source}]\n${r.content}`)
      .join('\n\n')
      .substring(0, 8000)

    // Generate analysis prompt
    const analysisPrompt = `Analyze this legal case for weaknesses and vulnerabilities:

## CASE INFORMATION
**Name:** ${caseData.name}
**Type:** ${caseData.case_type}
**Plaintiff:** ${caseData.plaintiff_name || 'N/A'}
**Defendant:** ${caseData.defendant_name || 'N/A'}

## CASE SUMMARY
${caseData.summary || 'No summary provided.'}

## DOCUMENTED FACTS
${factsContext}

## AVAILABLE DOCUMENTS
${docsContext}

## LEGAL RESEARCH & PRECEDENTS
${legalContext || 'No additional research available.'}

${focusAreas.length > 0 ? `
## FOCUS AREAS (prioritize these)
${focusAreas.map((a: string) => `- ${a}`).join('\n')}
` : ''}

---

Identify ALL weaknesses in this case, from the perspective of:
1. What could opposing counsel exploit?
2. What might the judge question?
3. What evidence is missing or weak?
4. What legal arguments have vulnerabilities?

Be thorough but specific. For each weakness, provide actionable fixes with realistic effort/impact assessments.

Return your analysis as valid JSON.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: WEAKNESS_SYSTEM_PROMPT },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content || '{}'
    
    let result
    try {
      result = JSON.parse(content)
    } catch {
      result = { weaknesses: [], summary: { overall_risk: 'unknown' } }
    }

    // Sort weaknesses by severity
    const severityOrder = { critical: 0, major: 1, minor: 2 }
    result.weaknesses.sort((a: Weakness, b: Weakness) => 
      severityOrder[a.severity] - severityOrder[b.severity]
    )

    return NextResponse.json({
      success: true,
      caseId,
      caseName: caseData.name,
      analysis: result,
      timestamp: new Date().toISOString(),
    })

  } catch (err) {
    console.error('Weakness analysis error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
