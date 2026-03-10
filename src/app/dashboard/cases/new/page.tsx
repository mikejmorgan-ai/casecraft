/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const caseTypes = [
  'civil',
  'criminal',
  'family',
  'corporate',
  'ip',
  'employment'
]

const jurisdictions = [
  'Federal',
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming'
]

export default function NewCasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    caseNumber: '',
    caseType: '',
    jurisdiction: '',
    court: '',
    judgeName: '',
    filingDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create case')
      }

      const case_ = await response.json()
      router.push(`/dashboard/cases/${case_.id}`)
    } catch (error) {
      console.error('Error creating case:', error)
      // TODO: Add proper error handling with toast
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="space-y-6" id="new-case-page">
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/cases"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          id="new-case-back-link"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Cases
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900" id="new-case-title">Create New Case</h1>
        <p className="text-gray-600 mt-1">Add a new case to your practice</p>
      </div>

      <div className="bg-white shadow sm:rounded-lg" id="new-case-form-container">
        <form onSubmit={handleSubmit} className="space-y-6 p-6" id="new-case-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div id="new-case-title-field">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Case Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Smith v. Jones Contract Dispute"
              />
            </div>

            <div id="new-case-number-field">
              <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700">
                Case Number
              </label>
              <input
                type="text"
                name="caseNumber"
                id="caseNumber"
                value={formData.caseNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 2026-CV-001234"
              />
            </div>

            <div id="new-case-type-field">
              <label htmlFor="caseType" className="block text-sm font-medium text-gray-700">
                Case Type *
              </label>
              <select
                name="caseType"
                id="caseType"
                required
                value={formData.caseType}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select case type</option>
                {caseTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div id="new-case-jurisdiction-field">
              <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700">
                Jurisdiction *
              </label>
              <select
                name="jurisdiction"
                id="jurisdiction"
                required
                value={formData.jurisdiction}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select jurisdiction</option>
                {jurisdictions.map((jurisdiction) => (
                  <option key={jurisdiction} value={jurisdiction}>
                    {jurisdiction}
                  </option>
                ))}
              </select>
            </div>

            <div id="new-case-court-field">
              <label htmlFor="court" className="block text-sm font-medium text-gray-700">
                Court
              </label>
              <input
                type="text"
                name="court"
                id="court"
                value={formData.court}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Superior Court of California"
              />
            </div>

            <div id="new-case-judge-field">
              <label htmlFor="judgeName" className="block text-sm font-medium text-gray-700">
                Judge Name
              </label>
              <input
                type="text"
                name="judgeName"
                id="judgeName"
                value={formData.judgeName}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Hon. Jane Smith"
              />
            </div>

            <div id="new-case-filing-date-field">
              <label htmlFor="filingDate" className="block text-sm font-medium text-gray-700">
                Filing Date
              </label>
              <input
                type="date"
                name="filingDate"
                id="filingDate"
                value={formData.filingDate}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3" id="new-case-form-actions">
            <Link
              href="/dashboard/cases"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              id="new-case-cancel-button"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              id="new-case-submit-button"
            >
              {loading ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}