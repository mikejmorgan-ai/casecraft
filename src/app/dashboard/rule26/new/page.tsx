/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function NewRule26Page() {
  return (
    <div className="space-y-6" id="new-rule26-page">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900" id="new-rule26-title">New Rule 26 Disclosure</h1>
        <p className="text-gray-600 mt-1">Create a FRCP Rule 26 disclosure document</p>
      </div>

      <div className="bg-white rounded-lg shadow border" id="rule26-form">
        <div className="p-6">
          <div className="space-y-6">
            {/* Case Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="case-selection">
                <label htmlFor="case" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Case *
                </label>
                <select
                  id="case"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a case...</option>
                  <option value="johnson-v-megacorp">Johnson v. MegaCorp</option>
                  <option value="smith-construction">Smith v. Construction Co.</option>
                  <option value="techcorp-merger">TechCorp Merger Analysis</option>
                  <option value="innovate-bigtech">InnovateTech v. BigTech</option>
                </select>
              </div>

              <div id="disclosure-type">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Disclosure Type *
                </label>
                <select
                  id="type"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select type...</option>
                  <option value="initial">Initial Disclosures (Rule 26(a)(1))</option>
                  <option value="expert">Expert Disclosures (Rule 26(a)(2))</option>
                  <option value="pretrial">Pretrial Disclosures (Rule 26(a)(3))</option>
                </select>
              </div>
            </div>

            {/* Deadlines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="due-date">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div id="serve-date">
                <label htmlFor="serveDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Planned Service Date
                </label>
                <input
                  type="date"
                  id="serveDate"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Initial Disclosures Section */}
            <div id="initial-disclosures" className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Initial Disclosure Content</h3>

              {/* Individuals with Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Individuals with Discoverable Information
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Subject of Information"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    + Add Another Individual
                  </button>
                </div>
              </div>

              {/* Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documents and Tangible Things
                </label>
                <textarea
                  rows={4}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe categories and locations of documents, including electronically stored information, that the disclosing party has in its possession, custody, or control..."
                ></textarea>
              </div>

              {/* Computation of Damages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Computation of Damages
                </label>
                <textarea
                  rows={4}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide computation of each category of damages claimed and make available for inspection the documents or evidentiary material on which such computation is based..."
                ></textarea>
              </div>

              {/* Insurance Agreements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Agreements
                </label>
                <textarea
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List any insurance agreement under which an insurance business may be liable to satisfy all or part of a possible judgment..."
                ></textarea>
              </div>
            </div>

            {/* Document Upload */}
            <div id="supporting-docs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <div className="mx-auto max-w-xs">
                  <div className="text-4xl text-gray-400 mb-2">📎</div>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload documents referenced in your disclosure
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                  >
                    Choose Files
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div id="additional-options" className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Additional Options</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Auto-populate from case documents</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Send calendar reminder 7 days before due date</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Generate service certificate</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <a
                href="/dashboard/rule26"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </a>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                id="save-draft"
              >
                💾 Save Draft
              </button>
              <button
                type="button"
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                id="create-disclosure"
              >
                📄 Create Disclosure
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rule 26 Requirements */}
      <div className="bg-blue-50 rounded-lg p-6" id="rule26-requirements">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Rule 26(a)(1) Initial Disclosure Requirements</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Required Information</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Name, address, and telephone number of individuals with discoverable information</li>
              <li>• Subject matter of their information</li>
              <li>• Categories and locations of documents and ESI</li>
              <li>• Computation of damages with supporting materials</li>
              <li>• Insurance agreements that may cover judgment</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Important Deadlines</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Due within 14 days of Rule 26(f) conference</li>
              <li>• Must supplement if information changes</li>
              <li>• Failure to disclose may preclude evidence at trial</li>
              <li>• Court may impose sanctions for non-compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}