import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.set('dev_bypass', 'true', {
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  const url = new URL('/dashboard', request.url)
  return NextResponse.redirect(url)
}
