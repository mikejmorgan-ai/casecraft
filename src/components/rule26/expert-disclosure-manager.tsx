'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users,
  Plus,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Trash2,
  Pencil,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  FileText,
  GraduationCap,
  Gavel,
  DollarSign,
  Shield,
} from 'lucide-react'
import type { ExpertDisclosure, ExpertType, ExpertReportStatus } from '@/lib/types'

interface ExpertDisclosureManagerProps {
  caseId: string
  onUpdate?: () => void
}

const EXPERT_TYPE_COLORS: Record<ExpertType, string> = {
  retained: 'bg-blue-100 text-blue-800 border-blue-200',
  non_retained: 'bg-gray-100 text-gray-800 border-gray-200',
  hybrid: 'bg-purple-100 text-purple-800 border-purple-200',
}

const EXPERT_TYPE_LABELS: Record<ExpertType, string> = {
  retained: 'Retained',
  non_retained: 'Non-Retained',
  hybrid: 'Hybrid',
}

const REPORT_STATUS_LABELS: Record<ExpertReportStatus, string> = {
  pending: 'Pending',
  draft: 'Draft',
  finalized: 'Finalized',
  served: 'Served',
  supplemented: 'Supplemented',
}

const REPORT_STATUS_STEPS: ExpertReportStatus[] = ['pending', 'draft', 'finalized', 'served']

interface ExpertFormData {
  expert_name: string
  expert_type: ExpertType
  field_of_expertise: string
  designated_by: string
  report_due_date: string
  notes: string
}

const EMPTY_EXPERT_FORM: ExpertFormData = {
  expert_name: '',
  expert_type: 'retained',
  field_of_expertise: '',
  designated_by: '',
  report_due_date: '',
  notes: '',
}

export function ExpertDisclosureManager({ caseId, onUpdate }: ExpertDisclosureManagerProps) {
  const [experts, setExperts] = useState<ExpertDisclosure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [editingExpert, setEditingExpert] = useState<ExpertDisclosure | null>(null)
  const [expertForm, setExpertForm] = useState<ExpertFormData>(EMPTY_EXPERT_FORM)
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchExperts = useCallback(async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/rule26/experts`)
      if (!response.ok) throw new Error('Failed to load experts')
      const data = await response.json()
      setExperts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experts')
    } finally {
      setLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    fetchExperts()
  }, [fetchExperts])

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const openCreateExpert = () => {
    setEditingExpert(null)
    setExpertForm(EMPTY_EXPERT_FORM)
    setShowDialog(true)
  }

  const openEditExpert = (expert: ExpertDisclosure) => {
    setEditingExpert(expert)
    setExpertForm({
      expert_name: expert.expert_name,
      expert_type: expert.expert_type,
      field_of_expertise: expert.field_of_expertise || '',
      designated_by: expert.designated_by || '',
      report_due_date: expert.report_due_date || '',
      notes: expert.notes || '',
    })
    setShowDialog(true)
  }

  const handleSaveExpert = async () => {
    if (!expertForm.expert_name.trim()) {
      alert('Expert name is required.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        expert_name: expertForm.expert_name.trim(),
        expert_type: expertForm.expert_type,
        field_of_expertise: expertForm.field_of_expertise || null,
        designated_by: expertForm.designated_by || null,
        report_due_date: expertForm.report_due_date || null,
        notes: expertForm.notes || null,
      }

      let response: Response
      if (editingExpert) {
        response = await fetch(
          `/api/cases/${caseId}/rule26/experts?expertId=${editingExpert.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        )
      } else {
        response = await fetch(`/api/cases/${caseId}/rule26/experts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to save expert')
      }

      setShowDialog(false)
      setEditingExpert(null)
      setExpertForm(EMPTY_EXPERT_FORM)
      await fetchExperts()
      onUpdate?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save expert')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteExpert = async (expertId: string) => {
    if (!confirm('Are you sure you want to delete this expert? This action cannot be undone.')) {
      return
    }
    setDeletingId(expertId)
    try {
      const response = await fetch(
        `/api/cases/${caseId}/rule26/experts?expertId=${expertId}`,
        { method: 'DELETE' }
      )
      if (!response.ok) throw new Error('Failed to delete expert')
      await fetchExperts()
      onUpdate?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete expert')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Experts</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => {
                setLoading(true)
                setError(null)
                fetchExperts()
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (experts.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="bg-primary/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2 text-primary">
                No experts designated
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                Designate your first Rule 26(a)(2) expert to begin tracking expert disclosures,
                reports, and deposition schedules.
              </p>
              <Button onClick={openCreateExpert}>
                <Plus className="h-4 w-4 mr-2" />
                Designate Expert
              </Button>
            </div>
          </CardContent>
        </Card>

        <ExpertDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          form={expertForm}
          setForm={setExpertForm}
          onSave={handleSaveExpert}
          saving={saving}
          isEdit={false}
        />
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-lg text-primary">Expert Disclosures</h3>
          <p className="text-sm text-muted-foreground">
            Rule 26(a)(2) expert witness designations and reports
          </p>
        </div>
        <Button onClick={openCreateExpert}>
          <Plus className="h-4 w-4 mr-2" />
          Designate Expert
        </Button>
      </div>

      {/* Expert Cards */}
      {experts.map((expert) => {
        const isExpanded = expandedIds.has(expert.id)

        return (
          <Card key={expert.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleExpanded(expert.id)}
                    className="mt-0.5 p-1 hover:bg-primary/5 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{expert.expert_name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={EXPERT_TYPE_COLORS[expert.expert_type]}
                      >
                        {EXPERT_TYPE_LABELS[expert.expert_type]}
                      </Badge>
                      {expert.is_rebuttal && (
                        <Badge
                          variant="outline"
                          className="bg-orange-100 text-orange-800 border-orange-200"
                        >
                          <Gavel className="h-3 w-3 mr-1" />
                          Rebuttal
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      <span className="inline-flex items-center gap-4 flex-wrap">
                        {expert.field_of_expertise && (
                          <span className="inline-flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {expert.field_of_expertise}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Report: {REPORT_STATUS_LABELS[expert.report_status]}
                        </span>
                        {expert.report_due_date && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {formatDate(expert.report_due_date)}
                          </span>
                        )}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditExpert(expert)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExpert(expert.id)}
                    disabled={deletingId === expert.id}
                  >
                    {deletingId === expert.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Expanded Detail View */}
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="border-t pt-4 space-y-6">
                  {/* Report Status Progress */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Report Status
                    </h4>
                    <ReportStatusTracker status={expert.report_status} />
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      {expert.report_due_date && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Report Due: </span>
                          <span className="font-medium">{formatDate(expert.report_due_date)}</span>
                        </div>
                      )}
                      {expert.report_served_date && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Report Served: </span>
                          <span className="font-medium">
                            {formatDate(expert.report_served_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Report Details */}
                  {(expert.opinions_summary ||
                    expert.bases_and_reasons ||
                    expert.data_and_exhibits ||
                    expert.compensation_rate ||
                    expert.qualifications_cv ||
                    expert.prior_testimony) && (
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Report Details
                      </h4>
                      <div className="space-y-3">
                        {expert.opinions_summary && (
                          <DetailRow label="Opinions Summary" value={expert.opinions_summary} />
                        )}
                        {expert.bases_and_reasons && (
                          <DetailRow label="Bases and Reasons" value={expert.bases_and_reasons} />
                        )}
                        {expert.data_and_exhibits && (
                          <DetailRow
                            label="Data and Exhibits"
                            value={expert.data_and_exhibits}
                          />
                        )}
                        {expert.qualifications_cv && (
                          <DetailRow
                            label="Qualifications / CV"
                            value={expert.qualifications_cv}
                          />
                        )}
                        {expert.publications_list && (
                          <DetailRow label="Publications" value={expert.publications_list} />
                        )}
                        {expert.prior_testimony && (
                          <DetailRow label="Prior Testimony" value={expert.prior_testimony} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Compensation */}
                  {(expert.compensation_rate || expert.compensation_terms) && (
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        Compensation
                      </h4>
                      <div className="p-3 bg-primary/5 rounded-lg space-y-2">
                        {expert.compensation_rate && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Rate: </span>
                            <span className="font-medium">{expert.compensation_rate}</span>
                          </div>
                        )}
                        {expert.compensation_terms && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Terms: </span>
                            <span>{expert.compensation_terms}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Deposition Tracking */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Deposition
                    </h4>
                    {expert.deposition_scheduled ? (
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {expert.deposition_date && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Date: </span>
                              <span className="font-medium">
                                {formatDate(expert.deposition_date)}
                              </span>
                            </div>
                          )}
                          {expert.deposition_duration_hours != null && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Duration: </span>
                              <span className="font-medium">
                                {expert.deposition_duration_hours} hour
                                {expert.deposition_duration_hours !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Circle className="h-3.5 w-3.5" />
                          No deposition scheduled
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rebuttal Info */}
                  {expert.is_rebuttal && (
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Rebuttal Information
                      </h4>
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
                        {expert.rebuttal_to && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Rebutting: </span>
                            <span className="font-medium">{expert.rebuttal_to}</span>
                          </div>
                        )}
                        {expert.rebuttal_due_date && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Rebuttal Due: </span>
                            <span className="font-medium">
                              {formatDate(expert.rebuttal_due_date)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Subject Matter and Facts */}
                  {(expert.subject_matter || expert.facts_and_opinions_summary) && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Subject & Opinions</h4>
                      <div className="space-y-3">
                        {expert.subject_matter && (
                          <DetailRow label="Subject Matter" value={expert.subject_matter} />
                        )}
                        {expert.facts_and_opinions_summary && (
                          <DetailRow
                            label="Facts and Opinions Summary"
                            value={expert.facts_and_opinions_summary}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Supplementation Info */}
                  {expert.supplement_count > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Supplemented {expert.supplement_count} time
                      {expert.supplement_count !== 1 ? 's' : ''}
                      {expert.last_supplemented_date &&
                        ` (last: ${formatDate(expert.last_supplemented_date)})`}
                    </div>
                  )}

                  {/* Designated By */}
                  {expert.designated_by && (
                    <div className="text-sm text-muted-foreground border-t pt-3">
                      Designated by: <span className="font-medium">{expert.designated_by}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {expert.notes && (
                    <div className="text-sm text-muted-foreground border-t pt-3 italic">
                      {expert.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Create/Edit Expert Dialog */}
      <ExpertDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        form={expertForm}
        setForm={setExpertForm}
        onSave={handleSaveExpert}
        saving={saving}
        isEdit={!!editingExpert}
      />
    </div>
  )
}

// ============================================================
// Report Status Tracker Sub-component
// ============================================================

function ReportStatusTracker({ status }: { status: ExpertReportStatus }) {
  const currentIndex = REPORT_STATUS_STEPS.indexOf(
    status === 'supplemented' ? 'served' : status
  )

  return (
    <div className="flex items-center gap-1">
      {REPORT_STATUS_STEPS.map((step, index) => {
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-full h-2 rounded-full transition-colors ${
                  isCompleted
                    ? isCurrent
                      ? 'bg-primary'
                      : 'bg-primary/60'
                    : 'bg-gray-200'
                }`}
              />
              <span
                className={`text-[10px] mt-1 ${
                  isCurrent
                    ? 'font-semibold text-primary'
                    : isCompleted
                      ? 'text-primary/60'
                      : 'text-muted-foreground'
                }`}
              >
                {REPORT_STATUS_LABELS[step]}
              </span>
            </div>
          </div>
        )
      })}
      {status === 'supplemented' && (
        <div className="flex flex-col items-center ml-1">
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-1.5 py-0"
          >
            Supplemented
          </Badge>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Detail Row Sub-component
// ============================================================

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-primary/5 rounded-lg">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  )
}

// ============================================================
// Expert Form Dialog Sub-component
// ============================================================

function ExpertDialog({
  open,
  onOpenChange,
  form,
  setForm,
  onSave,
  saving,
  isEdit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: ExpertFormData
  setForm: React.Dispatch<React.SetStateAction<ExpertFormData>>
  onSave: () => void
  saving: boolean
  isEdit: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif font-bold text-primary">
            {isEdit ? 'Edit Expert' : 'Designate Expert'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the expert designation details below.'
              : 'Add a new Rule 26(a)(2) expert witness designation.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="expert_name">Expert Name</Label>
            <Input
              id="expert_name"
              placeholder="Full name of the expert"
              value={form.expert_name}
              onChange={(e) => setForm((prev) => ({ ...prev, expert_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expert_type">Expert Type</Label>
            <Select
              value={form.expert_type}
              onValueChange={(value: ExpertType) =>
                setForm((prev) => ({ ...prev, expert_type: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retained">Retained</SelectItem>
                <SelectItem value="non_retained">Non-Retained</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_of_expertise">Field of Expertise</Label>
            <Input
              id="field_of_expertise"
              placeholder="e.g., Biomechanical Engineering, Economics"
              value={form.field_of_expertise}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, field_of_expertise: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designated_by">Designated By</Label>
            <Input
              id="designated_by"
              placeholder="e.g., Plaintiff, Defendant"
              value={form.designated_by}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, designated_by: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report_due_date">Report Due Date</Label>
            <Input
              id="report_due_date"
              type="date"
              value={form.report_due_date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, report_due_date: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expert_notes">Notes</Label>
            <Textarea
              id="expert_notes"
              placeholder="Additional notes about this expert..."
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? 'Update' : 'Designate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
