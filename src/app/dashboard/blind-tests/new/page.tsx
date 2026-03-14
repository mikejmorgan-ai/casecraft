/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function NewBlindTestPage() {
  return (
    <div className="space-y-6" id="new-blind-test-page">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900" id="new-blind-test-title">Create Blind Test</h1>
        <p className="text-gray-600 mt-1">Test AI accuracy against a real concluded case</p>
      </div>

      <div className="bg-white rounded-lg shadow border" id="blind-test-form">
        <div className="p-6">
          <div className="space-y-6">
            {/* Test Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="test-name-field">
                <label htmlFor="testName" className="block text-sm font-medium text-gray-700 mb-2">
                  Test Name *
                </label>
                <input
                  type="text"
                  id="testName"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Johnson v. MegaCorp Blind Test"
                />
              </div>

              <div id="case-type-field">
                <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 mb-2">
                  Case Type *
                </label>
                <select
                  id="caseType"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select case type...</option>
                  <option value="employment">Employment Law</option>
                  <option value="civil">Civil Litigation</option>
                  <option value="corporate">Corporate Law</option>
                  <option value="personal-injury">Personal Injury</option>
                  <option value="patent">Patent/IP</option>
                  <option value="criminal">Criminal Defense</option>
                </select>
              </div>
            </div>

            {/* Case Materials Upload */}
            <div id="case-materials">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Materials *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <div className="mx-auto max-w-xs">
                  <div className="text-4xl text-gray-400 mb-4">📁</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Case Documents</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload all case materials EXCEPT the final outcome/ruling. The AI should not see the result.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Choose Files
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Supported: PDF, DOC, DOCX, TXT. Max 50MB per file. Include pleadings, discovery, depositions, but NOT the final ruling.
              </p>
            </div>

            {/* Jurisdiction & Legal Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="jurisdiction-field">
                <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-2">
                  Jurisdiction *
                </label>
                <select
                  id="jurisdiction"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select jurisdiction...</option>
                  <option value="federal">Federal Courts</option>
                  <option value="california">California</option>
                  <option value="new-york">New York</option>
                  <option value="texas">Texas</option>
                </select>
              </div>

              <div id="court-field">
                <label htmlFor="court" className="block text-sm font-medium text-gray-700 mb-2">
                  Court
                </label>
                <input
                  type="text"
                  id="court"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Superior Court of California"
                />
              </div>
            </div>

            {/* Real Outcome (Hidden) */}
            <div id="real-outcome" className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-yellow-800 mb-2">
                🔒 Actual Case Outcome (Hidden from AI)
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-yellow-700 mb-1">Winning Party *</label>
                  <select className="block w-full border-yellow-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="">Select winner...</option>
                    <option value="plaintiff">Plaintiff Victory</option>
                    <option value="defendant">Defendant Victory</option>
                    <option value="settlement">Settlement</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-yellow-700 mb-1">Outcome Details</label>
                  <textarea
                    rows={3}
                    className="block w-full border-yellow-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="e.g., $485K settlement, Summary judgment for defendant, Jury verdict $2.3M..."
                  ></textarea>
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                ⚠️ This information will be hidden from the AI during analysis and only revealed after prediction for comparison.
              </p>
            </div>

            {/* AI Configuration */}
            <div id="ai-config" className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">AI Analysis Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-blue-700 mb-1">AI Model</label>
                  <select className="block w-full border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>GPT-4o (Recommended)</option>
                    <option>Claude 3 Opus</option>
                    <option>Hybrid Model</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-blue-700 mb-1">Confidence Threshold</label>
                  <select className="block w-full border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>Standard (85%)</option>
                    <option>High (90%)</option>
                    <option>Very High (95%)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <a
                href="/dashboard/blind-tests"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </a>
              <button
                type="button"
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                id="start-blind-test"
              >
                🧪 Start Blind Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Process Overview */}
      <div className="bg-gray-50 rounded-lg p-6" id="process-overview">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blind Testing Process</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">1</div>
            <h4 className="font-medium text-gray-900 mb-2">Upload Materials</h4>
            <p className="text-sm text-gray-600">Provide case documents WITHOUT revealing the actual outcome to the AI</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">2</div>
            <h4 className="font-medium text-gray-900 mb-2">AI Prediction</h4>
            <p className="text-sm text-gray-600">AI analyzes the case and predicts the outcome based purely on legal merits</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">3</div>
            <h4 className="font-medium text-gray-900 mb-2">Compare & Score</h4>
            <p className="text-sm text-gray-600">Reveal actual outcome and get accuracy score with detailed analysis</p>
          </div>
        </div>
      </div>
    </div>
  )
}