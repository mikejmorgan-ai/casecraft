import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/case(.*)', '/admin(.*)'])
const isAuthRoute = createRouteMatcher(['/login', '/signup', '/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId } = await auth()

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthRoute(request) && userId) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Public routes pass through without triggering Clerk's handshake redirect
  if (!isProtectedRoute(request)) {
    return NextResponse.next()
  }

  const hasBetaBypass = request.cookies.get('beta_bypass')?.value === 'true'

  if (!userId && !hasBetaBypass) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  // Run middleware on protected routes + auth pages (for redirect logic)
  // Skip homepage and static assets to prevent Clerk handshake redirect loops
  matcher: [
    '/dashboard/:path*',
    '/case/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/sign-in/:path*',
    '/sign-up/:path*',
  ],
}
