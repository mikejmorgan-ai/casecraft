'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ConfidenceGauge } from '@/components/predictions/confidence-gauge'
import { AlertTriangle, FileText } from 'lucide-react'
import type { KeyFactor, PredictionCitation } from '@/lib/types'

interface PredictionDisplayProps {
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

export function PredictionDisplay({
  outcome,
  confidence,
  summary,
  keyFactors,
  reasoning,
  citations,
  risks,
  proceduralViolations,
  reversalIndicators,
}: PredictionDisplayProps) {
  const getOutcomeColor = (o: string) => {
    if (o.includes('plaintiff')) return 'bg-blue-500'
    if (o.includes('defendant')) return 'bg-amber-500'
    if (o.includes('dismiss') || o.includes('moot')) return 'bg-gray-500'
    return 'bg-purple-500'
  }

  const getWeightColor = (weight: string) => {
    if (weight === 'high') return 'text-red-500'
    if (weight === 'medium') return 'text-amber-500'
    return 'text-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Outcome & Confidence Gauge */}
      <div className="flex flex-col items-center">
        <ConfidenceGauge
          value={confidence}
          label="Prediction Confidence"
          size="lg"
          outcome={outcome}
        />
        <Badge className={`${getOutcomeColor(outcome)} text-white text-lg px-4 py-2 mt-4`}>
          {outcome.toUpperCase()}
        </Badge>
      </div>

      {/* Summary */}
      <Card className="p-4 bg-slate-50 border-l-4 border-l-[#1a365d]">
        <h4 className="font-medium text-[#1a365d] mb-2">Predicted Ruling</h4>
        <p className="text-sm leading-relaxed">{summary}</p>
      </Card>

      {/* Key Factors */}
      {keyFactors.length > 0 && (
        <div>
          <h4 className="font-medium text-[#1a365d] mb-3">Key Factors</h4>
          <div className="space-y-2">
            {keyFactors.map((factor, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm border-l-2 pl-3"
                style={{
                  borderColor:
                    factor.favors === 'plaintiff'
                      ? '#3b82f6'
                      : factor.favors === 'defendant'
                      ? '#f59e0b'
                      : '#6b7280',
                }}
              >
                <span className={`font-medium shrink-0 ${getWeightColor(factor.weight)}`}>
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
      )}

      {/* Procedural Violations */}
      {proceduralViolations && proceduralViolations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Procedural Violations Detected
          </h4>
          <ul className="list-disc list-inside text-sm space-y-1 text-red-700">
            {proceduralViolations.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Reversal Indicators */}
      {reversalIndicators && reversalIndicators.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2">Reversal Indicators</h4>
          <ul className="list-disc list-inside text-sm space-y-1 text-amber-700">
            {reversalIndicators.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {risks && risks.length > 0 && (
        <div>
          <h4 className="font-medium text-[#1a365d] mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Risk Factors
          </h4>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            {risks.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Citations */}
      {citations && citations.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-[#1a365d] flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Sources Cited ({citations.length})
          </summary>
          <div className="mt-2 space-y-1">
            {citations.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                <span className="text-sm">{c.source}</span>
                <Progress value={c.relevance} className="w-20 h-2" />
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Reasoning */}
      {reasoning && (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-[#1a365d]">
            Full Reasoning
          </summary>
          <div className="mt-2 bg-slate-50 rounded-lg p-4 whitespace-pre-wrap">
            {reasoning}
          </div>
        </details>
      )}
    </div>
  )
}
