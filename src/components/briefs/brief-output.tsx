'use client'

import { useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Download, FileText, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { BriefType, BriefTone } from './brief-config-form'

const BRIEF_TYPE_LABELS: Record<BriefType, string> = {
  response: 'Response Brief',
  motion: 'Motion',
  memorandum: 'Memorandum of Law',
  opposition: 'Opposition Brief',
  reply: 'Reply Brief',
}

const TONE_LABELS: Record<BriefTone, string> = {
  formal: 'Formal',
  aggressive: 'Aggressive',
  measured: 'Measured',
}

interface BriefOutputProps {
  content: string
  isStreaming: boolean
  briefType: BriefType
  tone: BriefTone
  topic: string
}

export function BriefOutput({
  content,
  isStreaming,
  briefType,
  tone,
  topic,
}: BriefOutputProps) {
  const [copied, setCopied] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [content])

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const sanitizedTopic = topic.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase()
    link.download = `${BRIEF_TYPE_LABELS[briefType].replace(/\s+/g, '-').toLowerCase()}-${sanitizedTopic || 'draft'}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [content, briefType, topic])

  if (!content && !isStreaming) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[400px]">
        <CardContent className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Brief Drafted Yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Configure your brief settings and click &quot;Draft Brief&quot; to generate
            a professional legal brief using AI.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {BRIEF_TYPE_LABELS[briefType]}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {TONE_LABELS[tone]}
            </Badge>
            {isStreaming && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Drafting...
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!content || isStreaming}
              className="h-8"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!content || isStreaming}
              className="h-8"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
          </div>
        </div>
        {topic && (
          <p className="text-sm text-muted-foreground mt-1">
            Topic: {topic}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[calc(100vh-380px)] px-6 pb-6">
          <div ref={contentRef} className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-serif font-bold text-center mt-6 mb-4 uppercase tracking-wide">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-serif font-bold mt-6 mb-3 uppercase">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-serif font-semibold mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed mb-3 text-justify">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 mb-3 text-sm">
                    {children}
                  </ol>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 mb-3 text-sm">
                    {children}
                  </ul>
                ),
                hr: () => (
                  <hr className="my-6 border-gray-300" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>

            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
