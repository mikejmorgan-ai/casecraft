/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

'use client'

import { UserButton } from '@clerk/nextjs'
import { Bell } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200" id="dashboard-header">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center" id="header-left">
          <h2 className="text-lg font-semibold text-gray-900">CaseBreak.AI Dashboard</h2>
        </div>

        <div className="flex items-center space-x-4" id="header-right">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-500"
            id="header-notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "shadow-lg",
                userButtonPopoverActionButton: "hover:bg-gray-50"
              }
            }}
            showName={false}
          />
        </div>
      </div>
    </header>
  )
}