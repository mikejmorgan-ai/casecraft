'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  Highlighter,
} from 'lucide-react'

interface DocumentQuickViewProps {
  id: string
  title: string
  relevance: number
  summary: string
  keyExcerpts: string[]
  docType: string
  dateReference?: string
  isReviewed?: boolean
  onToggleReviewed?: (id: string) => void
}

export function DocumentQuickView({
  id,
  title,
  relevance,
  summary,
  keyExcerpts,
  docType,
  dateReference,
  isReviewed,
  onToggleReviewed,
}: DocumentQuickViewProps) {
  const [expanded, setExpanded] = useState(false)

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-amber-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-gray-500'
  }

  const getRelevanceBg = (score: number) => {
    if (score >= 80) return 'bg-red-50 border-red-200'
    if (score >= 60) return 'bg-amber-50 border-amber-200'
    if (score >= 40) return 'bg-yellow-50 border-yellow-200'
    return 'bg-gray-50 border-gray-200'
  }

  return (
    <Card className={`overflow-hidden transition-all ${expanded ? 'ring-1 ring-[#1a365d]/20' : ''}`}>
      <CardContent className="pt-4 pb-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm truncate">{title}</h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">{docType}</Badge>
                {dateReference && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {dateReference}
                  </span>
                )}
                {isReviewed !== undefined && (
                  <Badge
                    className={`text-xs cursor-pointer ${
                      isReviewed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => onToggleReviewed?.(id)}
                  >
                    {isReviewed ? 'Reviewed' : 'Unreviewed'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Relevance Score */}
            <div className="text-center">
              <span className={`text-lg font-bold ${getRelevanceColor(relevance)}`}>
                {relevance}
              </span>
              <p className="text-[10px] text-muted-foreground">relevance</p>
            </div>

            {/* Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Relevance Bar */}
        <div className="mt-3">
          <Progress value={relevance} className="h-1.5" />
        </div>

        {/* Summary (always visible) */}
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
          {summary}
        </p>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Full Summary */}
            <div>
              <h5 className="text-xs font-medium text-[#1a365d] uppercase tracking-wider mb-1">
                Summary
              </h5>
              <p className="text-sm">{summary}</p>
            </div>

            {/* Key Excerpts */}
            {keyExcerpts.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-[#1a365d] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Highlighter className="h-3 w-3" />
                  Key Excerpts
                </h5>
                <div className="space-y-2">
                  {keyExcerpts.map((excerpt, i) => (
                    <div
                      key={i}
                      className={`text-sm p-3 rounded border-l-2 border-l-amber-400 ${getRelevanceBg(relevance)}`}
                    >
                      <span className="italic">&ldquo;{excerpt}&rdquo;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
