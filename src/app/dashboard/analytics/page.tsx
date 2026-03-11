/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function AnalyticsPage() {
  return (
    <div className="space-y-6" id="analytics-page">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900" id="analytics-title">Analytics</h1>
        <p className="text-gray-600 mt-1">Insights into your firm's performance and AI accuracy</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="analytics-metrics">
        <div className="bg-white p-6 rounded-lg shadow border" id="metric-win-rate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Win Rate</p>
              <p className="text-3xl font-bold text-gray-900">87%</p>
              <p className="text-sm text-green-600">+12% this month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              🏆
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border" id="metric-ai-accuracy">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">AI Accuracy</p>
              <p className="text-3xl font-bold text-gray-900">94%</p>
              <p className="text-sm text-blue-600">Based on 150 cases</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              🎯
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border" id="metric-time-saved">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Time Saved</p>
              <p className="text-3xl font-bold text-gray-900">124hrs</p>
              <p className="text-sm text-purple-600">This month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              ⏱️
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border" id="metric-revenue-impact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue Impact</p>
              <p className="text-3xl font-bold text-gray-900">$89K</p>
              <p className="text-sm text-green-600">+23% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="analytics-charts">
        <div className="bg-white p-6 rounded-lg shadow border" id="case-outcomes-chart">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Outcomes Over Time</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📈</div>
              <p>Interactive chart would appear here</p>
              <p className="text-sm">Showing wins, losses, and settlements</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border" id="ai-confidence-chart">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Confidence Distribution</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>Confidence score distribution</p>
              <p className="text-sm">90%+ predictions at high confidence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Case Type Performance */}
      <div className="bg-white rounded-lg shadow border" id="case-type-performance">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance by Case Type</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Civil Litigation</h4>
                <p className="text-sm text-gray-600">45 cases • $2.3M recovered</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">92% Win Rate</p>
                <p className="text-sm text-gray-500">95% AI Accuracy</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Employment Law</h4>
                <p className="text-sm text-gray-600">28 cases • $1.7M settlements</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">89% Win Rate</p>
                <p className="text-sm text-gray-500">93% AI Accuracy</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Corporate Law</h4>
                <p className="text-sm text-gray-600">18 cases • $5.2M value</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">94% Win Rate</p>
                <p className="text-sm text-gray-500">97% AI Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Insights */}
      <div className="bg-white rounded-lg shadow border" id="recent-insights">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent AI Insights</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                AI
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Contract Clause Optimization</h4>
                <p className="text-sm text-gray-600">
                  AI identified 3 contract clauses that could be strengthened in future agreements,
                  potentially saving $50K+ in disputes.
                </p>
                <p className="text-xs text-gray-500 mt-2">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Settlement Prediction Accuracy</h4>
                <p className="text-sm text-gray-600">
                  Johnson v. MegaCorp settled for $485K - within 2% of AI's $475K prediction.
                  Confidence score was 96%.
                </p>
                <p className="text-xs text-gray-500 mt-2">1 day ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-sm">
                ⚠
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Jurisdiction Risk Alert</h4>
                <p className="text-sm text-gray-600">
                  New precedent in 9th Circuit may affect 3 ongoing cases. Review recommended
                  for strategy adjustment.
                </p>
                <p className="text-xs text-gray-500 mt-2">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}