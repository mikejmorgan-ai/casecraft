/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Gavel,
  TestTube,
  Upload,
  BookOpen,
  BarChart3,
  Settings,
  Users
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cases', href: '/dashboard/cases', icon: FileText },
  { name: 'Mock Trials', href: '/dashboard/mock-trials', icon: Gavel },
  { name: 'Blind Tests', href: '/dashboard/blind-tests', icon: TestTube },
  { name: 'Documents', href: '/dashboard/documents', icon: Upload },
  { name: 'Rule 26', href: '/dashboard/rule26', icon: BookOpen },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
]

const settingsNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Team', href: '/dashboard/settings/team', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900" id="dashboard-sidebar">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4" id="sidebar-logo">
          <h1 className="text-xl font-bold text-white">CaseBreak.AI</h1>
        </div>

        <nav className="mt-5 flex-1 space-y-1 px-2" id="sidebar-nav">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
                id={`sidebar-nav-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon
                  className="mr-3 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <nav className="space-y-1 px-2" id="sidebar-settings-nav">
            {settingsNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                  id={`sidebar-settings-${item.name.toLowerCase()}`}
                >
                  <item.icon
                    className="mr-3 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}