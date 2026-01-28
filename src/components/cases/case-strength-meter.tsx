'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Scale, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import type { CaseFact } from '@/lib/types'

interface CaseStrengthMeterProps {
  facts: CaseFact[]
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

// Generic fact analysis patterns (no hardcoded case-specific logic)
const PLAINTIFF_PATTERNS = [
  { pattern: /preempt|supersede|override/i, weight: 8, label: 'Preemption argument' },
  { pattern: /vested|grandfathered|established right/i, weight: 8, label: 'Vested rights claim' },
  { pattern: /successor|assign|transfer/i, weight: 6, label: 'Successor status' },
  { pattern: /patent|deed|title/i, weight: 5, label: 'Title documentation' },
  { pattern: /documented|historical|continuous/i, weight: 4, label: 'Historical evidence' },
  { pattern: /permit|license|authorization/i, weight: 5, label: 'Regulatory compliance' },
]

const DEFENDANT_PATTERNS = [
  { pattern: /no permit|without authorization|unlicensed/i, weight: 6, label: 'Regulatory violation' },
  { pattern: /zoning|ordinance|regulation/i, weight: 5, label: 'Regulatory authority' },
  { pattern: /environmental|safety|public/i, weight: 4, label: 'Public interest' },
  { pattern: /gap|discontinu|abandon/i, weight: 5, label: 'Continuity issues' },
  { pattern: /recent|acquired|new/i, weight: 3, label: 'Recent acquisition' },
]

export function CaseStrengthMeter({
  facts,
  plaintiffName = 'Plaintiff',
  defendantName = 'Defendant',
}: CaseStrengthMeterProps) {
  const [analysis, setAnalysis] = useState<StrengthAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const hasAnalyzedRef = useRef(false)

  const analyzeCase = useCallback(() => {
    setIsAnalyzing(true)

    // Analyze facts by category
    const undisputedFacts = facts.filter((f) => f.category === 'undisputed' || f.category === 'stipulated')
    const disputedFacts = facts.filter((f) => f.category === 'disputed' || f.is_disputed)
    const evidenceFacts = facts.filter((f) => f.category === 'evidence_based')

    // Calculate scores based on generic fact patterns
    let plaintiffScore = 50
    let defenseScore = 50
    const matchedPlaintiffFactors: string[] = []
    const matchedDefenseFactors: string[] = []

    facts.forEach((fact) => {
      const text = fact.fact_text

      // Check plaintiff patterns
      PLAINTIFF_PATTERNS.forEach(({ pattern, weight, label }) => {
        if (pattern.test(text)) {
          plaintiffScore += weight
          if (!matchedPlaintiffFactors.includes(label)) {
            matchedPlaintiffFactors.push(label)
          }
        }
      })

      // Check defendant patterns
      DEFENDANT_PATTERNS.forEach(({ pattern, weight, label }) => {
        if (pattern.test(text)) {
          defenseScore += weight
          if (!matchedDefenseFactors.includes(label)) {
            matchedDefenseFactors.push(label)
          }
        }
      })

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
    const overallScore = Math.round(50 + ((plaintiffScore - defenseScore) / 2))

    // Build dynamic categories based on case type and matched patterns
    const categories = [
      {
        name: 'Documentary Evidence',
        score: evidenceFacts.length > 3 ? 80 : evidenceFacts.length > 0 ? 60 : 40,
        factors: [
          `${evidenceFacts.length} evidence-based facts documented`,
          `${undisputedFacts.length} undisputed facts established`,
        ],
      },
      {
        name: 'Legal Foundation',
        score: matchedPlaintiffFactors.length > 2 ? 75 : matchedPlaintiffFactors.length > 0 ? 55 : 40,
        factors: matchedPlaintiffFactors.length > 0
          ? matchedPlaintiffFactors.map(f => `${f} established in record`)
          : ['Legal foundation needs strengthening'],
      },
      {
        name: 'Opposition Strength',
        score: 100 - (matchedDefenseFactors.length > 2 ? 70 : matchedDefenseFactors.length > 0 ? 55 : 30),
        factors: matchedDefenseFactors.length > 0
          ? matchedDefenseFactors.map(f => `Defense argues: ${f}`)
          : ['Limited opposition arguments identified'],
      },
      {
        name: 'Risk Assessment',
        score: Math.max(0, 100 - (disputedFacts.length * 10)),
        factors: [
          `${disputedFacts.length} disputed facts requiring resolution`,
          disputedFacts.length > 2 ? 'High factual uncertainty' : 'Manageable factual disputes',
        ],
      },
    ]

    // Build dynamic strengths/weaknesses
    const strengths = [
      ...matchedPlaintiffFactors.slice(0, 3).map(f => `Strong ${f.toLowerCase()} in record`),
      `${undisputedFacts.length} facts are undisputed or stipulated`,
    ]

    const weaknesses = [
      ...matchedDefenseFactors.slice(0, 3).map(f => `Potential vulnerability: ${f.toLowerCase()}`),
      `${disputedFacts.length} key facts remain disputed`,
    ]

    const keyIssues = [
      ...matchedPlaintiffFactors.slice(0, 2).map(f => `Can ${f.toLowerCase()} be proven definitively?`),
      ...matchedDefenseFactors.slice(0, 1).map(f => `How to address ${f.toLowerCase()} argument?`),
    ]

    const strengthAnalysis: StrengthAnalysis = {
      overallScore: Math.min(100, Math.max(0, overallScore)),
      plaintiffStrength: plaintiffScore,
      defenseStrength: defenseScore,
      categories,
      strengths: strengths.filter(Boolean),
      weaknesses: weaknesses.filter(Boolean),
      keyIssues: keyIssues.length > 0 ? keyIssues : ['Analyze case facts to identify key issues'],
    }

    setAnalysis(strengthAnalysis)
    setIsAnalyzing(false)
  }, [facts])

  // Auto-analyze on mount if facts exist (using ref to prevent re-runs)
  useEffect(() => {
    if (facts.length > 0 && !hasAnalyzedRef.current) {
      hasAnalyzedRef.current = true
      // Use setTimeout to avoid setState during render
      const timeoutId = setTimeout(() => {
        analyzeCase()
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [facts, analyzeCase])

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
