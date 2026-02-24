import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { searchAll } from '@/lib/pinecone/search'
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
  proceduralViolations?: string[]
  reversalIndicators?: string[]
}

// Generic legal analysis prompt that works on any case
const JUDGE_SYSTEM_PROMPT = `You are an experienced appellate judge tasked with predicting case outcomes based on the evidence presented.

Your analysis must be:
1. EVIDENCE-BASED - Only cite facts from the provided documents
2. LEGALLY GROUNDED - Apply relevant statutory and case law
3. PROCEDURALLY AWARE - Consider procedural posture and burdens
4. OBJECTIVE - No advocacy, just prediction

## CRITICAL LEGAL DOCTRINES

### STATUTORY SUPREMACY
- Mandatory statutory procedures (like public hearings) CANNOT be waived by contract
- Government entities are BOUND to follow their own ordinances and regulations
- When a statute says "shall" do something, that is MANDATORY, not discretionary
- Settlement agreements and contracts cannot circumvent mandatory statutory procedures

### CONTRACT ZONING DOCTRINE (Land Use Cases)
- "Contract zoning" = when a municipality contracts to zone property in a particular way
- Contract zoning is ILLEGAL in most U.S. jurisdictions
- Rationale: Zoning power is LEGISLATIVE and cannot be bargained away
- A contract that effectively amends zoning without required procedures is VOID
- Courts will NOT enforce contracts that circumvent zoning procedures

### APPELLATE REVIEW PRINCIPLES
- Appellate courts DO reverse lower courts, especially on legal questions
- Questions of statutory interpretation are reviewed DE NOVO (no deference)
- If the lower court misapplied the law, reversal is appropriate
- Government deference does NOT apply when the government violated its own procedures

### PROCEDURAL REQUIREMENTS
- Public hearings serve fundamental democratic purposes
- Citizens have a RIGHT to participate in government decisions affecting them
- This right cannot be contracted away by the government
- Failure to follow required procedures is grounds for reversal

## REVERSAL INDICATORS (for appeals)
- Government admitted one thing, then acted contrary to that admission
- No required hearing was held when statute/ordinance mandated one
- Agreement's explicit purpose was to avoid required procedures
- Clear statutory language mandating procedures was ignored
- Lower court gave improper deference on legal questions

## UTAH MINING LAW (For Utah Cases)

### § 17-41-101(13) - "MINE OPERATOR" DEFINITION
"Mine operator" means a natural person, corporation, or other entity, including a SUCCESSOR, ASSIGN, AFFILIATE, SUBSIDIARY, and RELATED PARENT COMPANY, that, ON OR BEFORE JANUARY 1, 2019:
(a) owns, controls, or manages a mining use under a large mine permit; AND
(b) has produced commercial quantities of a mineral deposit.

CRITICAL: The "on or before January 1, 2019" language is a ONE-TIME threshold. Once met, status is permanent. Continuous operations are NOT required.

### § 17-41-402 - PREEMPTION OF LOCAL REGULATION
"A political subdivision may not change the zoning designation of or a zoning regulation affecting land within a mining protection area unless the political subdivision receives written approval for the change from each mine operator within the area."

For critical infrastructure materials (sand, gravel, rock): Counties "may not adopt, enact, or amend an existing land use regulation, ordinance, or regulation that would prohibit, restrict, regulate, or otherwise limit critical infrastructure materials operations."

### § 17-41-501 - VESTED MINING USE
(1)(a) A mining use is CONCLUSIVELY PRESUMED to be a vested mining use if the mining use existed or was conducted BEFORE a political subdivision prohibits, restricts, or otherwise limits the mining use.

(1)(b) Anyone claiming that a vested mining use has NOT been established has the BURDEN OF PROOF to show by CLEAR AND CONVINCING EVIDENCE that the vested mining use has not been established.

(2)(a) A vested mining use RUNS WITH THE LAND.

(2)(b) A vested mining use may be changed to another mining use without losing its status.

CRITICAL PROVISIONS:
1. "CONCLUSIVELY PRESUMED" = strongest legal protection, cannot be rebutted
2. Burden on CHALLENGER to prove by clear and convincing evidence
3. "RUNS WITH THE LAND" = automatic transfer to successors
4. Permit boundaries do NOT limit vested rights

### § 17-41-502 - RIGHTS OF MINE OPERATOR
Mine operators with vested mining use have rights to "progress, extend, enlarge, grow, or expand" to any land they own or control, NOTWITHSTANDING local restrictions adopted after vesting.

### STATUTORY CONSTRUCTION - ABANDONMENT
The existence of a SEPARATE abandonment provision (§ 17-41-503) implies that gaps in operations do NOT automatically terminate vested rights. If gaps terminated vesting, no abandonment statute would be needed.

### SECTION CROSSWALK (Nov 6, 2025 Recodification)
- § 17-41-101 → § 17-81-101 (Definitions)
- § 17-41-402 → § 17-81-302 (Preemption)
- § 17-41-501 → § 17-81-401 (Vested mining use)
- § 17-41-502 → § 17-81-402 (Rights of mine operator)
- § 17-41-503 → § 17-81-403 (Abandonment)

### KEY UTAH CASE LAW
- Gibbons & Reed Co. v. North Salt Lake City, 431 P.2d 559 (Utah 1967): "Doctrine of diminishing assets" - extractive uses can expand beyond original boundaries
- Jordan v. Jensen, 2017 UT 1: Mineral rights owners have vested property rights protected by due process

Consider these potential outcomes:
- plaintiff: Plaintiff/Appellant prevails on the merits
- defendant: Defendant/Appellee prevails on the merits
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
  "reasoning": "Detailed legal reasoning applying the doctrines above",
  "citations": [{"source": "Document name", "relevance": 0-100}],
  "risks": ["Potential issues that could change outcome"],
  "proceduralFlags": ["Any mootness, standing, or jurisdictional concerns"],
  "proceduralViolations": ["Any violations of mandatory procedures"],
  "reversalIndicators": ["Factors suggesting appellate reversal (if applicable)"]
}`

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
      prediction = await runMultiAgentPrediction(analysisPrompt)
    } else {
      prediction = await runStandardPrediction(analysisPrompt)
    }

    // Save prediction to database
    const { data: savedPrediction, error: saveError } = await supabase
      .from('case_predictions')
      .insert({
        case_id: caseId,
        user_id: userId,
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
        proceduralViolations: prediction.proceduralViolations,
        reversalIndicators: prediction.reversalIndicators,
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
      proceduralViolations: parsed.proceduralViolations || [],
      reversalIndicators: parsed.reversalIndicators || [],
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
      proceduralViolations: [],
      reversalIndicators: [],
    }
  }
}

async function runMultiAgentPrediction(
  prompt: string
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
    proceduralViolations: judgeResult.proceduralViolations || [],
    reversalIndicators: judgeResult.reversalIndicators || [],
  }
}
