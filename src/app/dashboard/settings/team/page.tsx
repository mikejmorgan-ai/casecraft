/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function TeamPage() {
  return (
    <div className="space-y-6" id="team-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" id="team-title">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their permissions</p>
        </div>
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          id="invite-member-button"
        >
          <span className="mr-2">+</span>
          Invite Member
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" id="team-stats">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">8</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              👥
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Attorneys</p>
              <p className="text-3xl font-bold text-gray-900">5</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              ⚖️
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Paralegals</p>
              <p className="text-3xl font-bold text-gray-900">2</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              📋
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Today</p>
              <p className="text-3xl font-bold text-gray-900">6</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              🟢
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-lg shadow border" id="team-members">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cases
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr id="member-john-smith">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      JS
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">John Smith</div>
                      <div className="text-sm text-gray-500">john@smithlaw.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Admin
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  2 minutes ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  23
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                </td>
              </tr>

              <tr id="member-sarah-johnson">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      SJ
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
                      <div className="text-sm text-gray-500">sarah@smithlaw.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Attorney
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  15 minutes ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  18
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                </td>
              </tr>

              <tr id="member-michael-brown">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                      MB
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Michael Brown</div>
                      <div className="text-sm text-gray-500">michael@smithlaw.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Attorney
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Away
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  2 hours ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  15
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                </td>
              </tr>

              <tr id="member-lisa-davis">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                      LD
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Lisa Davis</div>
                      <div className="text-sm text-gray-500">lisa@smithlaw.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Paralegal
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  5 minutes ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  12
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                </td>
              </tr>

              <tr id="member-robert-wilson">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                      RW
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Robert Wilson</div>
                      <div className="text-sm text-gray-500">robert@smithlaw.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Attorney
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  1 hour ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  20
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="bg-white rounded-lg shadow border" id="pending-invitations">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">jennifer@newattorney.com</p>
                <p className="text-sm text-gray-600">Invited as Attorney • 2 days ago</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-700 text-sm">Resend</button>
                <button className="text-red-600 hover:text-red-700 text-sm">Cancel</button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">mark@paralegal.com</p>
                <p className="text-sm text-gray-600">Invited as Paralegal • 1 week ago</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-700 text-sm">Resend</button>
                <button className="text-red-600 hover:text-red-700 text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Permissions */}
      <div className="bg-white rounded-lg shadow border" id="role-permissions">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Role Permissions</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-900">Permission</th>
                  <th className="text-center py-2 font-medium text-gray-900">Admin</th>
                  <th className="text-center py-2 font-medium text-gray-900">Attorney</th>
                  <th className="text-center py-2 font-medium text-gray-900">Paralegal</th>
                  <th className="text-center py-2 font-medium text-gray-900">Viewer</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-900">Create/Edit Cases</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-900">Run Mock Trials</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                  <td className="text-center py-2">❌</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-900">Upload Documents</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-900">View Analytics</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">🔸</td>
                  <td className="text-center py-2">❌</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-900">Manage Team</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                  <td className="text-center py-2">❌</td>
                  <td className="text-center py-2">❌</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Billing & Settings</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                  <td className="text-center py-2">❌</td>
                  <td className="text-center py-2">❌</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-gray-500 mt-4">
              🔸 = Limited access (own cases only)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}