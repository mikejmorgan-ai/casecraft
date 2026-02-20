import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TierBadgeProps {
  tier: number | null
  className?: string
}

const TIER_COLORS: Record<string, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

function getTierColor(tier: number | null): string {
  if (tier === null) return TIER_COLORS.neutral
  if (tier >= 1 && tier <= 3) return TIER_COLORS.green
  if (tier >= 4 && tier <= 6) return TIER_COLORS.yellow
  if (tier >= 7 && tier <= 12) return TIER_COLORS.red
  return TIER_COLORS.neutral
}

function getTierLabel(tier: number | null): string {
  if (tier === null) return 'No Tier'
  return `Tier ${tier}`
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  return (
    <Badge className={cn(getTierColor(tier), className)}>
      {getTierLabel(tier)}
    </Badge>
  )
}
