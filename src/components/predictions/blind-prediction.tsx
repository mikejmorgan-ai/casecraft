'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Scale, 
  Eye, 
  EyeOff, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Loader2
} from 'lucide-react'

interface KeyFactor {
  factor: string
  weight: 'high' | 'medium' | 'low'
  favors: 'plaintiff' | 'defendant' | 'neutral'
  evidence: string
}

interface PredictionResult {
  id?: string
  outcome: string
  confidence: number
  summary: string
  keyFactors: KeyFactor[]
  reasoning?: string
  risks: string[]
}

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

interface BlindPredictionProps {
  caseId: string
  caseName: string
  isBlindTest: boolean
  rulingRevealed: boolean
  actualRuling?: string
  actualRulingSummary?: string
  onPredictionComplete?: (prediction: PredictionResult) => void
}

export function BlindPrediction({
  caseId,
  isBlindTest,
  rulingRevealed,
  onPredictionComplete,
}: BlindPredictionProps) {
  const [loading, setLoading] = useState(false)
  const [revealing, setRevealing] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [comparison, setComparison] = useState<ComparisonResult[] | null>(null)
  const [mode, setMode] = useState<'standard' | 'multi_agent'>('standard')
  const [error, setError] = useState<string | null>(null)

  const runPrediction = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${caseId}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, includeReasoning: true }),
      })

      if (!response.ok) {
        throw new Error('Prediction failed')
      }

      const data = await response.json()
      setPrediction(data.prediction)
      onPredictionComplete?.(data.prediction)
    } catch (err) {
      setError('Failed to generate prediction')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const revealActual = async () => {
    setRevealing(true)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${caseId}/reveal`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Reveal failed')
      }

      const data = await response.json()
      setComparison(data.comparisons)
    } catch (err) {
      setError('Failed to reveal ruling')
      console.error(err)
    } finally {
      setRevealing(false)
    }
  }

  const getOutcomeColor = (outcome: string) => {
    if (outcome.includes('plaintiff')) return 'bg-blue-500'
    if (outcome.includes('defendant')) return 'bg-amber-500'
    if (outcome.includes('dismiss') || outcome.includes('moot')) return 'bg-gray-500'
    return 'bg-purple-500'
  }

  const getWeightColor = (weight: string) => {
    if (weight === 'high') return 'text-red-500'
    if (weight === 'medium') return 'text-amber-500'
    return 'text-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="h-6 w-6 text-[#1a365d]" />
          <h2 className="text-xl font-semibold text-[#1a365d]">
            {isBlindTest ? 'Blind Prediction Test' : 'Case Prediction'}
          </h2>
          {isBlindTest && (
            <Badge variant={rulingRevealed ? 'outline' : 'default'} className="ml-2">
              {rulingRevealed ? (
                <><Eye className="h-3 w-3 mr-1" /> Revealed</>
              ) : (
                <><EyeOff className="h-3 w-3 mr-1" /> Hidden</>
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Mode Selection */}
      {!prediction && !comparison && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Prediction Mode</h3>
          <div className="flex gap-3">
            <Button
              variant={mode === 'standard' ? 'default' : 'outline'}
              onClick={() => setMode('standard')}
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              Standard
            </Button>
            <Button
              variant={mode === 'multi_agent' ? 'default' : 'outline'}
              onClick={() => setMode('multi_agent')}
              className="flex-1"
            >
              <Target className="h-4 w-4 mr-2" />
              Multi-Agent
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === 'standard' 
              ? 'Single judge perspective analysis'
              : 'Analysis from plaintiff, defendant, and judge perspectives'}
          </p>
        </Card>
      )}

      {/* Run Prediction Button */}
      {!prediction && !comparison && (
        <Button 
          onClick={runPrediction} 
          disabled={loading}
          className="w-full bg-[#1a365d] hover:bg-[#2d4a7c]"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing Case...
            </>
          ) : (
            <>
              <Scale className="h-5 w-5 mr-2" />
              Generate Prediction
            </>
          )}
        </Button>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Prediction Results */}
      {prediction && !comparison && (
        <Card className="p-6 space-y-6">
          {/* Outcome */}
          <div className="text-center">
            <Badge className={`${getOutcomeColor(prediction.outcome)} text-white text-lg px-4 py-2`}>
              {prediction.outcome.toUpperCase()}
            </Badge>
            <div className="mt-3">
              <span className="text-3xl font-bold text-[#1a365d]">{prediction.confidence}%</span>
              <span className="text-muted-foreground ml-2">confidence</span>
            </div>
            <Progress value={prediction.confidence} className="mt-2 h-2" />
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-medium text-[#1a365d] mb-2">Predicted Ruling</h4>
            <p className="text-sm">{prediction.summary}</p>
          </div>

          {/* Key Factors */}
          <div>
            <h4 className="font-medium text-[#1a365d] mb-3">Key Factors</h4>
            <div className="space-y-2">
              {prediction.keyFactors.map((factor, i) => (
                <div key={i} className="flex items-start gap-3 text-sm border-l-2 pl-3"
                  style={{ borderColor: factor.favors === 'plaintiff' ? '#3b82f6' : 
                    factor.favors === 'defendant' ? '#f59e0b' : '#6b7280' }}>
                  <span className={`font-medium ${getWeightColor(factor.weight)}`}>
                    [{factor.weight.toUpperCase()}]
                  </span>
                  <div>
                    <p className="font-medium">{factor.factor}</p>
                    <p className="text-muted-foreground">{factor.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          {prediction.risks.length > 0 && (
            <div>
              <h4 className="font-medium text-[#1a365d] mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Risk Factors
              </h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                {prediction.risks.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Reasoning */}
          {prediction.reasoning && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-[#1a365d]">
                Full Reasoning
              </summary>
              <div className="mt-2 bg-slate-50 rounded-lg p-4 whitespace-pre-wrap">
                {prediction.reasoning}
              </div>
            </details>
          )}

          {/* Reveal Button */}
          {isBlindTest && !rulingRevealed && (
            <Button 
              onClick={revealActual}
              disabled={revealing}
              variant="outline"
              className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
              size="lg"
            >
              {revealing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Revealing...
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5 mr-2" />
                  Reveal Actual Ruling & Compare
                </>
              )}
            </Button>
          )}
        </Card>
      )}

      {/* Comparison Results */}
      {comparison && comparison.length > 0 && (
        <Card className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-[#1a365d] mb-4">
              Prediction Accuracy Report
            </h3>
            
            {/* Accuracy Score */}
            <div className="flex justify-center items-center gap-4">
              {comparison[0].isCorrect ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
              <div>
                <span className="text-4xl font-bold">
                  {comparison[0].accuracyScore}%
                </span>
                <p className="text-muted-foreground">Accuracy Score</p>
              </div>
            </div>
          </div>

          {/* Outcome Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Predicted</p>
              <Badge className={`${getOutcomeColor(comparison[0].predictedOutcome)} text-white`}>
                {comparison[0].predictedOutcome.toUpperCase()}
              </Badge>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Actual</p>
              <Badge className={`${getOutcomeColor(comparison[0].actualOutcome)} text-white`}>
                {comparison[0].actualOutcome.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* What We Got Right */}
          {comparison[0].comparison.whatWeGotRight.length > 0 && (
            <div>
              <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> What We Got Right
              </h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {comparison[0].comparison.whatWeGotRight.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* What We Missed */}
          {comparison[0].comparison.whatWeMissed.length > 0 && (
            <div>
              <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4" /> What We Missed
              </h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {comparison[0].comparison.whatWeMissed.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Differences */}
          {comparison[0].comparison.keyDifferences.length > 0 && (
            <div>
              <h4 className="font-medium text-[#1a365d] mb-2">Key Differences</h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                {comparison[0].comparison.keyDifferences.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Procedural Analysis */}
          {comparison[0].proceduralAnalysis?.wasProcedural && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Procedural Dismissal Analysis
              </h4>
              <p className="text-sm mb-2">
                <strong>Type:</strong> {comparison[0].proceduralAnalysis.proceduralType}
              </p>
              <p className="text-sm mb-2">
                <strong>Could have predicted:</strong>{' '}
                {comparison[0].proceduralAnalysis.couldHavePredicted ? 'Yes' : 'Unlikely'}
              </p>
              {comparison[0].proceduralAnalysis.signals.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Signals that were present:</p>
                  <ul className="list-disc list-inside text-sm">
                    {comparison[0].proceduralAnalysis.signals.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Lessons Learned */}
          {comparison[0].comparison.lessonsLearned.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">📚 Lessons Learned</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {comparison[0].comparison.lessonsLearned.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
