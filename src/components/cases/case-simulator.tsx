'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Loader2,
  BarChart3,
  Lightbulb,
} from 'lucide-react'

interface SimulationResult {
  success: boolean
  summary: {
    iterations: number
    plaintiff_win_rate: number
    defendant_win_rate: number
    current_strength: number
    simulated_strength: number
    confidence_interval: string
  }
  critical_factors: {
    factor: string
    frequency: number
    recommendation: string
  }[]
  path_to_100: {
    gap: number
    actions_needed: string[]
  }
  strategic_advice: string
  decision_points: {
    name: string
    weight: number
    description: string
  }[]
  sample_scenarios: {
    scenario: string
    plaintiff_wins: boolean
    confidence: number
    key_factor: string
  }[]
}

interface CaseSimulatorProps {
  caseId: string
  caseName: string
}

export function CaseSimulator({ caseId }: CaseSimulatorProps) {
  const [iterations, setIterations] = useState(20)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)

  const runSimulation = async () => {
    setRunning(true)
    setResult(null)

    try {
      const response = await fetch(`/api/cases/${caseId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iterations, mode: 'turbo' }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch (err) {
      console.error('Simulation error:', err)
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card id="case-simulator" className="border-2 border-dashed border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Turbo Case Simulator
        </CardTitle>
        <CardDescription>
          Monte Carlo simulation - run multiple scenarios to stress-test your case
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label>Iterations: {iterations}</Label>
            <Slider
              value={[iterations]}
              onValueChange={(v) => setIterations(v[0])}
              min={10}
              max={100}
              step={10}
            />
            <p className="text-xs text-muted-foreground">
              More iterations = more accurate probability estimate
            </p>
          </div>
          <Button
            onClick={runSimulation}
            disabled={running}
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Turbo Analysis
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Win Probability Card */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className={result.summary.plaintiff_win_rate >= 70 ? 'bg-green-50 border-green-200' : result.summary.plaintiff_win_rate >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {result.summary.plaintiff_win_rate >= 70 ? (
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      ) : result.summary.plaintiff_win_rate >= 50 ? (
                        <BarChart3 className="h-6 w-6 text-yellow-600" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      )}
                      <span className="font-semibold">Plaintiff Win Rate</span>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {result.summary.confidence_interval}
                    </Badge>
                  </div>
                  <div className="text-5xl font-bold text-center mb-2">
                    {result.summary.plaintiff_win_rate}%
                  </div>
                  <Progress value={result.summary.plaintiff_win_rate} className="h-3" />
                  <p className="text-sm text-center text-muted-foreground mt-2">
                    Based on {result.summary.iterations} simulated scenarios
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-6 w-6 text-primary" />
                    <span className="font-semibold">Path to Victory</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Strength</span>
                      <span className="font-semibold">{result.summary.current_strength}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Simulated Probability</span>
                      <span className="font-semibold">{result.summary.simulated_strength}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Gap to 100%</span>
                      <span className="font-semibold text-orange-600">{result.path_to_100.gap}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strategic Advice */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Judge Stormont&apos;s Strategic Assessment</h4>
                    <p className="text-blue-800">{result.strategic_advice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Critical Risk Factors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Critical Risk Factors
                </CardTitle>
                <CardDescription>
                  Issues that most frequently cause adverse outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.critical_factors.map((factor, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{factor.factor}</span>
                        <Badge variant={factor.frequency > 50 ? 'destructive' : 'secondary'}>
                          {factor.frequency}% of losses
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 inline mr-1 text-green-500" />
                        {factor.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions Needed */}
            {result.path_to_100.gap > 0 && (
              <Card className="border-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Actions to Reach 100%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {result.path_to_100.actions_needed.map((action, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Sample Scenarios */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sample Scenarios</CardTitle>
                <CardDescription>Preview of simulated outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.sample_scenarios.map((scenario, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2 rounded ${
                        scenario.plaintiff_wins ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {scenario.plaintiff_wins ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">{scenario.scenario}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{scenario.key_factor}</span>
                        <Badge variant="outline">{scenario.confidence}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Decision Points Reference */}
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                View all decision points ({result.decision_points.length})
              </summary>
              <div className="mt-2 grid gap-2">
                {result.decision_points.map((dp, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>{dp.name}</span>
                    <Badge variant="outline">Weight: {dp.weight}/10</Badge>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
