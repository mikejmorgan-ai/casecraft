import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { type UserRole } from '@/lib/auth/rbac'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav user={user} userRole={userRole} />
      <main className="flex-1 min-h-screen lg:pl-0">
        {children}
      </main>
    </div>
  )
}
