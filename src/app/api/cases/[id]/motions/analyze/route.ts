import { NextRequest } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { openai } from '@ai-sdk/openai'
import { streamText, createUIMessageStream, createUIMessageStreamResponse } from 'ai'

export const maxDuration = 120

function buildMotionAnalysisSystemPrompt(
  caseData: {
    name: string
    case_type: string
    summary: string | null
    plaintiff_name: string | null
    defendant_name: string | null
    jurisdiction: string | null
    case_number: string | null
  },
  facts: string[],
  claims: { claim_number: number; title: string; description: string; relief_type: string }[],
  evidenceSummary: string
): string {
  const partyInfo = caseData.plaintiff_name && caseData.defendant_name
    ? `${caseData.plaintiff_name} v. ${caseData.defendant_name}`
    : 'Parties not specified'

  const factsSection = facts.length > 0
    ? facts.map((f, i) => `${i + 1}. ${f}`).join('\n')
    : 'No facts have been documented yet.'

  const claimsSection = claims.length > 0
    ? claims.map(c => `- Claim ${c.claim_number}: ${c.title} (${c.relief_type}) - ${c.description}`).join('\n')
    : 'No claims for relief documented.'

  return `You are a senior litigation analyst reviewing a motion filed in the case "${caseData.name}".

CASE CONTEXT:
- Case: ${caseData.name}
- Case Number: ${caseData.case_number || 'Not assigned'}
- Type: ${caseData.case_type}
- Jurisdiction: ${caseData.jurisdiction || 'Not specified'}
- Parties: ${partyInfo}
- Summary: ${caseData.summary || 'No summary provided'}

ESTABLISHED FACTS:
${factsSection}

CLAIMS FOR RELIEF:
${claimsSection}

EXISTING EVIDENCE:
${evidenceSummary || 'No evidence summary available.'}

Analyze the motion provided and deliver a comprehensive analysis with the following sections:

1. **EXECUTIVE SUMMARY** (2-3 sentences)
   Provide a concise overview of the motion, its purpose, and likely impact on the case.

2. **KEY ARGUMENTS MADE** (bulleted list)
   List each distinct argument presented in the motion. For each argument, note the page or paragraph reference where it appears.

3. **STRENGTHS OF THE MOTION** (what is well-argued)
   Identify the strongest legal and factual arguments. Explain why they are effective, citing specific language, authorities, or evidence referenced.

4. **WEAKNESSES & VULNERABILITIES** (what can be attacked)
   Identify logical gaps, unsupported claims, mischaracterized authority, or factual weaknesses that opposing counsel could exploit.

5. **OPPOSING ARGUMENTS** (how to counter each point)
   For each key argument in the motion, provide a specific counter-argument with suggested authorities or factual bases.

6. **PROCEDURAL ISSUES** (any procedural defects)
   Note any problems with timeliness, standing, proper notice, required certifications, formatting, or compliance with local rules.

7. **STRATEGIC RECOMMENDATIONS** (next steps)
   Provide specific, actionable next steps ranked by priority and urgency.

8. **RELEVANT CASE LAW** (cases that help or hurt)
   Identify precedents that strengthen or weaken the motion's position. Note whether each case helps or hurts and explain why.

Be specific, cite page/paragraph numbers from the motion text when possible, and focus on actionable intelligence. Use markdown formatting with headers, bullets, and bold text for emphasis.`
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
    const supabase = getSupabase()

    const { motion_text, document_id } = await request.json()

    if (!motion_text && !document_id) {
      return new Response('Either motion_text or document_id is required', { status: 400 })
    }

    // Fetch case data with related entities
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select(`
        *,
        case_facts(fact_text, category, is_disputed),
        claims_for_relief(claim_number, title, description, relief_type),
        documents(id, name, doc_type, content_text)
      `)
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return new Response('Case not found', { status: 404 })
    }

    // Get the motion text - either provided directly or from a document
    let motionContent = motion_text || ''

    if (document_id && !motion_text) {
      const doc = caseData.documents?.find(
        (d: { id: string; content_text: string | null }) => d.id === document_id
      )
      if (doc?.content_text) {
        motionContent = doc.content_text
      } else {
        // Fetch document content separately if not in the join
        const { data: docData } = await supabase
          .from('documents')
          .select('content_text, name')
          .eq('id', document_id)
          .eq('case_id', caseId)
          .single()

        if (docData?.content_text) {
          motionContent = docData.content_text
        } else {
          return new Response('Document not found or has no text content', { status: 404 })
        }
      }
    }

    if (!motionContent.trim()) {
      return new Response('Motion text is empty', { status: 400 })
    }

    // Build case context
    const facts = caseData.case_facts?.map(
      (f: { fact_text: string; category: string; is_disputed: boolean }) =>
        `[${f.category}${f.is_disputed ? ' - DISPUTED' : ''}] ${f.fact_text}`
    ) || []

    const claims = caseData.claims_for_relief?.map(
      (c: { claim_number: number; title: string; description: string; relief_type: string }) => ({
        claim_number: c.claim_number,
        title: c.title,
        description: c.description,
        relief_type: c.relief_type,
      })
    ) || []

    const evidenceDocs = caseData.documents
      ?.filter((d: { doc_type: string }) =>
        ['exhibit', 'deposition', 'discovery'].includes(d.doc_type)
      )
      .map((d: { name: string; doc_type: string }) => `- ${d.name} (${d.doc_type})`)
      .join('\n') || ''

    const systemPrompt = buildMotionAnalysisSystemPrompt(
      caseData,
      facts,
      claims,
      evidenceDocs
    )

    // Stream the analysis using the same pattern as the chat route
    const stream = createUIMessageStream({
      async execute({ writer }) {
        const result = streamText({
          model: openai('gpt-4o'),
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: `Please analyze the following motion:\n\n---\n\n${motionContent}`,
            },
          ],
          temperature: 0.3,
        })

        const messageId = crypto.randomUUID()

        for await (const chunk of result.textStream) {
          writer.write({
            type: 'text-delta',
            id: messageId,
            delta: chunk,
          })
        }
      },
    })

    return createUIMessageStreamResponse({ stream })
  } catch (err) {
    console.error('POST /api/cases/[id]/motions/analyze error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}
