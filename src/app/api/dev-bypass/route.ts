import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  const cookieStore = await cookies()
  cookieStore.set('dev_bypass', 'true', {
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
  })

  return NextResponse.json({ success: true })
}
