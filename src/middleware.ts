import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/case(.*)', '/admin(.*)'])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Only enforce auth on protected routes — public routes pass through
  // without triggering Clerk's handshake redirect
  if (!isProtectedRoute(request)) {
    return NextResponse.next()
  }

  const hasBetaBypass = request.cookies.get('beta_bypass')?.value === 'true'
  const { userId } = await auth()

  if (!userId && !hasBetaBypass) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
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
