import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Flame } from 'lucide-react'
import { FindingsSummary } from '@/components/findings/findings-summary'
import { TierDistribution } from '@/components/findings/tier-distribution'
import { FindingsTable } from '@/components/findings/findings-table'
import { ClaimStrengthSummary } from '@/components/findings/claim-strength-summary'

export default async function FindingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const userId = await getAuthUserId()
  if (!userId) {
    redirect('/sign-in')
  }
  const supabase = await getSupabase()

  // Verify case access
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('id, name, case_number, status')
    .eq('id', id)
    .single()

  if (caseError || !caseData) {
    notFound()
  }

  // Fetch claims with their evidence
  const { data: claimsData } = await supabase
    .from('claims_for_relief')
    .select(`
      id,
      claim_number,
      title,
      relief_type,
      claim_evidence (
        id,
        tier,
        is_smoking_gun,
        description,
        relevance,
        document_id,
        discovery_file,
        created_at
      )
    `)
    .eq('case_id', id)
    .order('claim_number', { ascending: true })

  // Fetch documents for joining
  const { data: documentsData } = await supabase
    .from('documents')
    .select('id, name, doc_type')
    .eq('case_id', id)

  // Build document lookup
  const documentMap = new Map(
    (documentsData || []).map((doc) => [doc.id, doc])
  )

  // Aggregate data
  let totalEvidence = 0
  let totalSmokingGuns = 0
  const tierCounts: Record<number, number> = {}

  interface EvidenceItem {
    id: string
    tier: number | null
    is_smoking_gun: boolean
    description: string | null
    relevance: string | null
    discovery_file: string | null
    created_at: string
    claim_id: string
    claim_number: number
    claim_title: string
    document_id: string | null
    document_title: string | null
    document_type: string | null
  }

  const allEvidence: EvidenceItem[] = []

  const byClaim = (claimsData || []).map((claim) => {
    const evidence = claim.claim_evidence || []
    const count = evidence.length
    const smokingGuns = evidence.filter(
      (e: { is_smoking_gun: boolean }) => e.is_smoking_gun
    ).length

    totalEvidence += count
    totalSmokingGuns += smokingGuns

    const claimTierCounts: Record<number, number> = {}
    evidence.forEach(
      (e: {
        id: string
        tier: number | null
        is_smoking_gun: boolean
        description: string | null
        relevance: string | null
        document_id: string | null
        discovery_file: string | null
        created_at: string
      }) => {
        if (e.tier != null) {
          tierCounts[e.tier] = (tierCounts[e.tier] || 0) + 1
          claimTierCounts[e.tier] = (claimTierCounts[e.tier] || 0) + 1
        }

        const doc = e.document_id ? documentMap.get(e.document_id) : null
        allEvidence.push({
          id: e.id,
          tier: e.tier,
          is_smoking_gun: e.is_smoking_gun,
          description: e.description,
          relevance: e.relevance,
          discovery_file: e.discovery_file,
          created_at: e.created_at,
          claim_id: claim.id,
          claim_number: claim.claim_number,
          claim_title: claim.title,
          document_id: e.document_id,
          document_title: doc?.name || null,
          document_type: doc?.doc_type || null,
        })
      }
    )

    return {
      claim_id: claim.id,
      claim_number: claim.claim_number,
      claim_title: claim.title,
      relief_type: claim.relief_type,
      count,
      smoking_guns: smokingGuns,
      tier_breakdown: claimTierCounts,
    }
  })

  const byTier = Array.from({ length: 12 }, (_, i) => ({
    tier: i + 1,
    count: tierCounts[i + 1] || 0,
  }))

  const topFindings = allEvidence
    .filter((e) => e.is_smoking_gun)
    .sort((a, b) => (a.tier ?? 99) - (b.tier ?? 99))
    .slice(0, 20)

  const claimsCovered = byClaim.filter((c) => c.count > 0).length

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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold flex items-center gap-2">
                <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                Key Findings Dashboard
              </h1>
              <p className="text-gray-300 text-sm mt-1">
                {caseData.name}
                {caseData.case_number && (
                  <span className="ml-2 text-gray-400">({caseData.case_number})</span>
                )}
              </p>
            </div>
            <Badge className="bg-white/10 text-white border-white/20 w-fit">
              {totalEvidence} evidence items
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Summary Stats */}
        <FindingsSummary
          totalEvidence={totalEvidence}
          smokingGunCount={totalSmokingGuns}
          claimsCovered={claimsCovered}
          totalClaims={byClaim.length}
        />

        {/* Tier Distribution + Top Findings */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TierDistribution byTier={byTier} />

          {/* Top Smoking Gun Findings */}
          <Card id="top-findings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                Top Findings ({topFindings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topFindings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Flame className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm">No smoking gun evidence identified yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {topFindings.map((finding, index) => (
                    <div
                      key={finding.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 border border-red-100"
                    >
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-700 text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {finding.tier != null && (
                            <Badge
                              className={
                                finding.tier <= 3
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : finding.tier <= 6
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }
                            >
                              Tier {finding.tier}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Claim #{finding.claim_number}
                          </Badge>
                          {finding.discovery_file && (
                            <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                              {finding.discovery_file}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground line-clamp-3">
                          {finding.description || 'No description available'}
                        </p>
                        {finding.document_title && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Source: {finding.document_title}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Per-Claim Breakdown */}
        <ClaimStrengthSummary
          claims={byClaim}
          totalEvidence={totalEvidence}
        />

        {/* Full Findings Table */}
        <FindingsTable findings={allEvidence} />
      </main>
    </div>
  )
}
