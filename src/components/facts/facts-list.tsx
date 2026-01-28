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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, ClipboardList, Loader2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import type { CaseFact, Document, FactCategory } from '@/lib/types'

const CATEGORY_LABELS: Record<FactCategory, string> = {
  undisputed: 'Undisputed',
  disputed: 'Disputed',
  evidence_based: 'Evidence-Based',
  testimony: 'Testimony',
  expert_opinion: 'Expert Opinion',
  stipulated: 'Stipulated',
}

const CATEGORY_COLORS: Record<FactCategory, string> = {
  undisputed: 'bg-green-100 text-green-800',
  disputed: 'bg-red-100 text-red-800',
  evidence_based: 'bg-blue-100 text-blue-800',
  testimony: 'bg-purple-100 text-purple-800',
  expert_opinion: 'bg-orange-100 text-orange-800',
  stipulated: 'bg-gray-100 text-gray-800',
}

interface FactsListProps {
  caseId: string
  facts: CaseFact[]
  documents: Document[]
}

export function FactsList({ caseId, facts, documents }: FactsListProps) {
  const router = useRouter()

  const handleDelete = async (factId: string) => {
    if (!confirm('Delete this fact?')) return

    await fetch(`/api/cases/${caseId}/facts?factId=${factId}`, {
      method: 'DELETE',
    })
    router.refresh()
  }

  const disputedCount = facts.filter(f => f.is_disputed).length
  const undisputedCount = facts.filter(f => !f.is_disputed).length

  return (
    <div id="facts-list-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Case Facts</h2>
          <p className="text-muted-foreground text-sm">
            {undisputedCount} undisputed, {disputedCount} disputed
          </p>
        </div>
        <AddFactDialog caseId={caseId} documents={documents} />
      </div>

      <div className="grid gap-4">
        {facts.map((fact) => (
          <Card key={fact.id} id={`fact-card-${fact.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    {fact.is_disputed ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={CATEGORY_COLORS[fact.category as FactCategory]}>
                        {CATEGORY_LABELS[fact.category as FactCategory]}
                      </Badge>
                      {fact.is_disputed && (
                        <Badge variant="destructive">Disputed</Badge>
                      )}
                    </div>
                    <p className="text-foreground">{fact.fact_text}</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(fact.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {facts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No facts established</h3>
            <p className="text-muted-foreground mb-4">
              Add key facts to help agents understand the case.
            </p>
            <AddFactDialog caseId={caseId} documents={documents} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AddFactDialog({ caseId, documents }: { caseId: string; documents: Document[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<FactCategory>('undisputed')
  const [factText, setFactText] = useState('')
  const [isDisputed, setIsDisputed] = useState(false)
  const [sourceDocId, setSourceDocId] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/facts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          fact_text: factText,
          is_disputed: isDisputed,
          source_document_id: sourceDocId,
        }),
      })

      if (response.ok) {
        setOpen(false)
        setFactText('')
        setIsDisputed(false)
        setSourceDocId(null)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="btn-add-fact">
          <Plus className="h-4 w-4 mr-2" />
          Add Fact
        </Button>
      </DialogTrigger>
      <DialogContent id="add-fact-dialog" className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Case Fact</DialogTitle>
          <DialogDescription>
            Document a key fact for this case. Facts help agents understand the case context.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as FactCategory)}>
              <SelectTrigger id="select-fact-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="input-fact-text">Fact Statement *</Label>
            <Textarea
              id="input-fact-text"
              value={factText}
              onChange={(e) => setFactText(e.target.value)}
              rows={3}
              placeholder="State the fact clearly..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Is Disputed?</Label>
            <Switch checked={isDisputed} onCheckedChange={setIsDisputed} />
          </div>

          {documents.length > 0 && (
            <div className="grid gap-2">
              <Label>Source Document (optional)</Label>
              <Select value={sourceDocId || ''} onValueChange={(v) => setSourceDocId(v || null)}>
                <SelectTrigger id="select-fact-source">
                  <SelectValue placeholder="Select source document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button id="btn-submit-fact" onClick={handleSubmit} disabled={loading || !factText}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Fact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
