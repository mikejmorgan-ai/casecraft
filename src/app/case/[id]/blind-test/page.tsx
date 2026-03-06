import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Scale, EyeOff } from 'lucide-react'
import { BlindTestPanel } from '@/components/blind-test/blind-test-panel'
import type { CaseStatus, CaseType } from '@/lib/types'

const STATUS_COLORS: Record<CaseStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-500',
}

export default async function BlindTestPage({
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
        agents (*),
        documents (*),
        case_facts (*)
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

  // If not a blind test case, show info message
  if (!caseData.is_blind_test) {
    return (
      <div className="min-h-screen bg-[var(--color-legal-cream)]">
        <header className="bg-primary text-primary-foreground py-4 sm:py-6">
          <div className="container mx-auto px-4 sm:px-6">
            <Link href={`/case/${id}`} className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-3 sm:mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Case
            </Link>
            <h1 className="text-xl sm:text-2xl font-serif font-bold">{caseData.name}</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <EyeOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Not a Blind Test Case</h3>
              <p className="text-muted-foreground mb-4">
                This case is not configured for blind testing. To use the blind test feature,
                the case must have an actual ruling stored and be marked as a blind test.
              </p>
              <Link
                href={`/case/${id}`}
                className="text-sm text-primary underline hover:no-underline"
              >
                Return to case details
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

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
                  <Scale className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                  Blind Test: {caseData.name}
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
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a365d]">{caseData.documents?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Documents</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a365d]">{caseData.case_facts?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Facts</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a365d]">{caseData.agents?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Agents</p>
          </Card>
        </div>

        {/* Blind Test Panel */}
        <BlindTestPanel
          caseId={id}
          caseName={caseData.name}
          isBlindTest={caseData.is_blind_test || false}
          rulingRevealed={caseData.ruling_revealed || false}
          caseType={caseData.case_type as CaseType}
          jurisdiction={caseData.jurisdiction}
          plaintiffName={caseData.plaintiff_name}
          defendantName={caseData.defendant_name}
          summary={caseData.summary}
        />
      </main>
    </div>
  )
}
