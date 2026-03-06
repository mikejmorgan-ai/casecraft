import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { BriefDrafter } from '@/components/briefs/brief-drafter'
import type { ClaimForRelief } from '@/lib/types'

export default async function BriefsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  let caseData: {
    id: string
    name: string
    case_number: string | null
    plaintiff_name: string | null
    defendant_name: string | null
  } | null = null
  let claims: ClaimForRelief[] = []

  try {
    const userId = await getAuthUserId()
    if (!userId && !hasBetaBypass) redirect('/sign-in')
    const supabase = await getSupabase()

    const { data: caseResult, error: caseError } = await supabase
      .from('cases')
      .select('id, name, case_number, plaintiff_name, defendant_name')
      .eq('id', id)
      .single()

    if (caseError || !caseResult) {
      notFound()
    }
    caseData = caseResult

    const { data: claimsResult } = await supabase
      .from('claims_for_relief')
      .select('*')
      .eq('case_id', id)
      .order('claim_number', { ascending: true })

    claims = (claimsResult as ClaimForRelief[]) || []
  } catch {
    if (!hasBetaBypass) redirect('/sign-in')
    notFound()
  }

  if (!caseData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[var(--color-legal-cream)]">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <Link
            href={`/case/${id}`}
            className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Case
          </Link>

          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 sm:h-7 sm:w-7" />
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold">Brief Drafter</h1>
              <p className="text-gray-300 text-sm">
                {caseData.name}
                {caseData.case_number ? ` - ${caseData.case_number}` : ''}
              </p>
              {caseData.plaintiff_name && caseData.defendant_name && (
                <p className="text-secondary text-sm">
                  {caseData.plaintiff_name} v. {caseData.defendant_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <BriefDrafter caseId={id} claims={claims} />
      </main>
    </div>
  )
}
