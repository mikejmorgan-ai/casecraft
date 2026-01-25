'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { FileText, Download, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import type { DocumentType } from '@/lib/types'

interface GoogleDocsImportProps {
  caseId: string
  onImportComplete?: () => void
}

interface ImportStatus {
  status: 'idle' | 'importing' | 'success' | 'error'
  progress: number
  message?: string
  result?: {
    id: string
    name: string
    doc_type: string
    content_preview: string
    content_length: number
    filed_by?: string
    embedded: boolean
  }
}

const DOC_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
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
  { value: '', label: 'Select party (optional)' },
  { value: 'Tree Farm LLC', label: 'Tree Farm LLC (Plaintiff)' },
  { value: 'Salt Lake County', label: 'Salt Lake County (Defendant)' },
  { value: 'Court', label: 'Court' },
  { value: 'Other', label: 'Other' },
]

export function GoogleDocsImport({ caseId, onImportComplete }: GoogleDocsImportProps) {
  const [googleDocsUrl, setGoogleDocsUrl] = useState('')
  const [docType, setDocType] = useState<DocumentType>('other')
  const [filedBy, setFiledBy] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    status: 'idle',
    progress: 0
  })

  const isValidGoogleDocsUrl = (url: string): boolean => {
    const patterns = [
      /docs\.google\.com\/document/,
      /docs\.google\.com\/spreadsheets/,
      /docs\.google\.com\/presentation/,
      /drive\.google\.com.*\/file.*\/d\/[a-zA-Z0-9-_]+/
    ]
    return patterns.some(pattern => pattern.test(url))
  }

  const handleImport = async () => {
    if (!googleDocsUrl.trim()) {
      setImportStatus({
        status: 'error',
        progress: 0,
        message: 'Google Docs URL is required'
      })
      return
    }

    if (!isValidGoogleDocsUrl(googleDocsUrl)) {
      setImportStatus({
        status: 'error',
        progress: 0,
        message: 'Please enter a valid Google Docs, Sheets, or Slides URL'
      })
      return
    }

    setImportStatus({ status: 'importing', progress: 20 })

    try {
      const requestBody = {
        google_docs_url: googleDocsUrl.trim(),
        doc_type: docType,
        ...(filedBy && { filed_by: filedBy }),
        ...(documentName.trim() && { document_name: documentName.trim() }),
      }

      setImportStatus({
        status: 'importing',
        progress: 40,
        message: 'Fetching document from Google Docs...'
      })

      const response = await fetch(`/api/cases/${caseId}/documents/import-google-docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      setImportStatus({
        status: 'importing',
        progress: 80,
        message: 'Processing document...'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setImportStatus({
        status: 'success',
        progress: 100,
        message: `Successfully imported "${result.document.name}"`,
        result: result.document
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
    setGoogleDocsUrl('')
    setDocumentName('')
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Import from Google Docs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-docs-url">Google Docs URL *</Label>
            <Input
              id="google-docs-url"
              placeholder="https://docs.google.com/document/d/..."
              value={googleDocsUrl}
              onChange={(e) => setGoogleDocsUrl(e.target.value)}
              disabled={importStatus.status === 'importing'}
              className={!isValidGoogleDocsUrl(googleDocsUrl) && googleDocsUrl ? 'border-red-300' : ''}
            />
            {googleDocsUrl && !isValidGoogleDocsUrl(googleDocsUrl) && (
              <p className="text-xs text-red-500">
                Please enter a valid Google Docs, Sheets, or Slides URL
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Document must be shared with "anyone with the link" or be publicly viewable
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-name">Document Name (optional)</Label>
            <Input
              id="document-name"
              placeholder="Leave blank to use original title"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              disabled={importStatus.status === 'importing'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doc-type">Document Type *</Label>
              <Select
                value={docType}
                onValueChange={(v) => setDocType(v as DocumentType)}
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
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Import Successful</h4>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-green-700">
                    <strong>{importStatus.result.name}</strong>
                  </div>
                  <div className="text-xs text-green-600 space-y-1">
                    <p>• Type: {importStatus.result.doc_type}</p>
                    <p>• Content: {formatBytes(importStatus.result.content_length)}</p>
                    {importStatus.result.filed_by && (
                      <p>• Filed by: {importStatus.result.filed_by}</p>
                    )}
                    <p>• Embedded: {importStatus.result.embedded ? '✅ Yes' : '❌ No'}</p>
                  </div>
                  {importStatus.result.content_preview && (
                    <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
                      <strong>Preview:</strong> {importStatus.result.content_preview}
                    </div>
                  )}
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
                {googleDocsUrl && (
                  <div className="mt-2">
                    <a
                      href={googleDocsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      Check document sharing settings <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Imports content from Google Docs, Sheets, and Slides
          </div>
          <div className="flex gap-2">
            {importStatus.status === 'success' || importStatus.status === 'error' ? (
              <Button variant="outline" onClick={resetForm}>
                Import Another
              </Button>
            ) : null}
            <Button
              onClick={handleImport}
              disabled={
                !googleDocsUrl.trim() ||
                !isValidGoogleDocsUrl(googleDocsUrl) ||
                importStatus.status === 'importing'
              }
            >
              {importStatus.status === 'importing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Import Document
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}