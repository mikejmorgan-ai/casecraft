import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Scale, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClaimSummary {
  claim_id: string
  claim_number: number
  claim_title: string
  relief_type: string
  count: number
  smoking_guns: number
  tier_breakdown: Record<number, number>
}

interface ClaimStrengthSummaryProps {
  claims: ClaimSummary[]
  totalEvidence: number
}

const RELIEF_TYPE_LABELS: Record<string, string> = {
  declaratory: 'Declaratory',
  injunctive: 'Injunctive',
  regulatory_taking: 'Regulatory Taking',
  damages: 'Damages',
  restitution: 'Restitution',
  specific_performance: 'Specific Performance',
  attorneys_fees: "Attorney's Fees",
  other: 'Other',
}

function getStrengthLevel(count: number, smokingGuns: number): {
  label: string
  color: string
  borderColor: string
} {
  if (smokingGuns >= 2 && count >= 5) {
    return { label: 'Strong', color: 'text-emerald-600', borderColor: 'border-emerald-500/30' }
  }
  if (smokingGuns >= 1 || count >= 3) {
    return { label: 'Moderate', color: 'text-amber-600', borderColor: 'border-amber-500/30' }
  }
  if (count > 0) {
    return { label: 'Developing', color: 'text-blue-600', borderColor: 'border-blue-500/30' }
  }
  return { label: 'No Evidence', color: 'text-slate-500', borderColor: 'border-slate-200' }
}

export function ClaimStrengthSummary({
  claims,
  totalEvidence,
}: ClaimStrengthSummaryProps) {
  return (
    <div id="claim-strength-summary" className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Scale className="h-5 w-5" />
        Per-Claim Breakdown
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {claims.map((claim) => {
          const strength = getStrengthLevel(claim.count, claim.smoking_guns)
          const evidenceShare = totalEvidence > 0
            ? Math.round((claim.count / totalEvidence) * 100)
            : 0

          // Tier group counts
          const criticalTiers = Object.entries(claim.tier_breakdown)
            .filter(([tier]) => Number(tier) <= 3)
            .reduce((sum, [, count]) => sum + count, 0)
          const importantTiers = Object.entries(claim.tier_breakdown)
            .filter(([tier]) => Number(tier) >= 4 && Number(tier) <= 6)
            .reduce((sum, [, count]) => sum + count, 0)
          const supportingTiers = Object.entries(claim.tier_breakdown)
            .filter(([tier]) => Number(tier) >= 7)
            .reduce((sum, [, count]) => sum + count, 0)

          return (
            <Card
              key={claim.claim_id}
              className={cn('border transition-colors', strength.borderColor)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs shrink-0">
                        Claim #{claim.claim_number}
                      </Badge>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {RELIEF_TYPE_LABELS[claim.relief_type] || claim.relief_type}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 text-sm leading-snug">
                      {claim.claim_title}
                    </CardTitle>
                  </div>
                  <span className={cn('text-xs font-medium shrink-0', strength.color)}>
                    {strength.label}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Evidence count bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Evidence items</span>
                    <span className="font-medium">{claim.count}</span>
                  </div>
                  <Progress
                    value={evidenceShare}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {evidenceShare}% of total evidence
                  </p>
                </div>

                {/* Tier breakdown */}
                {claim.count > 0 && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">T1-3: {criticalTiers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">T4-6: {importantTiers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      <span className="text-muted-foreground">T7-12: {supportingTiers}</span>
                    </div>
                  </div>
                )}

                {/* Smoking guns */}
                {claim.smoking_guns > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
                    <Flame className="h-4 w-4 text-red-500 shrink-0" />
                    <span className="text-xs font-medium text-red-700">
                      {claim.smoking_guns} smoking gun{claim.smoking_guns !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {claims.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Scale className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No claims for relief have been established for this case.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
