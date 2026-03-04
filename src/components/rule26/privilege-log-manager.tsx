'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import type { PrivilegeLogEntry, PrivilegeType, PrivilegeLogStatus } from '@/lib/types'
import {
  Shield,
  Plus,
  Loader2,
  AlertTriangle,
  Trash2,
  FileText,
  Calendar,
  User,
  Users,
  Hash,
} from 'lucide-react'

interface PrivilegeLogManagerProps {
  caseId: string
  onUpdate?: () => void
}

const PRIVILEGE_TYPE_LABELS: Record<PrivilegeType, string> = {
  attorney_client: 'Attorney-Client',
  work_product: 'Work Product',
  joint_defense: 'Joint Defense',
  common_interest: 'Common Interest',
  deliberative_process: 'Deliberative Process',
  other: 'Other',
}

const PRIVILEGE_TYPE_COLORS: Record<string, string> = {
  attorney_client: 'bg-purple-100 text-purple-800 border-purple-200',
  work_product: 'bg-blue-100 text-blue-800 border-blue-200',
  joint_defense: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  common_interest: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  deliberative_process: 'bg-slate-100 text-slate-800 border-slate-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_LABELS: Record<PrivilegeLogStatus, string> = {
  withheld: 'Withheld',
  redacted: 'Redacted',
  produced_in_part: 'Produced in Part',
  clawback: 'Clawback',
  waived: 'Waived',
}

const STATUS_COLORS: Record<PrivilegeLogStatus, string> = {
  withheld: 'bg-amber-100 text-amber-800 border-amber-200',
  redacted: 'bg-blue-100 text-blue-800 border-blue-200',
  produced_in_part: 'bg-green-100 text-green-800 border-green-200',
  clawback: 'bg-red-100 text-red-800 border-red-200',
  waived: 'bg-gray-100 text-gray-800 border-gray-200',
}

const INITIAL_FORM_STATE = {
  document_title: '',
  privilege_type: 'attorney_client' as PrivilegeType,
  author: '',
  recipients: '',
  date_of_communication: '',
  subject_matter: '',
  basis_for_privilege: '',
  is_opinion_work_product: false,
  prepared_in_anticipation_of: '',
  status: 'withheld' as PrivilegeLogStatus,
  bates_number: '',
}

export function PrivilegeLogManager({ caseId, onUpdate }: PrivilegeLogManagerProps) {
  const [entries, setEntries] = useState<PrivilegeLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState(INITIAL_FORM_STATE)

  const apiBase = `/api/cases/${caseId}/rule26/privilege-log`

  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch(apiBase)
      if (!response.ok) throw new Error('Failed to load privilege log entries')
      const data = await response.json()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      const payload = {
        document_title: form.document_title,
        privilege_type: form.privilege_type,
        author: form.author || null,
        recipients: form.recipients
          ? form.recipients.split(',').map((r) => r.trim()).filter(Boolean)
          : [],
        date_of_communication: form.date_of_communication || null,
        subject_matter: form.subject_matter || null,
        basis_for_privilege: form.basis_for_privilege || null,
        is_opinion_work_product: form.is_opinion_work_product,
        prepared_in_anticipation_of: form.prepared_in_anticipation_of || null,
        status: form.status,
        bates_number: form.bates_number || null,
      }

      const response = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Failed to create entry')
      }

      setForm(INITIAL_FORM_STATE)
      setDialogOpen(false)
      await fetchEntries()
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (entryId: string) => {
    setDeletingId(entryId)
    try {
      const response = await fetch(`${apiBase}?entryId=${entryId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete entry')
      await fetchEntries()
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
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
            <h3 className="text-lg font-semibold mb-2">Error Loading Privilege Log</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => { setError(null); setLoading(true); fetchEntries() }}>
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
            <Shield className="h-5 w-5" />
            Privilege Log (Rule 26(b)(5))
          </h3>
          <p className="text-sm text-muted-foreground">
            {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'} logged
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Privilege Log Entry</DialogTitle>
              <DialogDescription>
                Log a document withheld or redacted on the basis of privilege.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Document Title */}
              <div className="grid gap-2">
                <Label htmlFor="document_title">Document Title *</Label>
                <Input
                  id="document_title"
                  value={form.document_title}
                  onChange={(e) => setForm({ ...form, document_title: e.target.value })}
                  placeholder="e.g., Email re: Settlement Strategy"
                />
              </div>

              {/* Privilege Type & Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Privilege Type *</Label>
                  <Select
                    value={form.privilege_type}
                    onValueChange={(v) => setForm({ ...form, privilege_type: v as PrivilegeType })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIVILEGE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as PrivilegeLogStatus })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Author & Bates Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="e.g., Jane Smith, Esq."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bates_number">Bates Number</Label>
                  <Input
                    id="bates_number"
                    value={form.bates_number}
                    onChange={(e) => setForm({ ...form, bates_number: e.target.value })}
                    placeholder="e.g., DEF-000123"
                  />
                </div>
              </div>

              {/* Recipients */}
              <div className="grid gap-2">
                <Label htmlFor="recipients">Recipients (comma-separated)</Label>
                <Input
                  id="recipients"
                  value={form.recipients}
                  onChange={(e) => setForm({ ...form, recipients: e.target.value })}
                  placeholder="e.g., John Doe, Jane Roe, Bob Smith"
                />
              </div>

              {/* Date of Communication */}
              <div className="grid gap-2">
                <Label htmlFor="date_of_communication">Date of Communication</Label>
                <Input
                  id="date_of_communication"
                  type="date"
                  value={form.date_of_communication}
                  onChange={(e) => setForm({ ...form, date_of_communication: e.target.value })}
                />
              </div>

              {/* Subject Matter */}
              <div className="grid gap-2">
                <Label htmlFor="subject_matter">Subject Matter</Label>
                <Textarea
                  id="subject_matter"
                  value={form.subject_matter}
                  onChange={(e) => setForm({ ...form, subject_matter: e.target.value })}
                  placeholder="Brief description of the communication's subject"
                  rows={2}
                />
              </div>

              {/* Basis for Privilege */}
              <div className="grid gap-2">
                <Label htmlFor="basis_for_privilege">Basis for Privilege</Label>
                <Textarea
                  id="basis_for_privilege"
                  value={form.basis_for_privilege}
                  onChange={(e) => setForm({ ...form, basis_for_privilege: e.target.value })}
                  placeholder="Explain why this document is privileged"
                  rows={3}
                />
              </div>

              {/* Work Product Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="is_opinion_work_product" className="text-sm font-medium">
                    Opinion Work Product
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Contains mental impressions, conclusions, or legal theories
                  </p>
                </div>
                <Switch
                  id="is_opinion_work_product"
                  checked={form.is_opinion_work_product}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, is_opinion_work_product: checked })
                  }
                />
              </div>

              {/* Prepared in Anticipation of (shown when work product related) */}
              {(form.privilege_type === 'work_product' || form.is_opinion_work_product) && (
                <div className="grid gap-2">
                  <Label htmlFor="prepared_in_anticipation_of">Prepared in Anticipation of</Label>
                  <Input
                    id="prepared_in_anticipation_of"
                    value={form.prepared_in_anticipation_of}
                    onChange={(e) => setForm({ ...form, prepared_in_anticipation_of: e.target.value })}
                    placeholder="e.g., Litigation regarding contract dispute"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={submitting || !form.document_title.trim()}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Entry'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No privilege log entries</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add entries for documents withheld or redacted on the basis of privilege under Rule 26(b)(5).
              </p>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add First Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{entry.document_title}</span>
                    </CardTitle>
                    {entry.subject_matter && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {entry.subject_matter}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={PRIVILEGE_TYPE_COLORS[entry.privilege_type]}>
                      {PRIVILEGE_TYPE_LABELS[entry.privilege_type]}
                    </Badge>
                    <Badge variant="outline" className={STATUS_COLORS[entry.status]}>
                      {STATUS_LABELS[entry.status]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {entry.author && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{entry.author}</span>
                    </div>
                  )}
                  {entry.recipients && entry.recipients.length > 0 && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{entry.recipients.join(', ')}</span>
                    </div>
                  )}
                  {entry.date_of_communication && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {new Date(entry.date_of_communication).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {entry.bates_number && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Hash className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{entry.bates_number}</span>
                    </div>
                  )}
                </div>

                {/* Work Product Section */}
                {(entry.is_opinion_work_product || entry.prepared_in_anticipation_of) && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.is_opinion_work_product && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Opinion Work Product
                        </Badge>
                      )}
                      {entry.prepared_in_anticipation_of && (
                        <span className="text-xs text-muted-foreground">
                          Prepared in anticipation of: {entry.prepared_in_anticipation_of}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Basis for Privilege */}
                {entry.basis_for_privilege && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <span className="font-medium">Basis:</span> {entry.basis_for_privilege}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 pt-3 border-t flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                  >
                    {deletingId === entry.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="ml-1">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
