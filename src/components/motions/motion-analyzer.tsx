'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Search,
  Loader2,
  Copy,
  Check,
  Save,
  RotateCcw,
  FileUp,
} from 'lucide-react'
import { MotionAnalysisResult } from './motion-analysis-result'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/lib/types'

interface MotionAnalyzerProps {
  caseId: string
  caseName: string
  documents: Document[]
}

export function MotionAnalyzer({ caseId, caseName, documents }: MotionAnalyzerProps) {
  const [motionText, setMotionText] = useState('')
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('')
  const [analysisContent, setAnalysisContent] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Filter documents that could be motions
  const motionDocuments = documents.filter(
    (d) => d.doc_type === 'motion' || d.doc_type === 'brief' || d.doc_type === 'other'
  )

  const handleAnalyze = useCallback(async () => {
    if (!motionText.trim() && !selectedDocumentId) {
      setError('Please paste motion text or select a document to analyze.')
      return
    }

    setError(null)
    setAnalysisContent('')
    setIsAnalyzing(true)
    setIsSaved(false)

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(`/api/cases/${caseId}/motions/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motion_text: motionText.trim() || undefined,
          document_id: selectedDocumentId || undefined,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Analysis failed (${response.status})`)
      }

      if (!response.body) {
        throw new Error('No response body received')
      }

      // Read the streaming response
      // The API returns a UI message stream format, parse the text-delta events
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.trim()) continue

          // Parse the stream format: lines that start with data indicators
          // The UI message stream format uses lines like:
          // 0:{"type":"text-delta","id":"...","delta":"text"}
          const dataMatch = line.match(/^0:(.+)$/)
          if (dataMatch) {
            try {
              const parsed = JSON.parse(dataMatch[1])
              if (parsed.type === 'text-delta' && parsed.delta) {
                accumulatedContent += parsed.delta
                setAnalysisContent(accumulatedContent)
              }
            } catch {
              // Skip malformed lines
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, ignore
        return
      }
      console.error('Motion analysis error:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }, [caseId, motionText, selectedDocumentId])

  const handleCopy = useCallback(async () => {
    if (!analysisContent) return
    try {
      await navigator.clipboard.writeText(analysisContent)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Fallback for clipboard API failures
      const textArea = document.createElement('textarea')
      textArea.value = analysisContent
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }, [analysisContent])

  const handleSave = useCallback(async () => {
    if (!analysisContent) return
    setIsSaving(true)

    try {
      const supabase = createClient()

      // Save as a document in the case
      const { error: saveError } = await supabase.from('documents').insert({
        case_id: caseId,
        name: `Motion Analysis - ${new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        doc_type: 'other' as const,
        content_text: analysisContent,
        metadata: {
          type: 'motion_analysis',
          source_document_id: selectedDocumentId || null,
          generated_at: new Date().toISOString(),
        },
      })

      if (saveError) throw saveError

      setIsSaved(true)
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save analysis. Please try copying instead.')
    } finally {
      setIsSaving(false)
    }
  }, [analysisContent, caseId, selectedDocumentId])

  const handleReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setMotionText('')
    setSelectedDocumentId('')
    setAnalysisContent('')
    setError(null)
    setIsAnalyzing(false)
    setIsSaved(false)
  }, [])

  const handleDocumentSelect = useCallback((docId: string) => {
    setSelectedDocumentId(docId)
    setError(null)
    // Clear pasted text when selecting a document to avoid confusion
    if (docId) {
      setMotionText('')
    }
  }, [])

  const hasInput = motionText.trim().length > 0 || selectedDocumentId.length > 0
  const hasResults = analysisContent.length > 0

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card id="motion-input-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Motion Text
          </CardTitle>
          <CardDescription>
            Paste the motion text below or select an uploaded document from &ldquo;{caseName}&rdquo; to analyze.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-4">
          {/* Document Selector */}
          {motionDocuments.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <FileUp className="h-3.5 w-3.5" />
                Select from uploaded documents
              </label>
              <Select
                value={selectedDocumentId}
                onValueChange={handleDocumentSelect}
                disabled={isAnalyzing}
              >
                <SelectTrigger id="select-motion-document" className="w-full">
                  <SelectValue placeholder="Choose a document..." />
                </SelectTrigger>
                <SelectContent>
                  {motionDocuments.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{doc.name}</span>
                        <Badge variant="secondary" className="text-xs ml-1">
                          {doc.doc_type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedDocumentId && (
                <p className="text-xs text-muted-foreground">
                  Document selected. The full document text will be sent for analysis.
                </p>
              )}

              {motionDocuments.length > 0 && (
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      or paste text directly
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Input */}
          <div className="space-y-2">
            {motionDocuments.length === 0 && (
              <label className="text-sm font-medium text-muted-foreground">
                Paste the full motion text
              </label>
            )}
            <Textarea
              id="motion-text-input"
              placeholder="Paste the full motion text here for analysis...

Example: COMES NOW the Defendant, by and through counsel, and pursuant to Rule 56 of the Utah Rules of Civil Procedure, hereby moves this Court for summary judgment..."
              value={motionText}
              onChange={(e) => {
                setMotionText(e.target.value)
                setError(null)
                if (e.target.value.trim()) {
                  setSelectedDocumentId('')
                }
              }}
              disabled={isAnalyzing || !!selectedDocumentId}
              className="min-h-[200px] font-mono text-sm resize-y"
            />
            {motionText && (
              <p className="text-xs text-muted-foreground text-right">
                {motionText.length.toLocaleString()} characters
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              id="btn-analyze-motion"
              onClick={handleAnalyze}
              disabled={!hasInput || isAnalyzing}
              className="flex-1 sm:flex-none"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Motion...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Motion
                </>
              )}
            </Button>

            {(hasResults || hasInput) && (
              <Button
                id="btn-reset-motion"
                variant="outline"
                onClick={handleReset}
                disabled={isAnalyzing}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {(hasResults || isAnalyzing) && (
        <>
          {/* Action bar for results */}
          {hasResults && !isAnalyzing && (
            <div className="flex items-center justify-end gap-2">
              <Button
                id="btn-copy-analysis"
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy Analysis
                  </>
                )}
              </Button>

              <Button
                id="btn-save-analysis"
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || isSaved}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                    Saved to Documents
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save to Case
                  </>
                )}
              </Button>
            </div>
          )}

          <MotionAnalysisResult
            content={analysisContent}
            isStreaming={isAnalyzing}
          />
        </>
      )}
    </div>
  )
}
