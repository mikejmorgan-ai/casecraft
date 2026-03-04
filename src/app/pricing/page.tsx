/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle,
  ArrowRight,
  Gavel,
  Target,
  Users,
  Zap,
  Star,
  CreditCard,
  Calendar,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface PricingPlan {
  id: string
  name: string
  price: number
  currency: string
  interval?: string
  description: string
  features: string[]
  priceDisplay: string
}

export default function PricingPage() {
  const { user, isLoaded } = useUser()
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)

  useEffect(() => {
    fetchPricingPlans()
  }, [])

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch('/api/checkout')
      const data = await response.json()
      setPlans(data.plans)
    } catch (error) {
      console.error('Failed to fetch pricing plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async (planId: string) => {
    if (!isLoaded || !user) {
      // Redirect to sign up
      window.location.href = '/sign-up'
      return
    }

    setCheckingOut(planId)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planId,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/pricing?payment=cancelled`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      alert('Failed to create checkout session. Please try again.')
    } finally {
      setCheckingOut(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  const payPerCasePlan = plans.find(p => p.id === 'pay_per_case')
  const proSubscriptionPlan = plans.find(p => p.id === 'pro_subscription')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Gavel className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CaseBrake.ai
            </span>
          </Link>
          <div className="flex gap-4 items-center">
            {isLoaded && user ? (
              <Link href="/dashboard">
                <Button variant="ghost">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button variant="ghost">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 mb-8">
            <Star className="w-3 h-3 mr-1" />
            Enterprise Legal Intelligence Pricing
          </Badge>

          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
            Choose Your Legal Advantage
          </h1>

          <p className="text-xl text-slate-600 mb-16 max-w-3xl mx-auto leading-relaxed">
            From single case analysis to unlimited enterprise access.
            Start adversarial testing today and transform your litigation outcomes.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Pay Per Case */}
            {payPerCasePlan && (
              <Card className="relative border-2 border-slate-200 hover:border-blue-300 transition-all duration-300">
                <CardHeader className="text-center pb-8">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full w-fit mx-auto mb-4">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">{payPerCasePlan.name}</CardTitle>
                  <div className="text-4xl font-bold text-slate-900 mb-2">
                    {payPerCasePlan.priceDisplay}
                  </div>
                  <Badge variant="secondary" className="mb-4">
                    <CreditCard className="w-3 h-3 mr-1" />
                    One-time payment
                  </Badge>
                  <p className="text-slate-600">{payPerCasePlan.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {payPerCasePlan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}

                  <div className="pt-6">
                    <Button
                      onClick={() => handleCheckout(payPerCasePlan.id)}
                      disabled={checkingOut === payPerCasePlan.id}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      size="lg"
                    >
                      {checkingOut === payPerCasePlan.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Get Single Case Analysis
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pro Subscription */}
            {proSubscriptionPlan && (
              <Card className="relative border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 shadow-lg">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>

                <CardHeader className="text-center pb-8 pt-8">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-full w-fit mx-auto mb-4">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">{proSubscriptionPlan.name}</CardTitle>
                  <div className="text-4xl font-bold text-slate-900 mb-2">
                    {proSubscriptionPlan.priceDisplay}
                  </div>
                  <Badge variant="secondary" className="mb-4">
                    <Calendar className="w-3 h-3 mr-1" />
                    Monthly subscription
                  </Badge>
                  <p className="text-slate-600">{proSubscriptionPlan.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {proSubscriptionPlan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}

                  <div className="pt-6">
                    <Button
                      onClick={() => handleCheckout(proSubscriptionPlan.id)}
                      disabled={checkingOut === proSubscriptionPlan.id}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      size="lg"
                    >
                      {checkingOut === proSubscriptionPlan.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Start Pro Subscription
                          <Zap className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Trial Notice */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-bold text-slate-900">30-Day Free Trial</h3>
                </div>
                <p className="text-slate-600 mb-4">
                  Every plan includes a full 30-day trial with complete access to adversarial simulations.
                  No credit card required to start.
                </p>
                {!isLoaded || !user ? (
                  <Link href="/sign-up">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Continue to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Feature Comparison
            </h2>
            <p className="text-xl text-slate-600">
              Choose the plan that fits your legal practice needs
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div></div>
              <div className="font-semibold text-slate-900">Pay Per Case</div>
              <div className="font-semibold text-slate-900">Pro Subscription</div>

              {[
                { feature: 'Adversarial Simulations', payPerCase: '1 Case', pro: 'Unlimited' },
                { feature: 'Bates Evidence Validation', payPerCase: '✓', pro: '✓' },
                { feature: 'Multi-Agent Battle Testing', payPerCase: '✓', pro: '✓' },
                { feature: 'Organization Access', payPerCase: '1 User', pro: 'Team Access' },
                { feature: 'Priority Support', payPerCase: '—', pro: '✓' },
                { feature: 'Custom Integrations', payPerCase: '—', pro: '✓' },
                { feature: 'Dedicated Account Manager', payPerCase: '—', pro: '✓' },
              ].map((row, i) => (
                <div key={i} className="contents">
                  <div className="py-4 border-b border-slate-100 text-left font-medium text-slate-700">
                    {row.feature}
                  </div>
                  <div className="py-4 border-b border-slate-100 text-slate-600">
                    {row.payPerCase}
                  </div>
                  <div className="py-4 border-b border-slate-100 text-slate-600">
                    {row.pro}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}