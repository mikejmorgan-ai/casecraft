import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { RoleDashboard } from '@/components/dashboard/role-dashboards'
import { type UserRole } from '@/lib/auth/rbac'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch user profile to get role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Default to attorney if no profile exists yet
  const userRole: UserRole = (profile?.role as UserRole) || 'attorney'

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
