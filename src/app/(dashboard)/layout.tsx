import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { type UserRole } from '@/lib/auth/rbac'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  let user = null
  let userRole: UserRole = 'attorney'

  try {
    const supabase = await createServerSupabase()
    const { data } = await supabase.auth.getUser()
    user = data.user

    if (!user && !hasBetaBypass) redirect('/login')

    // Fetch user profile to get role (skip if beta bypass without user)
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      userRole = (profile?.role as UserRole) || 'attorney'
    }
  } catch (err) {
    // If Supabase is unreachable, allow beta bypass users through with defaults
    if (!hasBetaBypass) redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav user={user ?? undefined} userRole={userRole} />
      <main className="flex-1 min-h-screen lg:pl-0">
        {children}
      </main>
    </div>
  )
}
