'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  ExternalLink,
  Shield,
  X
} from 'lucide-react'

interface Citation {
  id: string
  text: string
  source: string
  sourceUrl?: string
  verified: boolean
}

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
  documentTitle: string
  documentContent: string
  citations: Citation[]
  actionLabel?: string
}

/**
 * Human-in-the-Loop Verification Modal
 *
 * Implements attorney duty of supervision requirement.
 * Users must verify all AI-generated citations against source documents
 * before any document can be "filed" or exported.
 *
 * This satisfies ethical obligations under:
 * - Utah Rules of Professional Conduct 5.3 (Supervision)
 * - ABA Model Rule 1.1 (Competence)
 */
export function VerificationModal({
  isOpen,
  onClose,
  onVerified,
  documentTitle,
  documentContent,
  citations,
  actionLabel = 'File Document'
}: VerificationModalProps) {
  const [verifiedCitations, setVerifiedCitations] = useState<Set<string>>(new Set())
  const [acknowledged, setAcknowledged] = useState(false)

  const allCitationsVerified = citations.length === 0 ||
    citations.every(c => verifiedCitations.has(c.id))

  const canProceed = allCitationsVerified && acknowledged

  const handleVerifyCitation = (citationId: string) => {
    setVerifiedCitations(prev => {
      const next = new Set(prev)
      if (next.has(citationId)) {
        next.delete(citationId)
      } else {
        next.add(citationId)
      }
      return next
    })
  }

  const handleVerifyAll = () => {
    if (verifiedCitations.size === citations.length) {
      setVerifiedCitations(new Set())
    } else {
      setVerifiedCitations(new Set(citations.map(c => c.id)))
    }
  }

  const handleProceed = () => {
    if (canProceed) {
      onVerified()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Human Verification Required
              </h2>
              <p className="text-sm text-slate-400">
                Attorney duty of supervision (URPC 5.3)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-6 space-y-6">
          {/* Document Preview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-medium text-slate-300">
                Document: {documentTitle}
              </h3>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 max-h-40 overflow-y-auto">
              <p className="text-sm text-slate-400 whitespace-pre-wrap">
                {documentContent.substring(0, 500)}
                {documentContent.length > 500 && '...'}
              </p>
            </div>
          </div>

          {/* Citation Verification */}
          {citations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-300">
                  Verify Citations ({verifiedCitations.size}/{citations.length})
                </h3>
                <button
                  onClick={handleVerifyAll}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {verifiedCitations.size === citations.length ? 'Uncheck All' : 'Check All'}
                </button>
              </div>

              <div className="space-y-2">
                {citations.map(citation => (
                  <div
                    key={citation.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      verifiedCitations.has(citation.id)
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-slate-900/50 border-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => handleVerifyCitation(citation.id)}
                      className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        verifiedCitations.has(citation.id)
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {verifiedCitations.has(citation.id) && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">
                        &ldquo;{citation.text}&rdquo;
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          Source: {citation.source}
                        </span>
                        {citation.sourceUrl && (
                          <a
                            href={citation.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acknowledgment */}
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={e => setAcknowledged(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-amber-500 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-800"
              />
              <div>
                <p className="text-sm text-amber-200 font-medium">
                  I acknowledge my duty of supervision
                </p>
                <p className="mt-1 text-xs text-amber-300/70 leading-relaxed">
                  I have reviewed this AI-generated document and verified that all citations
                  accurately reference the source materials. I understand that I am responsible
                  for the accuracy of any document filed with the court, regardless of whether
                  it was AI-assisted. (Utah RPC 5.3, ABA Model Rule 1.1)
                </p>
              </div>
            </label>
          </div>

          {/* Warning if not complete */}
          {!canProceed && (
            <div className="flex items-start gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                {!allCitationsVerified && 'Please verify all citations. '}
                {!acknowledged && 'Please acknowledge your duty of supervision.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-800/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={!canProceed}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              canProceed
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {canProceed ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {actionLabel}
              </span>
            ) : (
              actionLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage verification state
 */
export function useVerificationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const requestVerification = (onVerified: () => void) => {
    setPendingAction(() => onVerified)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setPendingAction(null)
  }

  const handleVerified = () => {
    if (pendingAction) {
      pendingAction()
    }
    handleClose()
  }

  return {
    isOpen,
    requestVerification,
    handleClose,
    handleVerified
  }
}
