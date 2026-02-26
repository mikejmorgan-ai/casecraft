import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/case(.*)'])
const isAuthRoute = createRouteMatcher(['/login', '/signup'])

export default async function middleware(request: NextRequest) {
  const hasBetaBypass = request.cookies.get('beta_bypass')?.value === 'true'

  try {
    return await clerkMiddleware(async (auth, req: NextRequest) => {
      const { userId } = await auth()

      if (isProtectedRoute(req) && !userId && !hasBetaBypass) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }

      if (isAuthRoute(req) && userId) {
        const url = req.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }

      return NextResponse.next()
    })(request, {} as any)
  } catch {
    if (isProtectedRoute(request) && !hasBetaBypass) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
