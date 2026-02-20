'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { EvidenceRelevance } from '@/lib/types'

const RELEVANCE_OPTIONS: { value: EvidenceRelevance; label: string }[] = [
  { value: 'direct', label: 'Direct' },
  { value: 'corroborative', label: 'Corroborative' },
  { value: 'circumstantial', label: 'Circumstantial' },
  { value: 'impeachment', label: 'Impeachment' },
]

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

interface LinkEvidenceDialogProps {
  caseId: string
  claims: ClaimOption[]
  documents: DocumentOption[]
  facts: FactOption[]
}

export function LinkEvidenceDialog({ caseId, claims, documents, facts }: LinkEvidenceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [claimId, setClaimId] = useState<string>('')
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [factId, setFactId] = useState<string | null>(null)
  const [discoveryFile, setDiscoveryFile] = useState('')
  const [description, setDescription] = useState('')
  const [relevance, setRelevance] = useState<EvidenceRelevance>('direct')
  const [tier, setTier] = useState<string>('')
  const [isSmokingGun, setIsSmokingGun] = useState(false)
  const [notes, setNotes] = useState('')
  const router = useRouter()

  const resetForm = () => {
    setClaimId('')
    setDocumentId(null)
    setFactId(null)
    setDiscoveryFile('')
    setDescription('')
    setRelevance('direct')
    setTier('')
    setIsSmokingGun(false)
    setNotes('')
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      resetForm()
    }
  }

  const handleSubmit = async () => {
    if (!claimId) {
      toast.error('Please select a claim')
      return
    }

    if (!documentId && !factId && !discoveryFile) {
      toast.error('Please link a document, fact, or enter a discovery file reference')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_id: claimId,
          document_id: documentId,
          fact_id: factId,
          discovery_file: discoveryFile || null,
          description: description || null,
          relevance,
          tier: tier ? parseInt(tier, 10) : null,
          is_smoking_gun: isSmokingGun,
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to link evidence')
      }

      toast.success('Evidence linked successfully')
      handleOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Link evidence error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to link evidence')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = claimId && (documentId || factId || discoveryFile)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button id="btn-link-evidence">
          <Plus className="h-4 w-4 mr-2" />
          Link Evidence
        </Button>
      </DialogTrigger>
      <DialogContent id="link-evidence-dialog" className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Link Evidence to Claim</DialogTitle>
          <DialogDescription>
            Connect a document, fact, or discovery file to a claim for relief.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Claim Selection */}
          <div className="grid gap-2">
            <Label>Claim *</Label>
            <Select value={claimId || 'none'} onValueChange={(v) => setClaimId(v === 'none' ? '' : v)}>
              <SelectTrigger id="select-evidence-claim">
                <SelectValue placeholder="Select a claim" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" disabled>Select a claim</SelectItem>
                {claims.map((claim) => (
                  <SelectItem key={claim.id} value={claim.id}>
                    Claim {claim.claim_number}: {claim.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Selection */}
          {documents.length > 0 && (
            <div className="grid gap-2">
              <Label>Document (optional)</Label>
              <Select value={documentId || 'none'} onValueChange={(v) => setDocumentId(v === 'none' ? null : v)}>
                <SelectTrigger id="select-evidence-document">
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fact Selection */}
          {facts.length > 0 && (
            <div className="grid gap-2">
              <Label>Case Fact (optional)</Label>
              <Select value={factId || 'none'} onValueChange={(v) => setFactId(v === 'none' ? null : v)}>
                <SelectTrigger id="select-evidence-fact">
                  <SelectValue placeholder="Select a fact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {facts.map((fact) => (
                    <SelectItem key={fact.id} value={fact.id}>
                      {fact.fact_text.length > 80 ? fact.fact_text.slice(0, 80) + '...' : fact.fact_text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Discovery File */}
          <div className="grid gap-2">
            <Label htmlFor="input-discovery-file">Discovery File Reference</Label>
            <Input
              id="input-discovery-file"
              placeholder="e.g., Exhibit A, Deposition of John Doe p.42"
              value={discoveryFile}
              onChange={(e) => setDiscoveryFile(e.target.value)}
            />
          </div>

          {/* Relevance and Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Relevance Type *</Label>
              <Select value={relevance} onValueChange={(v) => setRelevance(v as EvidenceRelevance)}>
                <SelectTrigger id="select-evidence-relevance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELEVANCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tier (1-12)</Label>
              <Select value={tier || 'none'} onValueChange={(v) => setTier(v === 'none' ? '' : v)}>
                <SelectTrigger id="select-evidence-tier">
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
          </div>

          {/* Smoking Gun */}
          <div className="flex items-center justify-between">
            <Label>Smoking Gun</Label>
            <Switch checked={isSmokingGun} onCheckedChange={setIsSmokingGun} />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="input-evidence-description">Description</Label>
            <Textarea
              id="input-evidence-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Describe how this evidence supports the claim..."
            />
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="input-evidence-notes">Notes</Label>
            <Textarea
              id="input-evidence-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional notes..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button id="btn-submit-evidence" onClick={handleSubmit} disabled={loading || !canSubmit}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Linking...
              </>
            ) : (
              'Link Evidence'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
