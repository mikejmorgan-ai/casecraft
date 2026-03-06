import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Scale } from 'lucide-react'
import { EvidenceList } from '@/components/evidence/evidence-list'

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  try {
    const userId = await getAuthUserId()
    if (!userId && !hasBetaBypass) redirect('/sign-in')
    const supabase = await getSupabase()

    // Fetch case with related data
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, name')
      .eq('id', id)
      .single()

    if (caseError || !caseData) {
      notFound()
    }

    // Fetch claims for relief
    const { data: claims } = await supabase
      .from('claims_for_relief')
      .select('id, claim_number, title')
      .eq('case_id', id)
      .order('claim_number', { ascending: true })

    // Fetch documents
    const { data: documents } = await supabase
      .from('documents')
      .select('id, name')
      .eq('case_id', id)
      .order('name', { ascending: true })

    // Fetch case facts
    const { data: facts } = await supabase
      .from('case_facts')
      .select('id, fact_text')
      .eq('case_id', id)
      .order('created_at', { ascending: true })

    // Fetch all evidence for this case (via claims)
    const claimIds = (claims || []).map(c => c.id)

    let evidence: unknown[] = []
    if (claimIds.length > 0) {
      const { data: evidenceData } = await supabase
        .from('claim_evidence')
        .select(`
          *,
          claims_for_relief (
            id,
            case_id,
            claim_number,
            title,
            relief_type,
            description,
            legal_basis
          ),
          documents (
            id,
            name,
            doc_type,
            file_path
          ),
          case_facts (
            id,
            fact_text,
            category,
            is_disputed
          )
        `)
        .in('claim_id', claimIds)
        .order('tier', { ascending: true, nullsFirst: false })

      evidence = evidenceData || []
    }

    return (
      <div id="evidence-page-container" className="min-h-screen bg-[var(--color-legal-cream)]">
        {/* Header */}
        <header id="evidence-page-header" className="bg-primary text-primary-foreground py-4 sm:py-6">
          <div className="container mx-auto px-4 sm:px-6">
            <Link href={`/case/${id}`} className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-3 sm:mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Case
            </Link>

            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6" />
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold">Evidence Map</h1>
                <p className="text-gray-300 text-sm">{caseData.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main id="evidence-page-content" className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <EvidenceList
            caseId={id}
            evidence={evidence as never[]}
            claims={claims || []}
            documents={documents || []}
            facts={facts || []}
          />
        </main>
      </div>
    )
  } catch (err) {
    if (!hasBetaBypass) redirect('/sign-in')
    notFound()
  }
}
