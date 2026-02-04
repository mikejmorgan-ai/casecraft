'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  FileText,
  BarChart3,
  Play,
  Target,
  AlertTriangle,
  Scale,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Home,
  Upload,
  History,
  Gavel,
} from 'lucide-react'

interface SidebarNavProps {
  user?: { email?: string }
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/cases', label: 'Cases', icon: Briefcase },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/analysis', label: 'Analysis', icon: BarChart3 },
  { href: '/dashboard/simulations', label: 'Simulations', icon: Play },
  { href: '/dashboard/predictions', label: 'Predictions', icon: Target },
  { href: '/dashboard/weaknesses', label: 'Weaknesses', icon: AlertTriangle },
]

const secondaryItems = [
  { href: '/import-test', label: 'Import Test Case', icon: Upload },
  { href: '/dashboard/timeline', label: 'Timeline', icon: History },
  { href: '/dashboard/discovery', label: 'Discovery', icon: Search },
]

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDark, setIsDark] = useState(true) // Default to dark

  useEffect(() => {
    // Check for saved preference or default to dark
    const saved = localStorage.getItem('theme')
    const prefersDark = saved === 'dark' || (!saved && true) // Default dark
    setIsDark(prefersDark)
    document.documentElement.classList.toggle('dark', prefersDark)
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-sidebar-accent',
          isActive && 'bg-sidebar-accent text-sidebar-primary font-medium',
          !isActive && 'text-sidebar-foreground/80',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? label : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen bg-sidebar text-sidebar-foreground',
          'flex flex-col transition-all duration-300 ease-in-out',
          'border-r border-sidebar-border',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border',
          collapsed ? 'justify-center' : 'gap-3'
        )}>
          <Scale className="h-8 w-8 text-sidebar-primary shrink-0" />
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">CaseCraft</h1>
              <p className="text-xs text-sidebar-foreground/60">Legal Intelligence</p>
            </div>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className={cn('text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2', collapsed && 'sr-only')}>
            Main
          </div>
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}

          <div className={cn('text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mt-6 mb-2', collapsed && 'sr-only')}>
            Tools
          </div>
          {secondaryItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className={cn(
              'w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent',
              collapsed && 'justify-center'
            )}
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {!collapsed && <span className="ml-3">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </Button>

          {/* Settings */}
          <Link href="/dashboard/settings">
            <Button
              variant="ghost"
              size={collapsed ? 'icon' : 'default'}
              className={cn(
                'w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent',
                collapsed && 'justify-center'
              )}
            >
              <Settings className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Settings</span>}
            </Button>
          </Link>

          {/* User & Logout */}
          {user && !collapsed && (
            <div className="px-3 py-2 text-xs text-sidebar-foreground/60 truncate">
              {user.email}
            </div>
          )}

          <form action="/auth/signout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              size={collapsed ? 'icon' : 'default'}
              className={cn(
                'w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent',
                collapsed && 'justify-center'
              )}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Sign Out</span>}
            </Button>
          </form>
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border hidden lg:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </aside>

      {/* Spacer for main content */}
      <div className={cn(
        'transition-all duration-300 ease-in-out hidden lg:block',
        collapsed ? 'w-16' : 'w-64'
      )} />
    </>
  )
}
