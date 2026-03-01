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
  FileText,
  Plus,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Trash2,
  Pencil,
  User,
  FolderOpen,
  DollarSign,
  Shield,
  Calendar,
  Clock,
} from 'lucide-react'
import type {
  InitialDisclosure,
  DisclosureItem,
  DisclosureStatus,
  DisclosureType,
  DisclosureItemType,
} from '@/lib/types'

interface DisclosureManagerProps {
  caseId: string
  onUpdate?: () => void
}

const STATUS_COLORS: Record<DisclosureStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  in_review: 'bg-blue-100 text-blue-800 border-blue-200',
  served: 'bg-green-100 text-green-800 border-green-200',
  supplemented: 'bg-amber-100 text-amber-800 border-amber-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
}

const STATUS_LABELS: Record<DisclosureStatus, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  served: 'Served',
  supplemented: 'Supplemented',
  overdue: 'Overdue',
}

const ITEM_TYPE_ICONS: Record<DisclosureItemType, React.ReactNode> = {
  witness: <User className="h-4 w-4" />,
  document: <FolderOpen className="h-4 w-4" />,
  damage_computation: <DollarSign className="h-4 w-4" />,
  insurance: <Shield className="h-4 w-4" />,
}

const ITEM_TYPE_LABELS: Record<DisclosureItemType, string> = {
  witness: 'Witness',
  document: 'Document',
  damage_computation: 'Damage Computation',
  insurance: 'Insurance',
}

interface DisclosureFormData {
  disclosure_type: DisclosureType
  due_date: string
  served_to: string
  served_by: string
  notes: string
}

interface ItemFormData {
  item_type: DisclosureItemType
  // Witness fields
  witness_name: string
  witness_address: string
  witness_phone: string
  witness_email: string
  witness_subject: string
  // Document fields
  document_title: string
  document_description: string
  document_location: string
  custodian: string
  bates_range: string
  // Damage computation fields
  damage_category: string
  damage_amount: string
  damage_basis: string
  supporting_docs: string
  // Insurance fields
  insurer_name: string
  policy_number: string
  coverage_type: string
  coverage_amount: string
  policy_period: string
  // Common
  description: string
}

const EMPTY_DISCLOSURE_FORM: DisclosureFormData = {
  disclosure_type: 'initial',
  due_date: '',
  served_to: '',
  served_by: '',
  notes: '',
}

const EMPTY_ITEM_FORM: ItemFormData = {
  item_type: 'witness',
  witness_name: '',
  witness_address: '',
  witness_phone: '',
  witness_email: '',
  witness_subject: '',
  document_title: '',
  document_description: '',
  document_location: '',
  custodian: '',
  bates_range: '',
  damage_category: '',
  damage_amount: '',
  damage_basis: '',
  supporting_docs: '',
  insurer_name: '',
  policy_number: '',
  coverage_type: '',
  coverage_amount: '',
  policy_period: '',
  description: '',
}

export function DisclosureManager({ caseId, onUpdate }: DisclosureManagerProps) {
  const [disclosures, setDisclosures] = useState<InitialDisclosure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Disclosure dialog state
  const [showDisclosureDialog, setShowDisclosureDialog] = useState(false)
  const [editingDisclosure, setEditingDisclosure] = useState<InitialDisclosure | null>(null)
  const [disclosureForm, setDisclosureForm] = useState<DisclosureFormData>(EMPTY_DISCLOSURE_FORM)
  const [savingDisclosure, setSavingDisclosure] = useState(false)

  // Item dialog state
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [itemParentId, setItemParentId] = useState<string | null>(null)
  const [itemForm, setItemForm] = useState<ItemFormData>(EMPTY_ITEM_FORM)
  const [savingItem, setSavingItem] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchDisclosures = useCallback(async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/rule26/disclosures`)
      if (!response.ok) throw new Error('Failed to load disclosures')
      const data = await response.json()
      setDisclosures(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disclosures')
    } finally {
      setLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    fetchDisclosures()
  }, [fetchDisclosures])

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

  const openCreateDisclosure = () => {
    setEditingDisclosure(null)
    setDisclosureForm(EMPTY_DISCLOSURE_FORM)
    setShowDisclosureDialog(true)
  }

  const openEditDisclosure = (disclosure: InitialDisclosure) => {
    setEditingDisclosure(disclosure)
    setDisclosureForm({
      disclosure_type: disclosure.disclosure_type,
      due_date: disclosure.due_date || '',
      served_to: disclosure.served_to || '',
      served_by: disclosure.served_by || '',
      notes: disclosure.notes || '',
    })
    setShowDisclosureDialog(true)
  }

  const handleSaveDisclosure = async () => {
    setSavingDisclosure(true)
    try {
      const payload = {
        disclosure_type: disclosureForm.disclosure_type,
        due_date: disclosureForm.due_date || null,
        served_to: disclosureForm.served_to || null,
        served_by: disclosureForm.served_by || null,
        notes: disclosureForm.notes || null,
      }

      let response: Response
      if (editingDisclosure) {
        response = await fetch(
          `/api/cases/${caseId}/rule26/disclosures?disclosureId=${editingDisclosure.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        )
      } else {
        response = await fetch(`/api/cases/${caseId}/rule26/disclosures`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to save disclosure')
      }

      setShowDisclosureDialog(false)
      setEditingDisclosure(null)
      setDisclosureForm(EMPTY_DISCLOSURE_FORM)
      await fetchDisclosures()
      onUpdate?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save disclosure')
    } finally {
      setSavingDisclosure(false)
    }
  }

  const handleDeleteDisclosure = async (disclosureId: string) => {
    if (!confirm('Are you sure you want to delete this disclosure? This action cannot be undone.')) {
      return
    }
    setDeletingId(disclosureId)
    try {
      const response = await fetch(
        `/api/cases/${caseId}/rule26/disclosures?disclosureId=${disclosureId}`,
        { method: 'DELETE' }
      )
      if (!response.ok) throw new Error('Failed to delete disclosure')
      await fetchDisclosures()
      onUpdate?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete disclosure')
    } finally {
      setDeletingId(null)
    }
  }

  const openAddItem = (disclosureId: string) => {
    setItemParentId(disclosureId)
    setItemForm(EMPTY_ITEM_FORM)
    setShowItemDialog(true)
  }

  const handleSaveItem = async () => {
    if (!itemParentId) return
    setSavingItem(true)
    try {
      const payload: Record<string, unknown> = {
        disclosure_id: itemParentId,
        item_type: itemForm.item_type,
        description: itemForm.description || null,
      }

      if (itemForm.item_type === 'witness') {
        payload.witness_name = itemForm.witness_name || null
        payload.witness_address = itemForm.witness_address || null
        payload.witness_phone = itemForm.witness_phone || null
        payload.witness_email = itemForm.witness_email || null
        payload.witness_subject = itemForm.witness_subject || null
      } else if (itemForm.item_type === 'document') {
        payload.document_title = itemForm.document_title || null
        payload.document_description = itemForm.document_description || null
        payload.document_location = itemForm.document_location || null
        payload.custodian = itemForm.custodian || null
        payload.bates_range = itemForm.bates_range || null
      } else if (itemForm.item_type === 'damage_computation') {
        payload.damage_category = itemForm.damage_category || null
        payload.damage_amount = itemForm.damage_amount ? parseFloat(itemForm.damage_amount) : null
        payload.damage_basis = itemForm.damage_basis || null
        payload.supporting_docs = itemForm.supporting_docs || null
      } else if (itemForm.item_type === 'insurance') {
        payload.insurer_name = itemForm.insurer_name || null
        payload.policy_number = itemForm.policy_number || null
        payload.coverage_type = itemForm.coverage_type || null
        payload.coverage_amount = itemForm.coverage_amount
          ? parseFloat(itemForm.coverage_amount)
          : null
        payload.policy_period = itemForm.policy_period || null
      }

      const response = await fetch(`/api/cases/${caseId}/rule26/disclosures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, _action: 'add_item' }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to add item')
      }

      setShowItemDialog(false)
      setItemParentId(null)
      setItemForm(EMPTY_ITEM_FORM)
      await fetchDisclosures()
      onUpdate?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setSavingItem(false)
    }
  }

  const getItemCount = (disclosure: InitialDisclosure): number => {
    return disclosure.disclosure_items?.length || 0
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
            <h3 className="text-lg font-semibold mb-2">Error Loading Disclosures</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => {
                setLoading(true)
                setError(null)
                fetchDisclosures()
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
  if (disclosures.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="bg-primary/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2 text-primary">
                No disclosures yet
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                Create your first Rule 26(a)(1) initial disclosure to begin tracking witnesses,
                documents, damages, and insurance information.
              </p>
              <Button onClick={openCreateDisclosure}>
                <Plus className="h-4 w-4 mr-2" />
                Create Disclosure
              </Button>
            </div>
          </CardContent>
        </Card>

        <DisclosureDialog
          open={showDisclosureDialog}
          onOpenChange={setShowDisclosureDialog}
          form={disclosureForm}
          setForm={setDisclosureForm}
          onSave={handleSaveDisclosure}
          saving={savingDisclosure}
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
          <h3 className="font-serif font-bold text-lg text-primary">Initial Disclosures</h3>
          <p className="text-sm text-muted-foreground">
            Rule 26(a)(1) disclosure sets and items
          </p>
        </div>
        <Button onClick={openCreateDisclosure}>
          <Plus className="h-4 w-4 mr-2" />
          Create Disclosure
        </Button>
      </div>

      {/* Disclosure Cards */}
      {disclosures.map((disclosure) => {
        const isExpanded = expandedIds.has(disclosure.id)
        const itemCount = getItemCount(disclosure)

        return (
          <Card key={disclosure.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleExpanded(disclosure.id)}
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
                      <CardTitle className="text-base">
                        {disclosure.disclosure_type === 'initial'
                          ? 'Initial Disclosure'
                          : 'Supplemental Disclosure'}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={STATUS_COLORS[disclosure.status]}
                      >
                        {STATUS_LABELS[disclosure.status]}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      <span className="inline-flex items-center gap-4 flex-wrap">
                        {disclosure.due_date && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {formatDate(disclosure.due_date)}
                          </span>
                        )}
                        {disclosure.served_date && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Served: {formatDate(disclosure.served_date)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </span>
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDisclosure(disclosure)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDisclosure(disclosure.id)}
                    disabled={deletingId === disclosure.id}
                  >
                    {deletingId === disclosure.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Expanded Items Section */}
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="border-t pt-4">
                  {disclosure.disclosure_items && disclosure.disclosure_items.length > 0 ? (
                    <div className="space-y-3">
                      {disclosure.disclosure_items.map((item) => (
                        <DisclosureItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No items in this disclosure yet.
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddItem(disclosure.id)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Create/Edit Disclosure Dialog */}
      <DisclosureDialog
        open={showDisclosureDialog}
        onOpenChange={setShowDisclosureDialog}
        form={disclosureForm}
        setForm={setDisclosureForm}
        onSave={handleSaveDisclosure}
        saving={savingDisclosure}
        isEdit={!!editingDisclosure}
      />

      {/* Add Item Dialog */}
      <ItemDialog
        open={showItemDialog}
        onOpenChange={setShowItemDialog}
        form={itemForm}
        setForm={setItemForm}
        onSave={handleSaveItem}
        saving={savingItem}
      />
    </div>
  )
}

// ============================================================
// Disclosure Item Card Sub-component
// ============================================================

function DisclosureItemCard({ item }: { item: DisclosureItem }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
      <div className="mt-0.5 text-primary">
        {ITEM_TYPE_ICONS[item.item_type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {ITEM_TYPE_LABELS[item.item_type]}
          </span>
          {item.is_supplemented && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
              Supplemented
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {item.item_type === 'witness' && (
            <div className="space-y-0.5">
              {item.witness_name && (
                <p className="font-medium text-foreground">{item.witness_name}</p>
              )}
              {item.witness_subject && <p>Subject: {item.witness_subject}</p>}
              {item.witness_phone && <p>Phone: {item.witness_phone}</p>}
              {item.witness_email && <p>Email: {item.witness_email}</p>}
              {item.witness_address && <p>Address: {item.witness_address}</p>}
            </div>
          )}
          {item.item_type === 'document' && (
            <div className="space-y-0.5">
              {item.document_title && (
                <p className="font-medium text-foreground">{item.document_title}</p>
              )}
              {item.document_description && <p>{item.document_description}</p>}
              {item.document_location && <p>Location: {item.document_location}</p>}
              {item.custodian && <p>Custodian: {item.custodian}</p>}
              {item.bates_range && <p>Bates: {item.bates_range}</p>}
            </div>
          )}
          {item.item_type === 'damage_computation' && (
            <div className="space-y-0.5">
              {item.damage_category && (
                <p className="font-medium text-foreground">{item.damage_category}</p>
              )}
              {item.damage_amount != null && (
                <p>
                  Amount: ${item.damage_amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
              {item.damage_basis && <p>Basis: {item.damage_basis}</p>}
              {item.supporting_docs && <p>Supporting Docs: {item.supporting_docs}</p>}
            </div>
          )}
          {item.item_type === 'insurance' && (
            <div className="space-y-0.5">
              {item.insurer_name && (
                <p className="font-medium text-foreground">{item.insurer_name}</p>
              )}
              {item.policy_number && <p>Policy #: {item.policy_number}</p>}
              {item.coverage_type && <p>Coverage: {item.coverage_type}</p>}
              {item.coverage_amount != null && (
                <p>
                  Amount: ${item.coverage_amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
              {item.policy_period && <p>Period: {item.policy_period}</p>}
            </div>
          )}
          {item.description && <p className="mt-1 italic">{item.description}</p>}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Disclosure Form Dialog Sub-component
// ============================================================

function DisclosureDialog({
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
  form: DisclosureFormData
  setForm: React.Dispatch<React.SetStateAction<DisclosureFormData>>
  onSave: () => void
  saving: boolean
  isEdit: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif font-bold text-primary">
            {isEdit ? 'Edit Disclosure' : 'Create Disclosure'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the disclosure details below.'
              : 'Add a new Rule 26(a)(1) initial disclosure set.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="disclosure_type">Disclosure Type</Label>
            <Select
              value={form.disclosure_type}
              onValueChange={(value: DisclosureType) =>
                setForm((prev) => ({ ...prev, disclosure_type: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial">Initial</SelectItem>
                <SelectItem value="supplemental">Supplemental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="served_to">Served To</Label>
            <Input
              id="served_to"
              placeholder="e.g., Opposing counsel name"
              value={form.served_to}
              onChange={(e) => setForm((prev) => ({ ...prev, served_to: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="served_by">Served By</Label>
            <Input
              id="served_by"
              placeholder="e.g., Attorney name"
              value={form.served_by}
              onChange={(e) => setForm((prev) => ({ ...prev, served_by: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this disclosure..."
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
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// Add Item Dialog Sub-component
// ============================================================

function ItemDialog({
  open,
  onOpenChange,
  form,
  setForm,
  onSave,
  saving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: ItemFormData
  setForm: React.Dispatch<React.SetStateAction<ItemFormData>>
  onSave: () => void
  saving: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif font-bold text-primary">
            Add Disclosure Item
          </DialogTitle>
          <DialogDescription>
            Add a witness, document, damage computation, or insurance disclosure item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Item Type Selector */}
          <div className="space-y-2">
            <Label>Item Type</Label>
            <Select
              value={form.item_type}
              onValueChange={(value: DisclosureItemType) =>
                setForm((prev) => ({ ...prev, item_type: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select item type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="witness">
                  <span className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> Witness
                  </span>
                </SelectItem>
                <SelectItem value="document">
                  <span className="flex items-center gap-2">
                    <FolderOpen className="h-3.5 w-3.5" /> Document
                  </span>
                </SelectItem>
                <SelectItem value="damage_computation">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5" /> Damage Computation
                  </span>
                </SelectItem>
                <SelectItem value="insurance">
                  <span className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" /> Insurance
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Witness Fields */}
          {form.item_type === 'witness' && (
            <div className="space-y-3 p-3 bg-primary/5 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="witness_name">Witness Name</Label>
                <Input
                  id="witness_name"
                  placeholder="Full name"
                  value={form.witness_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, witness_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="witness_subject">Subject of Information</Label>
                <Textarea
                  id="witness_subject"
                  placeholder="Topics the witness may have information about..."
                  value={form.witness_subject}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, witness_subject: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="witness_address">Address</Label>
                <Input
                  id="witness_address"
                  placeholder="Street address"
                  value={form.witness_address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, witness_address: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="witness_phone">Phone</Label>
                  <Input
                    id="witness_phone"
                    placeholder="Phone number"
                    value={form.witness_phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, witness_phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="witness_email">Email</Label>
                  <Input
                    id="witness_email"
                    type="email"
                    placeholder="Email address"
                    value={form.witness_email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, witness_email: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Document Fields */}
          {form.item_type === 'document' && (
            <div className="space-y-3 p-3 bg-primary/5 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="document_title">Document Title</Label>
                <Input
                  id="document_title"
                  placeholder="Title or description of the document"
                  value={form.document_title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, document_title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document_description">Description</Label>
                <Textarea
                  id="document_description"
                  placeholder="Brief description of the document..."
                  value={form.document_description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, document_description: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document_location">Location</Label>
                <Input
                  id="document_location"
                  placeholder="Where the document can be found"
                  value={form.document_location}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, document_location: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="custodian">Custodian</Label>
                  <Input
                    id="custodian"
                    placeholder="Document custodian"
                    value={form.custodian}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, custodian: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bates_range">Bates Range</Label>
                  <Input
                    id="bates_range"
                    placeholder="e.g., DEF001-DEF050"
                    value={form.bates_range}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bates_range: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Damage Computation Fields */}
          {form.item_type === 'damage_computation' && (
            <div className="space-y-3 p-3 bg-primary/5 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="damage_category">Damage Category</Label>
                <Input
                  id="damage_category"
                  placeholder="e.g., Lost wages, Medical expenses"
                  value={form.damage_category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, damage_category: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="damage_amount">Amount ($)</Label>
                <Input
                  id="damage_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.damage_amount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, damage_amount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="damage_basis">Basis for Computation</Label>
                <Textarea
                  id="damage_basis"
                  placeholder="Explain how damages were calculated..."
                  value={form.damage_basis}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, damage_basis: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supporting_docs">Supporting Documents</Label>
                <Input
                  id="supporting_docs"
                  placeholder="References to supporting documentation"
                  value={form.supporting_docs}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, supporting_docs: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {/* Insurance Fields */}
          {form.item_type === 'insurance' && (
            <div className="space-y-3 p-3 bg-primary/5 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="insurer_name">Insurer Name</Label>
                <Input
                  id="insurer_name"
                  placeholder="Name of insurance company"
                  value={form.insurer_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, insurer_name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="policy_number">Policy Number</Label>
                  <Input
                    id="policy_number"
                    placeholder="Policy #"
                    value={form.policy_number}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, policy_number: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverage_type">Coverage Type</Label>
                  <Input
                    id="coverage_type"
                    placeholder="e.g., General liability"
                    value={form.coverage_type}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, coverage_type: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="coverage_amount">Coverage Amount ($)</Label>
                  <Input
                    id="coverage_amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.coverage_amount}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, coverage_amount: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy_period">Policy Period</Label>
                  <Input
                    id="policy_period"
                    placeholder="e.g., 01/2024 - 01/2025"
                    value={form.policy_period}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, policy_period: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Common Description */}
          <div className="space-y-2">
            <Label htmlFor="item_description">Additional Description</Label>
            <Textarea
              id="item_description"
              placeholder="Any additional notes about this item..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
