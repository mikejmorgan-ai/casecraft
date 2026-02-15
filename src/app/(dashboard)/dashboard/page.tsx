import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Card, CardContent } from '@/components/ui/card'
import { RoleDashboard } from '@/components/dashboard/role-dashboards'
import { type UserRole } from '@/lib/auth/rbac'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  let userRole: UserRole = 'attorney'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cases: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let predictions: any[] = []
  let totalDocs = 0

  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !hasBetaBypass) redirect('/login')

    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      userRole = (profile?.role as UserRole) || 'attorney'
    }

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

    cases = casesResult.data || []
    predictions = predictionsResult.data || []
    totalDocs = documentsResult.data?.count || 0
  } catch {
    // Supabase unreachable — show empty dashboard for beta bypass users
    if (!hasBetaBypass) redirect('/login')
  }

  // Calculate stats
  const totalCases = cases.length
  const blindTests = cases.filter((c: { is_blind_test: boolean }) => c.is_blind_test).length
  const avgAccuracy = predictions.length > 0
    ? Math.round(predictions.reduce((acc: number, p: { accuracy_score: number | null }) => acc + (p.accuracy_score || 0), 0) / predictions.filter((p: { accuracy_score: number | null }) => p.accuracy_score !== null).length) || 0
    : 0

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Role-based Dashboard */}
      <RoleDashboard
        role={userRole}
        cases={cases}
        predictions={predictions}
        totalDocs={totalDocs}
        totalCases={totalCases}
        blindTests={blindTests}
        avgAccuracy={avgAccuracy}
      />

      {/* Keyboard Shortcuts - shown for all roles */}
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
