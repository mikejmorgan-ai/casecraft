import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import OpenAI from 'openai'

const openai = new OpenAI()

export const maxDuration = 60

interface ComparisonResult {
  predictionId: string
  predictedOutcome: string
  actualOutcome: string
  isCorrect: boolean
  accuracyScore: number
  comparison: {
    whatWeGotRight: string[]
    whatWeMissed: string[]
    keyDifferences: string[]
    lessonsLearned: string[]
  }
  proceduralAnalysis?: {
    wasProcedural: boolean
    proceduralType?: string
    couldHavePredicted: boolean
    signals: string[]
  }
}

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
    const supabase = getSupabase()

    // Get case with actual ruling
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (!caseData.is_blind_test) {
      return NextResponse.json({ error: 'Not a blind test case' }, { status: 400 })
    }

    if (!caseData.actual_ruling) {
      return NextResponse.json({ error: 'Actual ruling not set' }, { status: 400 })
    }

    // Get all predictions for this case
    const { data: predictions, error: predError } = await supabase
      .from('case_predictions')
      .select('*')
      .eq('case_id', caseId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (predError || !predictions?.length) {
      return NextResponse.json({ error: 'No predictions found' }, { status: 404 })
    }

    // Compare each prediction
    const comparisons: ComparisonResult[] = []

    for (const prediction of predictions) {
      const comparison = await generateComparison(
        prediction,
        caseData.actual_ruling,
        caseData.actual_ruling_summary
      )

      // Update prediction with comparison results
      await supabase
        .from('case_predictions')
        .update({
          is_correct: comparison.isCorrect,
          accuracy_score: comparison.accuracyScore,
          comparison_notes: JSON.stringify(comparison.comparison),
          missed_factors: comparison.comparison.whatWeMissed,
          revealed_at: new Date().toISOString(),
        })
        .eq('id', prediction.id)

      comparisons.push({
        predictionId: prediction.id,
        ...comparison,
      })
    }

    // Mark case as revealed
    await supabase
      .from('cases')
      .update({ ruling_revealed: true })
      .eq('id', caseId)

    // Calculate overall accuracy
    const avgAccuracy = Math.round(
      comparisons.reduce((sum, c) => sum + c.accuracyScore, 0) / comparisons.length
    )

    return NextResponse.json({
      success: true,
      caseId,
      actualRuling: caseData.actual_ruling,
      actualRulingSummary: caseData.actual_ruling_summary,
      comparisons,
      overallAccuracy: avgAccuracy,
      totalPredictions: comparisons.length,
      correctPredictions: comparisons.filter(c => c.isCorrect).length,
    })

  } catch (err) {
    console.error('Reveal error:', err)
    return NextResponse.json({ error: 'Reveal failed' }, { status: 500 })
  }
}

async function generateComparison(
  prediction: Record<string, unknown>,
  actualRuling: string,
  actualSummary: string | null
): Promise<Omit<ComparisonResult, 'predictionId'>> {
  // Determine if outcomes match
  const predictedOutcome = (prediction.predicted_outcome as string || '').toLowerCase()
  const actualOutcome = actualRuling.toLowerCase()

  // Check for procedural outcomes
  const proceduralOutcomes = ['dismissed', 'moot', 'settled', 'remanded']
  const isProcedural = proceduralOutcomes.some(p => actualOutcome.includes(p))

  // Calculate base accuracy
  let accuracyScore = 0
  let isCorrect = false

  if (predictedOutcome === actualOutcome) {
    accuracyScore = 100
    isCorrect = true
  } else if (
    (predictedOutcome.includes('plaintiff') && actualOutcome.includes('plaintiff')) ||
    (predictedOutcome.includes('defendant') && actualOutcome.includes('defendant'))
  ) {
    accuracyScore = 90
    isCorrect = true
  } else if (isProcedural && !proceduralOutcomes.some(p => predictedOutcome.includes(p))) {
    // Missed a procedural dismissal
    accuracyScore = 30
    isCorrect = false
  } else {
    accuracyScore = 20
    isCorrect = false
  }

  // Use AI to generate detailed comparison
  const comparisonPrompt = `Compare this legal case prediction to the actual outcome:

PREDICTION:
- Outcome: ${prediction.predicted_outcome}
- Summary: ${prediction.predicted_ruling_summary}
- Key Factors: ${JSON.stringify(prediction.key_factors)}
- Reasoning: ${prediction.reasoning || 'N/A'}

ACTUAL OUTCOME:
- Ruling: ${actualRuling}
- Summary: ${actualSummary || 'N/A'}

Analyze the prediction accuracy and provide:
1. What the prediction got RIGHT (list specific elements)
2. What the prediction MISSED (list specific elements)  
3. Key DIFFERENCES between prediction and actual ruling
4. LESSONS LEARNED for improving future predictions

${isProcedural ? `
IMPORTANT: The actual outcome was PROCEDURAL (${actualRuling}).
Analyze whether there were signals that could have predicted this procedural outcome.
` : ''}

Return as JSON:
{
  "whatWeGotRight": ["item1", "item2"],
  "whatWeMissed": ["item1", "item2"],
  "keyDifferences": ["item1", "item2"],
  "lessonsLearned": ["item1", "item2"],
  "proceduralAnalysis": {
    "wasProcedural": boolean,
    "proceduralType": "mootness|standing|jurisdiction|other",
    "couldHavePredicted": boolean,
    "signals": ["signal1", "signal2"]
  }
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: comparisonPrompt }],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}')

    return {
      predictedOutcome,
      actualOutcome,
      isCorrect,
      accuracyScore,
      comparison: {
        whatWeGotRight: analysis.whatWeGotRight || [],
        whatWeMissed: analysis.whatWeMissed || [],
        keyDifferences: analysis.keyDifferences || [],
        lessonsLearned: analysis.lessonsLearned || [],
      },
      proceduralAnalysis: isProcedural ? analysis.proceduralAnalysis : undefined,
    }
  } catch {
    return {
      predictedOutcome,
      actualOutcome,
      isCorrect,
      accuracyScore,
      comparison: {
        whatWeGotRight: isCorrect ? ['Outcome prediction correct'] : [],
        whatWeMissed: isCorrect ? [] : ['Outcome prediction incorrect'],
        keyDifferences: [`Predicted: ${predictedOutcome}, Actual: ${actualOutcome}`],
        lessonsLearned: [],
      },
    }
  }
}
