/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function BlindTestsPage() {
  return (
    <div className="space-y-6" id="blind-tests-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" id="blind-tests-title">Blind Adjudication Tests</h1>
          <p className="text-gray-600 mt-1">Test AI accuracy against real case outcomes</p>
        </div>
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          id="create-blind-test-button"
        >
          <span className="mr-2">+</span>
          Create Blind Test
        </button>
      </div>

      {/* AI Accuracy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" id="blind-test-stats">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Overall Accuracy</p>
              <p className="text-3xl font-bold text-green-600">94.2%</p>
              <p className="text-sm text-gray-600">Based on 127 tests</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              🎯
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">High Confidence</p>
              <p className="text-3xl font-bold text-blue-600">97.1%</p>
              <p className="text-sm text-gray-600">Predictions &gt;90% confidence</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              📊
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tests This Month</p>
              <p className="text-3xl font-bold text-purple-600">23</p>
              <p className="text-sm text-gray-600">+15% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              🧪
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Match Score</p>
              <p className="text-3xl font-bold text-yellow-600">91.7%</p>
              <p className="text-sm text-gray-600">Outcome similarity</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              ⚖️
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow border" id="test-results">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Blind Tests</h3>
            <div className="flex space-x-2">
              <button className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1 rounded">
                Filter
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1 rounded">
                Export
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Prediction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Match Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr id="test-johnson-v-megacorp">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Johnson v. MegaCorp</div>
                    <div className="text-sm text-gray-500">Employment discrimination</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">Plaintiff victory</div>
                    <div className="text-sm text-gray-500">$475K settlement</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">Plaintiff victory</div>
                    <div className="text-sm text-gray-500">$485K settlement</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    98%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    96%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Mar 8, 2026
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">View Details</button>
                </td>
              </tr>

              <tr id="test-smith-construction">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Smith v. Construction Co.</div>
                    <div className="text-sm text-gray-500">Personal injury</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">Defendant victory</div>
                    <div className="text-sm text-gray-500">Summary judgment</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">Plaintiff victory</div>
                    <div className="text-sm text-gray-500">$125K jury verdict</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    15%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    67%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Mar 7, 2026
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">View Details</button>
                </td>
              </tr>

              <tr id="test-corporate-merger">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">TechCorp Merger Analysis</div>
                    <div className="text-sm text-gray-500">Corporate M&A</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">Regulatory approval</div>
                    <div className="text-sm text-gray-500">Minor concessions</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">Regulatory approval</div>
                    <div className="text-sm text-gray-500">Similar concessions</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    94%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    89%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Mar 5, 2026
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">View Details</button>
                </td>
              </tr>

              <tr id="test-patent-dispute">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">InnovateTech v. BigTech</div>
                    <div className="text-sm text-gray-500">Patent infringement</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">Plaintiff victory</div>
                    <div className="text-sm text-gray-500">$2.8M damages</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">Plaintiff victory</div>
                    <div className="text-sm text-gray-500">$3.1M damages</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    91%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    93%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Mar 3, 2026
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">View Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* How Blind Testing Works */}
      <div className="bg-blue-50 rounded-lg p-6" id="blind-testing-info">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">How Blind Adjudication Testing Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white">
              1
            </div>
            <h4 className="font-medium text-blue-900 mb-2">Create Test Case</h4>
            <p className="text-sm text-blue-700">
              Upload materials from a concluded case without revealing the outcome to the AI.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white">
              2
            </div>
            <h4 className="font-medium text-blue-900 mb-2">AI Analysis</h4>
            <p className="text-sm text-blue-700">
              Our AI analyzes the case and predicts the outcome based purely on legal merits.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white">
              3
            </div>
            <h4 className="font-medium text-blue-900 mb-2">Compare Results</h4>
            <p className="text-sm text-blue-700">
              Reveal the actual outcome and compare to the AI prediction for accuracy scoring.
            </p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-white rounded-lg">
          <p className="text-sm text-gray-600">
            <strong className="text-gray-900">Why this matters:</strong> Blind testing provides transparent validation
            of AI accuracy. Unlike "black box" AI systems, you can measure and trust our predictions with real data.
          </p>
        </div>
      </div>
    </div>
  )
}