/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { Upload } from 'lucide-react'

export default function DocumentsPage() {
  return (
    <div className="space-y-6" id="documents-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" id="documents-title">Documents</h1>
          <p className="text-gray-600 mt-1">Upload and manage your legal documents</p>
        </div>
      </div>

      {/* Document Library */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md" id="documents-list">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center" id="documents-empty-state">
            <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              📄
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600 mb-6">
              Upload legal documents to analyze with AI and use in mock trials.
            </p>
            <a
              href="/dashboard/documents/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              id="documents-upload-button"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}