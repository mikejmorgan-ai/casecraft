'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PredictionDisplay } from './prediction-display'
import { RulingReveal } from './ruling-reveal'
import {
  Scale,
  Eye,
  EyeOff,
  Brain,
  Target,
  Loader2,
} from 'lucide-react'
import type { KeyFactor, PredictionCitation } from '@/lib/types'

interface PredictionResult {
  id?: string
  outcome: string
  confidence: number
  summary: string
  keyFactors: KeyFactor[]
  reasoning?: string
  citations?: PredictionCitation[]
  risks?: string[]
  proceduralViolations?: string[]
  reversalIndicators?: string[]
}

interface BlindTestPanelProps {
  caseId: string
  caseName: string
  isBlindTest: boolean
  rulingRevealed: boolean
  caseType: string
  jurisdiction?: string | null
  plaintiffName?: string | null
  defendantName?: string | null
  summary?: string | null
}

export function BlindTestPanel({
  caseId,
  caseName,
  isBlindTest,
  rulingRevealed: initialRevealed,
  caseType,
  jurisdiction,
  plaintiffName,
  defendantName,
  summary,
}: BlindTestPanelProps) {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [mode, setMode] = useState<'standard' | 'multi_agent'>('standard')
  const [error, setError] = useState<string | null>(null)
  const [rulingRevealed, setRulingRevealed] = useState(initialRevealed)

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
        const data = await response.json()
        throw new Error(data.error || 'Prediction failed')
      }

      const data = await response.json()
      setPrediction(data.prediction)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prediction')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#1a365d]" />
              Blind Case Ruling Test
            </CardTitle>
            {isBlindTest && (
              <Badge variant={rulingRevealed ? 'outline' : 'default'}>
                {rulingRevealed ? (
                  <><Eye className="h-3 w-3 mr-1" /> Revealed</>
                ) : (
                  <><EyeOff className="h-3 w-3 mr-1" /> Hidden</>
                )}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {isBlindTest && !rulingRevealed
              ? 'The actual ruling is hidden. Generate an AI prediction, then reveal the actual ruling to compare accuracy.'
              : isBlindTest && rulingRevealed
              ? 'The actual ruling has been revealed for this case.'
              : 'Use AI to predict the likely outcome based on case documents and facts.'}
          </p>

          {/* Case Context */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            <h4 className="font-medium text-[#1a365d]">{caseName}</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{caseType}</Badge>
              {jurisdiction && <Badge variant="outline">{jurisdiction}</Badge>}
            </div>
            {plaintiffName && defendantName && (
              <p className="text-muted-foreground">
                {plaintiffName} v. {defendantName}
              </p>
            )}
            {summary && (
              <p className="text-muted-foreground line-clamp-3">{summary}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mode Selection & Predict */}
      {!prediction && !rulingRevealed && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium text-[#1a365d]">Prediction Mode</h3>
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
            <p className="text-sm text-muted-foreground">
              {mode === 'standard'
                ? 'Single judge perspective analysis'
                : 'Analysis from plaintiff, defendant, and judge perspectives'}
            </p>

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
                  Get AI Ruling
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Prediction Results */}
      {prediction && !rulingRevealed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <PredictionDisplay
              outcome={prediction.outcome}
              confidence={prediction.confidence}
              summary={prediction.summary}
              keyFactors={prediction.keyFactors}
              reasoning={prediction.reasoning}
              citations={prediction.citations}
              risks={prediction.risks}
              proceduralViolations={prediction.proceduralViolations}
              reversalIndicators={prediction.reversalIndicators}
            />
          </CardContent>
        </Card>
      )}

      {/* Reveal Section */}
      {isBlindTest && prediction && !rulingRevealed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Compare Against Actual Ruling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RulingReveal
              caseId={caseId}
              hasPrediction={!!prediction}
              onRevealed={() => setRulingRevealed(true)}
            />
          </CardContent>
        </Card>
      )}

      {/* Already Revealed Message */}
      {isBlindTest && rulingRevealed && !prediction && (
        <Card className="text-center py-8">
          <CardContent>
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ruling Already Revealed</h3>
            <p className="text-muted-foreground">
              The actual ruling for this case has been revealed. Check the Predict tab
              on the case page for comparison details.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
