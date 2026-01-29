'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { PLAN_METADATA, type PlanTier } from '@/lib/stripe/client'

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  const [loading, setLoading] = useState<PlanTier | null>(null)

  const handleSubscribe = async (planTier: 'solo' | 'team') => {
    setLoading(planTier)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    { tier: 'free' as const, cta: 'Start Free Trial', href: '/auth/signup' },
    { tier: 'solo' as const, cta: 'Subscribe', href: null },
    { tier: 'team' as const, cta: 'Subscribe', href: null },
    { tier: 'enterprise' as const, cta: 'Contact Sales', href: 'mailto:sales@casecraft.ai' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            CaseCraft
          </Link>
          <nav className="flex gap-6">
            <Link href="/auth/login" className="text-slate-300 hover:text-white">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Start free, upgrade when you need more. All plans include access to our 10 AI legal personas.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={billingInterval === 'month' ? 'text-white' : 'text-slate-400'}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBillingInterval(billingInterval === 'month' ? 'year' : 'month')
            }
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-blue-500 transition ${
                billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span
            className={billingInterval === 'year' ? 'text-white' : 'text-slate-400'}
          >
            Yearly
            <span className="ml-2 text-sm text-green-400">(Save 20%)</span>
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map(({ tier, cta, href }) => {
            const plan = PLAN_METADATA[tier]
            const price = plan.price
              ? billingInterval === 'year'
                ? Math.round(plan.price * 0.8)
                : plan.price
              : null

            const isPopular = tier === 'solo'

            return (
              <div
                key={tier}
                className={`relative rounded-2xl p-8 ${
                  isPopular
                    ? 'bg-blue-600 ring-2 ring-blue-400'
                    : 'bg-slate-800 ring-1 ring-slate-700'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-400 text-blue-900 text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isPopular ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {plan.name}
                </h3>

                <div className="mb-6">
                  {price !== null ? (
                    <>
                      <span
                        className={`text-4xl font-bold ${
                          isPopular ? 'text-white' : 'text-slate-100'
                        }`}
                      >
                        ${price}
                      </span>
                      <span
                        className={isPopular ? 'text-blue-200' : 'text-slate-400'}
                      >
                        /{billingInterval === 'year' ? 'mo' : 'month'}
                      </span>
                      {billingInterval === 'year' && (
                        <p
                          className={`text-sm mt-1 ${
                            isPopular ? 'text-blue-200' : 'text-slate-400'
                          }`}
                        >
                          Billed annually (${price * 12}/year)
                        </p>
                      )}
                    </>
                  ) : (
                    <span
                      className={`text-4xl font-bold ${
                        isPopular ? 'text-white' : 'text-slate-100'
                      }`}
                    >
                      Custom
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          isPopular ? 'text-blue-200' : 'text-green-400'
                        }`}
                      />
                      <span
                        className={isPopular ? 'text-blue-100' : 'text-slate-300'}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {href ? (
                  <Link
                    href={href}
                    className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition ${
                      isPopular
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleSubscribe(tier as 'solo' | 'team')}
                    disabled={loading === tier}
                    className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition ${
                      isPopular
                        ? 'bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50'
                        : 'bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50'
                    }`}
                  >
                    {loading === tier ? 'Loading...' : cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-700">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              What counts as a message?
            </h3>
            <p className="text-slate-400">
              Each exchange with an AI agent counts as one message. This includes chat
              messages during simulations, hearings, and strategy sessions.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              What&apos;s the difference between Turbo and Full simulations?
            </h3>
            <p className="text-slate-400">
              Turbo simulations provide a quick 10-turn case analysis with scoring.
              Full simulations allow extended multi-agent hearings with real-time
              streaming responses.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Can I upgrade or downgrade at any time?
            </h3>
            <p className="text-slate-400">
              Yes! You can change your plan at any time. Upgrades take effect
              immediately, while downgrades apply at the end of your billing period.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Is my data secure?
            </h3>
            <p className="text-slate-400">
              Yes. All data is encrypted at rest and in transit. We use row-level
              security to ensure your cases are only accessible to you. Enterprise
              plans include additional security features like SSO.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Case Preparation?
          </h2>
          <p className="text-blue-100 mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} CaseCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
