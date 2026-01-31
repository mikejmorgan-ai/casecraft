import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Scale, LayoutDashboard, LogOut, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help'
import { GlobalKeyboardShortcuts } from '@/components/global-keyboard-shortcuts'
import { CommandPalette } from '@/components/command-palette'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch cases for command palette
  const { data: cases } = await supabase
    .from('cases')
    .select('id, name, case_number, status')
    .order('updated_at', { ascending: false })
    .limit(10)

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
            {/* Search Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:text-secondary hidden sm:flex"
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
                    document.dispatchEvent(event)
                  }}
                >
                  <Command className="h-4 w-4 mr-2" />
                  <span className="text-xs text-gray-400">⌘K</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick Search (⌘K)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-secondary">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to Dashboard</p>
              </TooltipContent>
            </Tooltip>

            <form action="/api/auth/signout" method="post">
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign out of your account</p>
                </TooltipContent>
              </Tooltip>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="dashboard-main">{children}</main>

      {/* Command Palette */}
      <CommandPalette cases={cases || []} />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcutsHelp />
      <GlobalKeyboardShortcuts />
    </div>
  )
}
