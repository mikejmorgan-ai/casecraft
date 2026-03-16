export const dynamic = 'force-dynamic'
/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b" id="marketing-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-primary-900" id="marketing-logo">
                CaseBreak.AI
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8" id="marketing-nav">
              <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
              <a href="/sign-in" className="text-primary-600 hover:text-primary-700">Sign In</a>
              <a href="/sign-up" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                Start Free Trial
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}