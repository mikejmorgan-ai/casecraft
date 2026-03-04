/**
 * Role-Based Access Control (RBAC) System
 * Defines user roles, permissions, and access control utilities
 */

// User roles
export type UserRole = 'attorney' | 'paralegal' | 'client' | 'admin' | 'researcher'

// Organization roles
export type OrgRole = 'owner' | 'admin' | 'member'

// Case permission levels
export type CasePermission = 'view' | 'comment' | 'edit' | 'admin'

// System permissions
export type Permission =
  // Case permissions
  | 'cases:create'
  | 'cases:read'
  | 'cases:update'
  | 'cases:delete'
  | 'cases:share'
  | 'cases:archive'
  // Document permissions
  | 'documents:upload'
  | 'documents:read'
  | 'documents:delete'
  | 'documents:annotate'
  // Agent permissions
  | 'agents:create'
  | 'agents:read'
  | 'agents:update'
  | 'agents:delete'
  | 'agents:chat'
  // Prediction permissions
  | 'predictions:run'
  | 'predictions:read'
  | 'predictions:reveal'
  // Hearing permissions
  | 'hearings:run'
  | 'hearings:read'
  // Organization permissions
  | 'org:read'
  | 'org:update'
  | 'org:invite'
  | 'org:remove_member'
  | 'org:billing'
  // Admin permissions
  | 'admin:users'
  | 'admin:analytics'
  | 'admin:settings'

// Role permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access
    'cases:create', 'cases:read', 'cases:update', 'cases:delete', 'cases:share', 'cases:archive',
    'documents:upload', 'documents:read', 'documents:delete', 'documents:annotate',
    'agents:create', 'agents:read', 'agents:update', 'agents:delete', 'agents:chat',
    'predictions:run', 'predictions:read', 'predictions:reveal',
    'hearings:run', 'hearings:read',
    'org:read', 'org:update', 'org:invite', 'org:remove_member', 'org:billing',
    'admin:users', 'admin:analytics', 'admin:settings',
  ],

  attorney: [
    // Full case access
    'cases:create', 'cases:read', 'cases:update', 'cases:delete', 'cases:share', 'cases:archive',
    'documents:upload', 'documents:read', 'documents:delete', 'documents:annotate',
    'agents:create', 'agents:read', 'agents:update', 'agents:delete', 'agents:chat',
    'predictions:run', 'predictions:read', 'predictions:reveal',
    'hearings:run', 'hearings:read',
    'org:read',
  ],

  paralegal: [
    // Case management without delete
    'cases:create', 'cases:read', 'cases:update',
    'documents:upload', 'documents:read', 'documents:annotate',
    'agents:read', 'agents:chat',
    'predictions:run', 'predictions:read',
    'hearings:read',
    'org:read',
  ],

  client: [
    // View-only access with limited interaction
    'cases:read',
    'documents:read',
    'agents:read', 'agents:chat',
    'predictions:read',
    'hearings:read',
  ],

  researcher: [
    // Read access with prediction capabilities
    'cases:read',
    'documents:read',
    'agents:read',
    'predictions:run', 'predictions:read',
    'hearings:read',
  ],
}

// Role descriptions for UI
export const ROLE_INFO: Record<UserRole, { label: string; description: string; icon: string }> = {
  attorney: {
    label: 'Attorney',
    description: 'Full case management, predictions, and analysis',
    icon: 'Scale',
  },
  paralegal: {
    label: 'Legal Assistant',
    description: 'Case support, document management, and research',
    icon: 'FileText',
  },
  client: {
    label: 'Client',
    description: 'View case status and communicate with your team',
    icon: 'User',
  },
  admin: {
    label: 'Administrator',
    description: 'Full system access including user and billing management',
    icon: 'Settings',
  },
  researcher: {
    label: 'Legal Researcher',
    description: 'Case analysis, predictions, and data export',
    icon: 'Search',
  },
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if a role has all specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Check case permission level hierarchy
 */
export function hasMinimumCasePermission(
  userPermission: CasePermission,
  requiredPermission: CasePermission
): boolean {
  const hierarchy: CasePermission[] = ['view', 'comment', 'edit', 'admin']
  return hierarchy.indexOf(userPermission) >= hierarchy.indexOf(requiredPermission)
}

/**
 * User profile type with role info
 */
export interface UserProfile {
  id: string
  role: UserRole
  full_name?: string
  phone?: string
  bar_number?: string
  jurisdiction?: string
  organization_id?: string
  terms_accepted_at?: string
  onboarding_completed: boolean
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

/**
 * Organization type
 */
export interface Organization {
  id: string
  name: string
  slug?: string
  type: 'law_firm' | 'legal_aid' | 'corporate' | 'academic'
  billing_email?: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  subscription_status: 'active' | 'past_due' | 'canceled'
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

/**
 * Case share type
 */
export interface CaseShare {
  id: string
  case_id: string
  shared_with_user_id?: string
  shared_with_email?: string
  permission_level: CasePermission
  shared_by: string
  expires_at?: string
  accepted_at?: string
  created_at: string
}
