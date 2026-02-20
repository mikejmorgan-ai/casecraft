'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DocumentQuickView } from './document-quick-view'
import {
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Tag,
  CheckSquare,
} from 'lucide-react'

interface OrganizedDocument {
  id: string
  title: string
  relevance: number
  summary: string
  keyExcerpts: string[]
  docType: string
  dateReference?: string
}

interface DocumentCategoryViewProps {
  name: string
  description: string
  documents: OrganizedDocument[]
  selectedDocIds: Set<string>
  reviewedDocIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleReviewed: (id: string) => void
  defaultExpanded?: boolean
}

export function DocumentCategoryView({
  name,
  description,
  documents,
  selectedDocIds,
  reviewedDocIds,
  onToggleSelect,
  onToggleReviewed,
  defaultExpanded = true,
}: DocumentCategoryViewProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const avgRelevance = documents.length > 0
    ? Math.round(documents.reduce((sum, d) => sum + d.relevance, 0) / documents.length)
    : 0

  const reviewedCount = documents.filter((d) => reviewedDocIds.has(d.id)).length
  const allSelected = documents.every((d) => selectedDocIds.has(d.id))

  const handleSelectAll = () => {
    if (allSelected) {
      documents.forEach((d) => {
        if (selectedDocIds.has(d.id)) {
          onToggleSelect(d.id)
        }
      })
    } else {
      documents.forEach((d) => {
        if (!selectedDocIds.has(d.id)) {
          onToggleSelect(d.id)
        }
      })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2">
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <FolderOpen className="h-5 w-5 text-[#1a365d]" />
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {documents.length} doc{documents.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Avg. {avgRelevance}% relevance
            </Badge>
            {reviewedCount > 0 && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                {reviewedCount}/{documents.length} reviewed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          {/* Bulk Actions */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                id={`select-all-${name}`}
              />
              <label
                htmlFor={`select-all-${name}`}
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Select all
              </label>
            </div>

            {documents.some((d) => selectedDocIds.has(d.id)) && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  Tag Selected
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Mark Reviewed
                </Button>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-start gap-2">
                <div className="pt-4">
                  <Checkbox
                    checked={selectedDocIds.has(doc.id)}
                    onCheckedChange={() => onToggleSelect(doc.id)}
                  />
                </div>
                <div className="flex-1">
                  <DocumentQuickView
                    id={doc.id}
                    title={doc.title}
                    relevance={doc.relevance}
                    summary={doc.summary}
                    keyExcerpts={doc.keyExcerpts}
                    docType={doc.docType}
                    dateReference={doc.dateReference}
                    isReviewed={reviewedDocIds.has(doc.id)}
                    onToggleReviewed={onToggleReviewed}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
