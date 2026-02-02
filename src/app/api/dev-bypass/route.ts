import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set('dev_bypass', 'true', {
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  return NextResponse.json({ success: true })
}
