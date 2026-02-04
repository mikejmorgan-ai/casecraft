'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Clock,
  Zap,
  Shield,
  FileText,
  Scale,
  Target,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Fix {
  action: string
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  deadline?: string
  details: string
}

interface Weakness {
  id: string
  category: 'evidence' | 'legal' | 'procedural' | 'strategic'
  severity: 'critical' | 'major' | 'minor'
  title: string
  description: string
  impact: string
  fixes: Fix[]
  citations: string[]
}

interface AnalysisResult {
  weaknesses: Weakness[]
  summary: {
    critical_count: number
    major_count: number
    minor_count: number
    top_priority: string
    overall_risk: 'low' | 'medium' | 'high'
  }
}

interface WeaknessAnalysisProps {
  caseId: string
  caseName: string
}

const categoryIcons = {
  evidence: FileText,
  legal: Scale,
  procedural: Clock,
  strategic: Target,
}

const categoryColors = {
  evidence: 'text-blue-500 bg-blue-500/10',
  legal: 'text-purple-500 bg-purple-500/10',
  procedural: 'text-amber-500 bg-amber-500/10',
  strategic: 'text-green-500 bg-green-500/10',
}

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  major: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  minor: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
}

export function WeaknessAnalysis({ caseId, caseName }: WeaknessAnalysisProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${caseId}/weaknesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setResult(data.analysis)
      
      // Auto-expand critical weaknesses
      const criticalIds = data.analysis.weaknesses
        .filter((w: Weakness) => w.severity === 'critical')
        .map((w: Weakness) => w.id)
      setExpandedIds(new Set(criticalIds))
    } catch (err) {
      setError('Failed to analyze weaknesses')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getRiskScore = () => {
    if (!result) return 0
    const critical = result.summary.critical_count * 30
    const major = result.summary.major_count * 15
    const minor = result.summary.minor_count * 5
    return Math.min(100, critical + major + minor)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Weakness Analysis
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Identify vulnerabilities and get strategic fixes
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              {result ? 'Re-analyze' : 'Analyze Case'}
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className={cn(
              'border-2',
              result.summary.overall_risk === 'high' ? 'border-red-500/50' :
              result.summary.overall_risk === 'medium' ? 'border-amber-500/50' :
              'border-green-500/50'
            )}>
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">Overall Risk</p>
                <p className={cn(
                  'text-2xl font-bold mt-1 capitalize',
                  result.summary.overall_risk === 'high' ? 'text-red-500' :
                  result.summary.overall_risk === 'medium' ? 'text-amber-500' :
                  'text-green-500'
                )}>
                  {result.summary.overall_risk}
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-500 mt-1">
                  {result.summary.critical_count}
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-500/30">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">Major</p>
                <p className="text-2xl font-bold text-amber-500 mt-1">
                  {result.summary.major_count}
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">Minor</p>
                <p className="text-2xl font-bold text-blue-500 mt-1">
                  {result.summary.minor_count}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold mt-1">
                  {result.weaknesses.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Score Bar */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Risk Score</span>
                <span className="text-sm text-muted-foreground">{getRiskScore()}%</span>
              </div>
              <Progress 
                value={getRiskScore()} 
                className={cn(
                  'h-3',
                  getRiskScore() > 60 ? '[&>div]:bg-red-500' :
                  getRiskScore() > 30 ? '[&>div]:bg-amber-500' :
                  '[&>div]:bg-green-500'
                )}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {result.summary.top_priority}
              </p>
            </CardContent>
          </Card>

          {/* Weaknesses List */}
          <div className="space-y-3">
            {result.weaknesses.map((weakness) => {
              const isExpanded = expandedIds.has(weakness.id)
              const SeverityIcon = severityConfig[weakness.severity].icon
              const CategoryIcon = categoryIcons[weakness.category]

              return (
                <Card
                  key={weakness.id}
                  className={cn(
                    'border transition-all duration-200',
                    severityConfig[weakness.severity].border,
                    isExpanded && 'ring-1 ring-primary/20'
                  )}
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleExpand(weakness.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                        severityConfig[weakness.severity].bg
                      )}>
                        <SeverityIcon className={cn('h-5 w-5', severityConfig[weakness.severity].color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{weakness.title}</h3>
                          <Badge variant="outline" className={cn('text-xs', categoryColors[weakness.category])}>
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {weakness.category}
                          </Badge>
                          <Badge
                            variant={weakness.severity === 'critical' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {weakness.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {weakness.description}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 border-t">
                      {/* Impact */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Impact
                        </h4>
                        <p className="text-sm text-muted-foreground">{weakness.impact}</p>
                      </div>

                      {/* Fixes */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                          <Lightbulb className="h-4 w-4 text-green-500" />
                          Recommended Fixes
                        </h4>
                        <div className="space-y-3">
                          {weakness.fixes.map((fix, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{fix.action}</p>
                                <p className="text-xs text-muted-foreground mt-1">{fix.details}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    Effort: {fix.effort}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Impact: {fix.impact}
                                  </Badge>
                                  {fix.deadline && (
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {fix.deadline}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Citations */}
                      {weakness.citations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            Sources
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {weakness.citations.map((cite, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                {cite}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg">No Analysis Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Click &quot;Analyze Case&quot; to identify weaknesses and get strategic recommendations
            </p>
            <Button onClick={runAnalysis} className="gap-2">
              <Shield className="h-4 w-4" />
              Analyze Case
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
