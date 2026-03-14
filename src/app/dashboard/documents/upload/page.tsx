/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function DocumentUploadPage() {
  return (
    <div className="space-y-6" id="document-upload-page">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900" id="upload-title">Upload Documents</h1>
        <p className="text-gray-600 mt-1">Add legal documents to your case library</p>
      </div>

      <div className="bg-white rounded-lg shadow border" id="upload-form">
        <div className="p-6">
          <div className="space-y-6">
            {/* Document Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="document-type-field">
                <label htmlFor="docType" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  id="docType"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select document type...</option>
                  <option value="pleading">Pleading</option>
                  <option value="motion">Motion</option>
                  <option value="discovery">Discovery</option>
                  <option value="deposition">Deposition Transcript</option>
                  <option value="exhibit">Exhibit</option>
                  <option value="contract">Contract</option>
                  <option value="correspondence">Correspondence</option>
                  <option value="ruling">Court Ruling</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div id="case-association-field">
                <label htmlFor="caseId" className="block text-sm font-medium text-gray-700 mb-2">
                  Associate with Case
                </label>
                <select
                  id="caseId"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No case association</option>
                  <option value="johnson-v-megacorp">Johnson v. MegaCorp</option>
                  <option value="smith-construction">Smith v. Construction Co.</option>
                  <option value="techcorp-merger">TechCorp Merger Analysis</option>
                  <option value="innovate-bigtech">InnovateTech v. BigTech</option>
                </select>
              </div>
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="document-name-field">
                <label htmlFor="docName" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  id="docName"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Initial Complaint, Motion for Summary Judgment"
                />
              </div>

              <div id="document-date-field">
                <label htmlFor="docDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Date
                </label>
                <input
                  type="date"
                  id="docDate"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* File Upload Area */}
            <div id="file-upload-area">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <div className="mx-auto max-w-md">
                  <div className="text-6xl text-gray-400 mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Support for PDF, DOC, DOCX, TXT files up to 50MB each
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    id="select-files-btn"
                  >
                    Select Files
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Files are encrypted and securely stored. Maximum 10 files per upload.
              </p>
            </div>

            {/* Document Description */}
            <div id="description-field">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description / Notes
              </label>
              <textarea
                id="description"
                rows={4}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional notes about this document, key findings, relevance to case..."
              ></textarea>
            </div>

            {/* Processing Options */}
            <div id="processing-options" className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">AI Processing Options</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-blue-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-blue-700">Extract key legal concepts and entities</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-blue-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-blue-700">Identify relevant statutes and case law</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-blue-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-blue-700">Generate summary for quick review</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-blue-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-blue-700">Search for contradictions with existing documents</span>
                </label>
              </div>
            </div>

            {/* Privacy & Security */}
            <div id="security-options" className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-3">🔒 Privacy & Security</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500" defaultChecked />
                  <span className="ml-2 text-sm text-yellow-700">Encrypt document at rest</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500" />
                  <span className="ml-2 text-sm text-yellow-700">Mark as attorney-client privileged</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500" />
                  <span className="ml-2 text-sm text-yellow-700">Restrict access to case team only</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <a
                href="/dashboard/documents"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </a>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                id="save-draft-btn"
              >
                💾 Save as Draft
              </button>
              <button
                type="button"
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                id="upload-process-btn"
              >
                📤 Upload & Process
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-gray-50 rounded-lg p-6" id="upload-guidelines">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Guidelines</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Supported Formats</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PDF documents (preferred)</li>
              <li>• Microsoft Word (.doc, .docx)</li>
              <li>• Plain text files (.txt)</li>
              <li>• Image files with OCR processing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use descriptive file names</li>
              <li>• Associate with relevant cases</li>
              <li>• Mark privileged documents appropriately</li>
              <li>• Include document dates when known</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}