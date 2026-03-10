/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { Plus } from 'lucide-react'

export default function MockTrialsPage() {
  return (
    <div className="space-y-6" id="mock-trials-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" id="mock-trials-title">Mock Trials</h1>
          <p className="text-gray-600 mt-1">Test your cases with AI judges</p>
        </div>
      </div>

      {/* Mock Trials List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md" id="mock-trials-list">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center" id="mock-trials-empty-state">
            <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              ⚖️
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mock trials yet</h3>
            <p className="text-gray-600 mb-6">
              Create a case first, then run mock trials to test your legal strategy.
            </p>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              id="mock-trials-create-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Mock Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}