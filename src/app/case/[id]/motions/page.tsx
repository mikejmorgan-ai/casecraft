import { createServerSupabase } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MotionAnalyzer } from '@/components/motions/motion-analyzer'
import type { CaseStatus, CaseType, Document } from '@/lib/types'

const STATUS_COLORS: Record<CaseStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-500',
}

const TYPE_LABELS: Record<CaseType, string> = {
  civil: 'Civil',
  criminal: 'Criminal',
  family: 'Family',
  contract: 'Contract',
  tort: 'Tort',
  property: 'Property',
  constitutional: 'Constitutional',
  administrative: 'Administrative',
}

export default async function MotionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let caseData: any = null

  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user && !hasBetaBypass) redirect('/login')

    const { data: caseResult, error } = await supabase
      .from('cases')
      .select(`
        *,
        documents(*)
      `)
      .eq('id', id)
      .single()

    if (error || !caseResult) {
      notFound()
    }
    caseData = caseResult
  } catch (err) {
    if (!hasBetaBypass) redirect('/login')
    notFound()
  }

  if (!caseData) {
    notFound()
  }

  return (
    <div id="motions-page-container" className="min-h-screen bg-[var(--color-legal-cream)]">
      {/* Header */}
      <header id="motions-page-header" className="bg-primary text-primary-foreground py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <Link
            href={`/case/${id}`}
            className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {caseData.name}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-serif font-bold">Motion Analyzer</h1>
            <div className="flex items-center gap-2">
              <Badge className={STATUS_COLORS[caseData.status as CaseStatus]}>
                {caseData.status}
              </Badge>
              <Badge variant="secondary">
                {TYPE_LABELS[caseData.case_type as CaseType]}
              </Badge>
            </div>
          </div>

          {caseData.plaintiff_name && caseData.defendant_name && (
            <p className="text-secondary mt-1 text-sm">
              {caseData.plaintiff_name} v. {caseData.defendant_name}
            </p>
          )}
        </div>
      </header>

      {/* Content */}
      <main id="motions-page-content" className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <MotionAnalyzer
          caseId={id}
          caseName={caseData.name}
          documents={(caseData.documents || []) as Document[]}
        />
      </main>
    </div>
  )
}
