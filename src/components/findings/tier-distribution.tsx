'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Layers } from 'lucide-react'

interface TierData {
  tier: number
  count: number
}

interface TierDistributionProps {
  byTier: TierData[]
}

function getTierColor(tier: number): {
  indicator: string
  label: string
  text: string
} {
  if (tier <= 3) {
    return {
      indicator: '[&>div]:bg-emerald-500',
      label: 'bg-emerald-100 text-emerald-800',
      text: 'text-emerald-700',
    }
  }
  if (tier <= 6) {
    return {
      indicator: '[&>div]:bg-amber-500',
      label: 'bg-amber-100 text-amber-800',
      text: 'text-amber-700',
    }
  }
  return {
    indicator: '[&>div]:bg-slate-400',
    label: 'bg-slate-100 text-slate-700',
    text: 'text-slate-600',
  }
}

function getTierGroupLabel(tier: number): string {
  if (tier <= 3) return 'Critical'
  if (tier <= 6) return 'Important'
  return 'Supporting'
}

export function TierDistribution({ byTier }: TierDistributionProps) {
  const maxCount = Math.max(...byTier.map((t) => t.count), 1)
  const totalCount = byTier.reduce((sum, t) => sum + t.count, 0)

  // Group summary
  const criticalCount = byTier
    .filter((t) => t.tier <= 3)
    .reduce((sum, t) => sum + t.count, 0)
  const importantCount = byTier
    .filter((t) => t.tier >= 4 && t.tier <= 6)
    .reduce((sum, t) => sum + t.count, 0)
  const supportingCount = byTier
    .filter((t) => t.tier >= 7)
    .reduce((sum, t) => sum + t.count, 0)

  return (
    <Card id="tier-distribution">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Tier Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Group Summary */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="text-lg font-bold text-emerald-700">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">Tiers 1-3 (Critical)</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="text-lg font-bold text-amber-700">{importantCount}</p>
            <p className="text-xs text-muted-foreground">Tiers 4-6 (Important)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-lg font-bold text-slate-600">{supportingCount}</p>
            <p className="text-xs text-muted-foreground">Tiers 7-12 (Supporting)</p>
          </div>
        </div>

        {/* Individual Tiers */}
        <div className="space-y-3">
          {byTier.map((tierData) => {
            const colors = getTierColor(tierData.tier)
            const percentage = totalCount > 0
              ? Math.round((tierData.count / totalCount) * 100)
              : 0
            const barValue = maxCount > 0
              ? Math.round((tierData.count / maxCount) * 100)
              : 0

            return (
              <div key={tierData.tier} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center h-5 w-5 rounded text-xs font-medium ${colors.label}`}
                    >
                      {tierData.tier}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {getTierGroupLabel(tierData.tier)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${colors.text}`}>
                      {tierData.count}
                    </span>
                    {tierData.count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({percentage}%)
                      </span>
                    )}
                  </div>
                </div>
                <Progress
                  value={barValue}
                  className={`h-2 ${colors.indicator}`}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
