/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function NewMockTrialPage() {
  return (
    <div className="space-y-6" id="new-mock-trial-page">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900" id="new-mock-trial-title">Create Mock Trial</h1>
        <p className="text-gray-600 mt-1">Test your case with an AI judge before going to court</p>
      </div>

      <div className="bg-white rounded-lg shadow border" id="mock-trial-form">
        <div className="p-6">
          <div className="space-y-6">
            {/* Case Selection */}
            <div id="case-selection">
              <label htmlFor="case" className="block text-sm font-medium text-gray-700 mb-2">
                Select Case *
              </label>
              <select
                id="case"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a case...</option>
                <option value="johnson-v-megacorp">Johnson v. MegaCorp (Employment)</option>
                <option value="smith-construction">Smith v. Construction Co. (Personal Injury)</option>
                <option value="techcorp-merger">TechCorp Merger Analysis (Corporate)</option>
                <option value="innovate-bigtech">InnovateTech v. BigTech (Patent)</option>
              </select>
            </div>

            {/* Trial Type */}
            <div id="trial-type-selection">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trial Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="trialType" value="trial" className="text-blue-600 focus:ring-blue-500" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Full Trial</div>
                    <div className="text-xs text-gray-500">Complete trial simulation</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="trialType" value="hearing" className="text-blue-600 focus:ring-blue-500" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Hearing</div>
                    <div className="text-xs text-gray-500">Motion or preliminary hearing</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="trialType" value="mediation" className="text-blue-600 focus:ring-blue-500" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Mediation</div>
                    <div className="text-xs text-gray-500">Settlement discussion</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="trialType" value="deposition" className="text-blue-600 focus:ring-blue-500" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Deposition</div>
                    <div className="text-xs text-gray-500">Witness examination</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Jurisdiction */}
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
                  <option value="florida">Florida</option>
                </select>
              </div>

              <div id="ai-model-field">
                <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700 mb-2">
                  AI Judge Model *
                </label>
                <select
                  id="aiModel"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gpt-4o">GPT-4o (Recommended)</option>
                  <option value="claude-opus">Claude 3 Opus</option>
                  <option value="hybrid">Hybrid Model</option>
                </select>
              </div>
            </div>

            {/* Custom Instructions */}
            <div id="custom-instructions">
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                Custom Instructions for AI Judge
              </label>
              <textarea
                id="instructions"
                rows={4}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional: Provide specific instructions for the AI judge (e.g., focus on specific legal standards, consider particular precedents, etc.)"
              ></textarea>
            </div>

            {/* Applicable Statutes */}
            <div id="applicable-statutes">
              <label htmlFor="statutes" className="block text-sm font-medium text-gray-700 mb-2">
                Applicable Statutes (Auto-detected)
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-blue-900">Title VII of the Civil Rights Act</div>
                    <div className="text-xs text-blue-700">42 U.S.C. § 2000e et seq.</div>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Auto-detected</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-blue-900">California Fair Employment and Housing Act</div>
                    <div className="text-xs text-blue-700">Cal. Gov. Code § 12900 et seq.</div>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Auto-detected</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <a
                href="/dashboard/mock-trials"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </a>
              <button
                type="button"
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                id="start-mock-trial"
              >
                🚀 Start Mock Trial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 rounded-lg p-6" id="how-it-works">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Mock Trials Work</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">1</div>
            <h4 className="font-medium text-gray-900 mb-2">Case Analysis</h4>
            <p className="text-sm text-gray-600">AI analyzes your case documents and identifies applicable law</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">2</div>
            <h4 className="font-medium text-gray-900 mb-2">Present Arguments</h4>
            <p className="text-sm text-gray-600">Present your case to the AI judge in real-time</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">3</div>
            <h4 className="font-medium text-gray-900 mb-2">Judge Questions</h4>
            <p className="text-sm text-gray-600">AI judge asks clarifying questions based on statutes</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">4</div>
            <h4 className="font-medium text-gray-900 mb-2">Ruling & Analysis</h4>
            <p className="text-sm text-gray-600">Get detailed ruling with statute citations and reasoning</p>
          </div>
        </div>
      </div>
    </div>
  )
}