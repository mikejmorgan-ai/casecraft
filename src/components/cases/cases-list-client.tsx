'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Scale,
  FileText,
  Users,
  MessageSquare,
  Target,
  Calendar,
  X,
} from 'lucide-react'

interface CaseData {
  id: string
  name: string
  case_type: string
  case_number?: string
  status: string
  jurisdiction?: string
  plaintiff_name?: string
  defendant_name?: string
  is_blind_test?: boolean
  created_at: string
  updated_at: string
  agents: { count: number }[]
  documents: { count: number }[]
  conversations: { count: number }[]
  case_predictions: { count: number }[]
}

interface CasesListClientProps {
  cases: CaseData[]
  canCreateCase: boolean
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

const TYPE_LABELS: Record<string, string> = {
  civil: 'Civil',
  criminal: 'Criminal',
  family: 'Family',
  contract: 'Contract',
  tort: 'Tort',
  property: 'Property',
  constitutional: 'Constitutional',
  administrative: 'Administrative',
}

export function CasesListClient({ cases, canCreateCase }: CasesListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = c.name.toLowerCase().includes(query)
        const matchesNumber = c.case_number?.toLowerCase().includes(query)
        const matchesPlaintiff = c.plaintiff_name?.toLowerCase().includes(query)
        const matchesDefendant = c.defendant_name?.toLowerCase().includes(query)
        const matchesJurisdiction = c.jurisdiction?.toLowerCase().includes(query)

        if (!matchesName && !matchesNumber && !matchesPlaintiff && !matchesDefendant && !matchesJurisdiction) {
          return false
        }
      }

      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false
      }

      // Type filter
      if (typeFilter !== 'all' && c.case_type !== typeFilter) {
        return false
      }

      return true
    })
  }, [cases, searchQuery, statusFilter, typeFilter])

  const hasFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {hasFilters && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredCases.length} of {cases.length} cases
        </p>
      )}

      {/* Cases Grid */}
      {filteredCases.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              {hasFilters ? (
                <>
                  <h3 className="font-semibold mb-2">No matching cases</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="font-semibold mb-2">No cases yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first case to get started
                  </p>
                  {canCreateCase && (
                    <Link href="/dashboard/cases/new">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Case
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((c) => (
            <Link key={c.id} href={`/case/${c.id}`}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                        {c.name}
                      </CardTitle>
                      {c.plaintiff_name && c.defendant_name && (
                        <CardDescription className="truncate">
                          {c.plaintiff_name} v. {c.defendant_name}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {c.is_blind_test && (
                        <Badge variant="outline" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Blind
                        </Badge>
                      )}
                      <Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {TYPE_LABELS[c.case_type] || c.case_type}
                    </span>
                    {c.case_number && (
                      <span className="flex items-center gap-1">
                        #{c.case_number}
                      </span>
                    )}
                    {c.jurisdiction && (
                      <span className="truncate max-w-[120px]">
                        {c.jurisdiction}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1" title="Agents">
                        <Users className="h-3 w-3" />
                        {c.agents?.[0]?.count || 0}
                      </span>
                      <span className="flex items-center gap-1" title="Documents">
                        <FileText className="h-3 w-3" />
                        {c.documents?.[0]?.count || 0}
                      </span>
                      <span className="flex items-center gap-1" title="Conversations">
                        <MessageSquare className="h-3 w-3" />
                        {c.conversations?.[0]?.count || 0}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(c.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
