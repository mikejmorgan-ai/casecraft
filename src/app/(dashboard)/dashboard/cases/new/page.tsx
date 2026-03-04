import { getAuthUserId } from '@/lib/auth/clerk'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CaseWizard } from '@/components/cases/case-wizard'
import { getUserProfile } from '@/lib/auth/check-permission'
import { hasPermission, type UserRole } from '@/lib/auth/rbac'

export default async function NewCasePage() {
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  let userRole: UserRole = 'attorney'

  try {
    const userId = await getAuthUserId()
    if (!userId && !hasBetaBypass) redirect('/login')

    // Check permissions (default to attorney for beta bypass)
    const profile = userId ? await getUserProfile() : null
    userRole = profile?.role || 'attorney'
  } catch {
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
