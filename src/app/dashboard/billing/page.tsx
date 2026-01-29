'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  ArrowUpRight,
  AlertCircle,
  Zap,
  MessageSquare,
  Play,
  Clock,
  BarChart3
} from 'lucide-react'

interface SubscriptionData {
  planTier: string
  status: string
  currentPeriodEnd: string | null
  limits: {
    maxCases: number
    maxMessages: number
    maxSimulations: number
    maxHearings: number
    maxTtsMinutes: number
    maxDocumentsPerCase: number
  }
  usage: {
    messages: number
    simulations: number
    hearings: number
  }
}

function UsageBar({ current, max, label }: { current: number; max: number; label: string }) {
  const percentage = max === -1 ? 0 : Math.min((current / max) * 100, 100)
  const isUnlimited = max === -1
  const isNearLimit = !isUnlimited && percentage >= 80

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className={isNearLimit ? 'text-amber-400' : 'text-slate-400'}>
          {current.toLocaleString()} / {isUnlimited ? 'Unlimited' : max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isNearLimit ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: isUnlimited ? '0%' : `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/billing/subscription')
        if (!response.ok) throw new Error('Failed to fetch subscription')
        const data = await response.json()
        setSubscription(data)
      } catch (err) {
        setError('Failed to load subscription data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Portal error:', err)
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  const planNames: Record<string, string> = {
    free: 'Free Trial',
    solo: 'Solo',
    team: 'Team',
    enterprise: 'Enterprise',
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400',
    trialing: 'bg-blue-500/10 text-blue-400',
    past_due: 'bg-amber-500/10 text-amber-400',
    canceled: 'bg-red-500/10 text-red-400',
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-400 hover:text-white">
                Dashboard
              </Link>
              <span className="text-slate-600">/</span>
              <h1 className="text-xl font-semibold text-white">Billing</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Card */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">
                  {planNames[subscription?.planTier || 'free']} Plan
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[subscription?.status || 'active']
                  }`}
                >
                  {subscription?.status || 'Active'}
                </span>
              </div>
              {subscription?.currentPeriodEnd && (
                <p className="text-slate-400">
                  {subscription.status === 'trialing'
                    ? 'Trial ends'
                    : 'Renews'}{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    'en-US',
                    { month: 'long', day: 'numeric', year: 'numeric' }
                  )}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {subscription?.planTier === 'free' ? (
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  <Zap className="w-4 h-4" />
                  Upgrade Plan
                </Link>
              ) : (
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  {portalLoading ? 'Loading...' : 'Manage Billing'}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Messages</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {subscription?.usage.messages.toLocaleString() || 0}
              </p>
              <p className="text-sm text-slate-500">
                of {subscription?.limits.maxMessages === -1 ? 'unlimited' : subscription?.limits.maxMessages.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Play className="w-4 h-4" />
                <span className="text-sm">Simulations</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {subscription?.usage.simulations.toLocaleString() || 0}
              </p>
              <p className="text-sm text-slate-500">
                of {subscription?.limits.maxSimulations === -1 ? 'unlimited' : subscription?.limits.maxSimulations.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Hearings</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {subscription?.usage.hearings.toLocaleString() || 0}
              </p>
              <p className="text-sm text-slate-500">
                of {subscription?.limits.maxHearings === -1 ? 'unlimited' : subscription?.limits.maxHearings.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">TTS Minutes</span>
              </div>
              <p className="text-2xl font-bold text-white">-</p>
              <p className="text-sm text-slate-500">
                of {subscription?.limits.maxTtsMinutes === -1 ? 'unlimited' : subscription?.limits.maxTtsMinutes.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Usage Details */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6">Usage This Month</h3>

          <div className="space-y-6">
            <UsageBar
              current={subscription?.usage.messages || 0}
              max={subscription?.limits.maxMessages || 10}
              label="Chat Messages"
            />
            <UsageBar
              current={subscription?.usage.simulations || 0}
              max={subscription?.limits.maxSimulations || 1}
              label="Simulations"
            />
            <UsageBar
              current={subscription?.usage.hearings || 0}
              max={subscription?.limits.maxHearings || 0}
              label="Hearings"
            />
          </div>

          <p className="text-sm text-slate-500 mt-6">
            Usage resets on the 1st of each month.
          </p>
        </div>

        {/* Plan Limits */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Plan Limits</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Cases</span>
              <span className="text-white font-medium">
                {subscription?.limits.maxCases === -1 ? 'Unlimited' : subscription?.limits.maxCases}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Messages per month</span>
              <span className="text-white font-medium">
                {subscription?.limits.maxMessages === -1 ? 'Unlimited' : subscription?.limits.maxMessages.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Simulations per month</span>
              <span className="text-white font-medium">
                {subscription?.limits.maxSimulations === -1 ? 'Unlimited' : subscription?.limits.maxSimulations}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Hearings per month</span>
              <span className="text-white font-medium">
                {subscription?.limits.maxHearings === -1 ? 'Unlimited' : subscription?.limits.maxHearings}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">TTS minutes per month</span>
              <span className="text-white font-medium">
                {subscription?.limits.maxTtsMinutes === -1 ? 'Unlimited' : subscription?.limits.maxTtsMinutes}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Documents per case</span>
              <span className="text-white font-medium">
                {subscription?.limits.maxDocumentsPerCase === -1 ? 'Unlimited' : subscription?.limits.maxDocumentsPerCase}
              </span>
            </div>
          </div>

          {subscription?.planTier !== 'enterprise' && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <Link
                href="/pricing"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Compare plans and upgrade &rarr;
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
