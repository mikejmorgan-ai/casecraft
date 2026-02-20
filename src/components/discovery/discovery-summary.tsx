'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'

interface DiscoverySummaryProps {
  totalDocuments: number
  reviewedCount: number
  flaggedCount: number
  categoryCount: number
  isOrganized: boolean
}

export function DiscoverySummary({
  totalDocuments,
  reviewedCount,
  flaggedCount,
  categoryCount,
  isOrganized,
}: DiscoverySummaryProps) {
  const unreviewedCount = totalDocuments - reviewedCount

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <Card>
        <CardContent className="pt-4 pb-4 text-center">
          <div className="flex justify-center mb-2">
            <FileText className="h-5 w-5 text-[#1a365d]" />
          </div>
          <p className="text-2xl font-bold text-[#1a365d]">{totalDocuments}</p>
          <p className="text-xs text-muted-foreground">Total Documents</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4 text-center">
          <div className="flex justify-center mb-2">
            <FolderOpen className="h-5 w-5 text-[#1a365d]" />
          </div>
          <p className="text-2xl font-bold text-[#1a365d]">{categoryCount}</p>
          <p className="text-xs text-muted-foreground">Categories</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4 text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{flaggedCount}</p>
          <p className="text-xs text-muted-foreground">High Relevance</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4 text-center">
          <div className="flex justify-center mb-2">
            {isOrganized ? (
              unreviewedCount > 0 ? (
                <Clock className="h-5 w-5 text-orange-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )
            ) : (
              <Clock className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <p className="text-2xl font-bold text-[#1a365d]">
            {isOrganized ? reviewedCount : 0}
          </p>
          <div className="flex justify-center mt-1">
            {isOrganized ? (
              unreviewedCount > 0 ? (
                <Badge variant="outline" className="text-xs">
                  {unreviewedCount} unreviewed
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  All reviewed
                </Badge>
              )
            ) : (
              <Badge variant="secondary" className="text-xs">
                Not organized
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
