import { createServerSupabase } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Filter } from 'lucide-react'
import { FilterKeyTermsManager } from '@/components/filters/filter-key-terms-manager'
import type { FilterKeyTerm } from '@/lib/types'

export default async function FiltersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let caseData: any = null
  let filterTerms: FilterKeyTerm[] = []

  try {
    const supabase = await createServerSupabase()
    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user && !hasBetaBypass) redirect('/login')

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

    // Fetch active filter terms
    const { data: termsResult, error: termsError } = await supabase
      .from('filter_key_terms')
      .select('*')
      .eq('case_id', id)
      .eq('is_active', true)
      .order('category', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (termsError) {
      console.error('Error fetching filter terms:', termsError)
    } else {
      filterTerms = (termsResult || []) as FilterKeyTerm[]
    }
  } catch (err) {
    if (!hasBetaBypass) redirect('/login')
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
          <Link href={`/case/${id}`} className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-3 sm:mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {caseData.name}
          </Link>

          <div className="flex items-center gap-3">
            <Filter className="h-6 w-6" />
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold">Filter Key Terms</h1>
              <p className="text-gray-300 text-sm">{caseData.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <FilterKeyTermsManager caseId={id} initialTerms={filterTerms} />
      </main>
    </div>
  )
}
