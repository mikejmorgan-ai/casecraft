import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { searchAll } from '@/lib/pinecone/search'
import { getOpenAIClient } from '@/lib/ai/openai'

export const maxDuration = 60

interface SimulationResult {
  scenario: string
  plaintiff_wins: boolean
  confidence: number
  key_factor: string
  ruling_summary: string
}

interface DecisionPoint {
  id: string
  name: string
  description: string
  plaintiff_favorable: string
  defendant_favorable: string
  weight: number // How much this impacts outcome (1-10)
}

// Key decision points in litigation
const DECISION_POINTS: DecisionPoint[] = [
  {
    id: 'msj_plaintiff',
    name: 'Plaintiff MSJ on Vested Rights',
    description: 'Motion for Summary Judgment on vested mining rights claim',
    plaintiff_favorable: 'Granted - Court finds vested rights established as matter of law',
    defendant_favorable: 'Denied - Genuine issues of material fact exist',
    weight: 9,
  },
  {
    id: 'msj_defendant',
    name: 'Defendant MSJ on Standing',
    description: 'County motion challenging Tree Farm standing',
    plaintiff_favorable: 'Denied - Tree Farm has standing as successor',
    defendant_favorable: 'Granted - Tree Farm lacks standing',
    weight: 10,
  },
  {
    id: 'expert_testimony',
    name: 'Expert Witness Testimony',
    description: 'Chip Hilberg mining history testimony admitted',
    plaintiff_favorable: 'Admitted - Historical mining evidence establishes continuous use',
    defendant_favorable: 'Excluded - Testimony deemed speculative or irrelevant',
    weight: 7,
  },
  {
    id: 'discovery_sanctions',
    name: 'Discovery Sanctions',
    description: 'Motion for sanctions on discovery disputes',
    plaintiff_favorable: 'County sanctioned for inadequate responses',
    defendant_favorable: 'No sanctions or mutual sanctions',
    weight: 4,
  },
  {
    id: 'ordinance_validity',
    name: 'Ordinance 1895 Validity',
    description: 'Challenge to mining prohibition ordinance',
    plaintiff_favorable: 'Ordinance cannot override vested rights',
    defendant_favorable: 'Ordinance validly enacted under police power',
    weight: 8,
  },
  {
    id: 'statute_interpretation',
    name: 'Utah Code 17-41-501 Interpretation',
    description: 'Interpretation of vested mining use statute',
    plaintiff_favorable: 'Broad interpretation favoring mineral rights holders',
    defendant_favorable: 'Narrow interpretation requiring strict proof',
    weight: 9,
  },
  {
    id: 'successor_rights',
    name: 'Successor Rights Transfer',
    description: 'Whether vested rights transferred to Tree Farm',
    plaintiff_favorable: 'Rights properly transferred through chain of title',
    defendant_favorable: 'Rights personal to original operator, not transferable',
    weight: 8,
  },
  {
    id: 'abandonment',
    name: 'Abandonment Defense',
    description: 'County claim that mining was abandoned',
    plaintiff_favorable: 'No abandonment - continuous operations since 1903',
    defendant_favorable: 'Mining abandoned for extended period',
    weight: 7,
  },
]

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = await getSupabase()

    const body = await request.json()
    const { iterations = 20 } = body

    // Get case data
    const { data: caseData } = await supabase
      .from('cases')
      .select('*, case_facts(*)')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Get relevant documents from Pinecone
    const relevantDocs = await searchAll(
      'vested mining rights Tree Farm Salt Lake County summary judgment',
      { topK: 10, minScore: 0.5 }
    )

    const docContext = relevantDocs.map(d => d.content).join('\n\n').substring(0, 8000)
    const factsContext = caseData.case_facts?.map((f: { fact_text: string }) => f.fact_text).join('\n') || ''

    // Run simulations
    const results: SimulationResult[] = []
    let plaintiffWins = 0

    for (let i = 0; i < iterations; i++) {
      // Randomly determine outcomes for each decision point
      const scenario: Record<string, boolean> = {}
      let scenarioWeight = 0
      let maxWeight = 0

      for (const dp of DECISION_POINTS) {
        // Weighted random - plaintiff has base advantage based on current 83%
        const plaintiffProbability = 0.83 - (Math.random() * 0.3) // 53-83% base
        scenario[dp.id] = Math.random() < plaintiffProbability

        if (scenario[dp.id]) {
          scenarioWeight += dp.weight
        }
        maxWeight += dp.weight
      }

      // Calculate outcome
      const winProbability = scenarioWeight / maxWeight
      const plaintiffWinsThis = winProbability > 0.5

      if (plaintiffWinsThis) plaintiffWins++

      // Find the key factor (highest weight that went against winner)
      let keyFactor = ''
      let keyFactorWeight = 0
      for (const dp of DECISION_POINTS) {
        if (scenario[dp.id] !== plaintiffWinsThis && dp.weight > keyFactorWeight) {
          keyFactor = dp.name
          keyFactorWeight = dp.weight
        }
      }

      // Generate scenario description
      const favorableCount = Object.values(scenario).filter(v => v).length
      const scenarioDesc = `${favorableCount}/${DECISION_POINTS.length} rulings favor plaintiff`

      results.push({
        scenario: scenarioDesc,
        plaintiff_wins: plaintiffWinsThis,
        confidence: Math.round(winProbability * 100),
        key_factor: keyFactor || 'All factors aligned',
        ruling_summary: plaintiffWinsThis
          ? 'Plaintiff prevails on vested rights claim'
          : 'Defendant prevails - vested rights not established',
      })
    }

    // Aggregate analysis
    const winRate = Math.round((plaintiffWins / iterations) * 100)

    // Identify critical factors (most impactful on losses)
    const lossFactors: Record<string, number> = {}
    results.filter(r => !r.plaintiff_wins).forEach(r => {
      if (r.key_factor) {
        lossFactors[r.key_factor] = (lossFactors[r.key_factor] || 0) + 1
      }
    })

    const criticalFactors = Object.entries(lossFactors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([factor, count]) => ({
        factor,
        frequency: Math.round((count / (iterations - plaintiffWins)) * 100),
        recommendation: getRecommendation(factor),
      }))

    // AI Analysis for improvement path
    const analysisPrompt = `You are Judge Stormont analyzing Tree Farm LLC v. Salt Lake County.

Case Context:
${factsContext}

Document Evidence:
${docContext.substring(0, 3000)}

Simulation Results:
- Win probability: ${winRate}%
- Iterations: ${iterations}
- Critical risk factors: ${criticalFactors.map(f => f.factor).join(', ')}

Provide a BRIEF (3-4 sentences) strategic assessment:
1. What is the single most important action to increase win probability?
2. What is the biggest vulnerability that could cause a loss?

Be specific to THIS case. No generic advice.`

    const aiResponse = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.5,
      max_tokens: 300,
    })

    const strategicAdvice = aiResponse.choices[0]?.message?.content || ''

    return NextResponse.json({
      success: true,
      summary: {
        iterations,
        plaintiff_win_rate: winRate,
        defendant_win_rate: 100 - winRate,
        current_strength: 83, // From case strength meter
        simulated_strength: winRate,
        confidence_interval: `${Math.max(0, winRate - 10)}% - ${Math.min(100, winRate + 10)}%`,
      },
      critical_factors: criticalFactors,
      path_to_100: winRate < 100 ? {
        gap: 100 - winRate,
        actions_needed: criticalFactors.slice(0, 3).map(f => f.recommendation),
      } : {
        gap: 0,
        actions_needed: ['Case is optimally positioned'],
      },
      strategic_advice: strategicAdvice,
      decision_points: DECISION_POINTS.map(dp => ({
        name: dp.name,
        weight: dp.weight,
        description: dp.description,
      })),
      sample_scenarios: results.slice(0, 5),
    })

  } catch (err) {
    console.error('Simulation error:', err)
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 })
  }
}

function getRecommendation(factor: string): string {
  const recommendations: Record<string, string> = {
    'Defendant MSJ on Standing': 'Strengthen chain of title documentation and successor rights briefing',
    'Plaintiff MSJ on Vested Rights': 'Compile comprehensive evidence of continuous mining operations since 1903',
    'Statute Interpretation': 'Brief legislative history of HB 288 and protective intent of 17-41-501',
    'Successor Rights Transfer': 'Document complete chain from original operators through Sachs to Tree Farm',
    'Expert Witness Testimony': 'Prepare Hilberg testimony with supporting historical records',
    'Abandonment Defense': 'Counter with production records, permits, and continuous activity evidence',
    'Ordinance Validity': 'Challenge Ordinance 1895 as unconstitutional taking or preempted by state law',
    'Discovery Sanctions': 'Document all County discovery deficiencies for sanctions motion',
  }
  return recommendations[factor] || 'Strengthen evidence and briefing on this issue'
}
