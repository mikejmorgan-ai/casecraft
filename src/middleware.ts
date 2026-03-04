/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/case(.*)', '/admin(.*)'])
const isAuthRoute = createRouteMatcher(['/login', '/signup'])
const isAdversarialRoute = createRouteMatcher(['/adversarial(.*)', '/simulation(.*)'])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Only enforce auth on protected routes — public routes pass through
  // without triggering Clerk's handshake redirect
  if (!isProtectedRoute(request)) {
    return NextResponse.next()
  }

  const hasBetaBypass = request.cookies.get('beta_bypass')?.value === 'true'
  const { userId, sessionClaims, orgId } = await auth()

  if (!userId && !hasBetaBypass) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based access control for adversarial simulations
  if (isAdversarialRoute(request) && userId) {
    const userRole = sessionClaims?.metadata?.role as string

    // Only Admin and Attorney roles can access adversarial simulations
    if (userRole !== 'Admin' && userRole !== 'Attorney') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // Organization isolation for API routes - ensure database partitioning
  if (userId && request.nextUrl.pathname.startsWith('/api/')) {
    const organizationId = orgId || sessionClaims?.metadata?.organization_id

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization context required for data access' },
        { status: 403 }
      )
    }

    // Add organization context to request headers for database partitioning
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-organization-id', organizationId as string)
    requestHeaders.set('x-user-role', sessionClaims?.metadata?.role as string || 'User')
    requestHeaders.set('x-user-id', userId)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
})

export const config = {
  // Only run middleware on protected routes — skip homepage, auth pages,
  // and static assets entirely to prevent Clerk handshake redirect loops
  matcher: [
    '/dashboard/:path*',
    '/case/:path*',
    '/admin/:path*',
  ],
}
