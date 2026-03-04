'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, FileText, Loader2, Trash2, CheckCircle, Circle, Sparkles } from 'lucide-react'
import type { Document, DocumentType } from '@/lib/types'

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  complaint: 'Complaint',
  answer: 'Answer',
  motion: 'Motion',
  brief: 'Brief',
  discovery: 'Discovery',
  deposition: 'Deposition',
  exhibit: 'Exhibit',
  order: 'Court Order',
  judgment: 'Judgment',
  other: 'Other',
}

interface DocumentsListProps {
  caseId: string
  documents: Document[]
}

export function DocumentsList({ caseId, documents }: DocumentsListProps) {
  const router = useRouter()

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return

    await fetch(`/api/cases/${caseId}/documents?docId=${docId}`, {
      method: 'DELETE',
    })
    router.refresh()
  }

  const handleEmbed = async (docId: string) => {
    const response = await fetch(`/api/cases/${caseId}/documents/${docId}/embed`, {
      method: 'POST',
    })

    if (response.ok) {
      router.refresh()
    }
  }

  return (
    <div id="documents-list-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Case Documents</h2>
          <p className="text-muted-foreground text-sm">Upload and manage case documents for RAG</p>
        </div>
        <AddDocumentDialog caseId={caseId} />
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} id={`document-card-${doc.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{DOC_TYPE_LABELS[doc.doc_type as DocumentType]}</Badge>
                      {doc.is_embedded ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Embedded
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Circle className="h-3 w-3 mr-1" />
                          Not embedded
                        </Badge>
                      )}
                    </div>
                    {doc.content_text && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {doc.content_text.substring(0, 200)}...
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!doc.is_embedded && doc.content_text && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmbed(doc.id)}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Embed
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
            <p className="text-muted-foreground mb-4">
              Upload case documents to enable RAG-powered conversations.
            </p>
            <AddDocumentDialog caseId={caseId} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AddDocumentDialog({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [embedding, setEmbedding] = useState(false)
  const [name, setName] = useState('')
  const [docType, setDocType] = useState<DocumentType>('other')
  const [contentText, setContentText] = useState('')
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create document
      const response = await fetch(`/api/cases/${caseId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          doc_type: docType,
          content_text: contentText,
        }),
      })

      if (response.ok) {
        const doc = await response.json()

        // Auto-embed if content exists
        if (contentText) {
          setEmbedding(true)
          await fetch(`/api/cases/${caseId}/documents/${doc.id}/embed`, {
            method: 'POST',
          })
        }

        setOpen(false)
        setName('')
        setContentText('')
        router.refresh()
      }
    } finally {
      setLoading(false)
      setEmbedding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="btn-add-document">
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </DialogTrigger>
      <DialogContent id="add-document-dialog" className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Add a document to the case. Paste content directly or upload a file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="input-doc-name">Document Name *</Label>
            <Input
              id="input-doc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Complaint - Initial Filing"
            />
          </div>

          <div className="grid gap-2">
            <Label>Document Type</Label>
            <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
              <SelectTrigger id="select-doc-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="input-doc-content">Document Content *</Label>
            <Textarea
              id="input-doc-content"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              rows={10}
              placeholder="Paste the document text here..."
            />
            <p className="text-xs text-muted-foreground">
              Paste the full text content of the document. This will be chunked and embedded for RAG.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            id="btn-submit-document"
            onClick={handleSubmit}
            disabled={loading || !name || !contentText}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {embedding ? 'Embedding...' : 'Saving...'}
              </>
            ) : (
              'Add Document'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
