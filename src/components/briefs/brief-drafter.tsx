'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { BriefConfigForm, type BriefConfig } from './brief-config-form'
import { BriefOutput } from './brief-output'
import { FileText, Loader2, RotateCcw } from 'lucide-react'
import type { ClaimForRelief } from '@/lib/types'

interface BriefDrafterProps {
  caseId: string
  claims: ClaimForRelief[]
}

export function BriefDrafter({ caseId, claims }: BriefDrafterProps) {
  const [config, setConfig] = useState<BriefConfig>({
    brief_type: 'motion',
    topic: '',
    instructions: '',
    tone: 'formal',
    include_case_law: true,
    claim_ids: [],
  })

  const [briefContent, setBriefContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDraft = useCallback(async () => {
    if (!config.topic.trim()) {
      setError('Please enter a topic for the brief.')
      return
    }

    setError(null)
    setBriefContent('')
    setIsStreaming(true)

    try {
      const response = await fetch(`/api/cases/${caseId}/briefs/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Failed to draft brief (${response.status})`)
      }

      if (!response.body) {
        throw new Error('No response body received')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setBriefContent(accumulated)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setIsStreaming(false)
    }
  }, [caseId, config])

  const handleReset = useCallback(() => {
    setBriefContent('')
    setError(null)
  }, [])

  const canDraft = config.topic.trim().length > 0 && !isStreaming

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-2 space-y-4">
        <BriefConfigForm
          config={config}
          onConfigChange={setConfig}
          claims={claims}
          disabled={isStreaming}
        />

        {/* Action Buttons */}
        <div className="flex gap-2 sticky bottom-4">
          <Button
            id="btn-draft-brief"
            onClick={handleDraft}
            disabled={!canDraft}
            className="flex-1 h-11"
          >
            {isStreaming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Draft Brief
              </>
            )}
          </Button>
          {(briefContent || error) && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isStreaming}
              className="h-11"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-3">
        <BriefOutput
          content={briefContent}
          isStreaming={isStreaming}
          briefType={config.brief_type}
          tone={config.tone}
          topic={config.topic}
        />
      </div>
    </div>
  )
}
