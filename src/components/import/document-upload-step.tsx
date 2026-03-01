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
  X,
  File,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WizardFileUpload {
  file: File
  id: string
  status: 'pending' | 'ready'
  error?: string
}

interface DocumentUploadStepProps {
  files: WizardFileUpload[]
  onFilesChange: (files: WizardFileUpload[]) => void
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
]

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.md']

function detectDocType(filename: string): string {
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentUploadStep({ files, onFilesChange }: DocumentUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: WizardFileUpload[] = Array.from(fileList)
      .filter(file => {
        const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '')
        return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext)
      })
      .map(file => ({
        file,
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        status: 'ready' as const,
      }))

    if (newFiles.length === 0 && fileList.length > 0) {
      // All files were filtered out
      return
    }

    onFilesChange([...files, ...newFiles])
  }, [files, onFilesChange])

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
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id))
  }

  const clearAll = () => {
    onFilesChange([])
  }

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0)

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
              PDF, DOC, DOCX, TXT files -- Folders supported
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
              <span className="font-medium">{files.length} file{files.length !== 1 ? 's' : ''}</span>
              <Badge variant="secondary">{formatFileSize(totalSize)} total</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
            >
              Clear All
            </Button>
          </div>

          {/* File Items */}
          <div className="max-h-72 overflow-y-auto">
            {files.map(f => (
              <div key={f.id} className="p-3 flex items-center gap-3 hover:bg-muted/30">
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                  f.status === 'ready' ? 'bg-green-500/10' : 'bg-muted'
                )}>
                  {f.status === 'ready' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : f.error ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <File className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{f.file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(f.file.size)}</span>
                    {f.error && <span className="text-red-500">{f.error}</span>}
                  </div>
                </div>

                <Badge variant="outline" className="shrink-0 text-xs">
                  {detectDocType(f.file.name)}
                </Badge>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeFile(f.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
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
            <li>- Name files descriptively (e.g., &quot;01_MSJ_Motion.pdf&quot;)</li>
            <li>- Upload motions, briefs, and exhibits for comprehensive analysis</li>
            <li>- Documents will be uploaded and text-extracted after case creation</li>
            <li>- You can always add more documents later from the case dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
