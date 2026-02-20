'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Flame, ArrowUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FindingRow {
  id: string
  tier: number | null
  is_smoking_gun: boolean
  description: string | null
  relevance: string | null
  discovery_file: string | null
  claim_id: string
  claim_number: number
  claim_title: string
  document_id: string | null
  document_title: string | null
  document_type: string | null
  created_at: string
}

interface FindingsTableProps {
  findings: FindingRow[]
}

type SortField = 'discovery_file' | 'claim_number' | 'tier' | 'relevance' | 'is_smoking_gun'
type SortDirection = 'asc' | 'desc'

function getTierBadgeClass(tier: number | null): string {
  if (tier == null) return 'bg-slate-100 text-slate-700'
  if (tier <= 3) return 'bg-emerald-100 text-emerald-800'
  if (tier <= 6) return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-700'
}

const RELEVANCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  corroborative: 'Corroborative',
  circumstantial: 'Circumstantial',
  impeachment: 'Impeachment',
}

export function FindingsTable({ findings }: FindingsTableProps) {
  const [sortField, setSortField] = useState<SortField>('tier')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filterText, setFilterText] = useState('')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedFindings = useMemo(() => {
    let filtered = findings

    if (filterText.trim()) {
      const lower = filterText.toLowerCase()
      filtered = findings.filter(
        (f) =>
          f.description?.toLowerCase().includes(lower) ||
          f.discovery_file?.toLowerCase().includes(lower) ||
          f.claim_title?.toLowerCase().includes(lower) ||
          f.document_title?.toLowerCase().includes(lower)
      )
    }

    return [...filtered].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1

      switch (sortField) {
        case 'discovery_file':
          return dir * (a.discovery_file || '').localeCompare(b.discovery_file || '')
        case 'claim_number':
          return dir * (a.claim_number - b.claim_number)
        case 'tier':
          return dir * ((a.tier ?? 99) - (b.tier ?? 99))
        case 'relevance':
          return dir * (a.relevance || '').localeCompare(b.relevance || '')
        case 'is_smoking_gun':
          return dir * (Number(b.is_smoking_gun) - Number(a.is_smoking_gun))
        default:
          return 0
      }
    })
  }, [findings, sortField, sortDirection, filterText])

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField
    children: React.ReactNode
  }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown
          className={cn(
            'h-3 w-3 shrink-0',
            sortField === field ? 'text-foreground' : 'text-muted-foreground/50'
          )}
        />
      </div>
    </TableHead>
  )

  return (
    <Card id="findings-table">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            All Evidence ({findings.length})
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter evidence..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border rounded-md bg-background w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedFindings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filterText ? 'No evidence matches your filter.' : 'No evidence items found.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="discovery_file">Discovery File</SortableHeader>
                <SortableHeader field="claim_number">Claim</SortableHeader>
                <SortableHeader field="tier">Tier</SortableHeader>
                <SortableHeader field="relevance">Type</SortableHeader>
                <TableHead>Description</TableHead>
                <SortableHeader field="is_smoking_gun">Smoking Gun</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFindings.map((finding) => (
                <TableRow key={finding.id}>
                  <TableCell className="font-medium text-sm max-w-[180px] truncate">
                    {finding.discovery_file || finding.document_title || '-'}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      #{finding.claim_number}
                    </span>
                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {finding.claim_title}
                    </p>
                  </TableCell>
                  <TableCell>
                    {finding.tier != null ? (
                      <Badge className={getTierBadgeClass(finding.tier)}>
                        {finding.tier}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {finding.relevance
                        ? RELEVANCE_LABELS[finding.relevance] || finding.relevance
                        : '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {finding.description || 'No description'}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {finding.is_smoking_gun ? (
                      <Flame className="h-5 w-5 text-red-500 mx-auto" />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
