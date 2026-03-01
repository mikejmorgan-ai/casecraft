import { Card, CardContent } from '@/components/ui/card'
import { FileText, Flame, Scale, Layers } from 'lucide-react'

interface FindingsSummaryProps {
  totalEvidence: number
  smokingGunCount: number
  claimsCovered: number
  totalClaims: number
}

export function FindingsSummary({
  totalEvidence,
  smokingGunCount,
  claimsCovered,
  totalClaims,
}: FindingsSummaryProps) {
  const stats = [
    {
      label: 'Total Evidence',
      value: totalEvidence,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Smoking Guns',
      value: smokingGunCount,
      icon: Flame,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Claims Covered',
      value: `${claimsCovered} / ${totalClaims}`,
      icon: Scale,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Coverage Rate',
      value: totalClaims > 0
        ? `${Math.round((claimsCovered / totalClaims) * 100)}%`
        : '0%',
      icon: Layers,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ]

  return (
    <div id="findings-summary" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
