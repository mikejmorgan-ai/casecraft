'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { EvidenceCard } from '@/components/evidence/evidence-card'
import { LinkEvidenceDialog } from '@/components/evidence/link-evidence-dialog'
import { Search, Filter, X, Scale, Flame } from 'lucide-react'
import type { EvidenceRelevance } from '@/lib/types'

const RELEVANCE_LABELS: Record<EvidenceRelevance, string> = {
  direct: 'Direct',
  corroborative: 'Corroborative',
  circumstantial: 'Circumstantial',
  impeachment: 'Impeachment',
}

interface EvidenceItem {
  id: string
  claim_id: string
  fact_id: string | null
  document_id: string | null
  relevance: EvidenceRelevance
  discovery_file: string | null
  tier: number | null
  description: string | null
  is_smoking_gun: boolean
  notes: string | null
  created_at: string
  updated_at: string
  claims_for_relief: {
    id: string
    case_id: string
    claim_number: number
    title: string
    relief_type: string
    description: string
    legal_basis: string | null
  }
  documents: {
    id: string
    name: string
    doc_type: string
    file_path: string | null
  } | null
  case_facts: {
    id: string
    fact_text: string
    category: string
    is_disputed: boolean
  } | null
}

interface ClaimOption {
  id: string
  claim_number: number
  title: string
}

interface DocumentOption {
  id: string
  name: string
}

interface FactOption {
  id: string
  fact_text: string
}

interface EvidenceListProps {
  caseId: string
  evidence: EvidenceItem[]
  claims: ClaimOption[]
  documents: DocumentOption[]
  facts: FactOption[]
}

export function EvidenceList({ caseId, evidence, claims, documents, facts }: EvidenceListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [claimFilter, setClaimFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [relevanceFilter, setRelevanceFilter] = useState<string>('all')
  const [smokingGunOnly, setSmokingGunOnly] = useState(false)

  const filteredEvidence = useMemo(() => {
    return evidence.filter(e => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesDoc = e.documents?.name?.toLowerCase().includes(query)
        const matchesFact = e.case_facts?.fact_text?.toLowerCase().includes(query)
        const matchesDiscovery = e.discovery_file?.toLowerCase().includes(query)
        const matchesDescription = e.description?.toLowerCase().includes(query)
        const matchesNotes = e.notes?.toLowerCase().includes(query)

        if (!matchesDoc && !matchesFact && !matchesDiscovery && !matchesDescription && !matchesNotes) {
          return false
        }
      }

      // Claim filter
      if (claimFilter !== 'all' && e.claim_id !== claimFilter) {
        return false
      }

      // Tier filter
      if (tierFilter !== 'all') {
        if (tierFilter === 'green' && (e.tier === null || e.tier < 1 || e.tier > 3)) return false
        if (tierFilter === 'yellow' && (e.tier === null || e.tier < 4 || e.tier > 6)) return false
        if (tierFilter === 'red' && (e.tier === null || e.tier < 7 || e.tier > 12)) return false
        if (tierFilter === 'none' && e.tier !== null) return false
      }

      // Relevance filter
      if (relevanceFilter !== 'all' && e.relevance !== relevanceFilter) {
        return false
      }

      // Smoking gun filter
      if (smokingGunOnly && !e.is_smoking_gun) {
        return false
      }

      return true
    })
  }, [evidence, searchQuery, claimFilter, tierFilter, relevanceFilter, smokingGunOnly])

  // Group evidence by claim
  const evidenceByClaim = useMemo(() => {
    const grouped: Record<string, { claim: ClaimOption; items: EvidenceItem[] }> = {}

    for (const item of filteredEvidence) {
      const claimId = item.claim_id
      if (!grouped[claimId]) {
        grouped[claimId] = {
          claim: {
            id: item.claims_for_relief.id,
            claim_number: item.claims_for_relief.claim_number,
            title: item.claims_for_relief.title,
          },
          items: [],
        }
      }
      grouped[claimId].items.push(item)
    }

    // Sort by claim number
    return Object.values(grouped).sort((a, b) => a.claim.claim_number - b.claim.claim_number)
  }, [filteredEvidence])

  const hasFilters = searchQuery || claimFilter !== 'all' || tierFilter !== 'all' || relevanceFilter !== 'all' || smokingGunOnly

  const clearFilters = () => {
    setSearchQuery('')
    setClaimFilter('all')
    setTierFilter('all')
    setRelevanceFilter('all')
    setSmokingGunOnly(false)
  }

  const smokingGunCount = evidence.filter(e => e.is_smoking_gun).length

  return (
    <div id="evidence-list-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Evidence Map</h2>
          <p className="text-muted-foreground text-sm">
            {evidence.length} evidence link{evidence.length !== 1 ? 's' : ''} across {claims.length} claim{claims.length !== 1 ? 's' : ''}
            {smokingGunCount > 0 && (
              <span className="ml-2">
                <Flame className="h-3 w-3 inline text-amber-500" /> {smokingGunCount} smoking gun{smokingGunCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <LinkEvidenceDialog caseId={caseId} claims={claims} documents={documents} facts={facts} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search evidence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Select value={claimFilter} onValueChange={setClaimFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Claim" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Claims</SelectItem>
                    {claims.map((claim) => (
                      <SelectItem key={claim.id} value={claim.id}>
                        Claim {claim.claim_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="green">Tier 1-3 (Strong)</SelectItem>
                    <SelectItem value="yellow">Tier 4-6 (Moderate)</SelectItem>
                    <SelectItem value="red">Tier 7-12 (Weak)</SelectItem>
                    <SelectItem value="none">No Tier</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={relevanceFilter} onValueChange={setRelevanceFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Relevance</SelectItem>
                    {Object.entries(RELEVANCE_LABELS).map(([value, label]) => (
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

            <div className="flex items-center gap-2">
              <Switch
                id="smoking-gun-filter"
                checked={smokingGunOnly}
                onCheckedChange={setSmokingGunOnly}
              />
              <Label htmlFor="smoking-gun-filter" className="text-sm flex items-center gap-1 cursor-pointer">
                <Flame className="h-3 w-3 text-amber-500" />
                Smoking guns only
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {hasFilters && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvidence.length} of {evidence.length} evidence links
        </p>
      )}

      {/* Evidence grouped by claim */}
      {evidenceByClaim.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              {hasFilters ? (
                <>
                  <h3 className="font-semibold mb-2">No matching evidence</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="font-semibold mb-2">No evidence linked yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Link documents and facts to claims to build your evidence map.
                  </p>
                  {claims.length > 0 ? (
                    <LinkEvidenceDialog caseId={caseId} claims={claims} documents={documents} facts={facts} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add claims for relief first, then link evidence to them.
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {evidenceByClaim.map(({ claim, items }) => (
            <div key={claim.id}>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-sm">
                  Claim {claim.claim_number}
                </Badge>
                <h3 className="font-semibold">{claim.title}</h3>
                <span className="text-sm text-muted-foreground">
                  ({items.length} item{items.length !== 1 ? 's' : ''})
                </span>
              </div>

              <div className="grid gap-3 pl-4 border-l-2 border-muted">
                {items.map((item) => (
                  <EvidenceCard key={item.id} caseId={caseId} evidence={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
