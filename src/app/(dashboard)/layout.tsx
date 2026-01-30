import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Scale, LayoutDashboard, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help'
import { GlobalKeyboardShortcuts } from '@/components/global-keyboard-shortcuts'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div id="dashboard-layout-container" className="min-h-screen bg-[var(--color-legal-cream)]">
      {/* Navigation */}
      <nav id="dashboard-nav" className="bg-primary text-primary-foreground border-b border-[var(--color-legal-navy-light)]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Scale className="h-6 w-6" />
            <span className="font-serif font-bold text-lg">CaseCraft</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-secondary">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            <form action="/api/auth/signout" method="post">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:text-secondary"
                formAction={async () => {
                  'use server'
                  const supabase = await createServerSupabase()
                  await supabase.auth.signOut()
                  redirect('/login')
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="dashboard-main">{children}</main>

      {/* Keyboard Shortcuts */}
      <KeyboardShortcutsHelp />
      <GlobalKeyboardShortcuts />
    </div>
  )
}
