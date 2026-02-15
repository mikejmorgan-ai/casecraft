import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CaseWizard } from '@/components/cases/case-wizard'
import { getUserProfile } from '@/lib/auth/check-permission'
import { hasPermission } from '@/lib/auth/rbac'

export default async function NewCasePage() {
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  let userRole = 'attorney'

  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user && !hasBetaBypass) redirect('/login')

    // Check permissions (default to attorney for beta bypass)
    const profile = user ? await getUserProfile() : null
    userRole = profile?.role || 'attorney'
  } catch {
    // Supabase unreachable — allow beta bypass users through
    if (!hasBetaBypass) redirect('/login')
  }

  if (!hasPermission(userRole, 'cases:create')) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard/cases" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Link>

          <CaseWizard />
        </div>
      </div>
    </div>
  )
}
