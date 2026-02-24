// RBAC Types and Utilities
export {
  type UserRole,
  type OrgRole,
  type CasePermission,
  type Permission,
  type UserProfile,
  type Organization,
  type CaseShare,
  ROLE_PERMISSIONS,
  ROLE_INFO,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissions,
  hasMinimumCasePermission,
} from './rbac'

// Clerk-based Auth Utilities
export {
  getSupabase,
  getAuthUserId,
  requireAuth,
  getUserProfile,
  getUserRole,
  checkPermission,
  requirePermission,
  checkCaseAccess,
  requireCaseAccess,
} from './clerk'
