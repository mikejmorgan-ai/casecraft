'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Scale, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import type { CaseFact } from '@/lib/types'
import { getCurrentPlaintiff } from '@/lib/case-ledger'

interface CaseStrengthMeterProps {
  caseId: string
  facts: CaseFact[]
  caseName: string
  plaintiffName?: string
  defendantName?: string
}

interface StrengthAnalysis {
  overallScore: number
  plaintiffStrength: number
  defenseStrength: number
  categories: {
    name: string
    score: number
    factors: string[]
  }[]
  strengths: string[]
  weaknesses: string[]
  keyIssues: string[]
}

export function CaseStrengthMeter({
  facts,
  plaintiffName = 'Plaintiff',
  defendantName = 'Defendant',
}: CaseStrengthMeterProps) {
  const [analysis, setAnalysis] = useState<StrengthAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeCase = async () => {
    setIsAnalyzing(true)

    // Analyze facts locally
    const undisputedFacts = facts.filter((f) => f.category === 'undisputed' || f.category === 'stipulated')
    const disputedFacts = facts.filter((f) => f.category === 'disputed' || f.is_disputed)
    const evidenceFacts = facts.filter((f) => f.category === 'evidence_based')

    // Calculate scores based on fact patterns
    let plaintiffScore = 50
    let defenseScore = 50

    // Analyze fact content for case-specific patterns
    facts.forEach((fact) => {
      const text = fact.fact_text.toLowerCase()

      // Favorable to plaintiff
      if (text.includes('preempt') || text.includes('17-41-402')) {
        plaintiffScore += 8
      }
      if (text.includes('vested right') || text.includes('17-41-501')) {
        plaintiffScore += 8
      }
      if (text.includes('successor') || text.includes('17-41-101')) {
        plaintiffScore += 6
      }
      if (text.includes('1895') && text.includes('patent')) {
        plaintiffScore += 5
      }
      if (text.includes('mining') && (text.includes('documented') || text.includes('historical'))) {
        plaintiffScore += 4
      }
      if (text.includes('portland cement') || text.includes('lone star')) {
        plaintiffScore += 5
      }

      // Favorable to defense (County)
      if (text.includes('no permit') || text.includes('never held')) {
        defenseScore += 6
      }
      if (text.includes('zoning authority') || text.includes('valid exercise')) {
        defenseScore += 5
      }
      if (text.includes('environmental') || text.includes('water quality')) {
        defenseScore += 4
      }
      if (text.includes('gap') || text.includes('discontinu')) {
        defenseScore += 5
      }
      if (text.includes('2021') && text.includes('acquired')) {
        defenseScore += 3 // Recent acquisition
      }

      // Disputed facts reduce certainty for both
      if (fact.is_disputed) {
        plaintiffScore -= 2
        defenseScore -= 2
      }
    })

    // Normalize scores to 0-100
    plaintiffScore = Math.min(100, Math.max(0, plaintiffScore))
    defenseScore = Math.min(100, Math.max(0, defenseScore))

    // Calculate overall score (plaintiff advantage)
    const overallScore = Math.round(
      50 + ((plaintiffScore - defenseScore) / 2)
    )

    // Build analysis
    const strengthAnalysis: StrengthAnalysis = {
      overallScore: Math.min(100, Math.max(0, overallScore)),
      plaintiffStrength: plaintiffScore,
      defenseStrength: defenseScore,
      categories: [
        {
          name: 'State Preemption',
          score: facts.some((f) => f.fact_text.toLowerCase().includes('17-41-402')) ? 75 : 50,
          factors: [
            'Utah Code §17-41-402 expressly preempts county mining regulation',
            facts.some((f) => f.fact_text.toLowerCase().includes('preempt'))
              ? 'Preemption argument documented in case facts'
              : 'Preemption argument needs strengthening',
          ],
        },
        {
          name: 'Vested Rights',
          score: facts.some((f) => f.fact_text.toLowerCase().includes('successor')) ? 70 : 45,
          factors: [
            'Successor status under §17-41-101(13)',
            'Historical mining operations documented from 1906',
            facts.some((f) => f.is_disputed && f.fact_text.toLowerCase().includes('successor'))
              ? 'County disputes successor status'
              : 'Successor chain established',
          ],
        },
        {
          name: 'Documentary Evidence',
          score: evidenceFacts.length > 3 ? 80 : evidenceFacts.length > 0 ? 60 : 40,
          factors: [
            `${evidenceFacts.length} evidence-based facts documented`,
            `${undisputedFacts.length} undisputed facts established`,
            'Chain of title spans 126 years with 62 transactions',
          ],
        },
        {
          name: 'Legal Risk',
          score: 100 - (disputedFacts.length * 8),
          factors: [
            `${disputedFacts.length} disputed facts requiring resolution`,
            'County may argue lack of continuous operations',
            'Regulatory taking claim requires showing no viable use',
          ],
        },
      ],
      strengths: [
        'Mining rights trace to 1895 federal land patents',
        'Utah Code §17-41-402 provides strong preemption language',
        'Historical operations well-documented (Portland Cement, Lone Star)',
        `${undisputedFacts.length} facts are undisputed or stipulated`,
      ],
      weaknesses: [
        'Gap in active mining operations between 1990s and 2021',
        'No current mining permits held',
        'County argues valid zoning authority',
        `${disputedFacts.length} key facts remain disputed`,
      ],
      keyIssues: [
        `Does successor status under §17-41-101(13) apply to ${getCurrentPlaintiff()}?`,
        'Was mining activity continuous enough to establish vesting?',
        'Does Ordinance 1895 constitute a regulatory taking?',
      ],
    }

    setAnalysis(strengthAnalysis)
    setIsAnalyzing(false)
  }

  useEffect(() => {
    if (facts.length > 0 && !analysis) {
      setTimeout(() => analyzeCase(), 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facts])

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'Strong'
    if (score >= 60) return 'Favorable'
    if (score >= 50) return 'Even'
    if (score >= 40) return 'Challenging'
    return 'Weak'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 60) return <TrendingUp className="h-4 w-4" />
    if (score >= 40) return <Minus className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  if (!analysis && !isAnalyzing) {
    return (
      <Card id="case-strength-meter">
        <CardContent className="py-8 text-center">
          <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Analyze case strength based on documented facts
          </p>
          <Button onClick={analyzeCase}>
            <Scale className="h-4 w-4 mr-2" />
            Analyze Case
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isAnalyzing) {
    return (
      <Card id="case-strength-meter">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing case strength...</p>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) return null

  return (
    <Card id="case-strength-meter">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Case Strength Analysis
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={analyzeCase}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div id="overall-score" className="text-center">
          <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
            {analysis.overallScore}
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            {getScoreIcon(analysis.overallScore)}
            <span className="text-sm text-muted-foreground">
              {getScoreLabel(analysis.overallScore)} Position for {plaintiffName}
            </span>
          </div>
        </div>

        {/* Party Comparison */}
        <div id="party-comparison" className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground">{plaintiffName}</p>
            <p className="text-2xl font-bold text-blue-600">{analysis.plaintiffStrength}%</p>
            <Progress value={analysis.plaintiffStrength} className="mt-2 h-2" />
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-muted-foreground">{defendantName}</p>
            <p className="text-2xl font-bold text-red-600">{analysis.defenseStrength}%</p>
            <Progress value={analysis.defenseStrength} className="mt-2 h-2" />
          </div>
        </div>

        {/* Category Breakdown */}
        <div id="category-breakdown" className="space-y-3">
          <h4 className="font-medium text-sm">Analysis by Category</h4>
          {analysis.categories.map((cat, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{cat.name}</span>
                <Badge variant={cat.score >= 60 ? 'default' : cat.score >= 40 ? 'secondary' : 'destructive'}>
                  {cat.score}%
                </Badge>
              </div>
              <Progress value={cat.score} className="h-2" />
            </div>
          ))}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          <div id="case-strengths">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Strengths
            </h4>
            <ul className="text-sm space-y-1">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-muted-foreground">• {s}</li>
              ))}
            </ul>
          </div>
          <div id="case-weaknesses">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Weaknesses
            </h4>
            <ul className="text-sm space-y-1">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="text-muted-foreground">• {w}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key Issues */}
        <div id="key-issues">
          <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Key Issues to Resolve
          </h4>
          <ul className="text-sm space-y-1">
            {analysis.keyIssues.map((issue, i) => (
              <li key={i} className="text-muted-foreground">• {issue}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
