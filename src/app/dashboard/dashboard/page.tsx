/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function DashboardPage() {
  return (
    <div className="space-y-6" id="dashboard-overview">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900" id="dashboard-title">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your legal practice command center</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-stats">
        <div className="bg-white p-6 rounded-lg shadow" id="dashboard-stats-cases">
          <h3 className="text-sm font-medium text-gray-500">Active Cases</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600 mt-1">+0 this week</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow" id="dashboard-stats-trials">
          <h3 className="text-sm font-medium text-gray-500">Mock Trials</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600 mt-1">+0 this week</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow" id="dashboard-stats-documents">
          <h3 className="text-sm font-medium text-gray-500">Documents</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600 mt-1">+0 this week</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow" id="dashboard-stats-accuracy">
          <h3 className="text-sm font-medium text-gray-500">AI Accuracy</h3>
          <p className="text-3xl font-bold text-gray-900">--%</p>
          <p className="text-sm text-gray-600 mt-1">From blind tests</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow" id="dashboard-quick-actions">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/cases/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50"
              id="dashboard-action-new-case"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  📁
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">New Case</h3>
                <p className="text-sm text-gray-500">Create a new case</p>
              </div>
            </a>

            <a
              href="/dashboard/mock-trials/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50"
              id="dashboard-action-mock-trial"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  ⚖️
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Mock Trial</h3>
                <p className="text-sm text-gray-500">Test your case with AI</p>
              </div>
            </a>

            <a
              href="/dashboard/documents"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50"
              id="dashboard-action-upload-docs"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  📄
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Upload Documents</h3>
                <p className="text-sm text-gray-500">Add case materials</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}