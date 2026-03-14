/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <a href="/" className="text-blue-600">CaseBreak.AI</a>
          </h2>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <a href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
              start your free trial
            </a>
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <SignIn />
        </div>
      </div>
    </div>
  )
}