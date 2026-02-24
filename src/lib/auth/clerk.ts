import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { type UserRole, type UserProfile, hasPermission, type Permission } from './rbac'

/**
 * Create a Supabase client with service role (bypasses RLS).
 * Used for all DB operations when auth is handled by Clerk.
 */
export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Get the authenticated Clerk user ID.
 * Returns null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

/**
 * Require authentication — throws if not logged in.
 * Returns the Clerk user ID.
 */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthUserId()
  if (!userId) {
    throw new Error('Unauthorized: Not logged in')
  }
  return userId
}

/**
 * Get the current user's profile from the database.
 * Falls back to a default attorney profile if no DB record exists.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const userId = await getAuthUserId()
  if (!userId) return null

  const supabase = getSupabase()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profile) {
    return profile as UserProfile
  }

  // Fallback: Return basic profile with default role
  const user = await currentUser()
  return {
    id: userId,
    role: 'attorney' as UserRole,
    full_name: user?.fullName || undefined,
    onboarding_completed: false,
    preferences: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/**
 * Get user role. Returns 'attorney' as default.
 */
export async function getUserRole(): Promise<UserRole> {
  const profile = await getUserProfile()
  return profile?.role ?? 'attorney'
}

/**
 * Check if the current user has a specific permission.
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const profile = await getUserProfile()
  if (!profile) return false
  return hasPermission(profile.role, permission)
}

/**
 * Require a specific permission — throws if not authorized.
 */
export async function requirePermission(permission: Permission): Promise<UserProfile> {
  const profile = await getUserProfile()
  if (!profile) {
    throw new Error('Unauthorized: Not logged in')
  }
  if (!hasPermission(profile.role, permission)) {
    throw new Error(`Forbidden: Missing permission ${permission}`)
  }
  return profile
}

/**
 * Check if the current user has access to a specific case.
 */
export async function checkCaseAccess(
  caseId: string,
  requiredPermission: 'view' | 'comment' | 'edit' | 'admin' = 'view'
): Promise<boolean> {
  const userId = await getAuthUserId()
  if (!userId) return false

  const supabase = getSupabase()

  // Check ownership
  const { data: caseData } = await supabase
    .from('cases')
    .select('user_id, organization_id')
    .eq('id', caseId)
    .single()

  if (!caseData) return false

  // User is owner
  if (caseData.user_id === userId) return true

  // Check organization membership
  if (caseData.organization_id) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('org_role')
      .eq('organization_id', caseData.organization_id)
      .eq('user_id', userId)
      .single()

    if (membership) {
      if (['owner', 'admin'].includes(membership.org_role)) return true
      if (requiredPermission === 'view') return true
    }
  }

  // Check direct share
  const permissionHierarchy = ['view', 'comment', 'edit', 'admin']
  const user = await currentUser()
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase()

  const recipientFilter = userEmail
    ? `shared_with_user_id.eq.${userId},shared_with_email.eq.${userEmail}`
    : `shared_with_user_id.eq.${userId}`

  const { data: shares } = await supabase
    .from('case_shares')
    .select('permission_level, expires_at')
    .eq('case_id', caseId)
    .or(recipientFilter)

  if (!shares || shares.length === 0) return false

  const now = new Date()
  const validShares = shares.filter(s => !s.expires_at || new Date(s.expires_at) > now)

  if (validShares.length === 0) return false

  const bestShare = validShares.reduce((best, current) => {
    const bestIdx = permissionHierarchy.indexOf(best.permission_level)
    const currentIdx = permissionHierarchy.indexOf(current.permission_level)
    return currentIdx > bestIdx ? current : best
  }, validShares[0])

  return permissionHierarchy.indexOf(bestShare.permission_level) >=
         permissionHierarchy.indexOf(requiredPermission)
}

/**
 * Require case access — throws if not authorized.
 */
export async function requireCaseAccess(
  caseId: string,
  requiredPermission: 'view' | 'comment' | 'edit' | 'admin' = 'view'
): Promise<void> {
  const hasAccess = await checkCaseAccess(caseId, requiredPermission)
  if (!hasAccess) {
    throw new Error(`Forbidden: Missing ${requiredPermission} access to case`)
  }
}
