'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  CheckCircle,
  XCircle,
  MinusCircle,
  TrendingUp,
  AlertTriangle,
  Target,
  Loader2,
  FileText,
  Gavel,
  Scale,
  Shield,
} from 'lucide-react'
import type { TurnResult } from '@/lib/types'

interface TurboResult {
  success: boolean
  error?: string
  warning?: string
  stats: {
    total_turns: number
    favorable: number
    unfavorable: number
    neutral: number
    plaintiff_score: number
    defendant_score: number
    win_probability: number
    gap_to_100: number
    documents_searched: number
  }
  vulnerabilities: string[]
  path_to_100: string[]
  critical_evidence: { doc: string; status: string; impact: string }[]
  turns: TurnResult[]
  evidence_sources: string[]
}

interface TurboSimulatorProps {
  caseId: string
}

export function TurboSimulator({ caseId }: TurboSimulatorProps) {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<TurboResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runTurbo = async () => {
    setRunning(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${caseId}/turbo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Simulation failed')
        return
      }

      if (!data.success) {
        setError(data.error || 'Simulation returned no results')
        return
      }

      setResult(data)
    } catch (err) {
      console.error('Turbo error:', err)
      setError('Failed to connect to simulation service')
    } finally {
      setRunning(false)
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'favorable':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unfavorable':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <MinusCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getRulingBadge = (ruling: string) => {
    const positive = ['admitted', 'granted', 'sustained']
    const negative = ['excluded', 'denied', 'overruled']

    if (positive.includes(ruling.toLowerCase())) {
      return <Badge className="bg-green-100 text-green-800">{ruling}</Badge>
    } else if (negative.includes(ruling.toLowerCase())) {
      return <Badge className="bg-red-100 text-red-800">{ruling}</Badge>
    }
    return <Badge variant="secondary">{ruling}</Badge>
  }

  return (
    <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Turbo Case Simulator
          </CardTitle>
          <Button
            onClick={runTurbo}
            disabled={running}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Simulating Trial...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Turbo
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          AI simulates 10 critical trial turns using your Pinecone documents
        </p>
      </CardHeader>

      {error && (
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              Simulation Error
            </h4>
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              Make sure you have documents imported from Pinecone and the case has facts entered.
            </p>
          </div>
        </CardContent>
      )}

      {result && (
        <CardContent className="space-y-6">
          {/* Warning if low document count */}
          {result.warning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {result.warning}
              </p>
            </div>
          )}

          {/* Documents Searched Indicator */}
          {result.stats.documents_searched !== undefined && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Searched {result.stats.documents_searched} document chunks from Pinecone
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-4 text-center border">
              <div className="text-3xl font-bold text-primary">{result.stats.plaintiff_score}%</div>
              <div className="text-xs text-muted-foreground">Plaintiff Win</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border">
              <div className="text-3xl font-bold text-green-600">{result.stats.favorable}</div>
              <div className="text-xs text-muted-foreground">Favorable Rulings</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border">
              <div className="text-3xl font-bold text-red-600">{result.stats.unfavorable}</div>
              <div className="text-xs text-muted-foreground">Unfavorable</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border">
              <div className="text-3xl font-bold text-orange-600">{result.stats.gap_to_100}%</div>
              <div className="text-xs text-muted-foreground">Gap to 100%</div>
            </div>
          </div>

          {/* Vulnerabilities */}
          {result.vulnerabilities.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" />
                Vulnerabilities Found
              </h4>
              <ul className="space-y-1">
                {result.vulnerabilities.map((v, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Path to 100% */}
          {result.path_to_100.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                Path to 100%
              </h4>
              <ol className="space-y-1">
                {result.path_to_100.map((p, i) => (
                  <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                    <span className="bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                      {i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Turn-by-Turn */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Trial Simulation ({result.stats.total_turns} turns)
            </h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {result.turns.map((turn, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    turn.impact === 'favorable'
                      ? 'bg-green-50 border-green-200'
                      : turn.impact === 'unfavorable'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {turn.party === 'plaintiff' ? (
                        <Scale className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Shield className="h-4 w-4 text-purple-600" />
                      )}
                      <span className="font-medium text-sm capitalize">{turn.party}</span>
                      {getImpactIcon(turn.impact)}
                    </div>
                    {getRulingBadge(turn.judge_ruling)}
                  </div>
                  <p className="text-sm mt-1">{turn.action}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    {turn.evidence_cited}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Judge: {turn.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Sources */}
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Documents analyzed ({result.evidence_sources.length})
            </summary>
            <div className="mt-2 flex flex-wrap gap-1">
              {result.evidence_sources.map((src, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {src.split('/').pop()}
                </Badge>
              ))}
            </div>
          </details>
        </CardContent>
      )}
    </Card>
  )
}
