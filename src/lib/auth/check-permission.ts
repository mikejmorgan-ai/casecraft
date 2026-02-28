import { createServerSupabase } from '../supabase/server'

export type UserRole = 'attorney' | 'paralegal' | 'client' | 'admin' | 'researcher'

export interface UserProfile {
  id: string
  role: UserRole
  onboarding_completed: boolean
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

/**
 * Get the authenticated user's profile including their role
 * 
 * Security: Uses least-privilege default role (client) for users without a profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile) {
    return profile as UserProfile
  }

  // Fallback: Return basic profile with least-privilege default role
  // This handles users created before RBAC migration
  return {
    id: user.id,
    role: 'client' as UserRole, // Least-privilege default
    onboarding_completed: false,
    preferences: {},
    created_at: user.created_at,
    updated_at: user.created_at,
  }
}

/**
 * Check if the current user has the required role
 */
export async function checkPermission(requiredRole: UserRole): Promise<boolean> {
  const profile = await getUserProfile()
  if (!profile) {
    return false
  }

  const roleHierarchy: Record<UserRole, number> = {
    client: 0,
    researcher: 1,
    paralegal: 2,
    attorney: 3,
    admin: 4,
  }

  return roleHierarchy[profile.role] >= roleHierarchy[requiredRole]
}
