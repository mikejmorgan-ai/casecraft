'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  ArrowRight,
} from 'lucide-react'

interface ComparisonData {
  whatWeGotRight: string[]
  whatWeMissed: string[]
  keyDifferences: string[]
  lessonsLearned: string[]
}

interface ProceduralAnalysis {
  wasProcedural: boolean
  proceduralType?: string
  couldHavePredicted: boolean
  signals: string[]
}

interface AccuracyScorecardProps {
  predictedOutcome: string
  actualOutcome: string
  isCorrect: boolean
  accuracyScore: number
  comparison: ComparisonData
  proceduralAnalysis?: ProceduralAnalysis
  actualRulingSummary?: string
}

export function AccuracyScorecard({
  predictedOutcome,
  actualOutcome,
  isCorrect,
  accuracyScore,
  comparison,
  proceduralAnalysis,
  actualRulingSummary,
}: AccuracyScorecardProps) {
  const getOutcomeColor = (outcome: string) => {
    if (outcome.includes('plaintiff')) return 'bg-blue-500'
    if (outcome.includes('defendant')) return 'bg-amber-500'
    if (outcome.includes('dismiss') || outcome.includes('moot')) return 'bg-gray-500'
    return 'bg-purple-500'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Accuracy Score Header */}
      <div className="text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          {isCorrect ? (
            <CheckCircle className="h-14 w-14 text-green-500" />
          ) : (
            <XCircle className="h-14 w-14 text-red-500" />
          )}
          <div>
            <span className={`text-5xl font-bold ${getScoreColor(accuracyScore)}`}>
              {accuracyScore}%
            </span>
            <p className="text-muted-foreground text-sm">Accuracy Score</p>
          </div>
        </div>
        <Progress
          value={accuracyScore}
          className="h-3 max-w-sm mx-auto"
        />
      </div>

      {/* Side-by-Side Outcome Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200 text-center">
          <p className="text-sm text-muted-foreground mb-2">AI Predicted</p>
          <Badge className={`${getOutcomeColor(predictedOutcome)} text-white text-base px-3 py-1`}>
            {predictedOutcome.toUpperCase()}
          </Badge>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-200 text-center">
          <p className="text-sm text-muted-foreground mb-2">Actual Ruling</p>
          <Badge className={`${getOutcomeColor(actualOutcome)} text-white text-base px-3 py-1`}>
            {actualOutcome.toUpperCase()}
          </Badge>
        </Card>
      </div>

      {/* Match indicator */}
      <div className="flex justify-center">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          isCorrect
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {isCorrect ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Prediction Matched Actual Outcome
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              Prediction Did Not Match Actual Outcome
            </>
          )}
        </div>
      </div>

      {/* Actual Ruling Summary */}
      {actualRulingSummary && (
        <Card className="p-4 bg-slate-50 border-l-4 border-l-amber-500">
          <h4 className="font-medium text-[#1a365d] mb-2">Actual Ruling Summary</h4>
          <p className="text-sm leading-relaxed">{actualRulingSummary}</p>
        </Card>
      )}

      {/* What We Got Right */}
      {comparison.whatWeGotRight.length > 0 && (
        <div>
          <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> What the AI Got Right
          </h4>
          <ul className="space-y-1">
            {comparison.whatWeGotRight.map((item, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-green-400 mt-0.5">
                  <ArrowRight className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What We Missed */}
      {comparison.whatWeMissed.length > 0 && (
        <div>
          <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
            <XCircle className="h-4 w-4" /> What the AI Missed
          </h4>
          <ul className="space-y-1">
            {comparison.whatWeMissed.map((item, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-red-400 mt-0.5">
                  <ArrowRight className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Differences */}
      {comparison.keyDifferences.length > 0 && (
        <div>
          <h4 className="font-medium text-[#1a365d] mb-2">Key Differences</h4>
          <ul className="space-y-1">
            {comparison.keyDifferences.map((item, i) => (
              <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                <span className="text-[#1a365d] mt-0.5">
                  <ArrowRight className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Procedural Analysis */}
      {proceduralAnalysis?.wasProcedural && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Procedural Dismissal Analysis
          </h4>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Type:</strong> {proceduralAnalysis.proceduralType}
            </p>
            <p>
              <strong>Could have predicted:</strong>{' '}
              {proceduralAnalysis.couldHavePredicted ? 'Yes' : 'Unlikely'}
            </p>
            {proceduralAnalysis.signals.length > 0 && (
              <div>
                <p className="font-medium">Signals that were present:</p>
                <ul className="list-disc list-inside mt-1">
                  {proceduralAnalysis.signals.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Lessons Learned */}
      {comparison.lessonsLearned.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lessons Learned
          </h4>
          <ul className="space-y-1">
            {comparison.lessonsLearned.map((item, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">
                  <ArrowRight className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
