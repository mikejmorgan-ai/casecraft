'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Eye, Loader2, AlertTriangle } from 'lucide-react'
import { AccuracyScorecard } from './accuracy-scorecard'

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

interface RevealResponse {
  success: boolean
  actualRuling: string
  actualRulingSummary: string
  comparisons: ComparisonResult[]
  overallAccuracy: number
  totalPredictions: number
  correctPredictions: number
}

interface RulingRevealProps {
  caseId: string
  hasPrediction: boolean
  onRevealed?: (data: RevealResponse) => void
}

export function RulingReveal({
  caseId,
  hasPrediction,
  onRevealed,
}: RulingRevealProps) {
  const [revealing, setRevealing] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [revealData, setRevealData] = useState<RevealResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleReveal = async () => {
    setConfirmOpen(false)
    setRevealing(true)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${caseId}/reveal`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Reveal failed')
      }

      const data: RevealResponse = await response.json()
      setRevealData(data)
      setRevealed(true)
      onRevealed?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reveal ruling')
      console.error(err)
    } finally {
      setRevealing(false)
    }
  }

  if (revealed && revealData) {
    const primary = revealData.comparisons[0]
    return (
      <div className="space-y-6">
        {/* Reveal Header with animation */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className="text-2xl font-serif font-bold text-[#1a365d] mb-2">
            Ruling Revealed
          </h3>
          <p className="text-muted-foreground">
            {revealData.correctPredictions} of {revealData.totalPredictions} prediction(s) matched
            the actual outcome
          </p>
        </div>

        {/* Overall Accuracy */}
        {revealData.totalPredictions > 1 && (
          <Card className="p-4 bg-primary/5 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <p className="text-sm text-muted-foreground mb-1">Overall Accuracy</p>
            <span className="text-4xl font-bold text-[#1a365d]">
              {revealData.overallAccuracy}%
            </span>
          </Card>
        )}

        {/* Primary Comparison */}
        {primary && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <AccuracyScorecard
              predictedOutcome={primary.predictedOutcome}
              actualOutcome={primary.actualOutcome}
              isCorrect={primary.isCorrect}
              accuracyScore={primary.accuracyScore}
              comparison={primary.comparison}
              proceduralAnalysis={primary.proceduralAnalysis}
              actualRulingSummary={revealData.actualRulingSummary}
            />
          </div>
        )}

        {/* Additional Predictions */}
        {revealData.comparisons.length > 1 && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-[#1a365d]">
              View {revealData.comparisons.length - 1} additional prediction comparison(s)
            </summary>
            <div className="mt-4 space-y-6">
              {revealData.comparisons.slice(1).map((comp, i) => (
                <Card key={i} className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">Prediction #{i + 2}</p>
                  <AccuracyScorecard
                    predictedOutcome={comp.predictedOutcome}
                    actualOutcome={comp.actualOutcome}
                    isCorrect={comp.isCorrect}
                    accuracyScore={comp.accuracyScore}
                    comparison={comp.comparison}
                    proceduralAnalysis={comp.proceduralAnalysis}
                  />
                </Card>
              ))}
            </div>
          </details>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {revealing ? (
        <Card className="p-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#1a365d] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1a365d] mb-2">
            Revealing Actual Ruling...
          </h3>
          <p className="text-sm text-muted-foreground">
            Comparing your AI prediction against the real outcome
          </p>
        </Card>
      ) : (
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={!hasPrediction}
              variant="outline"
              className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
              size="lg"
            >
              <Eye className="h-5 w-5 mr-2" />
              Reveal Actual Ruling
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reveal Actual Ruling?</DialogTitle>
              <DialogDescription>
                This will permanently reveal the actual ruling for this case and compare it
                against your AI prediction. This action cannot be undone -- the blind test
                will be marked as revealed.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Once revealed, you will not be able to run additional blind predictions
                for this case.
              </span>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReveal}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Confirm Reveal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
