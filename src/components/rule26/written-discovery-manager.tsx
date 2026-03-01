'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type {
  WrittenDiscovery,
  WrittenDiscoveryType,
  WrittenDiscoveryDirection,
  WrittenDiscoveryStatus,
} from '@/lib/types'
import {
  ScrollText,
  Plus,
  Loader2,
  AlertTriangle,
  Trash2,
  Calendar,
  Hash,
  ArrowUpRight,
  ArrowDownLeft,
  FileQuestion,
  FileSearch,
  FileCheck,
} from 'lucide-react'

interface WrittenDiscoveryManagerProps {
  caseId: string
  onUpdate?: () => void
}

const DISCOVERY_TYPE_LABELS: Record<WrittenDiscoveryType, string> = {
  interrogatory: 'Interrogatories',
  rfp: 'Requests for Production',
  rfa: 'Requests for Admission',
}

const DISCOVERY_TYPE_SHORT: Record<WrittenDiscoveryType, string> = {
  interrogatory: 'Interrogatories',
  rfp: 'RFPs',
  rfa: 'RFAs',
}

const DISCOVERY_TYPE_ICONS: Record<WrittenDiscoveryType, typeof FileQuestion> = {
  interrogatory: FileQuestion,
  rfp: FileSearch,
  rfa: FileCheck,
}

const DIRECTION_LABELS: Record<WrittenDiscoveryDirection, string> = {
  outgoing: 'Sent',
  incoming: 'Received',
}

const DIRECTION_COLORS: Record<WrittenDiscoveryDirection, string> = {
  outgoing: 'bg-blue-100 text-blue-800 border-blue-200',
  incoming: 'bg-amber-100 text-amber-800 border-amber-200',
}

const STATUS_LABELS: Record<WrittenDiscoveryStatus, string> = {
  draft: 'Draft',
  served: 'Served',
  response_due: 'Response Due',
  response_received: 'Response Received',
  objections_pending: 'Objections Pending',
  complete: 'Complete',
  overdue: 'Overdue',
}

const STATUS_COLORS: Record<WrittenDiscoveryStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  served: 'bg-blue-100 text-blue-800 border-blue-200',
  response_due: 'bg-amber-100 text-amber-800 border-amber-200',
  response_received: 'bg-green-100 text-green-800 border-green-200',
  objections_pending: 'bg-orange-100 text-orange-800 border-orange-200',
  complete: 'bg-green-100 text-green-800 border-green-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
}

const INITIAL_FORM_STATE = {
  discovery_type: 'interrogatory' as WrittenDiscoveryType,
  direction: 'outgoing' as WrittenDiscoveryDirection,
  set_number: 1,
  title: '',
  served_date: '',
  response_due_date: '',
  request_count: 0,
  status: 'draft' as WrittenDiscoveryStatus,
  served_by: '',
  served_to: '',
}

export function WrittenDiscoveryManager({ caseId, onUpdate }: WrittenDiscoveryManagerProps) {
  const [sets, setSets] = useState<WrittenDiscovery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [form, setForm] = useState(INITIAL_FORM_STATE)

  const apiBase = `/api/cases/${caseId}/rule26/written-discovery`

  const fetchSets = useCallback(async () => {
    try {
      const response = await fetch(apiBase)
      if (!response.ok) throw new Error('Failed to load written discovery sets')
      const data = await response.json()
      setSets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  useEffect(() => {
    fetchSets()
  }, [fetchSets])

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      const payload = {
        discovery_type: form.discovery_type,
        direction: form.direction,
        set_number: form.set_number,
        title: form.title,
        served_date: form.served_date || null,
        response_due_date: form.response_due_date || null,
        request_count: form.request_count,
        status: form.status,
        served_by: form.served_by || null,
        served_to: form.served_to || null,
      }

      const response = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Failed to create set')
      }

      setForm(INITIAL_FORM_STATE)
      setDialogOpen(false)
      await fetchSets()
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (discoveryId: string) => {
    setDeletingId(discoveryId)
    try {
      const response = await fetch(`${apiBase}?discoveryId=${discoveryId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete set')
      await fetchSets()
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredSets =
    activeTab === 'all'
      ? sets
      : sets.filter((s) => s.discovery_type === activeTab)

  // Counts by type
  const counts = {
    interrogatory: sets.filter((s) => s.discovery_type === 'interrogatory').length,
    rfp: sets.filter((s) => s.discovery_type === 'rfp').length,
    rfa: sets.filter((s) => s.discovery_type === 'rfa').length,
  }

  const servedCounts = {
    interrogatory: sets.filter(
      (s) => s.discovery_type === 'interrogatory' && s.status !== 'draft'
    ).length,
    rfp: sets.filter((s) => s.discovery_type === 'rfp' && s.status !== 'draft').length,
    rfa: sets.filter((s) => s.discovery_type === 'rfa' && s.status !== 'draft').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Written Discovery</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => { setError(null); setLoading(true); fetchSets() }}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Written Discovery
          </h3>
          <p className="text-sm text-muted-foreground">
            {sets.length} set{sets.length !== 1 ? 's' : ''} tracked
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Set
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Written Discovery Set</DialogTitle>
              <DialogDescription>
                Track a set of interrogatories, requests for production, or requests for admission.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Discovery Type & Direction */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Discovery Type *</Label>
                  <Select
                    value={form.discovery_type}
                    onValueChange={(v) =>
                      setForm({ ...form, discovery_type: v as WrittenDiscoveryType })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DISCOVERY_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Direction *</Label>
                  <Select
                    value={form.direction}
                    onValueChange={(v) =>
                      setForm({ ...form, direction: v as WrittenDiscoveryDirection })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outgoing">Outgoing (Sent)</SelectItem>
                      <SelectItem value="incoming">Incoming (Received)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Plaintiff's First Set of Interrogatories"
                />
              </div>

              {/* Set Number & Request Count */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="set_number">Set Number</Label>
                  <Input
                    id="set_number"
                    type="number"
                    min={1}
                    value={form.set_number}
                    onChange={(e) =>
                      setForm({ ...form, set_number: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="request_count">Request Count</Label>
                  <Input
                    id="request_count"
                    type="number"
                    min={0}
                    value={form.request_count}
                    onChange={(e) =>
                      setForm({ ...form, request_count: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              {/* Served Date & Response Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="served_date">Served Date</Label>
                  <Input
                    id="served_date"
                    type="date"
                    value={form.served_date}
                    onChange={(e) => setForm({ ...form, served_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="response_due_date">Response Due Date</Label>
                  <Input
                    id="response_due_date"
                    type="date"
                    value={form.response_due_date}
                    onChange={(e) => setForm({ ...form, response_due_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Served By & Served To */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="served_by">Served By</Label>
                  <Input
                    id="served_by"
                    value={form.served_by}
                    onChange={(e) => setForm({ ...form, served_by: e.target.value })}
                    placeholder="e.g., Plaintiff's Counsel"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="served_to">Served To</Label>
                  <Input
                    id="served_to"
                    value={form.served_to}
                    onChange={(e) => setForm({ ...form, served_to: e.target.value })}
                    placeholder="e.g., Defendant's Counsel"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as WrittenDiscoveryStatus })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={submitting || !form.title.trim()}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Set'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Counts Summary */}
      {sets.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(DISCOVERY_TYPE_SHORT) as WrittenDiscoveryType[]).map((type) => {
            const Icon = DISCOVERY_TYPE_ICONS[type]
            return (
              <Card key={type}>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="flex justify-center mb-1 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-primary">{counts[type]}</p>
                  <p className="text-xs text-muted-foreground">{DISCOVERY_TYPE_SHORT[type]}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {servedCounts[type]} served
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Tabbed View */}
      {sets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ScrollText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No written discovery tracked</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Track interrogatories, requests for production, and requests for admission to
                monitor discovery limits and deadlines.
              </p>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add First Set
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({sets.length})
            </TabsTrigger>
            <TabsTrigger value="interrogatory" className="text-xs sm:text-sm">
              Interrogatories ({counts.interrogatory})
            </TabsTrigger>
            <TabsTrigger value="rfp" className="text-xs sm:text-sm">
              RFPs ({counts.rfp})
            </TabsTrigger>
            <TabsTrigger value="rfa" className="text-xs sm:text-sm">
              RFAs ({counts.rfa})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredSets.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No {activeTab === 'all' ? 'sets' : DISCOVERY_TYPE_SHORT[activeTab as WrittenDiscoveryType]} found.
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredSets.map((set) => {
                  const Icon = DISCOVERY_TYPE_ICONS[set.discovery_type]
                  return (
                    <Card key={set.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{set.title}</span>
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {DISCOVERY_TYPE_LABELS[set.discovery_type]} &middot; Set {set.set_number}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                            <Badge variant="outline" className={DIRECTION_COLORS[set.direction]}>
                              {set.direction === 'outgoing' ? (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDownLeft className="h-3 w-3 mr-1" />
                              )}
                              {DIRECTION_LABELS[set.direction]}
                            </Badge>
                            <Badge variant="outline" className={STATUS_COLORS[set.status]}>
                              {STATUS_LABELS[set.status]}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          {set.served_date && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                Served{' '}
                                {new Date(set.served_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          )}
                          {set.response_due_date && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                Due{' '}
                                {new Date(set.response_due_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Hash className="h-3.5 w-3.5 shrink-0" />
                            <span>{set.request_count} request{set.request_count !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {/* Served By / Served To */}
                        {(set.served_by || set.served_to) && (
                          <div className="mt-3 pt-3 border-t flex gap-4 text-xs text-muted-foreground">
                            {set.served_by && (
                              <span>
                                <span className="font-medium">From:</span> {set.served_by}
                              </span>
                            )}
                            {set.served_to && (
                              <span>
                                <span className="font-medium">To:</span> {set.served_to}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-3 pt-3 border-t flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(set.id)}
                            disabled={deletingId === set.id}
                          >
                            {deletingId === set.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="ml-1">Delete</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
