import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { searchAll, searchByRole } from '@/lib/pinecone/search'
import OpenAI from 'openai'

const openai = new OpenAI()

export const maxDuration = 120

interface PredictionRequest {
  mode?: 'standard' | 'multi_agent' | 'monte_carlo'
  includeReasoning?: boolean
}

interface KeyFactor {
  factor: string
  weight: 'high' | 'medium' | 'low'
  favors: 'plaintiff' | 'defendant' | 'neutral'
  evidence: string
}

interface PredictionResult {
  outcome: 'plaintiff' | 'defendant' | 'dismissed' | 'settled' | 'moot'
  confidence: number
  summary: string
  keyFactors: KeyFactor[]
  reasoning: string
  citations: Array<{ source: string; relevance: number }>
  risks: string[]
  missedConsiderations?: string[]
}

// Generic legal analysis prompt that works on any case
const JUDGE_SYSTEM_PROMPT = `You are an experienced federal judge tasked with predicting case outcomes based on the evidence presented.

Your analysis must be:
1. EVIDENCE-BASED - Only cite facts from the provided documents
2. LEGALLY GROUNDED - Apply relevant statutory and case law
3. PROCEDURALLY AWARE - Consider procedural posture and burdens
4. OBJECTIVE - No advocacy, just prediction

Consider these potential outcomes:
- plaintiff: Plaintiff prevails on the merits
- defendant: Defendant prevails on the merits  
- dismissed: Case dismissed on procedural grounds (standing, mootness, ripeness, jurisdiction)
- settled: Likely settlement before ruling
- moot: Case becomes moot due to changed circumstances

CRITICAL: Watch for procedural dismissal risks:
- Mootness (circumstances changed making relief impossible)
- Standing (injury, causation, redressability)
- Ripeness (dispute not yet concrete)
- Jurisdiction (proper court, amount in controversy)

Output your analysis as JSON matching this structure:
{
  "outcome": "plaintiff|defendant|dismissed|settled|moot",
  "confidence": 0-100,
  "summary": "One paragraph ruling summary",
  "keyFactors": [
    {
      "factor": "Description of key factor",
      "weight": "high|medium|low",
      "favors": "plaintiff|defendant|neutral",
      "evidence": "Specific evidence supporting this"
    }
  ],
  "reasoning": "Detailed legal reasoning",
  "citations": [{"source": "Document name", "relevance": 0-100}],
  "risks": ["Potential issues that could change outcome"],
  "proceduralFlags": ["Any mootness, standing, or jurisdictional concerns"]
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

    const body: PredictionRequest = await request.json()
    const { mode = 'standard', includeReasoning = true } = body

    // Get case data (excluding actual ruling if blind test)
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select(`
        *,
        case_facts(*),
        documents(id, name, doc_type, content_text),
        agents(*)
      `)
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Check if this is a blind test and ruling hasn't been revealed
    if (caseData.is_blind_test && !caseData.ruling_revealed) {
      // Don't include actual ruling in context
      delete caseData.actual_ruling
      delete caseData.actual_ruling_summary
    }

    // Build context from case documents and facts
    const factsContext = caseData.case_facts
      ?.map((f: { category: string; fact_text: string }) => `[${f.category.toUpperCase()}] ${f.fact_text}`)
      .join('\n') || 'No facts documented.'

    // Get document content
    const docsContext = caseData.documents
      ?.filter((d: { content_text: string | null }) => d.content_text)
      .map((d: { name: string; doc_type: string; content_text: string }) => `--- ${d.name} (${d.doc_type}) ---\n${d.content_text?.substring(0, 3000)}`)
      .join('\n\n') || ''

    // Search Pinecone for relevant precedents
    const searchQuery = `${caseData.name} ${caseData.summary || ''} key legal issues ruling`
    const pineconeResults = await searchAll(searchQuery, { topK: 10, minScore: 0.6 })
    
    const precedentContext = pineconeResults.length > 0
      ? pineconeResults.map(r => `[${r.source}]\n${r.content}`).join('\n\n')
      : 'No additional precedents found in knowledge base.'

    // Build the analysis prompt
    const analysisPrompt = `Analyze this case and predict the outcome:

## CASE INFORMATION
**Name:** ${caseData.name}
**Case Number:** ${caseData.case_number || 'N/A'}
**Type:** ${caseData.case_type}
**Jurisdiction:** ${caseData.jurisdiction || 'N/A'}
**Plaintiff:** ${caseData.plaintiff_name || 'N/A'}
**Defendant:** ${caseData.defendant_name || 'N/A'}
**Filed:** ${caseData.filed_date || 'N/A'}

## CASE SUMMARY
${caseData.summary || 'No summary provided.'}

## DOCUMENTED FACTS
${factsContext}

## CASE DOCUMENTS
${docsContext.substring(0, 10000) || 'No documents uploaded.'}

## RELEVANT PRECEDENTS & RESEARCH
${precedentContext.substring(0, 5000)}

---

Based on ALL the evidence above, predict how this case will be decided.
Remember to check for procedural dismissal risks (mootness, standing, etc.) BEFORE analyzing the merits.

Return your analysis as valid JSON.`

    // Run prediction based on mode
    let prediction: PredictionResult

    if (mode === 'multi_agent') {
      prediction = await runMultiAgentPrediction(analysisPrompt, caseData)
    } else {
      prediction = await runStandardPrediction(analysisPrompt)
    }

    // Save prediction to database
    const { data: savedPrediction, error: saveError } = await supabase
      .from('case_predictions')
      .insert({
        case_id: caseId,
        user_id: user.id,
        predicted_outcome: prediction.outcome,
        predicted_ruling_summary: prediction.summary,
        confidence_score: prediction.confidence,
        key_factors: prediction.keyFactors,
        reasoning: includeReasoning ? prediction.reasoning : null,
        citations: prediction.citations,
        model_used: 'gpt-4o',
        prediction_mode: mode,
        raw_response: prediction,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save prediction:', saveError)
    }

    return NextResponse.json({
      success: true,
      prediction: {
        id: savedPrediction?.id,
        outcome: prediction.outcome,
        confidence: prediction.confidence,
        summary: prediction.summary,
        keyFactors: prediction.keyFactors,
        reasoning: includeReasoning ? prediction.reasoning : undefined,
        citations: prediction.citations,
        risks: prediction.risks,
      },
      isBlindTest: caseData.is_blind_test && !caseData.ruling_revealed,
    })

  } catch (err) {
    console.error('Prediction error:', err)
    return NextResponse.json({ error: 'Prediction failed' }, { status: 500 })
  }
}

async function runStandardPrediction(prompt: string): Promise<PredictionResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: JUDGE_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content || '{}'
  
  try {
    const parsed = JSON.parse(content)
    return {
      outcome: parsed.outcome || 'defendant',
      confidence: parsed.confidence || 50,
      summary: parsed.summary || 'Unable to generate summary',
      keyFactors: parsed.keyFactors || [],
      reasoning: parsed.reasoning || '',
      citations: parsed.citations || [],
      risks: [...(parsed.risks || []), ...(parsed.proceduralFlags || [])],
    }
  } catch {
    return {
      outcome: 'defendant',
      confidence: 30,
      summary: 'Failed to parse prediction',
      keyFactors: [],
      reasoning: content,
      citations: [],
      risks: ['Prediction parsing failed'],
    }
  }
}

async function runMultiAgentPrediction(
  prompt: string, 
  caseData: Record<string, unknown>
): Promise<PredictionResult> {
  // Run parallel predictions from different perspectives
  const perspectives = [
    { role: 'Plaintiff Attorney', bias: 'plaintiff' },
    { role: 'Defense Attorney', bias: 'defendant' },
    { role: 'Neutral Judge', bias: 'neutral' },
  ]

  const predictions = await Promise.all(
    perspectives.map(async (p) => {
      const biasedPrompt = `You are analyzing this case from the perspective of a ${p.role}.
${p.bias !== 'neutral' ? `While maintaining objectivity, note arguments favoring the ${p.bias}.` : ''}

${prompt}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: JUDGE_SYSTEM_PROMPT },
          { role: 'user', content: biasedPrompt }
        ],
        temperature: 0.4,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })

      try {
        return JSON.parse(response.choices[0]?.message?.content || '{}')
      } catch {
        return { outcome: 'defendant', confidence: 30 }
      }
    })
  )

  // Aggregate results - judge's view weighted highest
  const judgeResult = predictions[2]
  const plaintiffView = predictions[0]
  const defenseView = predictions[1]

  // Calculate consensus
  const outcomes = predictions.map(p => p.outcome)
  const consensus = outcomes.filter(o => o === judgeResult.outcome).length

  return {
    outcome: judgeResult.outcome || 'defendant',
    confidence: Math.round(
      (judgeResult.confidence * 0.5) + 
      (plaintiffView.confidence * 0.25) + 
      (defenseView.confidence * 0.25)
    ),
    summary: judgeResult.summary || 'Multi-agent analysis complete',
    keyFactors: [
      ...(judgeResult.keyFactors || []),
      // Add dissenting factors from other agents
      ...(plaintiffView.keyFactors?.filter(
        (f: KeyFactor) => !judgeResult.keyFactors?.some((j: KeyFactor) => j.factor === f.factor)
      ) || []),
    ],
    reasoning: `**Judge Analysis:**\n${judgeResult.reasoning}\n\n` +
      `**Plaintiff Perspective:**\n${plaintiffView.reasoning}\n\n` +
      `**Defense Perspective:**\n${defenseView.reasoning}`,
    citations: judgeResult.citations || [],
    risks: [
      ...(judgeResult.risks || []),
      consensus < 3 ? `Split decision (${consensus}/3 agree on outcome)` : null,
    ].filter(Boolean) as string[],
  }
}
