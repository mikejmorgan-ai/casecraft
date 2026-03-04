'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DiscoverySummary } from './discovery-summary'
import { DocumentCategoryView } from './document-category-view'
import {
  FolderSearch,
  Loader2,
  Search,
  Filter,
  Tag,
  CheckSquare,
  FolderOpen,
  AlertTriangle,
  Sparkles,
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

interface DiscoveryCategory {
  name: string
  description: string
  documents: OrganizedDocument[]
}

interface OrganizeResult {
  categories: DiscoveryCategory[]
  totalDocuments: number
  reviewedCount: number
  flaggedCount: number
}

interface DiscoveryOrganizerProps {
  caseId: string
  initialDocumentCount: number
}

export function DiscoveryOrganizer({
  caseId,
  initialDocumentCount,
}: DiscoveryOrganizerProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OrganizeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [relevanceFilter, setRelevanceFilter] = useState<string>('all')

  // Selection and review state
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set())
  const [reviewedDocIds, setReviewedDocIds] = useState<Set<string>>(new Set())

  const organizeDiscovery = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${caseId}/discovery/organize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Organization failed')
      }

      const data = await response.json()
      if (data.success) {
        setResult(data.result)
      } else {
        throw new Error('Organization returned no results')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to organize discovery')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleReviewed = (id: string) => {
    setReviewedDocIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBulkMarkReviewed = () => {
    setReviewedDocIds((prev) => {
      const next = new Set(prev)
      selectedDocIds.forEach((id) => next.add(id))
      return next
    })
    setSelectedDocIds(new Set())
  }

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!result) return []

    return result.categories
      .filter((cat) => {
        if (categoryFilter !== 'all' && cat.name !== categoryFilter) return false
        return true
      })
      .map((cat) => ({
        ...cat,
        documents: cat.documents.filter((doc) => {
          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const matchesTitle = doc.title.toLowerCase().includes(query)
            const matchesSummary = doc.summary.toLowerCase().includes(query)
            const matchesExcerpts = doc.keyExcerpts.some((e) =>
              e.toLowerCase().includes(query)
            )
            if (!matchesTitle && !matchesSummary && !matchesExcerpts) return false
          }

          // Relevance filter
          if (relevanceFilter === 'high' && doc.relevance < 80) return false
          if (relevanceFilter === 'medium' && (doc.relevance < 50 || doc.relevance >= 80)) return false
          if (relevanceFilter === 'low' && doc.relevance >= 50) return false

          return true
        }),
      }))
      .filter((cat) => cat.documents.length > 0)
  }, [result, searchQuery, categoryFilter, relevanceFilter])

  const totalFilteredDocs = filteredCategories.reduce(
    (sum, cat) => sum + cat.documents.length,
    0
  )

  return (
    <div className="space-y-6">
      {/* Summary */}
      <DiscoverySummary
        totalDocuments={result?.totalDocuments || initialDocumentCount}
        reviewedCount={reviewedDocIds.size}
        flaggedCount={result?.flaggedCount || 0}
        categoryCount={result?.categories.length || 0}
        isOrganized={!!result}
      />

      {/* Organize Button */}
      {!result && (
        <Card>
          <CardContent className="pt-6 text-center">
            {initialDocumentCount === 0 ? (
              <div className="py-8">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
                <p className="text-muted-foreground">
                  Upload documents to the case before organizing discovery.
                </p>
              </div>
            ) : (
              <div className="py-8">
                <FolderSearch className="h-12 w-12 text-[#1a365d] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Organize Discovery Documents</h3>
                <p className="text-muted-foreground mb-6">
                  AI will analyze {initialDocumentCount} document{initialDocumentCount !== 1 ? 's' : ''} and
                  categorize them by type, relevance, and key excerpts.
                </p>
                <Button
                  onClick={organizeDiscovery}
                  disabled={loading}
                  className="bg-[#1a365d] hover:bg-[#2d4a7c]"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Organizing Discovery...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Organize Discovery
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Filters & Actions Bar */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {result.categories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name} ({cat.documents.length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Relevance Filter */}
                <Select value={relevanceFilter} onValueChange={setRelevanceFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Relevance</SelectItem>
                    <SelectItem value="high">High (80+)</SelectItem>
                    <SelectItem value="medium">Medium (50-79)</SelectItem>
                    <SelectItem value="low">Low (&lt;50)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {selectedDocIds.size > 0 && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                  <Badge variant="secondary">
                    {selectedDocIds.size} selected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMarkReviewed}
                  >
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Mark Reviewed
                  </Button>
                  <Button variant="outline" size="sm">
                    <Tag className="h-4 w-4 mr-1" />
                    Tag
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDocIds(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}

              {/* Results Count */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {totalFilteredDocs} of {result.totalDocuments} documents
                  in {filteredCategories.length} categories
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={organizeDiscovery}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  Re-organize
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <DocumentCategoryView
                key={category.name}
                name={category.name}
                description={category.description}
                documents={category.documents}
                selectedDocIds={selectedDocIds}
                reviewedDocIds={reviewedDocIds}
                onToggleSelect={handleToggleSelect}
                onToggleReviewed={handleToggleReviewed}
              />
            ))}
          </div>

          {/* Empty state after filtering */}
          {filteredCategories.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Matching Documents</h3>
                <p className="text-muted-foreground">
                  No documents match your current filters. Try adjusting the search
                  or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
