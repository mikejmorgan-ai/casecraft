import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, FileText, Users, MessageSquare } from 'lucide-react'
import { CreateCaseDialog } from '@/components/cases/create-case-dialog'
import type { CaseStatus, CaseType } from '@/lib/types'

// Type for case with aggregate counts
interface CaseWithCounts {
  id: string
  user_id: string
  name: string
  case_number: string | null
  case_type: CaseType
  jurisdiction: string | null
  status: CaseStatus
  summary: string | null
  plaintiff_name: string | null
  defendant_name: string | null
  filed_date: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  agents: { count: number }[]
  documents: { count: number }[]
  conversations: { count: number }[]
}

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

export default async function DashboardPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('cases')
    .select(`
      *,
      agents(count),
      documents(count),
      conversations(count)
    `)
    .order('updated_at', { ascending: false })

  const cases = data as CaseWithCounts[] | null

  const caseStats = {
    total: cases?.length || 0,
    active: cases?.filter(c => c.status === 'active').length || 0,
    draft: cases?.filter(c => c.status === 'draft').length || 0,
  }

  return (
    <div id="dashboard-page-container" className="container mx-auto px-6 py-8">
      {/* Header */}
      <div id="dashboard-header" className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Manage your legal simulations</p>
        </div>
        <CreateCaseDialog />
      </div>

      {/* Stats */}
      <div id="dashboard-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Briefcase className="h-5 w-5" />}
          label="Total Cases"
          value={caseStats.total}
        />
        <StatCard
          icon={<Briefcase className="h-5 w-5 text-green-600" />}
          label="Active Cases"
          value={caseStats.active}
        />
        <StatCard
          icon={<Briefcase className="h-5 w-5 text-gray-400" />}
          label="Draft Cases"
          value={caseStats.draft}
        />
      </div>

      {/* Cases List */}
      <section id="dashboard-cases-section">
        <h2 className="text-xl font-semibold text-primary mb-4">Your Cases</h2>

        {cases && cases.length > 0 ? (
          <div className="grid gap-4">
            {cases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseData={caseItem} />
            ))}
          </div>
        ) : (
          <Card id="dashboard-empty-state" className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No cases yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first case to start simulating legal proceedings.
              </p>
              <CreateCaseDialog />
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
          <div>
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CaseCard({ caseData }: { caseData: CaseWithCounts }) {
  const agentCount = caseData.agents?.[0]?.count || 0
  const docCount = caseData.documents?.[0]?.count || 0
  const convCount = caseData.conversations?.[0]?.count || 0

  return (
    <Link href={`/case/${caseData.id}`}>
      <Card id={`case-card-${caseData.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{caseData.name}</CardTitle>
              <CardDescription>
                {caseData.case_number && <span>{caseData.case_number} &bull; </span>}
                {TYPE_LABELS[caseData.case_type]}
                {caseData.jurisdiction && <span> &bull; {caseData.jurisdiction}</span>}
              </CardDescription>
            </div>
            <Badge className={STATUS_COLORS[caseData.status]}>
              {caseData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {caseData.plaintiff_name && caseData.defendant_name && (
            <p className="text-sm text-muted-foreground mb-3">
              {caseData.plaintiff_name} v. {caseData.defendant_name}
            </p>
          )}

          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {agentCount} agents
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {docCount} documents
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {convCount} conversations
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
