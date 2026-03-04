'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Trash2,
} from 'lucide-react'
import type { DiscoveryDeadline, DeadlineType, DeadlineStatus } from '@/lib/types'

// ============================================================
// Types
// ============================================================

interface DeadlineTrackerProps {
  caseId: string
  onUpdate?: () => void
}

interface DeadlineFormData {
  title: string
  description: string
  deadline_type: DeadlineType
  due_date: string
  rule_reference: string
  assigned_to: string
  notes: string
}

const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  initial_disclosure: 'Initial Disclosure',
  expert_disclosure: 'Expert Disclosure',
  expert_rebuttal: 'Expert Rebuttal',
  pretrial_disclosure: 'Pretrial Disclosure',
  pretrial_objections: 'Pretrial Objections',
  discovery_cutoff: 'Discovery Cutoff',
  deposition: 'Deposition',
  interrogatory_response: 'Interrogatory Response',
  rfa_response: 'RFA Response',
  rfp_response: 'RFP Response',
  supplementation: 'Supplementation',
  rule26f_conference: 'Rule 26(f) Conference',
  scheduling_conference: 'Scheduling Conference',
  protective_order: 'Protective Order',
  custom: 'Custom',
}

const INITIAL_FORM_DATA: DeadlineFormData = {
  title: '',
  description: '',
  deadline_type: 'custom',
  due_date: '',
  rule_reference: '',
  assigned_to: '',
  notes: '',
}

// ============================================================
// Helpers
// ============================================================

function getDaysUntil(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  // Zero out time portions for accurate day calculation
  due.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusConfig(deadline: DiscoveryDeadline): {
  borderClass: string
  badgeClass: string
  label: string
} {
  if (deadline.status === 'completed') {
    return {
      borderClass: 'border-green-200',
      badgeClass: 'bg-green-100 text-green-800 border-green-200',
      label: 'Completed',
    }
  }

  const daysUntil = getDaysUntil(deadline.due_date)

  if (daysUntil < 0) {
    return {
      borderClass: 'border-red-300 bg-red-50/50',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      label: 'Overdue',
    }
  }

  if (daysUntil <= 7) {
    return {
      borderClass: 'border-amber-300 bg-amber-50/50',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      label: 'Due Soon',
    }
  }

  return {
    borderClass: '',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Upcoming',
  }
}

function getDaysLabel(deadline: DiscoveryDeadline): string {
  if (deadline.status === 'completed') return 'Done'
  const days = getDaysUntil(deadline.due_date)
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `${days}d remaining`
}

function getDaysBadgeClass(deadline: DiscoveryDeadline): string {
  if (deadline.status === 'completed') return 'bg-green-100 text-green-800 border-green-200'
  const days = getDaysUntil(deadline.due_date)
  if (days < 0) return 'bg-red-100 text-red-800 border-red-200'
  if (days <= 7) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-blue-100 text-blue-800 border-blue-200'
}

function groupByMonth(deadlines: DiscoveryDeadline[]): Record<string, DiscoveryDeadline[]> {
  const groups: Record<string, DiscoveryDeadline[]> = {}
  for (const deadline of deadlines) {
    const date = new Date(deadline.due_date)
    const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(deadline)
  }
  return groups
}

// ============================================================
// Main Component
// ============================================================

export function DeadlineTracker({ caseId, onUpdate }: DeadlineTrackerProps) {
  const [deadlines, setDeadlines] = useState<DiscoveryDeadline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<DeadlineFormData>(INITIAL_FORM_DATA)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({})

  const fetchDeadlines = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`/api/cases/${caseId}/rule26/deadlines`)
      if (!response.ok) throw new Error('Failed to load deadlines')
      const data = await response.json()
      setDeadlines(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deadlines')
    } finally {
      setLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    fetchDeadlines()
  }, [fetchDeadlines])

  const handleRefresh = useCallback(() => {
    fetchDeadlines()
    onUpdate?.()
  }, [fetchDeadlines, onUpdate])

  // ---- Filter deadlines ----
  const filteredDeadlines = deadlines.filter((d) => {
    // Status filter
    if (statusFilter === 'upcoming') {
      if (d.status === 'completed') return false
      const days = getDaysUntil(d.due_date)
      if (days < 0) return false
    }
    if (statusFilter === 'overdue') {
      if (d.status === 'completed') return false
      const days = getDaysUntil(d.due_date)
      if (days >= 0) return false
    }
    if (statusFilter === 'completed') {
      if (d.status !== 'completed') return false
    }

    // Type filter
    if (typeFilter !== 'all' && d.deadline_type !== typeFilter) return false

    return true
  })

  // Sort: overdue first (most overdue), then by due date ascending
  const sortedDeadlines = [...filteredDeadlines].sort((a, b) => {
    // Completed go to the end
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (b.status === 'completed' && a.status !== 'completed') return -1
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  })

  const grouped = groupByMonth(sortedDeadlines)

  // ---- Form handlers ----
  const handleFormChange = (field: keyof DeadlineFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.due_date) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/rule26/deadlines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          deadline_type: formData.deadline_type,
          due_date: formData.due_date,
          rule_reference: formData.rule_reference.trim() || null,
          assigned_to: formData.assigned_to.trim() || null,
          notes: formData.notes.trim() || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to create deadline')

      setFormData(INITIAL_FORM_DATA)
      setDialogOpen(false)
      handleRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deadline')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkComplete = async (deadlineId: string) => {
    setActionLoading(deadlineId)
    try {
      const response = await fetch(`/api/cases/${caseId}/rule26/deadlines/${deadlineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed' as DeadlineStatus,
          completed_date: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error('Failed to update deadline')
      handleRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deadline')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (deadlineId: string) => {
    setActionLoading(deadlineId)
    try {
      const response = await fetch(`/api/cases/${caseId}/rule26/deadlines/${deadlineId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete deadline')
      handleRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deadline')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleMonth = (month: string) => {
    setCollapsedMonths((prev) => ({ ...prev, [month]: !prev[month] }))
  }

  // ---- Unique deadline types present for filter ----
  const presentTypes = Array.from(new Set(deadlines.map((d) => d.deadline_type)))

  // ---- Counts ----
  const overdueCount = deadlines.filter(
    (d) => d.status !== 'completed' && getDaysUntil(d.due_date) < 0
  ).length
  const dueSoonCount = deadlines.filter(
    (d) => d.status !== 'completed' && getDaysUntil(d.due_date) >= 0 && getDaysUntil(d.due_date) <= 7
  ).length
  const completedCount = deadlines.filter((d) => d.status === 'completed').length

  // ============================================================
  // Render
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && deadlines.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Deadlines</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => { setLoading(true); setError(null); fetchDeadlines() }}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with summary stats and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Discovery Deadlines
          </h3>
          <p className="text-sm text-muted-foreground">
            {deadlines.length} total
            {overdueCount > 0 && (
              <span className="text-red-600 font-medium"> · {overdueCount} overdue</span>
            )}
            {dueSoonCount > 0 && (
              <span className="text-amber-600 font-medium"> · {dueSoonCount} due soon</span>
            )}
            {completedCount > 0 && (
              <span> · {completedCount} completed</span>
            )}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Deadline
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Discovery Deadline</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="deadline-title">Title *</Label>
                <Input
                  id="deadline-title"
                  placeholder="e.g., Expert Report Due"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="deadline-description">Description</Label>
                <Textarea
                  id="deadline-description"
                  placeholder="Brief description of this deadline..."
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
              </div>

              {/* Deadline Type */}
              <div className="space-y-1.5">
                <Label>Deadline Type *</Label>
                <Select
                  value={formData.deadline_type}
                  onValueChange={(v) => handleFormChange('deadline_type', v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(DEADLINE_TYPE_LABELS) as [DeadlineType, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <Label htmlFor="deadline-due-date">Due Date *</Label>
                <Input
                  id="deadline-due-date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleFormChange('due_date', e.target.value)}
                />
              </div>

              {/* Rule Reference */}
              <div className="space-y-1.5">
                <Label htmlFor="deadline-rule-ref">Rule Reference</Label>
                <Input
                  id="deadline-rule-ref"
                  placeholder="e.g., FRCP 26(a)(2)(B)"
                  value={formData.rule_reference}
                  onChange={(e) => handleFormChange('rule_reference', e.target.value)}
                />
              </div>

              {/* Assigned To */}
              <div className="space-y-1.5">
                <Label htmlFor="deadline-assigned">Assigned To</Label>
                <Input
                  id="deadline-assigned"
                  placeholder="e.g., Jane Smith"
                  value={formData.assigned_to}
                  onChange={(e) => handleFormChange('assigned_to', e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="deadline-notes">Notes</Label>
                <Textarea
                  id="deadline-notes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData(INITIAL_FORM_DATA)
                    setDialogOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.title.trim() || !formData.due_date}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                  Add Deadline
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inline error banner (non-fatal) */}
      {error && deadlines.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive flex-1">{error}</p>
              <Button variant="outline" size="sm" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1.5">Status</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1.5">Deadline Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {presentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {DEADLINE_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deadline List (grouped by month) */}
      {sortedDeadlines.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Deadlines Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {deadlines.length === 0
                  ? 'Configure discovery settings to auto-generate deadlines, or add one manually.'
                  : 'No deadlines match your current filters.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([month, monthDeadlines]) => (
          <div key={month} className="space-y-2">
            {/* Month header */}
            <button
              onClick={() => toggleMonth(month)}
              className="flex items-center gap-2 w-full text-left py-1 group"
            >
              {collapsedMonths[month] ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {month}
              </span>
              <Badge variant="outline" className="text-xs">
                {monthDeadlines.length}
              </Badge>
            </button>

            {/* Month deadlines */}
            {!collapsedMonths[month] && (
              <div className="space-y-2 pl-1">
                {monthDeadlines.map((deadline) => (
                  <DeadlineCard
                    key={deadline.id}
                    deadline={deadline}
                    actionLoading={actionLoading}
                    onMarkComplete={handleMarkComplete}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

function DeadlineCard({
  deadline,
  actionLoading,
  onMarkComplete,
  onDelete,
}: {
  deadline: DiscoveryDeadline
  actionLoading: string | null
  onMarkComplete: (id: string) => void
  onDelete: (id: string) => void
}) {
  const statusConfig = getStatusConfig(deadline)
  const isCompleted = deadline.status === 'completed'
  const isLoading = actionLoading === deadline.id
  const isAutoGenerated = !!deadline.calculated_from

  return (
    <Card className={statusConfig.borderClass}>
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start gap-2 flex-wrap">
              <h4
                className={`text-sm font-semibold ${
                  isCompleted ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {deadline.title}
              </h4>
              {deadline.rule_reference && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {deadline.rule_reference}
                </Badge>
              )}
            </div>

            {/* Description */}
            {deadline.description && (
              <p className="text-xs text-muted-foreground mt-1">{deadline.description}</p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {/* Due date */}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(deadline.due_date)}
              </span>

              {/* Deadline type */}
              <span className="text-xs text-muted-foreground">
                {DEADLINE_TYPE_LABELS[deadline.deadline_type]}
              </span>

              {/* Assigned to */}
              {deadline.assigned_to && (
                <span className="text-xs text-muted-foreground">
                  Assigned: {deadline.assigned_to}
                </span>
              )}
            </div>

            {/* Auto-generated note */}
            {isAutoGenerated && (
              <p className="text-xs text-muted-foreground/70 mt-1 italic">
                Auto-calculated from {deadline.calculated_from}
              </p>
            )}

            {/* Notes */}
            {deadline.notes && (
              <p className="text-xs text-muted-foreground mt-1 border-l-2 border-muted pl-2">
                {deadline.notes}
              </p>
            )}
          </div>

          {/* Right side: badges and actions */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            {/* Status badge */}
            <Badge variant="outline" className={statusConfig.badgeClass}>
              {isCompleted && <CheckCircle className="h-3 w-3" />}
              {!isCompleted && getDaysUntil(deadline.due_date) < 0 && (
                <AlertTriangle className="h-3 w-3" />
              )}
              {statusConfig.label}
            </Badge>

            {/* Days until/overdue badge */}
            <Badge variant="outline" className={getDaysBadgeClass(deadline)}>
              {getDaysLabel(deadline)}
            </Badge>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {!isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  disabled={isLoading}
                  onClick={() => onMarkComplete(deadline.id)}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  Complete
                </Button>
              )}

              {deadline.deadline_type === 'custom' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                  disabled={isLoading}
                  onClick={() => onDelete(deadline.id)}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
