/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

// import { auth } from '@clerk/nextjs'
// import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Re-enable auth check after Clerk setup
  // const { userId } = auth()
  // if (!userId) {
  //   redirect('/sign-in')
  // }

  return (
    <div className="flex h-screen bg-gray-100" id="dashboard-layout">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6" id="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  )
}