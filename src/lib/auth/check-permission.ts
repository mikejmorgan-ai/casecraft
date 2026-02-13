import { createServerSupabase } from '@/lib/supabase/server'
import { hasPermission, type Permission, type UserRole, type UserProfile } from './rbac'

/**
 * Get the current user's profile including role
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Try to get profile from database
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile) {
    return profile as UserProfile
  }

  // Fallback: Return basic profile with default role
  // This handles users created before RBAC migration
  return {
    id: user.id,
    role: 'attorney' as UserRole, // Default role
    onboarding_completed: false,
    preferences: {},
    created_at: user.created_at,
    updated_at: user.created_at,
  }
}

/**
 * Check if the current user has a specific permission
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const profile = await getUserProfile()
  if (!profile) return false

  return hasPermission(profile.role, permission)
}

/**
 * Check if the current user has access to a specific case
 */
export async function checkCaseAccess(
  caseId: string,
  requiredPermission: 'view' | 'comment' | 'edit' | 'admin' = 'view'
): Promise<boolean> {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Check ownership
  const { data: caseData } = await supabase
    .from('cases')
    .select('user_id, organization_id')
    .eq('id', caseId)
    .single()

  if (!caseData) return false

  // User is owner
  if (caseData.user_id === user.id) return true

  // Check organization membership
  if (caseData.organization_id) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('org_role')
      .eq('organization_id', caseData.organization_id)
      .eq('user_id', user.id)
      .single()

    if (membership) {
      // Org owners and admins get full access
      if (['owner', 'admin'].includes(membership.org_role)) return true
      // Org members get view access
      if (requiredPermission === 'view') return true
    }
  }

  // Check direct share
  const { data: share } = await supabase
    .from('case_shares')
    .select('permission_level')
    .eq('case_id', caseId)
    .eq('shared_with_user_id', user.id)
    .or('expires_at.is.null,expires_at.gt.now()')
    .single()

  if (!share) return false

  const permissionHierarchy = ['view', 'comment', 'edit', 'admin']
  return permissionHierarchy.indexOf(share.permission_level) >=
         permissionHierarchy.indexOf(requiredPermission)
}

/**
 * Require a permission - throws error if not authorized
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
 * Require case access - throws error if not authorized
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
