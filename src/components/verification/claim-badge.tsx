'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type VerificationStatus = 'verified' | 'contradicted' | 'partially_verified' | 'unverified'

interface Source {
  document: string
  excerpt: string
  relevance: number
  page?: string
}

interface ClaimBadgeProps {
  status: VerificationStatus
  confidence?: number
  sources?: Source[]
  notes?: string
  compact?: boolean
  onExpand?: () => void
}

const statusConfig = {
  verified: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    label: 'Verified',
    description: 'Supported by case documents',
  },
  contradicted: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    label: 'Contradicted',
    description: 'Conflicts with evidence',
  },
  partially_verified: {
    icon: AlertCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    label: 'Partial',
    description: 'Some support found',
  },
  unverified: {
    icon: HelpCircle,
    color: 'text-gray-500',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    label: 'Unverified',
    description: 'No supporting evidence found',
  },
}

export function ClaimBadge({
  status,
  confidence,
  sources = [],
  notes,
  compact = false,
  onExpand,
}: ClaimBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-6 w-6 p-0 rounded-full',
              config.bg,
              'hover:scale-110 transition-transform'
            )}
          >
            <Icon className={cn('h-4 w-4', config.color)} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <ClaimBadgeContent
            status={status}
            confidence={confidence}
            sources={sources}
            notes={notes}
            onExpand={onExpand}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            'cursor-pointer transition-all hover:scale-105',
            config.border,
            config.bg,
            config.color
          )}
        >
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
          {confidence !== undefined && (
            <span className="ml-1 opacity-70">{confidence}%</span>
          )}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <ClaimBadgeContent
          status={status}
          confidence={confidence}
          sources={sources}
          notes={notes}
          onExpand={onExpand}
        />
      </PopoverContent>
    </Popover>
  )
}

function ClaimBadgeContent({
  status,
  confidence,
  sources,
  notes,
  onExpand,
}: Omit<ClaimBadgeProps, 'compact'>) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={cn('h-8 w-8 rounded-full flex items-center justify-center', config.bg)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        <div>
          <p className={cn('font-medium', config.color)}>{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
        {confidence !== undefined && (
          <Badge variant="secondary" className="ml-auto">
            {confidence}%
          </Badge>
        )}
      </div>

      {/* Notes */}
      {notes && (
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
          {notes}
        </div>
      )}

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Sources</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sources.map((source, i) => (
              <div
                key={i}
                className="text-sm border rounded-lg p-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium truncate">{source.document}</span>
                  {source.page && (
                    <span className="text-xs text-muted-foreground">p. {source.page}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground italic line-clamp-3">
                  &ldquo;{source.excerpt}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {source.relevance}% relevant
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expand Button */}
      {onExpand && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          className="w-full justify-between"
        >
          View full verification
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// Inline verified text component
interface VerifiedTextProps {
  children: React.ReactNode
  status: VerificationStatus
  sources?: Source[]
  notes?: string
}

export function VerifiedText({ children, status, sources, notes }: VerifiedTextProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span
          className={cn(
            'cursor-pointer border-b-2 border-dotted transition-colors',
            status === 'verified' && 'border-green-500/50 hover:border-green-500',
            status === 'contradicted' && 'border-red-500/50 hover:border-red-500',
            status === 'partially_verified' && 'border-amber-500/50 hover:border-amber-500',
            status === 'unverified' && 'border-gray-500/50 hover:border-gray-500'
          )}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <ClaimBadgeContent status={status} sources={sources} notes={notes} />
      </PopoverContent>
    </Popover>
  )
}
