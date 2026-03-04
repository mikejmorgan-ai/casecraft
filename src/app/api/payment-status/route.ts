/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOrganizationContext } from '@/lib/auth/permissions'

// Mock payment status - In production, this would query your database
// to check for active subscriptions or case credits
export async function GET(request: NextRequest) {
  try {
    const authContext = await getOrganizationContext()
    if (!authContext) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Mock payment status logic
    // In production, query your database for:
    // 1. Active Pro subscriptions
    // 2. Available case credits
    // 3. Trial status
    const mockPaymentStatus = {
      hasActiveSubscription: false, // Query from stripe_subscriptions table
      availableCredits: 0, // Query from user_credits table
      trialEndsAt: null, // Query from organizations table
      isTrialActive: true, // Calculate based on trial_ends_at
      plan: null as string | null,
      features: {
        adversarialSimulations: true, // During trial or with payment
        unlimitedCases: false, // Pro subscription only
        prioritySupport: false, // Pro subscription only
        customIntegrations: false, // Pro subscription only
      },
    }

    // Mock logic for demo purposes
    // In production, this would be actual database queries
    if (authContext.organizationId === 'org_tree_farm') {
      // Tree Farm LLC gets trial access
      mockPaymentStatus.isTrialActive = true
      mockPaymentStatus.trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      mockPaymentStatus.features.adversarialSimulations = true
    }

    // Translate complex payment status to simple access control
    const hasAccess = mockPaymentStatus.hasActiveSubscription ||
                     mockPaymentStatus.availableCredits > 0 ||
                     mockPaymentStatus.isTrialActive

    const reason = !hasAccess
      ? 'No active subscription, credits, or trial found. Please upgrade to continue.'
      : 'Access granted'

    return NextResponse.json({
      hasAccess,
      reason,
      // Include detailed status for debugging
      paymentStatus: mockPaymentStatus,
      organization_id: authContext.organizationId,
    })

  } catch (error) {
    console.error('Payment status check failed:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}

// POST endpoint for updating payment status after successful Stripe events
export async function POST(request: NextRequest) {
  try {
    const authContext = await getOrganizationContext()
    if (!authContext) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, subscriptionId, credits, plan } = body

    // Mock implementation - In production, update your database
    console.log('💳 Payment Status Update:', {
      organization_id: authContext.organizationId,
      user_id: authContext.userId,
      action,
      subscription_id: subscriptionId,
      credits,
      plan,
      timestamp: new Date().toISOString(),
    })

    // In production, you would:
    // 1. Update organizations table with subscription info
    // 2. Update user_credits table for pay-per-case
    // 3. Create audit log entry
    // 4. Send confirmation email

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
    })

  } catch (error) {
    console.error('Payment status update failed:', error)
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}

/*
Production Database Schema for Payment Status:

-- Organizations payment info
ALTER TABLE organizations ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE organizations ADD COLUMN stripe_subscription_id VARCHAR(255);
ALTER TABLE organizations ADD COLUMN subscription_status VARCHAR(50);
ALTER TABLE organizations ADD COLUMN plan_type VARCHAR(50);
ALTER TABLE organizations ADD COLUMN trial_ends_at TIMESTAMP;

-- User credits for pay-per-case
CREATE TABLE user_credits (
  id SERIAL PRIMARY KEY,
  organization_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  credits_available INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_credits_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_credits_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  UNIQUE(organization_id, user_id)
);

-- Payment transactions log
CREATE TABLE payment_transactions (
  id SERIAL PRIMARY KEY,
  organization_id VARCHAR(255) NOT NULL,
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  plan_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_transaction_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE
);
*/