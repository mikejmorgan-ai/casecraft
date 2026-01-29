import Stripe from 'stripe'

// Server-side Stripe instance
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  }

  return stripeInstance
}

// Price IDs for each plan tier
export const STRIPE_PRICE_IDS = {
  solo: process.env.STRIPE_PRICE_SOLO || 'price_solo_monthly',
  team: process.env.STRIPE_PRICE_TEAM || 'price_team_monthly',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly',
} as const

// Plan tier metadata
export const PLAN_METADATA = {
  free: {
    name: 'Free Trial',
    price: 0,
    interval: 'month' as const,
    features: [
      '1 case',
      '10 messages',
      '1 simulation',
      '14-day trial',
    ],
  },
  solo: {
    name: 'Solo',
    price: 99,
    interval: 'month' as const,
    features: [
      '5 cases',
      '500 messages/month',
      '20 simulations/month',
      '5 hearings/month',
      '30 TTS minutes/month',
      'Custom agent personas',
    ],
  },
  team: {
    name: 'Team',
    price: 299,
    interval: 'month' as const,
    features: [
      '25 cases',
      '2,500 messages/month',
      '100 simulations/month',
      '25 hearings/month',
      '120 TTS minutes/month',
      '3 team seats',
      'Priority support',
      'Advanced analytics',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: null,
    interval: 'month' as const,
    features: [
      'Unlimited cases',
      'Unlimited messages',
      'Unlimited simulations',
      'Unlimited hearings',
      'Unlimited TTS',
      'Unlimited seats',
      'API access',
      'SSO/SAML',
      'Dedicated support',
      'Custom integrations',
    ],
  },
} as const

export type PlanTier = keyof typeof PLAN_METADATA

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(params: {
  userId: string
  email: string
  planTier: 'solo' | 'team'
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()
  const priceId = STRIPE_PRICE_IDS[params.planTier]

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: params.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      metadata: {
        userId: params.userId,
        planTier: params.planTier,
      },
      trial_period_days: 14,
    },
    metadata: {
      userId: params.userId,
      planTier: params.planTier,
    },
  })

  return session
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(params: {
  customerId: string
  returnUrl: string
}): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe()

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })

  return session
}

/**
 * Get customer's subscription
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe()

  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch {
    return null
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/**
 * Resume a canceled subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}
