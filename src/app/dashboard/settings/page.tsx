/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export default function SettingsPage() {
  return (
    <div className="space-y-6" id="settings-page">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900" id="settings-title">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your organization and preferences</p>
      </div>

      {/* Organization Settings */}
      <div className="bg-white rounded-lg shadow border" id="org-settings">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Organization Settings</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div id="org-name-field">
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                id="orgName"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                defaultValue="Smith & Associates Law Firm"
              />
            </div>

            <div id="org-type-field">
              <label htmlFor="orgType" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Type
              </label>
              <select
                id="orgType"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Law Firm</option>
                <option>Corporate Legal Department</option>
                <option>Government Agency</option>
                <option>Non-profit Legal Aid</option>
              </select>
            </div>

            <div id="jurisdiction-field">
              <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Jurisdiction
              </label>
              <select
                id="jurisdiction"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option>California</option>
                <option>New York</option>
                <option>Texas</option>
                <option>Federal</option>
                <option>Other...</option>
              </select>
            </div>

            <div id="practice-areas-field">
              <label htmlFor="practiceAreas" className="block text-sm font-medium text-gray-700 mb-2">
                Practice Areas
              </label>
              <select
                id="practiceAreas"
                multiple
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Civil Litigation</option>
                <option>Corporate Law</option>
                <option>Employment Law</option>
                <option>Family Law</option>
                <option>Criminal Defense</option>
                <option>Intellectual Property</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              id="save-org-settings"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Billing Settings */}
      <div className="bg-white rounded-lg shadow border" id="billing-settings">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Billing & Subscription</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-6">
            <div>
              <h4 className="font-medium text-blue-900">Professional Plan</h4>
              <p className="text-sm text-blue-700">$299/month per attorney • 5 seats active</p>
              <p className="text-sm text-blue-600">Next billing: March 15, 2026</p>
            </div>
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              id="manage-subscription"
            >
              Manage Subscription
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div id="payment-method">
              <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    💳
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-600">Expires 12/2028</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                  id="update-payment"
                >
                  Update Payment Method
                </button>
              </div>
            </div>

            <div id="billing-history">
              <h4 className="font-medium text-gray-900 mb-3">Recent Invoices</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">February 2026</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">$1,495.00</span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">January 2026</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">$1,495.00</span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">December 2025</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">$1,495.00</span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Preferences */}
      <div className="bg-white rounded-lg shadow border" id="ai-preferences">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">AI Preferences</h3>
        </div>
        <div className="p-6 space-y-6">
          <div id="ai-model-selection">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred AI Model
            </label>
            <select className="block w-full md:w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option>GPT-4o (Recommended)</option>
              <option>Claude 3 Opus</option>
              <option>Hybrid Model</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              GPT-4o provides the best balance of accuracy and speed for legal analysis.
            </p>
          </div>

          <div id="confidence-threshold">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence Threshold
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="70"
                max="99"
                defaultValue="85"
                className="flex-1 md:w-64"
              />
              <span className="text-sm font-medium text-gray-900">85%</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              AI predictions below this threshold will be flagged for review.
            </p>
          </div>

          <div id="notification-preferences">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Notification Preferences
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">High-confidence AI predictions</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Low-confidence predictions requiring review</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Weekly analytics summaries</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">New feature announcements</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              id="save-ai-preferences"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow border" id="security-settings">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Security & Privacy</h3>
        </div>
        <div className="p-6 space-y-6">
          <div id="two-factor-auth">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <button
                type="button"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                id="enable-2fa"
              >
                Enable 2FA
              </button>
            </div>
          </div>

          <div id="session-management">
            <h4 className="font-medium text-gray-900 mb-3">Active Sessions</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Current Session</p>
                  <p className="text-sm text-gray-600">MacBook Pro • San Francisco, CA</p>
                </div>
                <span className="text-sm text-green-600 font-medium">Active Now</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">iPad Session</p>
                  <p className="text-sm text-gray-600">iPad Pro • 2 hours ago</p>
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm">Revoke</button>
              </div>
            </div>
          </div>

          <div id="data-export">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Data Export</h4>
                <p className="text-sm text-gray-600">Download all your data in standard formats</p>
              </div>
              <button
                type="button"
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                id="export-data"
              >
                Request Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}