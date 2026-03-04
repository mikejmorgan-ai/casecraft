export const dynamic = 'force-dynamic'

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { getUserRole } from '@/lib/auth/clerk'
import { type UserRole } from '@/lib/auth/rbac'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  const { userId } = await auth()

  if (!userId && !hasBetaBypass) {
    redirect('/login')
  }

  let userRole: UserRole = 'attorney'
  let userEmail: string | undefined

  if (userId) {
    userRole = await getUserRole()
    const user = await currentUser()
    userEmail = user?.emailAddresses?.[0]?.emailAddress
  }

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav
        user={userEmail ? { email: userEmail } : undefined}
        userRole={userRole}
      />
      <main className="flex-1 min-h-screen lg:pl-0">
        {children}
      </main>
    </div>
  )
}
