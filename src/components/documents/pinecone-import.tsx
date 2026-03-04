'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Database, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { DocumentType } from '@/lib/types'

interface PineconeImportProps {
  caseId: string
  onImportComplete?: () => void
}

interface ImportStatus {
  status: 'idle' | 'importing' | 'success' | 'error'
  progress: number
  message?: string
  result?: {
    imported: number
    total_available: number
    embedded: number
    namespace: string
  }
}

const DOC_TYPE_OPTIONS: { value: DocumentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Document Types' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'answer', label: 'Answer' },
  { value: 'motion', label: 'Motion' },
  { value: 'brief', label: 'Brief' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'deposition', label: 'Deposition' },
  { value: 'exhibit', label: 'Exhibit' },
  { value: 'order', label: 'Court Order' },
  { value: 'judgment', label: 'Judgment' },
  { value: 'other', label: 'Other' },
]

const FILED_BY_OPTIONS = [
  { value: '', label: 'All Parties' },
  { value: 'Tree Farm LLC', label: 'Tree Farm LLC (Plaintiff)' },
  { value: 'Salt Lake County', label: 'Salt Lake County (Defendant)' },
  { value: 'Court', label: 'Court' },
  { value: 'Other', label: 'Other' },
]

export function PineconeImport({ caseId, onImportComplete }: PineconeImportProps) {
  const [namespace, setNamespace] = useState('')
  const [docType, setDocType] = useState<DocumentType | 'all'>('all')
  const [filedBy, setFiledBy] = useState('')
  const [limit, setLimit] = useState('100')
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    status: 'idle',
    progress: 0
  })

  const handleImport = async () => {
    if (!namespace.trim()) {
      setImportStatus({
        status: 'error',
        progress: 0,
        message: 'Pinecone namespace is required'
      })
      return
    }

    setImportStatus({ status: 'importing', progress: 10 })

    try {
      const requestBody = {
        namespace: namespace.trim(),
        limit: parseInt(limit) || 100,
        ...(docType !== 'all' && { doc_type: docType }),
        ...(filedBy && { filed_by: filedBy }),
      }

      setImportStatus({ status: 'importing', progress: 30, message: 'Querying Pinecone...' })

      const response = await fetch(`/api/cases/${caseId}/documents/import-pinecone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      setImportStatus({ status: 'importing', progress: 60, message: 'Processing documents...' })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setImportStatus({
        status: 'success',
        progress: 100,
        message: `Successfully imported ${result.imported} documents`,
        result
      })

      onImportComplete?.()

    } catch (err) {
      setImportStatus({
        status: 'error',
        progress: 0,
        message: err instanceof Error ? err.message : 'Import failed'
      })
    }
  }

  const resetForm = () => {
    setImportStatus({ status: 'idle', progress: 0 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Import from Pinecone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="namespace">Pinecone Namespace *</Label>
            <Input
              id="namespace"
              placeholder="e.g., legal-docs, case-documents"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              disabled={importStatus.status === 'importing'}
            />
            <p className="text-xs text-muted-foreground">
              The Pinecone namespace containing your documents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doc-type">Document Type</Label>
              <Select
                value={docType}
                onValueChange={(v) => setDocType(v as DocumentType | 'all')}
                disabled={importStatus.status === 'importing'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filed-by">Filed By</Label>
              <Select
                value={filedBy}
                onValueChange={setFiledBy}
                disabled={importStatus.status === 'importing'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILED_BY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Max Documents</Label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="1000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                disabled={importStatus.status === 'importing'}
              />
            </div>
          </div>
        </div>

        {/* Status Display */}
        {importStatus.status !== 'idle' && (
          <div className="space-y-3">
            {importStatus.status === 'importing' && (
              <>
                <Progress value={importStatus.progress} className="h-2" />
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {importStatus.message || 'Importing...'}
                  </p>
                </div>
              </>
            )}

            {importStatus.status === 'success' && importStatus.result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Import Successful</h4>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• Imported: {importStatus.result.imported} documents</p>
                  <p>• Available in namespace: {importStatus.result.total_available}</p>
                  <p>• Successfully embedded: {importStatus.result.embedded}</p>
                  <p>• Namespace: <code className="bg-green-100 px-1 py-0.5 rounded text-xs">{importStatus.result.namespace}</code></p>
                </div>
              </div>
            )}

            {importStatus.status === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium text-red-800">Import Failed</h4>
                </div>
                <p className="text-sm text-red-700">{importStatus.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Imports documents from your Pinecone vector database
          </div>
          <div className="flex gap-2">
            {importStatus.status === 'success' || importStatus.status === 'error' ? (
              <Button variant="outline" onClick={resetForm}>
                Import More
              </Button>
            ) : null}
            <Button
              onClick={handleImport}
              disabled={!namespace.trim() || importStatus.status === 'importing'}
            >
              {importStatus.status === 'importing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Import Documents
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}