'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TierBadge } from '@/components/evidence/tier-badge'
import { Pencil, Trash2, Loader2, FileText, ClipboardList, Flame } from 'lucide-react'
import { toast } from 'sonner'
import type { EvidenceRelevance } from '@/lib/types'

const RELEVANCE_LABELS: Record<EvidenceRelevance, string> = {
  direct: 'Direct',
  corroborative: 'Corroborative',
  circumstantial: 'Circumstantial',
  impeachment: 'Impeachment',
}

const RELEVANCE_COLORS: Record<EvidenceRelevance, string> = {
  direct: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  corroborative: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  circumstantial: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  impeachment: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
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

interface EvidenceCardProps {
  caseId: string
  evidence: EvidenceItem
}

export function EvidenceCard({ caseId, evidence }: EvidenceCardProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editRelevance, setEditRelevance] = useState<EvidenceRelevance>(evidence.relevance)
  const [editTier, setEditTier] = useState<string>(evidence.tier?.toString() || '')
  const [editSmokingGun, setEditSmokingGun] = useState(evidence.is_smoking_gun)
  const [editNotes, setEditNotes] = useState(evidence.notes || '')
  const [editDescription, setEditDescription] = useState(evidence.description || '')

  const displayTitle = evidence.documents?.name
    || evidence.discovery_file
    || evidence.case_facts?.fact_text?.slice(0, 80)
    || 'Untitled Evidence'

  const handleDelete = async () => {
    if (!confirm('Remove this evidence link?')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/evidence/${evidence.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove evidence')
      }

      toast.success('Evidence link removed')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to remove evidence')
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/evidence/${evidence.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relevance: editRelevance,
          tier: editTier ? parseInt(editTier, 10) : null,
          is_smoking_gun: editSmokingGun,
          notes: editNotes || null,
          description: editDescription || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update evidence')
      }

      toast.success('Evidence updated')
      setEditOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update evidence')
    } finally {
      setSaving(false)
    }
  }

  const handleEditOpen = (isOpen: boolean) => {
    if (isOpen) {
      setEditRelevance(evidence.relevance)
      setEditTier(evidence.tier?.toString() || '')
      setEditSmokingGun(evidence.is_smoking_gun)
      setEditNotes(evidence.notes || '')
      setEditDescription(evidence.description || '')
    }
    setEditOpen(isOpen)
  }

  return (
    <>
      <Card id={`evidence-card-${evidence.id}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="pt-1 shrink-0">
                {evidence.documents ? (
                  <FileText className="h-5 w-5 text-blue-500" />
                ) : (
                  <ClipboardList className="h-5 w-5 text-purple-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <TierBadge tier={evidence.tier} />
                  <Badge className={RELEVANCE_COLORS[evidence.relevance]}>
                    {RELEVANCE_LABELS[evidence.relevance]}
                  </Badge>
                  {evidence.is_smoking_gun && (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      <Flame className="h-3 w-3 mr-1" />
                      Smoking Gun
                    </Badge>
                  )}
                </div>

                <p className="font-medium text-foreground truncate">{displayTitle}</p>

                {evidence.description && (
                  <p className="text-sm text-muted-foreground mt-1">{evidence.description}</p>
                )}

                {evidence.discovery_file && evidence.documents && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Discovery: {evidence.discovery_file}
                  </p>
                )}

                {evidence.case_facts && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Fact: {evidence.case_facts.fact_text.length > 120
                      ? evidence.case_facts.fact_text.slice(0, 120) + '...'
                      : evidence.case_facts.fact_text}
                  </p>
                )}

                {evidence.notes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Notes: {evidence.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={handleEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Evidence</DialogTitle>
            <DialogDescription>
              Update the tier, relevance, and other details for this evidence link.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Relevance Type</Label>
              <Select value={editRelevance} onValueChange={(v) => setEditRelevance(v as EvidenceRelevance)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RELEVANCE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tier (1-12)</Label>
              <Select value={editTier || 'none'} onValueChange={(v) => setEditTier(v === 'none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Tier</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((t) => (
                    <SelectItem key={t} value={t.toString()}>
                      Tier {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Smoking Gun</Label>
              <Switch checked={editSmokingGun} onCheckedChange={setEditSmokingGun} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                placeholder="Describe how this evidence supports the claim..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
