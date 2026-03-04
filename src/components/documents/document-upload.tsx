'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { DocumentType } from '@/lib/types'

interface DocumentUploadProps {
  caseId: string
  onUploadComplete?: () => void
}

interface UploadFile {
  file: File
  docType: DocumentType
  filedBy: 'Tree Farm LLC' | 'Salt Lake County' | 'Court' | 'Other'
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  progress: number
  error?: string
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
  { value: 'Tree Farm LLC', label: 'Tree Farm LLC (Plaintiff)' },
  { value: 'Salt Lake County', label: 'Salt Lake County (Defendant)' },
  { value: 'Court', label: 'Court' },
  { value: 'Other', label: 'Other' },
]

export function DocumentUpload({ caseId, onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.type === 'text/plain' || f.name.endsWith('.md')
    )

    const newFiles: UploadFile[] = droppedFiles.map((file) => ({
      file,
      docType: guessDocType(file.name),
      filedBy: guessFiledBy(file.name),
      status: 'pending',
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const selectedFiles = Array.from(e.target.files).filter(
      (f) => f.type === 'application/pdf' || f.type === 'text/plain' || f.name.endsWith('.md')
    )

    const newFiles: UploadFile[] = selectedFiles.map((file) => ({
      file,
      docType: guessDocType(file.name),
      filedBy: guessFiledBy(file.name),
      status: 'pending',
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }

  const guessDocType = (filename: string): DocumentType => {
    const lower = filename.toLowerCase()
    if (lower.includes('complaint')) return 'complaint'
    if (lower.includes('answer')) return 'answer'
    if (lower.includes('motion')) return 'motion'
    if (lower.includes('brief')) return 'brief'
    if (lower.includes('discovery') || lower.includes('disclos')) return 'discovery'
    if (lower.includes('deposition')) return 'deposition'
    if (lower.includes('order')) return 'order'
    if (lower.includes('exhibit')) return 'exhibit'
    return 'other'
  }

  const guessFiledBy = (filename: string): 'Tree Farm LLC' | 'Salt Lake County' | 'Court' | 'Other' => {
    const lower = filename.toLowerCase()
    if (lower.includes('tree_farm') || lower.includes('tree farm') || lower.includes('plaintiff')) {
      return 'Tree Farm LLC'
    }
    if (lower.includes('salt_lake') || lower.includes('county') || lower.includes('defendant')) {
      return 'Salt Lake County'
    }
    if (lower.includes('order') || lower.includes('signed') || lower.includes('court')) {
      return 'Court'
    }
    return 'Other'
  }

  const updateFile = (index: number, updates: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    )
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    setIsUploading(true)

    for (let i = 0; i < files.length; i++) {
      const uploadFile = files[i]
      if (uploadFile.status !== 'pending') continue

      updateFile(i, { status: 'uploading', progress: 10 })

      try {
        // Create FormData
        const formData = new FormData()
        formData.append('file', uploadFile.file)
        formData.append('doc_type', uploadFile.docType)
        formData.append('filed_by', uploadFile.filedBy)

        updateFile(i, { progress: 30 })

        // Upload to Supabase storage and create document record
        const response = await fetch(`/api/cases/${caseId}/documents`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        updateFile(i, { status: 'processing', progress: 60 })

        const { document } = await response.json()

        // Trigger embedding
        const embedResponse = await fetch(
          `/api/cases/${caseId}/documents/${document.id}/embed`,
          { method: 'POST' }
        )

        if (embedResponse.ok) {
          updateFile(i, { status: 'complete', progress: 100 })
        } else {
          updateFile(i, { status: 'complete', progress: 100 }) // Upload succeeded, embedding optional
        }
      } catch (err) {
        updateFile(i, {
          status: 'error',
          progress: 0,
          error: err instanceof Error ? err.message : 'Upload failed',
        })
      }
    }

    setIsUploading(false)
    onUploadComplete?.()
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const completeCount = files.filter((f) => f.status === 'complete').length

  return (
    <Card id="document-upload-container">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          id="document-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          `}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports PDF, TXT, and Markdown files
          </p>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.txt,.md"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div id="document-file-list" className="space-y-3">
            {files.map((uploadFile, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Select
                      value={uploadFile.docType}
                      onValueChange={(v) => updateFile(index, { docType: v as DocumentType })}
                      disabled={uploadFile.status !== 'pending'}
                    >
                      <SelectTrigger className="h-7 text-xs w-28">
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

                    <Select
                      value={uploadFile.filedBy}
                      onValueChange={(v) =>
                        updateFile(index, { filedBy: v as UploadFile['filedBy'] })
                      }
                      disabled={uploadFile.status !== 'pending'}
                    >
                      <SelectTrigger className="h-7 text-xs w-36">
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

                  {uploadFile.status === 'uploading' || uploadFile.status === 'processing' ? (
                    <Progress value={uploadFile.progress} className="h-1 mt-2" />
                  ) : null}

                  {uploadFile.error && (
                    <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {uploadFile.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {uploadFile.status === 'processing' && (
                    <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                  )}
                  {uploadFile.status === 'complete' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {completeCount > 0 && `${completeCount} uploaded`}
              {completeCount > 0 && pendingCount > 0 && ' • '}
              {pendingCount > 0 && `${pendingCount} pending`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setFiles([])}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={pendingCount === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {pendingCount} File{pendingCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
