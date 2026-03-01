import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Scale } from 'lucide-react'
import { ClaimsList } from '@/components/claims/claims-list'
import type { ClaimForRelief } from '@/lib/types'

export default async function ClaimsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let caseData: any = null
  let claims: ClaimForRelief[] = []

  try {
    const userId = await getAuthUserId()
    if (!userId && !hasBetaBypass) redirect('/login')
    const supabase = getSupabase()

    // Fetch case details
    const { data: caseResult, error: caseError } = await supabase
      .from('cases')
      .select('id, name, case_number, case_type, status')
      .eq('id', id)
      .single()

    if (caseError || !caseResult) {
      notFound()
    }
    caseData = caseResult

    // Fetch claims with evidence
    const { data: claimsResult, error: claimsError } = await supabase
      .from('claims_for_relief')
      .select(`
        *,
        claim_evidence (*)
      `)
      .eq('case_id', id)
      .order('claim_number', { ascending: true })

    if (claimsError) {
      console.error('Error fetching claims:', claimsError)
    } else {
      claims = (claimsResult || []) as ClaimForRelief[]
    }
  } catch (err) {
    if (!hasBetaBypass) redirect('/login')
    notFound()
  }

  if (!caseData) {
    notFound()
  }

  return (
    <div id="claims-page-container" className="min-h-screen bg-[var(--color-legal-cream)]">
      {/* Header */}
      <header id="claims-page-header" className="bg-primary text-primary-foreground py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <Link href={`/case/${id}`} className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-3 sm:mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {caseData.name}
          </Link>

          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6" />
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold">Claims for Relief</h1>
              <p className="text-gray-300 text-sm">{caseData.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="claims-page-content" className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <ClaimsList caseId={id} claims={claims} />
      </main>
    </div>
  )
}
