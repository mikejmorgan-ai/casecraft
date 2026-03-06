import { NextRequest } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export const maxDuration = 120

type BriefType = 'response' | 'motion' | 'memorandum' | 'opposition' | 'reply'
type BriefTone = 'formal' | 'aggressive' | 'measured'

interface BriefDraftRequest {
  brief_type: BriefType
  topic: string
  instructions: string
  tone: BriefTone
  include_case_law: boolean
  claim_ids: string[]
}

const BRIEF_TYPE_LABELS: Record<BriefType, string> = {
  response: 'Response Brief',
  motion: 'Motion',
  memorandum: 'Memorandum of Law',
  opposition: 'Opposition Brief',
  reply: 'Reply Brief',
}

function buildBriefSystemPrompt(
  briefType: BriefType,
  tone: BriefTone,
  includeCaseLaw: boolean,
  caseData: {
    name: string
    case_number: string | null
    jurisdiction: string | null
    plaintiff_name: string | null
    defendant_name: string | null
    summary: string | null
  },
  claims: Array<{
    claim_number: number
    title: string
    description: string
    legal_basis: string | null
    relief_type: string
  }>,
  evidence: Array<{
    description: string | null
    relevance: string
    tier: number | null
    is_smoking_gun: boolean
  }>,
  facts: Array<{
    category: string
    fact_text: string
  }>
): string {
  const briefTypeLabel = BRIEF_TYPE_LABELS[briefType]

  const claimsText = claims.length > 0
    ? claims.map(c =>
        `  ${c.claim_number}. ${c.title} (${c.relief_type})\n     Legal Basis: ${c.legal_basis || 'Not specified'}\n     ${c.description}`
      ).join('\n')
    : 'No specific claims selected.'

  const topEvidenceText = evidence.length > 0
    ? evidence
        .sort((a, b) => (a.tier || 99) - (b.tier || 99))
        .slice(0, 15)
        .map(e => {
          const tierLabel = e.tier ? `[Tier ${e.tier}]` : '[Unranked]'
          const smokingGun = e.is_smoking_gun ? ' **CRITICAL EVIDENCE**' : ''
          return `  ${tierLabel}${smokingGun} (${e.relevance}) ${e.description || 'No description'}`
        })
        .join('\n')
    : 'No evidence linked to selected claims.'

  const factsText = facts.length > 0
    ? facts.map(f => `  [${f.category.toUpperCase()}] ${f.fact_text}`).join('\n')
    : 'No case facts documented.'

  const clientContext = briefType === 'response' || briefType === 'opposition'
    ? `Your client: ${caseData.defendant_name || 'Defendant'} (defending against claims)`
    : `Your client: ${caseData.plaintiff_name || 'Plaintiff'} (asserting claims)`

  const caseLawInstruction = includeCaseLaw
    ? `- Cite relevant case law and statutes using proper Bluebook format
- Include persuasive authority from the jurisdiction (${caseData.jurisdiction || 'as applicable'})
- Reference landmark cases that support the arguments`
    : `- Focus on statutory interpretation and factual arguments
- Minimize case law citations unless directly on point`

  return `You are an experienced litigation attorney drafting a ${briefTypeLabel} for ${caseData.name}.
Jurisdiction: ${caseData.jurisdiction || 'Not specified'}
Case Number: ${caseData.case_number || 'Not assigned'}
${clientContext}

Parties:
  Plaintiff: ${caseData.plaintiff_name || 'Not specified'}
  Defendant: ${caseData.defendant_name || 'Not specified'}

Case Summary: ${caseData.summary || 'No summary available.'}

Case Claims:
${claimsText}

Key Evidence:
${topEvidenceText}

Relevant Facts:
${factsText}

Draft a professional legal ${briefTypeLabel.toLowerCase()} that:
- Uses proper legal citation format (Bluebook)
- Includes a caption and proper heading
- Has clear argument structure with numbered sections
${caseLawInstruction}
- References specific evidence from the case record
- Maintains a ${tone} but professional tone
- Includes a conclusion with specific relief requested

Format the output in proper legal brief style with:
I. INTRODUCTION
II. STATEMENT OF FACTS
III. ARGUMENT
  A. [First argument]
  B. [Second argument]
IV. CONCLUSION

Use markdown formatting for readability while maintaining legal document structure.
Bold case names in citations. Use proper section numbering and indentation.`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }
    const supabase = await getSupabase()

    const body: BriefDraftRequest = await request.json()
    const {
      brief_type,
      topic,
      instructions,
      tone,
      include_case_law,
      claim_ids,
    } = body

    // Validate required fields
    if (!brief_type || !topic) {
      return new Response('Missing required fields: brief_type and topic', { status: 400 })
    }

    // Fetch case data
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return new Response('Case not found', { status: 404 })
    }

    // Fetch claims for the case (filtered by claim_ids if provided)
    let claimsQuery = supabase
      .from('claims_for_relief')
      .select('*')
      .eq('case_id', caseId)

    if (claim_ids && claim_ids.length > 0) {
      claimsQuery = claimsQuery.in('id', claim_ids)
    }

    const { data: claims } = await claimsQuery

    // Fetch evidence linked to selected claims
    let evidence: Array<{
      description: string | null
      relevance: string
      tier: number | null
      is_smoking_gun: boolean
    }> = []

    if (claims && claims.length > 0) {
      const claimDbIds = claims.map(c => c.id)
      const { data: claimEvidence } = await supabase
        .from('claim_evidence')
        .select('*')
        .in('claim_id', claimDbIds)

      if (claimEvidence) {
        evidence = claimEvidence.map(e => ({
          description: e.description,
          relevance: e.relevance,
          tier: e.tier,
          is_smoking_gun: e.is_smoking_gun,
        }))
      }
    }

    // Fetch case facts
    const { data: facts } = await supabase
      .from('case_facts')
      .select('category, fact_text')
      .eq('case_id', caseId)
      .limit(30)

    // Build the system prompt
    const systemPrompt = buildBriefSystemPrompt(
      brief_type,
      tone,
      include_case_law,
      {
        name: caseData.name,
        case_number: caseData.case_number,
        jurisdiction: caseData.jurisdiction,
        plaintiff_name: caseData.plaintiff_name,
        defendant_name: caseData.defendant_name,
        summary: caseData.summary,
      },
      (claims || []).map(c => ({
        claim_number: c.claim_number,
        title: c.title,
        description: c.description,
        legal_basis: c.legal_basis,
        relief_type: c.relief_type,
      })),
      evidence,
      (facts || []).map(f => ({
        category: f.category,
        fact_text: f.fact_text,
      }))
    )

    // Build the user prompt with topic and instructions
    const userPrompt = `Draft a ${BRIEF_TYPE_LABELS[brief_type]} on the following topic:

**Topic:** ${topic}

${instructions ? `**Additional Instructions:**\n${instructions}` : ''}

${claim_ids && claim_ids.length > 0
  ? `Focus the arguments on the ${claim_ids.length} selected claim(s) for relief.`
  : 'Address all claims for relief in the case.'}

Please draft the complete brief now.`

    // Stream the response using the AI SDK
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.4,
    })

    return result.toTextStreamResponse()
  } catch (err) {
    console.error('POST /api/cases/[id]/briefs/draft error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}
