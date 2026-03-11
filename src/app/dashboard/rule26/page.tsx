/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function Rule26Page() {
  return (
    <div className="space-y-6" id="rule26-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" id="rule26-title">Rule 26 Disclosures</h1>
          <p className="text-gray-600 mt-1">Manage FRCP Rule 26 disclosure requirements</p>
        </div>
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          id="create-disclosure-button"
        >
          <span className="mr-2">+</span>
          New Disclosure
        </button>
      </div>

      {/* Disclosure Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" id="disclosure-stats">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Due This Week</p>
              <p className="text-3xl font-bold text-red-600">3</p>
              <p className="text-sm text-gray-600">Disclosures pending</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              ⏰
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">7</p>
              <p className="text-sm text-gray-600">Being drafted</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              📝
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-green-600">24</p>
              <p className="text-sm text-gray-600">This year</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Time</p>
              <p className="text-3xl font-bold text-blue-600">4.2</p>
              <p className="text-sm text-gray-600">Days to complete</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              📊
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-lg shadow border" id="upcoming-deadlines">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-medium">
                  ⚠️
                </div>
                <div>
                  <h4 className="font-medium text-red-900">Johnson v. MegaCorp - Initial Disclosures</h4>
                  <p className="text-sm text-red-700">Due: March 12, 2026 (2 days)</p>
                  <p className="text-sm text-red-600">Status: Draft</p>
                </div>
              </div>
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                Complete Now
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-medium">
                  📋
                </div>
                <div>
                  <h4 className="font-medium text-yellow-900">Smith Construction - Expert Disclosures</h4>
                  <p className="text-sm text-yellow-700">Due: March 15, 2026 (5 days)</p>
                  <p className="text-sm text-yellow-600">Status: In Review</p>
                </div>
              </div>
              <button className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700">
                Review
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-medium">
                  📄
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Corporate Merger - Pretrial Disclosures</h4>
                  <p className="text-sm text-blue-700">Due: March 20, 2026 (10 days)</p>
                  <p className="text-sm text-blue-600">Status: Not Started</p>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Start
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Disclosures */}
      <div className="bg-white rounded-lg shadow border" id="recent-disclosures">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Disclosures</h3>
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
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Served
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attorney
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr id="disclosure-patent-case">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">InnovateTech v. BigTech</div>
                    <div className="text-sm text-gray-500">Patent infringement</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Initial Disclosures
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Served
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Mar 1, 2026
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Feb 28, 2026
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Sarah Johnson
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">View</button>
                </td>
              </tr>

              <tr id="disclosure-employment-case">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Davis v. TechCorp</div>
                    <div className="text-sm text-gray-500">Employment law</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Expert Disclosures
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    In Progress
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Mar 18, 2026
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Michael Brown
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                </td>
              </tr>

              <tr id="disclosure-contract-case">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Wilson Enterprises v. StartupCo</div>
                    <div className="text-sm text-gray-500">Contract dispute</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Pretrial Disclosures
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Served
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Feb 25, 2026
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Feb 24, 2026
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Robert Wilson
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule 26 Types Info */}
      <div className="bg-gray-50 rounded-lg p-6" id="rule26-info">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rule 26 Disclosure Types</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Initial Disclosures (a)(1)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Individuals with discoverable information</li>
              <li>• Documents and tangible things</li>
              <li>• Computation of damages</li>
              <li>• Insurance agreements</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">Due: Within 14 days of Rule 26(f) conference</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Expert Disclosures (a)(2)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Expert identity and qualifications</li>
              <li>• Written expert reports</li>
              <li>• Opinions, basis, and data</li>
              <li>• Compensation information</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">Due: 90 days before trial (or as ordered)</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Pretrial Disclosures (a)(3)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Witness list with contact info</li>
              <li>• Deposition designations</li>
              <li>• Exhibit list</li>
              <li>• Objections to exhibits</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">Due: 30 days before trial</p>
          </div>
        </div>
      </div>
    </div>
  )
}