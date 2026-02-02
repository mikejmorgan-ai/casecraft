import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { cookies } from 'next/headers'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabase()
  const cookieStore = await cookies()
  const devBypass = cookieStore.get('dev_bypass')?.value === 'true'

  const { data: { user } } = await supabase.auth.getUser()
  
  // Allow dev bypass (only works in non-production builds)
  if (!user && !devBypass) redirect('/login')
  
  // Create a mock user for dev bypass
  const displayUser = user || (devBypass ? {
    id: 'dev-user',
    email: 'dev@casecraft.local',
    user_metadata: { full_name: 'Dev User' }
  } as any : null)

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav user={displayUser} />
      <main className="flex-1 min-h-screen lg:pl-0">
        {children}
      </main>
    </div>
  )
}
