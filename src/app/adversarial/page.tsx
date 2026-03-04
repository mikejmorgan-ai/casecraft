/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { AlertTriangle, Play, Shield, Target, Users, FileText, Gavel, TrendingUp, CreditCard, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface PaymentStatus {
  hasActiveSubscription: boolean
  availableCredits: number
  trialEndsAt: string | null
  isTrialActive: boolean
  plan: string | null
  features: {
    adversarialSimulations: boolean
    unlimitedCases: boolean
    prioritySupport: boolean
    customIntegrations: boolean
  }
}

export default function AdversarialSimulationPage() {
  const { user, isLoaded } = useUser()
  const [isRunning, setIsRunning] = useState(false)
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loadingPayment, setLoadingPayment] = useState(true)

  const userRole = user?.publicMetadata?.role as string || 'User'
  const hasRoleAccess = userRole === 'Admin' || userRole === 'Attorney'

  useEffect(() => {
    if (isLoaded && user && hasRoleAccess) {
      checkPaymentStatus()
    }
  }, [isLoaded, user, hasRoleAccess])

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch('/api/payment-status')
      const data = await response.json()
      setPaymentStatus(data.paymentStatus)
    } catch (error) {
      console.error('Failed to check payment status:', error)
      // Default to no access if payment status check fails
      setPaymentStatus({
        hasActiveSubscription: false,
        availableCredits: 0,
        trialEndsAt: null,
        isTrialActive: false,
        plan: null,
        features: {
          adversarialSimulations: false,
          unlimitedCases: false,
          prioritySupport: false,
          customIntegrations: false
        }
      })
    } finally {
      setLoadingPayment(false)
    }
  }

  if (!isLoaded || loadingPayment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!hasRoleAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Access Denied:</strong> Adversarial simulations require Admin or Attorney role.
              Current role: <Badge variant="secondary">{userRole}</Badge>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Payment Status Check - Show Paywall if no access
  if (paymentStatus && !paymentStatus.features.adversarialSimulations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Paywall Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Unlock Adversarial Simulations
            </h1>
            <p className="text-xl text-slate-600">
              Transform your litigation strategy with enterprise-grade adversarial testing
            </p>
          </div>

          {/* Payment Required Notice */}
          <Alert className="border-amber-200 bg-amber-50">
            <CreditCard className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Payment Required:</strong> Adversarial simulations require an active subscription or available case credits.
            </AlertDescription>
          </Alert>

          {/* Pricing Options */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900">Pay Per Case</CardTitle>
                <div className="text-3xl font-bold text-slate-900">$499</div>
                <CardDescription>Single case adversarial analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-slate-700">
                    <Target className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    Complete adversarial simulation for 1 case
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <FileText className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    Bates-strict evidence validation
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <Users className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    Multi-agent battle testing
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <Gavel className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    Litigation fortress report
                  </li>
                </ul>
                <Link href="/pricing">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Purchase Single Case
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white">Most Popular</Badge>
              </div>
              <CardHeader className="pt-6">
                <CardTitle className="text-xl text-purple-900">Pro Subscription</CardTitle>
                <div className="text-3xl font-bold text-slate-900">$1,999<span className="text-base font-normal">/month</span></div>
                <CardDescription>Unlimited enterprise access</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-slate-700">
                    <Target className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    Unlimited adversarial simulations
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <Users className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    Organization-wide access
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <Shield className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    Priority support
                  </li>
                  <li className="flex items-center text-sm text-slate-700">
                    <Gavel className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    Dedicated account manager
                  </li>
                </ul>
                <Link href="/pricing">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                    Start Pro Subscription
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Trial Notice */}
          <Alert className="border-green-200 bg-green-50">
            <Clock className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Free Trial Available:</strong> Start with a 30-day free trial including full access to adversarial simulations.
            </AlertDescription>
          </Alert>

        </div>
      </div>
    )
  }

  const runAdversarialSimulation = async () => {
    setIsRunning(true)
    try {
      // Call the adversarial simulation API
      const response = await fetch('/api/adversarial/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          case_id: 'tree-farm',
          simulation_type: 'full_adversarial'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const results = await response.json()
      setSimulationResults(results)
    } catch (error) {
      console.error('Simulation failed:', error)
      alert('Simulation failed. Check console for details.')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Adversarial Simulation</h1>
            <p className="text-slate-600 mt-2">
              Enterprise litigation stress testing and case strength analysis
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Authorized: {userRole}
            </Badge>
          </div>
        </div>

        {/* Role Access Confirmation */}
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Access Granted:</strong> Your {userRole} role has been verified for adversarial simulation access.
          </AlertDescription>
        </Alert>

        {/* Simulation Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Litigation Fortress Analysis</span>
            </CardTitle>
            <CardDescription>
              Run comprehensive adversarial testing against case positions and evidence strength
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-blue-900">Multi-Agent Analysis</h4>
                  <p className="text-sm text-blue-700">Deploy opposing counsel perspectives</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <FileText className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-purple-900">Evidence Stress Test</h4>
                  <p className="text-sm text-purple-700">Identify weaknesses and gaps</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <Gavel className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="font-semibold text-green-900">Judicial Adjudication</h4>
                  <p className="text-sm text-green-700">Simulated judicial review</p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={runAdversarialSimulation}
                  disabled={isRunning}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Launch Adversarial Simulation
                    </>
                  )}
                </Button>
              </div>

              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Simulation Progress</span>
                    <span>Processing agents...</span>
                  </div>
                  <Progress value={65} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Display */}
        {simulationResults && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Litigation Fortress Report</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Overall Case Strength</h4>
                      <div className="text-3xl font-bold text-green-600">
                        {simulationResults.overall_strength || 'Strong'}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Risk Assessment</h4>
                      <div className="text-3xl font-bold text-amber-600">
                        {simulationResults.risk_level || 'Moderate'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strengths">
              <Card>
                <CardHeader>
                  <CardTitle>Case Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-4 rounded">
                    {JSON.stringify(simulationResults.strengths, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vulnerabilities">
              <Card>
                <CardHeader>
                  <CardTitle>Identified Vulnerabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-red-50 p-4 rounded">
                    {JSON.stringify(simulationResults.vulnerabilities, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle>Strategic Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-blue-50 p-4 rounded">
                    {JSON.stringify(simulationResults.recommendations, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Security Notice */}
        <Alert className="border-slate-200 bg-slate-50">
          <Shield className="h-4 w-4 text-slate-600" />
          <AlertDescription className="text-slate-700">
            <strong>Security Notice:</strong> All simulation results are partitioned by organization ID
            and encrypted at rest. Results are only accessible to authorized personnel within your organization.
          </AlertDescription>
        </Alert>

      </div>
    </div>
  )
}