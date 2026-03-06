import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FolderSearch } from 'lucide-react'
import { DiscoveryOrganizer } from '@/components/discovery/discovery-organizer'
import type { CaseStatus } from '@/lib/types'

const STATUS_COLORS: Record<CaseStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-500',
}

export default async function DiscoveryPage({
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
    const userId = await getAuthUserId()
    if (!userId && !hasBetaBypass) redirect('/sign-in')
    const supabase = await getSupabase()

    const { data: caseResult, error } = await supabase
      .from('cases')
      .select(`
        *,
        documents (*)
      `)
      .eq('id', id)
      .single()

    if (error || !caseResult) {
      notFound()
    }
    caseData = caseResult
  } catch (err) {
    if (!hasBetaBypass) redirect('/sign-in')
    notFound()
  }

  if (!caseData) {
    notFound()
  }

  const documentCount = caseData.documents?.length || 0

  return (
    <div className="min-h-screen bg-[var(--color-legal-cream)]">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <Link href={`/case/${id}`} className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-3 sm:mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Case
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold truncate flex items-center gap-2">
                  <FolderSearch className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                  Discovery: {caseData.name}
                </h1>
                <Badge className={`${STATUS_COLORS[caseData.status as CaseStatus]} shrink-0 w-fit`}>
                  {caseData.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-300 text-xs sm:text-sm">
                {caseData.case_number && <span>{caseData.case_number}</span>}
                <span>{caseData.case_type}</span>
                {caseData.jurisdiction && <span className="hidden sm:inline">{caseData.jurisdiction}</span>}
                <span>{documentCount} document{documentCount !== 1 ? 's' : ''}</span>
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
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <DiscoveryOrganizer
          caseId={id}
          initialDocumentCount={documentCount}
        />
      </main>
    </div>
  )
}
