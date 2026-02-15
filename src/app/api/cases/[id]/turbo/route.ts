import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { searchAll } from '@/lib/pinecone/search'
import OpenAI from 'openai'

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _TurboResult = {
  total_turns: number
  plaintiff_score: number
  defendant_score: number
  win_probability: number
  critical_evidence: { doc: string; status: string; impact: string }[]
  vulnerabilities: string[]
  path_to_100: string[]
  turns: TurnResult[]
}

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

    // Get case data
    const { data: caseData } = await supabase
      .from('cases')
      .select('*, case_facts(*)')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Pull key evidence from Pinecone
    const evidenceQueries = [
      'vested mining rights proof continuous operations',
      'chain of title ownership transfer successor',
      'mining permits DOGM reclamation records',
      'Ordinance 1895 mining prohibition validity',
      'abandonment of mining operations evidence',
      'expert witness Hilberg mining history testimony',
      'Salt Lake County discovery responses deficiencies',
      'Utah Code 17-41-501 statutory interpretation',
    ]

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

    // Have Judge Stormont simulate the trial with turns
    const simulationPrompt = `You are Judge Charles A. Stormont presiding over Tree Farm LLC v. Salt Lake County (Case #220902840).

CASE SUMMARY:
Tree Farm LLC claims vested mining rights on property in the Oquirrh Mountains based on continuous mining operations since 1903. Salt Lake County enacted Ordinance 1895 prohibiting mining. Tree Farm seeks declaratory judgment that their vested rights supersede the ordinance under Utah Code 17-41-501.

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
      "action": "Moves to admit Hilberg affidavit on mining history",
      "evidence_cited": "2024.06.21_Am_Complaint_Pet_for_Judicial_Review.pdf",
      "judge_ruling": "admitted",
      "impact": "favorable",
      "reasoning": "Relevant to establishing continuous mining operations"
    }
  ],
  "plaintiff_final_score": 83,
  "defendant_final_score": 17,
  "vulnerabilities": ["Chain of title gaps in 1970s", "Limited production records"],
  "path_to_100": ["Obtain county recorder deed showing unbroken ownership", "DOGM permit records confirming active status"]
}

Be realistic. Use actual document names from the evidence. Score must total 100.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: simulationPrompt }],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const aiResponse = response.choices[0]?.message?.content || '{}'

    // Define response interface
    interface SimulationResponse {
      turns: TurnResult[]
      plaintiff_final_score: number
      defendant_final_score: number
      vulnerabilities: string[]
      path_to_100: string[]
    }

    // Parse JSON from response
    let parsed: SimulationResponse
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { turns: [], plaintiff_final_score: 50, defendant_final_score: 50, vulnerabilities: [], path_to_100: [] }
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
