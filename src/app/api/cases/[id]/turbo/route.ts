import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { searchAll } from '@/lib/pinecone/search'
import OpenAI from 'openai'
import { applyRateLimit } from '@/lib/rate-limit'
import { enforceUsageLimit } from '@/lib/usage/limits'

const openai = new OpenAI()

export const maxDuration = 120

interface TurnResult {
  turn: number
  party: 'plaintiff' | 'defendant'
  action: string
  evidence_cited: string
  judge_ruling: 'sustained' | 'overruled' | 'admitted' | 'excluded' | 'granted' | 'denied'
  impact: 'favorable' | 'unfavorable' | 'neutral'
  reasoning: string
}

interface SimulationResponse {
  turns?: TurnResult[]
  plaintiff_final_score?: number
  defendant_final_score?: number
  vulnerabilities?: string[]
  path_to_100?: string[]
}

interface CaseData {
  id: string
  name: string
  case_number?: string | null
  case_type?: string | null
  jurisdiction?: string | null
  summary?: string | null
  plaintiff_name?: string | null
  defendant_name?: string | null
  case_facts?: { fact_text: string }[]
}

/**
 * Build dynamic evidence queries based on case type and available data
 */
function buildEvidenceQueries(caseData: CaseData): string[] {
  const queries: string[] = []
  const caseType = caseData.case_type || 'civil'

  // Generic queries that apply to all case types
  queries.push('key evidence supporting plaintiff claims')
  queries.push('key evidence supporting defendant position')
  queries.push('expert witness testimony declarations')
  queries.push('discovery responses document production')

  // Add case-type specific queries
  switch (caseType) {
    case 'property':
      queries.push('property rights ownership chain of title')
      queries.push('zoning ordinance land use regulations')
      queries.push('survey records property boundaries')
      queries.push('permits licenses governmental approval')
      break
    case 'contract':
      queries.push('contract terms conditions agreement')
      queries.push('breach of contract damages evidence')
      queries.push('performance obligations delivery')
      queries.push('communications negotiations correspondence')
      break
    case 'tort':
      queries.push('negligence duty of care breach')
      queries.push('causation damages injuries')
      queries.push('liability insurance coverage')
      queries.push('medical records expert opinions')
      break
    case 'criminal':
      queries.push('evidence chain of custody')
      queries.push('witness statements testimony')
      queries.push('police reports investigation')
      queries.push('alibi defense evidence')
      break
    case 'family':
      queries.push('custody best interests child')
      queries.push('financial records income assets')
      queries.push('parenting agreements visitation')
      queries.push('domestic relations support')
      break
    case 'constitutional':
      queries.push('constitutional rights violations')
      queries.push('statutory interpretation precedent')
      queries.push('governmental action authority')
      queries.push('civil liberties due process')
      break
    case 'administrative':
      queries.push('agency decision administrative record')
      queries.push('regulatory compliance violations')
      queries.push('permit denial appeal')
      queries.push('procedural requirements notice')
      break
    default:
      // Civil and other types
      queries.push('liability damages evidence')
      queries.push('statutory requirements compliance')
      queries.push('precedent case law authority')
      queries.push('procedural motions rulings')
  }

  // Add queries based on party names if available
  if (caseData.plaintiff_name) {
    queries.push(`${caseData.plaintiff_name} claims evidence`)
  }
  if (caseData.defendant_name) {
    queries.push(`${caseData.defendant_name} defense evidence`)
  }

  return queries
}

/**
 * Build case summary from database fields
 */
function buildCaseSummary(caseData: CaseData): string {
  // If summary exists, use it
  if (caseData.summary) {
    return caseData.summary
  }

  // Build summary from available fields
  const parts: string[] = []

  // Party names
  if (caseData.plaintiff_name && caseData.defendant_name) {
    parts.push(`This case involves ${caseData.plaintiff_name} (plaintiff) against ${caseData.defendant_name} (defendant).`)
  } else if (caseData.plaintiff_name) {
    parts.push(`The plaintiff in this case is ${caseData.plaintiff_name}.`)
  } else if (caseData.defendant_name) {
    parts.push(`The defendant in this case is ${caseData.defendant_name}.`)
  }

  // Case type and jurisdiction
  if (caseData.case_type && caseData.jurisdiction) {
    parts.push(`This is a ${caseData.case_type} case in ${caseData.jurisdiction}.`)
  } else if (caseData.case_type) {
    parts.push(`This is a ${caseData.case_type} case.`)
  } else if (caseData.jurisdiction) {
    parts.push(`This case is in ${caseData.jurisdiction}.`)
  }

  // If we have case facts, summarize the key disputed and undisputed facts
  if (caseData.case_facts && caseData.case_facts.length > 0) {
    const factCount = caseData.case_facts.length
    parts.push(`The case involves ${factCount} documented fact${factCount > 1 ? 's' : ''}.`)
  }

  if (parts.length === 0) {
    return 'Analyze the evidence and case facts to determine the strength of each party\'s position.'
  }

  return parts.join(' ')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting (AI operations: 10 req/min)
  const rateLimitResponse = await applyRateLimit(request, 'ai')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Enforce usage limits for simulations
    const usageLimitResponse = await enforceUsageLimit(user.id, 'turbo_simulations')
    if (usageLimitResponse) return usageLimitResponse

    // Get case data
    const { data: caseData } = await supabase
      .from('cases')
      .select('*, case_facts(*)')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Build dynamic evidence queries based on case data
    const evidenceQueries = buildEvidenceQueries(caseData)

    const allEvidence: { query: string; docs: { source: string; content: string; score: number }[] }[] = []
    let totalDocsFound = 0

    for (const query of evidenceQueries) {
      try {
        const results = await searchAll(query, { topK: 3, minScore: 0.5 })
        totalDocsFound += results.length
        allEvidence.push({
          query,
          docs: results.map(r => ({
            source: r.metadata.source || r.metadata.filename || 'Unknown',
            content: r.content.substring(0, 500),
            score: r.score,
          })),
        })
      } catch (searchError) {
        console.error(`Search error for query "${query}":`, searchError)
        allEvidence.push({ query, docs: [] })
      }
    }

    // Generate warning if low document count
    const warning = totalDocsFound < 5
      ? `Only ${totalDocsFound} document chunks found in Pinecone. Import more documents for better simulation accuracy.`
      : undefined

    // Build evidence summary for AI
    const evidenceSummary = allEvidence.map(e =>
      `\n### ${e.query}\n${e.docs.map(d => `- [${d.source}] (${(d.score * 100).toFixed(0)}%): ${d.content.substring(0, 200)}...`).join('\n')}`
    ).join('\n')

    // Build case summary from database fields
    const caseSummary = buildCaseSummary(caseData)

    // Have the judge simulate the trial with turns
    const simulationPrompt = `You are presiding as judge over ${caseData.name}${caseData.case_number ? ` (Case #${caseData.case_number})` : ''}.

CASE SUMMARY:
${caseSummary}

EVIDENCE FROM CASE FILES:
${evidenceSummary}

CASE FACTS:
${caseData.case_facts?.map((f: { fact_text: string }) => `- ${f.fact_text}`).join('\n') || 'No facts entered'}

INSTRUCTIONS:
Simulate 10 critical turns of this case. For each turn, one party presents evidence or makes an argument, and you rule on it. Be specific - cite actual documents.

Return ONLY valid JSON in this exact format:
{
  "turns": [
    {
      "turn": 1,
      "party": "plaintiff",
      "action": "Moves to admit key evidence",
      "evidence_cited": "document_name.pdf",
      "judge_ruling": "admitted",
      "impact": "favorable",
      "reasoning": "Relevant to the central claims in this case"
    }
  ],
  "plaintiff_final_score": 83,
  "defendant_final_score": 17,
  "vulnerabilities": ["Weakness 1", "Weakness 2"],
  "path_to_100": ["Action to strengthen case 1", "Action to strengthen case 2"]
}

Be realistic. Use actual document names from the evidence. Score must total 100.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: simulationPrompt }],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const aiResponse = response.choices[0]?.message?.content || '{}'

    // Parse JSON from response
    let parsed: SimulationResponse
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) as SimulationResponse : { turns: [], plaintiff_final_score: 50, defendant_final_score: 50 }
    } catch {
      parsed = { turns: [], plaintiff_final_score: 50, defendant_final_score: 50, vulnerabilities: [], path_to_100: [] }
    }

    // Calculate statistics
    const turns = parsed.turns || []
    const plaintiffScore = parsed.plaintiff_final_score || 50
    const defendantScore = parsed.defendant_final_score || 50

    const favorableTurns = turns.filter((t: TurnResult) => t.impact === 'favorable').length
    const unfavorableTurns = turns.filter((t: TurnResult) => t.impact === 'unfavorable').length
    const neutralTurns = turns.filter((t: TurnResult) => t.impact === 'neutral').length

    // Build critical evidence list
    const criticalEvidence = turns.map((t: TurnResult) => ({
      doc: t.evidence_cited,
      status: t.judge_ruling,
      impact: t.impact,
    }))

    return NextResponse.json({
      success: true,
      warning,
      stats: {
        total_turns: turns.length,
        favorable: favorableTurns,
        unfavorable: unfavorableTurns,
        neutral: neutralTurns,
        plaintiff_score: plaintiffScore,
        defendant_score: defendantScore,
        win_probability: plaintiffScore,
        gap_to_100: 100 - plaintiffScore,
        documents_searched: totalDocsFound,
      },
      vulnerabilities: parsed.vulnerabilities || [],
      path_to_100: parsed.path_to_100 || [],
      critical_evidence: criticalEvidence,
      turns,
      evidence_sources: allEvidence.flatMap(e => e.docs.map(d => d.source)).slice(0, 20),
    })

  } catch (err) {
    console.error('Turbo simulation error:', err)
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 })
  }
}
