/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe/config'
import { createEmergencyServiceClient } from '@/lib/auth/secure-client'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * STRIPE WEBHOOK HANDLER
 *
 * Processes payment events to update user subscription and credit status
 * SECURITY: Uses emergency service client for payment processing only
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`🎣 Stripe webhook received: ${event.type}`)

    // Use emergency service client for payment operations (justified)
    const supabase = createEmergencyServiceClient(
      `Processing Stripe webhook ${event.type} - payment operations require system-level access`
    )

    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED: {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('💳 Checkout completed:', session.id)

        // Extract organization from metadata
        const organizationId = session.metadata?.organization_id
        const planType = session.metadata?.plan_type

        if (!organizationId) {
          console.error('❌ No organization_id in session metadata')
          break
        }

        // Update payment transaction log
        const { error: txnError } = await supabase
          .from('payment_transactions')
          .insert({
            organization_id: organizationId,
            stripe_session_id: session.id,
            stripe_subscription_id: session.subscription as string,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            plan_type: planType || 'unknown',
            status: 'completed'
          })

        if (txnError) {
          console.error('❌ Failed to log transaction:', txnError)
        }

        // For subscriptions, update organization subscription status
        if (session.subscription) {
          const { error: orgError } = await supabase
            .from('organizations')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_status: 'active',
              plan_type: planType,
              updated_at: new Date().toISOString()
            })
            .eq('id', organizationId)

          if (orgError) {
            console.error('❌ Failed to update organization:', orgError)
          } else {
            console.log('✅ Organization subscription activated')
          }
        }

        // For pay-per-case, add credits
        if (planType === 'pay_per_case') {
          const userId = session.client_reference_id || session.metadata?.user_id

          if (userId) {
            const { error: creditError } = await supabase
              .from('user_credits')
              .upsert({
                organization_id: organizationId,
                user_id: userId,
                credits_available: 1, // One case credit
                updated_at: new Date().toISOString()
              })

            if (creditError) {
              console.error('❌ Failed to add credits:', creditError)
            } else {
              console.log('✅ Case credit added')
            }
          }
        }

        break
      }

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED: {
        const subscription = event.data.object as Stripe.Subscription
        console.log('🔄 Subscription created:', subscription.id)

        // Find organization by customer ID
        const { data: org, error: findError } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (findError || !org) {
          console.error('❌ Organization not found for customer:', subscription.customer)
          break
        }

        // Update subscription status
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', org.id)

        if (updateError) {
          console.error('❌ Failed to update subscription:', updateError)
        } else {
          console.log('✅ Subscription status updated')
        }

        break
      }

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED: {
        const subscription = event.data.object as Stripe.Subscription
        console.log('📝 Subscription updated:', subscription.id)

        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            subscription_status: subscription.status,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('❌ Failed to update subscription status:', updateError)
        } else {
          console.log('✅ Subscription status updated to:', subscription.status)
        }

        break
      }

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED: {
        const subscription = event.data.object as Stripe.Subscription
        console.log('🗑️ Subscription cancelled:', subscription.id)

        const { error: cancelError } = await supabase
          .from('organizations')
          .update({
            subscription_status: 'cancelled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (cancelError) {
          console.error('❌ Failed to cancel subscription:', cancelError)
        } else {
          console.log('✅ Subscription cancelled')
        }

        break
      }

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED: {
        const invoice = event.data.object as Stripe.Invoice
        console.log('✅ Payment succeeded for invoice:', invoice.id)

        if (invoice.subscription) {
          const { error: paymentError } = await supabase
            .from('organizations')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription)

          if (!paymentError) {
            console.log('✅ Subscription reactivated after payment')
          }
        }

        break
      }

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED: {
        const invoice = event.data.object as Stripe.Invoice
        console.log('❌ Payment failed for invoice:', invoice.id)

        if (invoice.subscription) {
          const { error: failError } = await supabase
            .from('organizations')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription)

          if (!failError) {
            console.log('⚠️ Subscription marked as past due')
          }
        }

        break
      }

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('💥 Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}