import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = await getSupabase()

    // Verify case exists and user has access
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, name')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Fetch all claim evidence for this case, joined with claims and documents
    const { data: claimsData, error: claimsError } = await supabase
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
      .eq('case_id', caseId)
      .order('claim_number', { ascending: true })

    if (claimsError) {
      return NextResponse.json({ error: claimsError.message }, { status: 500 })
    }

    // Fetch documents for joining with evidence
    const { data: documentsData, error: docsError } = await supabase
      .from('documents')
      .select('id, name, doc_type, content_text')
      .eq('case_id', caseId)

    if (docsError) {
      return NextResponse.json({ error: docsError.message }, { status: 500 })
    }

    // Build a document lookup map
    const documentMap = new Map(
      (documentsData || []).map((doc) => [doc.id, doc])
    )

    // Aggregate statistics
    let totalEvidence = 0
    let totalSmokingGuns = 0
    const tierCounts: Record<number, number> = {}
    const allEvidence: Array<{
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
    }> = []

    const byClaim = (claimsData || []).map((claim) => {
      const evidence = claim.claim_evidence || []
      const count = evidence.length
      const smokingGuns = evidence.filter(
        (e: { is_smoking_gun: boolean }) => e.is_smoking_gun
      ).length

      totalEvidence += count
      totalSmokingGuns += smokingGuns

      // Accumulate tier counts and build flat evidence list
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

    // Build tier distribution array (tiers 1-12)
    const byTier = Array.from({ length: 12 }, (_, i) => ({
      tier: i + 1,
      count: tierCounts[i + 1] || 0,
    }))

    // Top findings: smoking gun items sorted by tier (lowest tier first = most important)
    const topFindings = allEvidence
      .filter((e) => e.is_smoking_gun)
      .sort((a, b) => (a.tier ?? 99) - (b.tier ?? 99))
      .slice(0, 20)

    return NextResponse.json({
      total_evidence: totalEvidence,
      smoking_gun_count: totalSmokingGuns,
      claims_covered: byClaim.filter((c) => c.count > 0).length,
      total_claims: byClaim.length,
      by_claim: byClaim,
      by_tier: byTier,
      top_findings: topFindings,
    })
  } catch (err) {
    console.error('GET /api/cases/[id]/findings error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
