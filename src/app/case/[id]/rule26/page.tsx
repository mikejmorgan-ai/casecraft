import { createServerSupabase } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Scale } from 'lucide-react'
import { Rule26Dashboard } from '@/components/rule26/rule26-dashboard'
import type { CaseStatus } from '@/lib/types'

const STATUS_COLORS: Record<CaseStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-500',
}

export default async function Rule26Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: caseData, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !caseData) {
    notFound()
  }

  return (
    <div id="rule26-page-container" className="min-h-screen bg-[var(--color-legal-cream)]">
      {/* Header */}
      <header id="rule26-page-header" className="bg-primary text-primary-foreground py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <Link href={`/case/${id}`} className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-3 sm:mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {caseData.name}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold truncate flex items-center gap-2">
                  <Scale className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                  Rule 26 Discovery
                </h1>
                <Badge className={`${STATUS_COLORS[caseData.status as CaseStatus]} shrink-0 w-fit`}>
                  {caseData.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-300 text-xs sm:text-sm">
                {caseData.case_number && <span>{caseData.case_number}</span>}
                <span>{caseData.case_type}</span>
                {caseData.jurisdiction && <span className="hidden sm:inline">{caseData.jurisdiction}</span>}
              </div>

              {caseData.plaintiff_name && caseData.defendant_name && (
                <p className="text-secondary mt-2 text-sm sm:text-base truncate">
                  {caseData.plaintiff_name} v. {caseData.defendant_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="rule26-page-content" className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Rule26Dashboard
          caseId={id}
          caseName={caseData.name}
          jurisdiction={caseData.jurisdiction}
        />
      </main>
    </div>
  )
}
