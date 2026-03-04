/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { SignIn } from '@clerk/nextjs'
import { Scale, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CaseBrake.ai
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600">
            Sign in to your legal intelligence platform
          </p>
        </div>

        {/* Clerk Sign In with Custom Configuration */}
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#3b82f6',
              colorBackground: '#ffffff',
              colorText: '#1e293b',
              colorInputText: '#1e293b',
              colorInputBackground: '#f8fafc',
              borderRadius: '8px',
            },
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white border border-slate-200 shadow-xl rounded-xl',
              headerTitle: 'text-2xl font-bold text-slate-900',
              headerSubtitle: 'text-slate-600',
              formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200',
              formFieldInput: 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg',
              formFieldLabel: 'text-slate-700 font-medium',
              footerActionText: 'text-slate-600',
              footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold',
              dividerText: 'text-slate-500',
              socialButtonsBlockButton: 'border-slate-200 text-slate-700 hover:bg-slate-50',
              formFieldInputShowPasswordButton: 'text-slate-500 hover:text-slate-700',
              identityPreviewText: 'text-slate-600',
            },
          }}
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />

        {/* New to CaseBrake.ai */}
        <div className="mt-8 text-center">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-3">
              New to CaseBrake.ai? Start your free trial today.
            </p>
            <Link href="/sign-up">
              <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm">
                Create Account
                <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              SOC 2 Compliant
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              256-bit Encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
