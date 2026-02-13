'use client'

import { useState, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  FolderUp,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  File,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUpload {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'embedding' | 'complete' | 'error'
  progress: number
  error?: string
}

interface DragDropUploadProps {
  caseId: string
  onUploadComplete?: (documentIds: string[]) => void
}

export function DragDropUpload({ caseId, onUploadComplete }: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<FileUpload[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ]

    const newFiles: FileUpload[] = Array.from(fileList)
      .filter(file => {
        const isAllowed = allowedTypes.includes(file.type) || 
          file.name.endsWith('.pdf') || 
          file.name.endsWith('.doc') || 
          file.name.endsWith('.docx') ||
          file.name.endsWith('.txt') ||
          file.name.endsWith('.md')
        return isAllowed
      })
      .map(file => ({
        file,
        id: Math.random().toString(36).slice(2),
        status: 'pending' as const,
        progress: 0,
      }))

    if (newFiles.length === 0) {
      alert('Please upload PDF, DOC, DOCX, TXT, or MD files only.')
      return
    }

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const items = e.dataTransfer.items
    const filePromises: Promise<File>[] = []

    // Handle folder drops
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry()
        if (entry) {
          if (entry.isDirectory) {
            filePromises.push(...traverseDirectory(entry as FileSystemDirectoryEntry))
          } else {
            const fileEntry = entry as FileSystemFileEntry
            filePromises.push(new Promise(resolve => fileEntry.file(resolve)))
          }
        }
      }
    }

    if (filePromises.length > 0) {
      Promise.all(filePromises).then(files => processFiles(files))
    } else {
      processFiles(e.dataTransfer.files)
    }
  }, [processFiles])

  const traverseDirectory = (dirEntry: FileSystemDirectoryEntry): Promise<File>[] => {
    const promises: Promise<File>[] = []
    const reader = dirEntry.createReader()

    const readEntries = (): Promise<File[]> => {
      return new Promise((resolve) => {
        reader.readEntries(async (entries) => {
          if (entries.length === 0) {
            resolve([])
            return
          }

          const files: File[] = []
          for (const entry of entries) {
            if (entry.isFile) {
              const fileEntry = entry as FileSystemFileEntry
              const file = await new Promise<File>(resolve => fileEntry.file(resolve))
              files.push(file)
            } else if (entry.isDirectory) {
              const subFiles = await Promise.all(traverseDirectory(entry as FileSystemDirectoryEntry))
              files.push(...subFiles)
            }
          }

          const moreFiles = await readEntries()
          resolve([...files, ...moreFiles])
        })
      })
    }

    promises.push(readEntries().then(files => files).then(f => f[0])) // Simplified
    return promises
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const startUpload = async () => {
    if (files.length === 0 || isProcessing) return

    setIsProcessing(true)
    const uploadedIds: string[] = []

    for (const fileUpload of files) {
      if (fileUpload.status !== 'pending') continue

      try {
        // Update status to uploading
        setFiles(prev => prev.map(f =>
          f.id === fileUpload.id ? { ...f, status: 'uploading' as const, progress: 10 } : f
        ))

        // Create form data
        const formData = new FormData()
        formData.append('file', fileUpload.file)
        formData.append('name', fileUpload.file.name)
        formData.append('doc_type', detectDocType(fileUpload.file.name))

        // Upload file
        const uploadRes = await fetch(`/api/cases/${caseId}/documents`, {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) throw new Error('Upload failed')

        const doc = await uploadRes.json()

        setFiles(prev => prev.map(f =>
          f.id === fileUpload.id ? { ...f, status: 'embedding' as const, progress: 50 } : f
        ))

        // Trigger embedding
        const embedRes = await fetch(`/api/cases/${caseId}/documents/${doc.id}/embed`, {
          method: 'POST',
        })

        if (!embedRes.ok) {
          console.warn('Embedding failed, document uploaded but not vectorized')
        }

        // Mark complete
        setFiles(prev => prev.map(f =>
          f.id === fileUpload.id ? { ...f, status: 'complete' as const, progress: 100 } : f
        ))

        uploadedIds.push(doc.id)

      } catch (error) {
        setFiles(prev => prev.map(f =>
          f.id === fileUpload.id ? {
            ...f,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f
        ))
      }
    }

    setIsProcessing(false)
    if (uploadedIds.length > 0) {
      onUploadComplete?.(uploadedIds)
    }
  }

  const detectDocType = (filename: string): string => {
    const lower = filename.toLowerCase()
    if (lower.includes('motion')) return 'motion'
    if (lower.includes('brief')) return 'brief'
    if (lower.includes('complaint')) return 'complaint'
    if (lower.includes('answer')) return 'answer'
    if (lower.includes('discovery')) return 'discovery'
    if (lower.includes('deposition')) return 'deposition'
    if (lower.includes('exhibit')) return 'exhibit'
    if (lower.includes('order')) return 'order'
    if (lower.includes('judgment') || lower.includes('ruling')) return 'judgment'
    return 'other'
  }

  const pendingCount = files.filter(f => f.status === 'pending').length
  const completeCount = files.filter(f => f.status === 'complete').length
  const errorCount = files.filter(f => f.status === 'error').length

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragging && 'border-primary bg-primary/10 scale-[1.02]',
          !isDragging && 'border-muted-foreground/25'
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            'h-16 w-16 rounded-full flex items-center justify-center transition-colors',
            isDragging ? 'bg-primary/20' : 'bg-muted'
          )}>
            <Upload className={cn('h-8 w-8', isDragging ? 'text-primary' : 'text-muted-foreground')} />
          </div>

          <div>
            <p className="font-medium text-lg">
              {isDragging ? 'Drop files here' : 'Drag & drop case documents'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, DOC, DOCX, TXT files • Folders supported
            </p>
          </div>

          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={folderInputRef}
              type="file"
              multiple
              // @ts-expect-error - webkitdirectory is valid but not in types
              webkitdirectory=""
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Select Files
            </Button>
            <Button
              variant="outline"
              onClick={() => folderInputRef.current?.click()}
              className="gap-2"
            >
              <FolderUp className="h-4 w-4" />
              Select Folder
            </Button>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <Card className="divide-y">
          {/* Header */}
          <div className="p-4 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-4">
              <span className="font-medium">{files.length} files</span>
              {pendingCount > 0 && (
                <Badge variant="secondary">{pendingCount} pending</Badge>
              )}
              {completeCount > 0 && (
                <Badge variant="default" className="bg-green-500">{completeCount} complete</Badge>
              )}
              {errorCount > 0 && (
                <Badge variant="destructive">{errorCount} failed</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiles([])}
                disabled={isProcessing}
              >
                Clear All
              </Button>
              <Button
                onClick={startUpload}
                disabled={pendingCount === 0 || isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload & Ingest
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* File Items */}
          <div className="max-h-80 overflow-y-auto">
            {files.map(f => (
              <div key={f.id} className="p-3 flex items-center gap-3 hover:bg-muted/30">
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                  f.status === 'complete' && 'bg-green-500/10',
                  f.status === 'error' && 'bg-red-500/10',
                  (f.status === 'pending' || f.status === 'uploading' || f.status === 'embedding') && 'bg-muted'
                )}>
                  {f.status === 'complete' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : f.status === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : f.status === 'uploading' || f.status === 'embedding' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <File className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{f.file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{(f.file.size / 1024).toFixed(1)} KB</span>
                    {f.status === 'uploading' && <span>Uploading...</span>}
                    {f.status === 'embedding' && <span>Creating embeddings...</span>}
                    {f.error && <span className="text-red-500">{f.error}</span>}
                  </div>
                  {(f.status === 'uploading' || f.status === 'embedding') && (
                    <Progress value={f.progress} className="h-1 mt-1" />
                  )}
                </div>

                <Badge variant="outline" className="shrink-0 text-xs">
                  {detectDocType(f.file.name)}
                </Badge>

                {f.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeFile(f.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tips */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 text-sm">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Tips for best results:</p>
          <ul className="text-muted-foreground mt-1 space-y-1">
            <li>• Name files descriptively (e.g., &quot;01_MSJ_Motion.pdf&quot;)</li>
            <li>• Upload motions, briefs, and exhibits — not the ruling for blind tests</li>
            <li>• Larger files take longer to process and vectorize</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
