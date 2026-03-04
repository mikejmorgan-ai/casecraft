'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateCaseReportPDF } from '@/lib/pdf/case-report-pdf'
import type { Case, Agent, Document, CaseFact } from '@/lib/types'

interface ExportCaseButtonProps {
  caseId: string
  caseData?: Case
  agents?: Agent[]
  documents?: Document[]
  facts?: CaseFact[]
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportCaseButton({
  caseId,
  caseData,
  agents,
  documents,
  facts,
  variant = 'outline',
  size = 'sm',
}: ExportCaseButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // If case data is already provided, use it directly
      if (caseData) {
        generateCaseReportPDF({
          caseData,
          agents,
          documents,
          facts,
        })
        toast.success('Case report PDF generated successfully')
        return
      }

      // Otherwise, fetch case data from the API
      const response = await fetch(`/api/cases/${caseId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch case data')
      }

      const data = await response.json()

      generateCaseReportPDF({
        caseData: data.case,
        agents: data.agents,
        documents: data.documents,
        facts: data.facts,
      })

      toast.success('Case report PDF generated successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to generate case report PDF')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      id="btn-export-case-pdf"
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      title="Export case as PDF"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-2" />
          Export PDF
        </>
      )}
    </Button>
  )
}
