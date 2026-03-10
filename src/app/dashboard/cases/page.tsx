/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function CasesPage() {
  return (
    <div className="space-y-6" id="cases-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" id="cases-title">Cases</h1>
          <p className="text-gray-600 mt-1">Manage all your legal cases</p>
        </div>
        <Link
          href="/dashboard/cases/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          id="cases-new-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Link>
      </div>

      {/* Cases List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md" id="cases-list">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center" id="cases-empty-state">
            <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              📁
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first case to organize documents and run mock trials.
            </p>
            <Link
              href="/dashboard/cases/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              id="cases-empty-cta"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Case
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}