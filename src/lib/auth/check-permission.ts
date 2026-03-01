// Permission checking is now handled by clerk.ts
// This file is kept for backwards compatibility.
// See src/lib/auth/clerk.ts for the new implementation.
export { getUserProfile, checkPermission, checkCaseAccess, requirePermission, requireCaseAccess } from './clerk'
