import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarNav } from '@/components/layout/sidebar-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  
  // In development, allow access without auth
  // For production, require proper authentication
  if (!user) redirect('/login')
  
  const displayUser = user

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav user={displayUser} />
      <main className="flex-1 min-h-screen lg:pl-0">
        {children}
      </main>
    </div>
  )
}
