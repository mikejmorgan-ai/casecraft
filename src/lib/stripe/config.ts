/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

// Stripe pricing configuration
export const PRICING_PLANS = {
  PAY_PER_CASE: {
    id: 'pay_per_case',
    name: 'Pay Per Case',
    price: 49900, // $499.00 in cents
    currency: 'usd',
    description: 'CaseBreak.ai - Adversarial Analysis (Single Case)',
    features: [
      'Complete adversarial simulation for 1 case',
      'Bates-strict evidence validation',
      'Multi-agent battle testing',
      'Judicial review analysis',
      'Litigation fortress report',
      'Strategic recommendations',
    ],
  },
  PRO_SUBSCRIPTION: {
    id: 'pro_subscription',
    name: 'Pro Subscription',
    price: 199900, // $1,999.00 in cents
    currency: 'usd',
    interval: 'month',
    description: 'CaseBreak.ai - Adversarial Analysis (Unlimited Enterprise)',
    features: [
      'Unlimited adversarial simulations',
      'Organization-wide access',
      'Role-based permissions',
      'Advanced case intelligence',
      'Priority support',
      'White-glove onboarding',
      'Custom integrations',
      'Dedicated account manager',
    ],
  },
} as const

export type PricingPlan = keyof typeof PRICING_PLANS

// Stripe webhook endpoints
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const