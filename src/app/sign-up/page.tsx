/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <a href="/" className="text-blue-600">CaseBreak.AI</a>
          </h2>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <SignUp />
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="inline-block p-3 bg-blue-50 rounded-md">
          <p className="text-blue-800 font-medium">🎉 Free 30-day trial</p>
          <p className="text-blue-600 text-xs mt-1">
            No credit card required • Full access to all features
          </p>
        </div>
      </div>
    </div>
  )
}