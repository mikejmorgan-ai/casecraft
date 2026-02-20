'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  X,
  Filter,
  ShieldOff,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react'
import type { FilterKeyTerm, FilterType } from '@/lib/types'

interface FilterKeyTermsManagerProps {
  caseId: string
  initialTerms: FilterKeyTerm[]
}

export function FilterKeyTermsManager({ caseId, initialTerms }: FilterKeyTermsManagerProps) {
  const [terms, setTerms] = useState<FilterKeyTerm[]>(initialTerms)
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [newTerm, setNewTerm] = useState('')
  const [newFilterType, setNewFilterType] = useState<FilterType>('exclude')
  const [newCategory, setNewCategory] = useState('')

  // Computed stats
  const excludeCount = useMemo(
    () => terms.filter(t => t.filter_type === 'exclude').length,
    [terms]
  )
  const includeCount = useMemo(
    () => terms.filter(t => t.filter_type === 'include').length,
    [terms]
  )

  // Group terms by category
  const groupedTerms = useMemo(() => {
    const groups: Record<string, FilterKeyTerm[]> = {}
    for (const term of terms) {
      const key = term.category || 'Uncategorized'
      if (!groups[key]) groups[key] = []
      groups[key].push(term)
    }
    // Sort groups alphabetically, with Uncategorized last
    const sortedEntries = Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Uncategorized') return 1
      if (b === 'Uncategorized') return -1
      return a.localeCompare(b)
    })
    return sortedEntries
  }, [terms])

  // Existing categories for suggestions
  const existingCategories = useMemo(() => {
    const cats = new Set<string>()
    for (const term of terms) {
      if (term.category) cats.add(term.category)
    }
    return Array.from(cats).sort()
  }, [terms])

  async function handleAddTerm(e: React.FormEvent) {
    e.preventDefault()
    if (!newTerm.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${caseId}/filters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: newTerm.trim(),
          filter_type: newFilterType,
          category: newCategory.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || 'Failed to add filter term')
      }

      const created = await response.json()
      setTerms(prev => [created, ...prev])
      setNewTerm('')
      setNewCategory('')
      setIsAdding(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add filter term')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemoveTerm(termId: string) {
    setRemovingId(termId)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${caseId}/filters?term_id=${termId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || 'Failed to remove filter term')
      }

      setTerms(prev => prev.filter(t => t.id !== termId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove filter term')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Active Filters</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <ShieldOff className="h-3 w-3" />
                  {excludeCount} exclude
                </Badge>
                <Badge className="flex items-center gap-1 bg-emerald-600 text-white hover:bg-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  {includeCount} include
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              size="sm"
              variant={isAdding ? 'outline' : 'default'}
            >
              {isAdding ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Filter Term
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 w-6 p-0"
                onClick={() => setError(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Filter Term Form */}
      {isAdding && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Filter Term
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTerm} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Term Input */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="term">Term</Label>
                  <Input
                    id="term"
                    placeholder='e.g., "critical infrastructure material"'
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    required
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                {/* Filter Type Toggle */}
                <div className="space-y-2">
                  <Label>Filter Type</Label>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setNewFilterType('exclude')}
                      disabled={isSubmitting}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        newFilterType === 'exclude'
                          ? 'bg-destructive text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <ShieldOff className="h-3.5 w-3.5" />
                      Exclude
                    </button>
                    <Switch
                      checked={newFilterType === 'include'}
                      onCheckedChange={(checked) => setNewFilterType(checked ? 'include' : 'exclude')}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setNewFilterType('include')}
                      disabled={isSubmitting}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        newFilterType === 'include'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Include
                    </button>
                  </div>
                </div>

                {/* Category Input */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category (optional)</Label>
                  <Input
                    id="category"
                    placeholder='e.g., "CIM", "Environmental"'
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    disabled={isSubmitting}
                    list="category-suggestions"
                  />
                  {existingCategories.length > 0 && (
                    <datalist id="category-suggestions">
                      {existingCategories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newTerm.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Term
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter Terms by Category */}
      {groupedTerms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No filter terms yet</h3>
            <p className="text-sm text-muted-foreground/80 mb-4">
              Add filter terms to exclude or include document categories during analysis.
            </p>
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Filter Term
            </Button>
          </CardContent>
        </Card>
      ) : (
        groupedTerms.map(([category, categoryTerms]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                {category}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {categoryTerms.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categoryTerms.map((term) => (
                  <div
                    key={term.id}
                    className={`group inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      term.filter_type === 'exclude'
                        ? 'bg-destructive/10 border-destructive/30 text-destructive'
                        : 'bg-emerald-50 border-emerald-300/50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-700/50'
                    }`}
                  >
                    {term.filter_type === 'exclude' ? (
                      <ShieldOff className="h-3 w-3 shrink-0" />
                    ) : (
                      <ShieldCheck className="h-3 w-3 shrink-0" />
                    )}
                    <span>{term.term}</span>
                    <button
                      onClick={() => handleRemoveTerm(term.id)}
                      disabled={removingId === term.id}
                      className={`ml-0.5 inline-flex items-center justify-center h-5 w-5 rounded-full transition-colors ${
                        term.filter_type === 'exclude'
                          ? 'hover:bg-destructive/20 text-destructive/60 hover:text-destructive'
                          : 'hover:bg-emerald-200/50 text-emerald-600/60 hover:text-emerald-700 dark:hover:bg-emerald-800/30 dark:text-emerald-500/60 dark:hover:text-emerald-400'
                      }`}
                      title="Remove filter term"
                    >
                      {removingId === term.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
