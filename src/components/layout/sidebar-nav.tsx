'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type UserRole, ROLE_INFO, hasPermission, type Permission } from '@/lib/auth/rbac'
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
  Users,
  MessageSquare,
  Gavel,
} from 'lucide-react'

interface SidebarNavProps {
  user?: { email?: string }
  userRole?: UserRole
}

// Navigation items with required permissions
const navItems: { href: string; label: string; icon: React.ElementType; permission?: Permission }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/cases', label: 'Cases', icon: Briefcase, permission: 'cases:read' },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText, permission: 'documents:read' },
  { href: '/dashboard/analysis', label: 'Analysis', icon: BarChart3, permission: 'predictions:read' },
  { href: '/dashboard/simulations', label: 'Simulations', icon: Play, permission: 'hearings:run' },
  { href: '/dashboard/predictions', label: 'Predictions', icon: Target, permission: 'predictions:run' },
  { href: '/dashboard/weaknesses', label: 'Weaknesses', icon: AlertTriangle, permission: 'cases:read' },
]

const secondaryItems: { href: string; label: string; icon: React.ElementType; permission?: Permission }[] = [
  { href: '/import-test', label: 'Import Test Case', icon: Upload, permission: 'cases:create' },
  { href: '/dashboard/timeline', label: 'Timeline', icon: History, permission: 'cases:read' },
  { href: '/dashboard/discovery', label: 'Discovery', icon: Search, permission: 'documents:read' },
  { href: '/dashboard/rule26', label: 'Rule 26', icon: Gavel, permission: 'cases:read' },
]

const adminItems: { href: string; label: string; icon: React.ElementType; permission?: Permission }[] = [
  { href: '/admin/users', label: 'User Management', icon: Users, permission: 'admin:users' },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, permission: 'admin:analytics' },
  { href: '/admin/settings', label: 'System Settings', icon: Settings, permission: 'admin:settings' },
]

const clientItems: { href: string; label: string; icon: React.ElementType }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/cases', label: 'My Cases', icon: Briefcase },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
]

export function SidebarNav({ user, userRole = 'attorney' }: SidebarNavProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDark, setIsDark] = useState(true) // Default to dark

  // Initialize theme from localStorage on mount
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check for saved preference or default to dark
    const saved = localStorage.getItem('theme')
    const prefersDark = saved === 'dark' || (!saved && true) // Default dark
    if (prefersDark !== isDark) {
      setIsDark(prefersDark)
    }
    document.documentElement.classList.toggle('dark', prefersDark)
    setMounted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  // Filter nav items based on user permissions
  const filteredNavItems = userRole === 'client'
    ? clientItems
    : navItems.filter(item => !item.permission || hasPermission(userRole, item.permission))

  const filteredSecondaryItems = userRole === 'client'
    ? []
    : secondaryItems.filter(item => !item.permission || hasPermission(userRole, item.permission))

  const filteredAdminItems = adminItems.filter(item =>
    !item.permission || hasPermission(userRole, item.permission)
  )

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
              <h1 className="font-bold text-lg">CaseBrake.ai</h1>
              <p className="text-xs text-sidebar-foreground/60">Legal Intelligence</p>
            </div>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Role Badge */}
          {!collapsed && (
            <div className="px-3 py-2 mb-3">
              <Badge variant="outline" className="text-xs w-full justify-center py-1">
                {ROLE_INFO[userRole].label}
              </Badge>
            </div>
          )}

          <div className={cn('text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2', collapsed && 'sr-only')}>
            Main
          </div>
          {filteredNavItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}

          {filteredSecondaryItems.length > 0 && (
            <>
              <div className={cn('text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mt-6 mb-2', collapsed && 'sr-only')}>
                Tools
              </div>
              {filteredSecondaryItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </>
          )}

          {filteredAdminItems.length > 0 && (
            <>
              <div className={cn('text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mt-6 mb-2', collapsed && 'sr-only')}>
                Admin
              </div>
              {filteredAdminItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </>
          )}
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

          <SignOutButton>
            <Button
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
          </SignOutButton>
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
