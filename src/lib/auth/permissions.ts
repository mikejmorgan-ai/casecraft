/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

export type UserRole = 'Admin' | 'Attorney' | 'Paralegal' | 'Client' | 'User'

export interface AuthContext {
  userId: string
  organizationId: string
  role: UserRole
  canAccessAdversarialSimulations: boolean
}

/**
 * Extract organization context from request headers (set by middleware)
 * Ensures all database operations are partitioned by organization_id
 */
export async function getOrganizationContext(): Promise<AuthContext | null> {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const headersList = await headers()
    const organizationId = headersList.get('x-organization-id')
    const role = headersList.get('x-user-role') as UserRole || 'User'

    if (!organizationId) {
      throw new Error('Organization context required for data access')
    }

    return {
      userId,
      organizationId,
      role,
      canAccessAdversarialSimulations: role === 'Admin' || role === 'Attorney'
    }
  } catch (error) {
    console.error('Failed to get organization context:', error)
    return null
  }
}

/**
 * Middleware helper to extract auth context from NextRequest
 */
export function getAuthContextFromRequest(request: NextRequest): AuthContext | null {
  const userId = request.headers.get('x-user-id')
  const organizationId = request.headers.get('x-organization-id')
  const role = request.headers.get('x-user-role') as UserRole || 'User'

  if (!userId || !organizationId) {
    return null
  }

  return {
    userId,
    organizationId,
    role,
    canAccessAdversarialSimulations: role === 'Admin' || role === 'Attorney'
  }
}

/**
 * Check if user can access adversarial simulation features
 */
export async function canAccessAdversarialSimulations(): Promise<boolean> {
  const context = await getOrganizationContext()
  return context?.canAccessAdversarialSimulations ?? false
}

/**
 * Enforce role-based access control
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthContext> {
  const context = await getOrganizationContext()

  if (!context) {
    throw new Error('Authentication required')
  }

  if (!allowedRoles.includes(context.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`)
  }

  return context
}

/**
 * Enforce adversarial simulation access
 */
export async function requireAdversarialAccess(): Promise<AuthContext> {
  const context = await getOrganizationContext()

  if (!context) {
    throw new Error('Authentication required')
  }

  if (!context.canAccessAdversarialSimulations) {
    throw new Error('Access denied. Adversarial simulations require Admin or Attorney role.')
  }

  return context
}

/**
 * Get organization-partitioned database query filters
 * Ensures all database operations are scoped to the user's organization
 */
export async function getOrganizationFilter(): Promise<{ organization_id: string } | null> {
  const context = await getOrganizationContext()
  return context ? { organization_id: context.organizationId } : null
}

/**
 * Validate organization access for a specific resource
 * Prevents users from accessing data outside their organization
 */
export async function validateOrganizationAccess(resourceOrganizationId: string): Promise<boolean> {
  const context = await getOrganizationContext()
  return context ? context.organizationId === resourceOrganizationId : false
}

/**
 * Create database context with organization partitioning
 * Use this pattern in all database operations
 */
export async function createDatabaseContext() {
  const context = await getOrganizationContext()

  if (!context) {
    throw new Error('Authentication required for database access')
  }

  return {
    // Organization partition filter - ALWAYS include this in queries
    where: {
      organization_id: context.organizationId
    },
    // User context for auditing
    audit: {
      user_id: context.userId,
      organization_id: context.organizationId,
      role: context.role,
      timestamp: new Date().toISOString()
    }
  }
}