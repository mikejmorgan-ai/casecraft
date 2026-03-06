/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOrganizationContext } from '@/lib/auth/permissions'
import { stripe, PRICING_PLANS, type PricingPlan } from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication and organization context
    const authContext = await getOrganizationContext()
    if (!authContext) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plan, successUrl, cancelUrl } = body

    if (!plan || !PRICING_PLANS[plan as PricingPlan]) {
      return NextResponse.json(
        { error: 'Invalid pricing plan specified' },
        { status: 400 }
      )
    }

    const selectedPlan = PRICING_PLANS[plan as PricingPlan]

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'interval' in selectedPlan ? 'subscription' : 'payment',
      customer_email: undefined, // Will be populated from Clerk user data
      metadata: {
        organization_id: authContext.organizationId,
        user_id: authContext.userId,
        user_role: authContext.role,
        plan_id: selectedPlan.id,
      },
      line_items: [
        {
          price_data: {
            currency: selectedPlan.currency,
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
            },
            unit_amount: selectedPlan.price,
            ...('interval' in selectedPlan && {
              recurring: {
                interval: selectedPlan.interval as 'month' | 'year',
              },
            }),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
      automatic_tax: {
        enabled: true,
      },
      billing_address_collection: 'required',
      invoice_creation: 'interval' in selectedPlan ? undefined : {
        enabled: true,
        invoice_data: {
          description: `${selectedPlan.name} - CaseBrake.ai Legal Intelligence`,
          metadata: {
            organization_id: authContext.organizationId,
            plan_id: selectedPlan.id,
          },
        },
      },
    })

    // Log checkout session creation for audit
    console.log('🔥 Checkout Session Created:', {
      session_id: checkoutSession.id,
      organization_id: authContext.organizationId,
      user_id: authContext.userId,
      plan: selectedPlan.name,
      amount: selectedPlan.price / 100, // Convert to dollars for logging
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      plan: selectedPlan,
    })

  } catch (error) {
    console.error('Stripe checkout session creation failed:', error)

    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for retrieving pricing information
export async function GET() {
  try {
    return NextResponse.json({
      plans: Object.entries(PRICING_PLANS).map(([key, plan]) => ({
        ...plan,
        key,
        priceDisplay: `$${(plan.price / 100).toLocaleString()}${'interval' in plan ? `/${plan.interval}` : ''}`,
      })),
    })
  } catch (error) {
    console.error('Failed to retrieve pricing plans:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve pricing information' },
      { status: 500 }
    )
  }
}