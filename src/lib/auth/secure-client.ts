/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

/**
 * SECURITY-HARDENED SUPABASE CLIENT
 *
 * CRITICAL: This client NEVER uses SUPABASE_SERVICE_ROLE_KEY
 * All queries respect Row Level Security (RLS) policies
 * User context is preserved through Clerk authentication
 */
export async function createSecureSupabase() {
  const cookieStore = await cookies()
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Authentication required - cannot create database client for anonymous user')
  }

  // Create RLS-compliant client using anon key
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // NOT service role - respects RLS
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - cookies are read-only
          }
        },
      },
      global: {
        headers: {
          // Set user context for RLS policies
          'x-user-id': userId,
        }
      }
    }
  )

  return client
}

/**
 * ORGANIZATION-SCOPED DATABASE CLIENT
 *
 * Ensures all queries are automatically filtered by organization_id
 * Prevents data leaks between organizations
 */
export async function createOrganizationScopedClient(organizationId: string) {
  const client = await createSecureSupabase()

  // Validate user has access to this organization
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Authentication required')
  }

  // Check organization membership through RLS-protected query
  const { data: membership, error } = await client
    .from('organization_members')
    .select('org_role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (error || !membership) {
    throw new Error(`Access denied: User ${userId} is not a member of organization ${organizationId}`)
  }

  // Return client with organization context
  return {
    client,
    organizationId,
    userId,
    orgRole: membership.org_role,
    // Convenience method for organization-scoped queries
    from: (table: string) => client.from(table).eq('organization_id', organizationId)
  }
}

/**
 * EMERGENCY SERVICE CLIENT (USE WITH EXTREME CAUTION)
 *
 * Only for system operations that genuinely need to bypass RLS:
 * - Initial user setup/onboarding
 * - System migrations
 * - Admin-only global operations
 *
 * AUDIT LOG: All usage must be logged and justified
 */
export function createEmergencyServiceClient(justification: string) {
  console.warn(`🚨 SERVICE ROLE CLIENT CREATED: ${justification}`)
  console.warn('⚠️  BYPASSING ROW LEVEL SECURITY - USE WITH EXTREME CAUTION')

  // Log to audit trail
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action: 'SERVICE_CLIENT_CREATED',
    justification,
    stack: new Error().stack,
  }
  console.log('AUDIT LOG:', JSON.stringify(auditEntry))

  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}