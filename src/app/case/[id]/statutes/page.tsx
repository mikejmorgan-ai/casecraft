'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Search,
  BookOpen,
  Scale,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Plus,
  Gavel,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import type { StatuteCategory } from '@/lib/legal/statute-database'
import type { Statute } from '@/lib/legal/statute-database'

// =============================================================================
// Types
// =============================================================================

interface CategoryInfo {
  category: StatuteCategory
  label: string
  count: number
}

interface SearchResult extends Statute {
  relevanceScore?: number
}

// Category icon mapping
const CATEGORY_ICONS: Record<StatuteCategory, typeof BookOpen> = {
  mining_rights: Scale,
  critical_infrastructure: Shield,
  land_use: FileText,
  nonconforming_use: AlertTriangle,
  injunction: Gavel,
  declaratory_judgment: BookOpen,
  regulatory_takings: AlertTriangle,
  due_process: Scale,
  preemption: Shield,
  constitutional: BookOpen,
}

const CATEGORY_COLORS: Record<StatuteCategory, string> = {
  mining_rights: 'bg-amber-100 text-amber-800 border-amber-200',
  critical_infrastructure: 'bg-blue-100 text-blue-800 border-blue-200',
  land_use: 'bg-green-100 text-green-800 border-green-200',
  nonconforming_use: 'bg-orange-100 text-orange-800 border-orange-200',
  injunction: 'bg-purple-100 text-purple-800 border-purple-200',
  declaratory_judgment: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  regulatory_takings: 'bg-red-100 text-red-800 border-red-200',
  due_process: 'bg-teal-100 text-teal-800 border-teal-200',
  preemption: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  constitutional: 'bg-slate-100 text-slate-800 border-slate-200',
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function StatutesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: caseId } = use(params)

  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedCategory, setSelectedCategory] = useState<StatuteCategory | null>(null)
  const [categoryStatutes, setCategoryStatutes] = useState<Statute[]>([])
  const [expandedStatuteId, setExpandedStatuteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [addedStatutes, setAddedStatutes] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'browse' | 'search'>('browse')

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/statutes?type=categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data.data)
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    loadCategories()
  }, [])

  // Search handler
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setView('browse')
      return
    }

    setLoading(true)
    setView('search')

    try {
      const res = await fetch(`/api/statutes?q=${encodeURIComponent(query)}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.data || [])
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  // Load statutes for a category
  const handleCategoryClick = async (category: StatuteCategory) => {
    if (selectedCategory === category) {
      setSelectedCategory(null)
      setCategoryStatutes([])
      return
    }

    setSelectedCategory(category)
    setLoading(true)

    try {
      const res = await fetch(`/api/statutes?category=${category}`)
      if (res.ok) {
        const data = await res.json()
        setCategoryStatutes(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load category:', err)
    } finally {
      setLoading(false)
    }
  }

  // Toggle statute expansion
  const toggleStatute = (statuteId: string) => {
    setExpandedStatuteId((prev) => (prev === statuteId ? null : statuteId))
  }

  // Add to case (simulated)
  const handleAddToCase = (statuteId: string) => {
    setAddedStatutes((prev) => {
      const next = new Set(prev)
      if (next.has(statuteId)) {
        next.delete(statuteId)
      } else {
        next.add(statuteId)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-[var(--color-legal-cream)]">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <Link
            href={`/case/${caseId}`}
            className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Case
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Statute Research
              </h1>
              <p className="text-gray-300 text-sm mt-1">
                Search and browse statutes, legal standards, and key cases
              </p>
            </div>

            {addedStatutes.size > 0 && (
              <Badge className="bg-green-600 text-white shrink-0 w-fit">
                {addedStatutes.size} statute{addedStatutes.size !== 1 ? 's' : ''} linked to case
              </Badge>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search statutes by keyword, code, or topic... (e.g., 'vested mining', '17-41-501', 'injunction')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Search Results */}
        {view === 'search' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {loading ? 'Searching...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
              </h2>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setView('browse')
                }}
                className="text-sm text-primary hover:underline"
              >
                Clear search
              </button>
            </div>

            {!loading && searchResults.length === 0 && searchQuery && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p>No statutes found matching &quot;{searchQuery}&quot;</p>
                  <p className="text-sm mt-1">
                    Try broader search terms or browse by category below.
                  </p>
                </CardContent>
              </Card>
            )}

            {searchResults.map((statute) => (
              <StatuteCard
                key={statute.id}
                statute={statute}
                isExpanded={expandedStatuteId === statute.id}
                isAdded={addedStatutes.has(statute.id)}
                onToggle={() => toggleStatute(statute.id)}
                onAddToCase={() => handleAddToCase(statute.id)}
                showRelevance
              />
            ))}
          </div>
        )}

        {/* Browse by Category */}
        {view === 'browse' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Browse by Category</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.category] || BookOpen
                const isSelected = selectedCategory === cat.category
                return (
                  <button
                    key={cat.category}
                    onClick={() => handleCategoryClick(cat.category)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-md ${CATEGORY_COLORS[cat.category]}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {cat.count} statute{cat.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {isSelected ? (
                        <ChevronDown className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Category Statutes */}
            {selectedCategory && (
              <div className="space-y-4 mt-4">
                <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                  <Badge className={CATEGORY_COLORS[selectedCategory]}>
                    {categories.find((c) => c.category === selectedCategory)?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-normal">
                    {categoryStatutes.length} statute{categoryStatutes.length !== 1 ? 's' : ''}
                  </span>
                </h3>

                {loading && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Loading statutes...
                    </CardContent>
                  </Card>
                )}

                {!loading &&
                  categoryStatutes.map((statute) => (
                    <StatuteCard
                      key={statute.id}
                      statute={statute}
                      isExpanded={expandedStatuteId === statute.id}
                      isAdded={addedStatutes.has(statute.id)}
                      onToggle={() => toggleStatute(statute.id)}
                      onAddToCase={() => handleAddToCase(statute.id)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// =============================================================================
// Statute Card Component
// =============================================================================

function StatuteCard({
  statute,
  isExpanded,
  isAdded,
  onToggle,
  onAddToCase,
  showRelevance = false,
}: {
  statute: SearchResult
  isExpanded: boolean
  isAdded: boolean
  onToggle: () => void
  onAddToCase: () => void
  showRelevance?: boolean
}) {
  return (
    <Card className={`transition-all ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
      <CardHeader
        className="cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-base">
                {statute.code}
                {statute.newCode && (
                  <span className="text-muted-foreground font-normal text-sm ml-1">
                    (now {statute.newCode})
                  </span>
                )}
              </CardTitle>

              <Badge variant="outline" className={CATEGORY_COLORS[statute.category]}>
                {statute.category.replace(/_/g, ' ')}
              </Badge>

              {showRelevance && statute.relevanceScore && (
                <Badge variant="secondary" className="text-xs">
                  Score: {statute.relevanceScore}
                </Badge>
              )}
            </div>

            <CardDescription className="text-sm font-medium text-gray-700">
              {statute.title}
            </CardDescription>

            {!isExpanded && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {statute.summary}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddToCase()
              }}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isAdded
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {isAdded ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Linked
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Add to Case
                </>
              )}
            </button>

            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          {/* Summary */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
            <p className="text-sm text-gray-600">{statute.summary}</p>
          </div>

          {/* Effective Date & Jurisdiction */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Effective: {statute.effectiveDate}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Scale className="h-3.5 w-3.5" />
              {statute.jurisdiction}
            </div>
          </div>

          {/* Elements to Prove */}
          {statute.elements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Elements to Prove
              </h4>
              <ul className="space-y-1.5">
                {statute.elements.map((element, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {element}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Provisions (Full Text) */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Key Provisions
            </h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                {statute.fullText}
              </pre>
            </div>
          </div>

          {/* Key Cases */}
          {statute.keyCases.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Key Cases
              </h4>
              <div className="space-y-3">
                {statute.keyCases.map((kcase, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-3 bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {kcase.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {kcase.citation}
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1.5">
                      <span className="font-medium">Holding: </span>
                      {kcase.holding}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Relevance: </span>
                      {kcase.relevance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amendments */}
          {statute.amendments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Amendment History
              </h4>
              <div className="space-y-2">
                {statute.amendments.map((amendment, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-sm"
                  >
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                      {amendment.date}
                    </Badge>
                    <span className="text-gray-600">{amendment.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Statutes */}
          {statute.relatedStatutes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Related Statutes
              </h4>
              <div className="flex flex-wrap gap-2">
                {statute.relatedStatutes.map((related, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {related}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {statute.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {statute.tags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
