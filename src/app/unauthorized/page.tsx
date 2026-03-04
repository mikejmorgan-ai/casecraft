/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

'use client'

import { useUser } from '@clerk/nextjs'
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const { user } = useUser()
  const router = useRouter()
  const userRole = user?.publicMetadata?.role as string || 'User'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Access Restricted
          </CardTitle>
          <CardDescription>
            You don't have permission to access this resource
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-amber-800">
                  Insufficient Role Permissions
                </h4>
                <p className="text-sm text-amber-700">
                  Adversarial simulations require <strong>Admin</strong> or <strong>Attorney</strong> role access.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600">
              Current role: <span className="font-semibold">{userRole}</span>
            </p>
            <p className="text-xs text-slate-500">
              Contact your administrator to request elevated permissions.
            </p>
          </div>

          <div className="pt-4 space-y-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}