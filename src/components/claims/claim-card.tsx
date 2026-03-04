'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  Flame,
} from 'lucide-react'
import type { ClaimForRelief, ClaimEvidence, ReliefType } from '@/lib/types'
import { reliefTypes } from '@/lib/validations/claim'

const RELIEF_TYPE_LABELS: Record<ReliefType, string> = {
  declaratory: 'Declaratory',
  injunctive: 'Injunctive',
  regulatory_taking: 'Regulatory Taking',
  damages: 'Damages',
  restitution: 'Restitution',
  specific_performance: 'Specific Performance',
  attorneys_fees: "Attorney's Fees",
  other: 'Other',
}

const RELIEF_TYPE_COLORS: Record<ReliefType, string> = {
  declaratory: 'bg-blue-100 text-blue-800',
  injunctive: 'bg-purple-100 text-purple-800',
  regulatory_taking: 'bg-orange-100 text-orange-800',
  damages: 'bg-red-100 text-red-800',
  restitution: 'bg-green-100 text-green-800',
  specific_performance: 'bg-teal-100 text-teal-800',
  attorneys_fees: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800',
}

const RELEVANCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  corroborative: 'Corroborative',
  circumstantial: 'Circumstantial',
  impeachment: 'Impeachment',
}

const RELEVANCE_COLORS: Record<string, string> = {
  direct: 'bg-green-100 text-green-800',
  corroborative: 'bg-blue-100 text-blue-800',
  circumstantial: 'bg-yellow-100 text-yellow-800',
  impeachment: 'bg-red-100 text-red-800',
}

interface ClaimCardProps {
  claim: ClaimForRelief
  caseId: string
  isExpanded: boolean
  onToggleExpand: () => void
}

export function ClaimCard({ claim, caseId, isExpanded, onToggleExpand }: ClaimCardProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editData, setEditData] = useState({
    claim_number: claim.claim_number,
    title: claim.title,
    relief_type: claim.relief_type,
    description: claim.description,
    legal_basis: claim.legal_basis || '',
    is_alternative: claim.is_alternative,
  })

  const evidence = claim.evidence || []

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this claim? This will also remove all linked evidence.')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/claims/${claim.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Claim deleted successfully')
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error('Failed to delete claim', {
          description: errorData.message || errorData.error,
        })
      }
    } catch (error) {
      console.error('Failed to delete claim:', error)
      toast.error('Failed to delete claim', {
        description: 'An unexpected error occurred.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleEditSubmit = async () => {
    setEditLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/claims/${claim.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          legal_basis: editData.legal_basis || null,
        }),
      })

      if (response.ok) {
        toast.success('Claim updated successfully')
        setEditOpen(false)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error('Failed to update claim', {
          description: errorData.message || errorData.error,
        })
      }
    } catch (error) {
      console.error('Failed to update claim:', error)
      toast.error('Failed to update claim', {
        description: 'An unexpected error occurred.',
      })
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <>
      <Card id={`claim-card-${claim.id}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button
                onClick={onToggleExpand}
                className="mt-1 p-0.5 hover:bg-muted rounded shrink-0"
                aria-label={isExpanded ? 'Collapse claim details' : 'Expand claim details'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm font-mono text-muted-foreground shrink-0">
                    #{claim.claim_number}
                  </span>
                  <h3 className="font-semibold text-foreground truncate">
                    {claim.title}
                  </h3>
                  <Badge className={RELIEF_TYPE_COLORS[claim.relief_type as ReliefType]}>
                    {RELIEF_TYPE_LABELS[claim.relief_type as ReliefType]}
                  </Badge>
                  {claim.is_alternative && (
                    <Badge variant="outline">Alternative</Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {claim.description}
                </p>

                {evidence.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {evidence.length} evidence item{evidence.length !== 1 ? 's' : ''} linked
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditData({
                    claim_number: claim.claim_number,
                    title: claim.title,
                    relief_type: claim.relief_type,
                    description: claim.description,
                    legal_basis: claim.legal_basis || '',
                    is_alternative: claim.is_alternative,
                  })
                  setEditOpen(true)
                }}
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

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-4 pl-8 space-y-4">
              {claim.legal_basis && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Legal Basis</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{claim.legal_basis}</p>
                </div>
              )}

              {evidence.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Linked Evidence</h4>
                  <div className="space-y-2">
                    {evidence.map((ev: ClaimEvidence) => (
                      <div
                        key={ev.id}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg text-sm"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge className={RELEVANCE_COLORS[ev.relevance] || 'bg-gray-100 text-gray-800'}>
                              {RELEVANCE_LABELS[ev.relevance] || ev.relevance}
                            </Badge>
                            {ev.tier && (
                              <span className="text-xs text-muted-foreground">
                                Tier {ev.tier}
                              </span>
                            )}
                            {ev.is_smoking_gun && (
                              <Badge variant="destructive" className="gap-1">
                                <Flame className="h-3 w-3" />
                                Key Evidence
                              </Badge>
                            )}
                          </div>
                          {ev.description && (
                            <p className="text-muted-foreground">{ev.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evidence.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No evidence linked to this claim yet.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[500px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Claim</DialogTitle>
            <DialogDescription>
              Update the details for this claim for relief.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-claim-number">Claim Number *</Label>
                <Input
                  id="edit-claim-number"
                  type="number"
                  min={1}
                  max={999}
                  value={editData.claim_number}
                  onChange={(e) => setEditData(prev => ({ ...prev, claim_number: parseInt(e.target.value) || 0 }))}
                  className="h-11 sm:h-10"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-relief-type">Relief Type *</Label>
                <Select
                  value={editData.relief_type}
                  onValueChange={(value: ReliefType) => setEditData(prev => ({ ...prev, relief_type: value }))}
                >
                  <SelectTrigger id="edit-relief-type" className="h-11 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reliefTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {RELIEF_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-claim-title">Title *</Label>
              <Input
                id="edit-claim-title"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="h-11 sm:h-10"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-claim-description">Description *</Label>
              <Textarea
                id="edit-claim-description"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-claim-legal-basis">Legal Basis</Label>
              <Textarea
                id="edit-claim-legal-basis"
                value={editData.legal_basis}
                onChange={(e) => setEditData(prev => ({ ...prev, legal_basis: e.target.value }))}
                rows={3}
                placeholder="Cite relevant statutes, regulations, or case law..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-claim-alternative"
                checked={editData.is_alternative}
                onCheckedChange={(checked) =>
                  setEditData(prev => ({ ...prev, is_alternative: checked === true }))
                }
              />
              <Label htmlFor="edit-claim-alternative" className="text-sm font-normal">
                This is an alternative claim
              </Label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="w-full sm:w-auto h-11 sm:h-10">
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={editLoading || !editData.title || !editData.description}
              className="w-full sm:w-auto h-11 sm:h-10"
            >
              {editLoading ? (
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
