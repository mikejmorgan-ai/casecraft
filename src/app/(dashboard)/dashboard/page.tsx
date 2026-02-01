import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  FileText,
  Target,
  Play,
  AlertTriangle,
  Plus,
  ArrowRight,
  Upload,
  Clock,
  CheckCircle,
  Scale,
  TrendingUp,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch dashboard data
  const [casesResult, predictionsResult, documentsResult] = await Promise.all([
    supabase
      .from('cases')
      .select('*, case_predictions(count)')
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase
      .from('case_predictions')
      .select('*, cases(name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('documents')
      .select('count')
      .single(),
  ])

  const cases = casesResult.data || []
  const predictions = predictionsResult.data || []
  const totalDocs = documentsResult.data?.count || 0

  // Calculate stats
  const totalCases = cases.length
  const blindTests = cases.filter((c: { is_blind_test: boolean }) => c.is_blind_test).length
  const avgAccuracy = predictions.length > 0
    ? Math.round(predictions.reduce((acc: number, p: { accuracy_score: number | null }) => acc + (p.accuracy_score || 0), 0) / predictions.filter((p: { accuracy_score: number | null }) => p.accuracy_score !== null).length) || 0
    : 0

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back. Here&apos;s your litigation intelligence overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/import-test">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Test Case
            </Button>
          </Link>
          <Link href="/dashboard/cases">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cases"
          value={totalCases}
          icon={<Briefcase className="h-5 w-5" />}
          trend="+2 this week"
          color="primary"
        />
        <StatCard
          title="Documents"
          value={totalDocs}
          icon={<FileText className="h-5 w-5" />}
          trend="39,457 vectors"
          color="accent"
        />
        <StatCard
          title="Blind Tests"
          value={blindTests}
          icon={<Target className="h-5 w-5" />}
          trend="Predictions ready"
          color="secondary"
        />
        <StatCard
          title="Avg Accuracy"
          value={`${avgAccuracy}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={avgAccuracy >= 80 ? 'Excellent' : avgAccuracy >= 60 ? 'Good' : 'Needs data'}
          color={avgAccuracy >= 80 ? 'success' : avgAccuracy >= 60 ? 'warning' : 'muted'}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Run Prediction"
          description="Analyze case documents and predict outcomes"
          icon={<Target className="h-6 w-6" />}
          href="/dashboard/predictions"
          color="primary"
        />
        <QuickActionCard
          title="Start Simulation"
          description="Mock trial with AI attorneys and judge"
          icon={<Play className="h-6 w-6" />}
          href="/dashboard/simulations"
          color="accent"
        />
        <QuickActionCard
          title="Find Weaknesses"
          description="Identify gaps and strategic fixes"
          icon={<AlertTriangle className="h-6 w-6" />}
          href="/dashboard/weaknesses"
          color="destructive"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Cases</CardTitle>
              <CardDescription>Your active litigation matters</CardDescription>
            </div>
            <Link href="/dashboard/cases">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {cases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No cases yet</p>
                <Link href="/dashboard/cases">
                  <Button variant="link" className="mt-2">Create your first case</Button>
                </Link>
              </div>
            ) : (
              cases.map((c: {
                id: string
                name: string
                status: string
                case_type: string
                is_blind_test?: boolean
                updated_at: string
              }) => (
                <Link key={c.id} href={`/case/${c.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">
                          {c.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.case_type} • {new Date(c.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {c.is_blind_test && (
                        <Badge variant="outline" className="text-xs">Blind Test</Badge>
                      )}
                      <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {c.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Predictions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Predictions</CardTitle>
              <CardDescription>AI outcome analysis results</CardDescription>
            </div>
            <Link href="/dashboard/predictions">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {predictions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No predictions yet</p>
                <Link href="/dashboard/predictions">
                  <Button variant="link" className="mt-2">Run your first prediction</Button>
                </Link>
              </div>
            ) : (
              predictions.map((p: {
                id: string
                predicted_outcome: string
                confidence_score: number
                is_correct: boolean | null
                accuracy_score: number | null
                created_at: string
                cases: { name: string } | null
              }) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      p.is_correct === true ? 'bg-green-500/10' :
                      p.is_correct === false ? 'bg-red-500/10' :
                      'bg-primary/10'
                    }`}>
                      {p.is_correct === true ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : p.is_correct === false ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Target className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {p.cases?.name || 'Unknown Case'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.predicted_outcome} • {p.confidence_score}% confidence
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.accuracy_score !== null && (
                      <Badge variant={p.accuracy_score >= 80 ? 'default' : 'secondary'} className="text-xs">
                        {p.accuracy_score}% accurate
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Keyboard Shortcuts */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-background border text-xs font-mono">⌘K</kbd>
              Quick Search
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-background border text-xs font-mono">⌘N</kbd>
              New Case
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-background border text-xs font-mono">⌘P</kbd>
              Run Prediction
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-background border text-xs font-mono">⌘/</kbd>
              Shortcuts Help
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  trend,
  color,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center bg-${color}/10 text-${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
  color,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
        <CardContent className="pt-6">
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center bg-${color}/10 text-${color} mb-4 group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <h3 className="font-semibold group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
