import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), {
    status: 302,
  })
}

export async function GET() {
  return POST()
}
