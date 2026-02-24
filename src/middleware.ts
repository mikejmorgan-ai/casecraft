import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/case(.*)'])
const isAuthRoute = createRouteMatcher(['/login', '/signup'])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const hasBetaBypass = request.cookies.get('beta_bypass')?.value === 'true'
  const { userId } = await auth()

  // Protect dashboard and case routes
  if (isProtectedRoute(request) && !userId && !hasBetaBypass) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(request) && userId) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
