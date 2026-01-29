import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/client'
import { createServiceSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceSupabase()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(supabase, session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(supabase, subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabase, subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(supabase, invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(supabase, invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

type SupabaseClient = ReturnType<typeof createServiceSupabase>

async function handleCheckoutCompleted(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId
  const planTier = session.metadata?.planTier as 'solo' | 'team' | 'enterprise'

  if (!userId || !planTier) {
    console.error('Missing userId or planTier in checkout session metadata')
    return
  }

  // Upsert subscription record
  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      plan_tier: planTier,
      status: 'active',
      current_period_start: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  )

  if (error) {
    console.error('Failed to create subscription:', error)
    throw error
  }

  console.log(`Subscription created for user ${userId} - ${planTier}`)
}

async function handleSubscriptionUpdated(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.userId
  if (!userId) {
    // Try to find by stripe_subscription_id
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (!existingSub) {
      console.error('No subscription found for:', subscription.id)
      return
    }
  }

  const planTier = subscription.metadata?.planTier as
    | 'solo'
    | 'team'
    | 'enterprise'
    | undefined

  const statusMap: Record<Stripe.Subscription.Status, string> = {
    active: 'active',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    past_due: 'past_due',
    paused: 'canceled',
    trialing: 'trialing',
    unpaid: 'past_due',
  }

  // Get period dates from subscription items or subscription object
  const currentPeriodStart = subscription.items?.data?.[0]?.current_period_start
  const currentPeriodEnd = subscription.items?.data?.[0]?.current_period_end

  const updateData: Record<string, unknown> = {
    status: statusMap[subscription.status] || 'active',
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: currentPeriodStart
      ? new Date(currentPeriodStart * 1000).toISOString()
      : null,
    current_period_end: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  }

  if (planTier) {
    updateData.plan_tier = planTier
  }

  const { error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Failed to update subscription:', error)
    throw error
  }

  console.log(`Subscription updated: ${subscription.id} - ${subscription.status}`)
}

async function handleSubscriptionDeleted(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      plan_tier: 'free',
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Failed to cancel subscription:', error)
    throw error
  }

  console.log(`Subscription canceled: ${subscription.id}`)
}

async function handleInvoicePaymentSucceeded(
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
) {
  // Get subscription ID from parent field (invoice has subscription_details not subscription)
  const subscriptionId = (invoice as { parent?: { subscription?: string } }).parent?.subscription
    || (invoice as unknown as { subscription?: string | { id: string } }).subscription

  const subId = typeof subscriptionId === 'string'
    ? subscriptionId
    : subscriptionId?.id

  if (!subId) return

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('stripe_subscription_id', subId)

  if (error) {
    console.error('Failed to update subscription on payment success:', error)
  }

  console.log(`Payment succeeded for subscription: ${subId}`)
}

async function handleInvoicePaymentFailed(
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
) {
  // Get subscription ID from parent field (invoice has subscription_details not subscription)
  const subscriptionId = (invoice as { parent?: { subscription?: string } }).parent?.subscription
    || (invoice as unknown as { subscription?: string | { id: string } }).subscription

  const subId = typeof subscriptionId === 'string'
    ? subscriptionId
    : subscriptionId?.id

  if (!subId) return

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subId)

  if (error) {
    console.error('Failed to update subscription on payment failure:', error)
  }

  console.log(`Payment failed for subscription: ${subId}`)
}
