import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const baseUrl = request.nextUrl.origin
  return NextResponse.redirect(new URL('/sign-in', baseUrl), {
    status: 302,
  })
}

export async function GET(request: NextRequest) {
  return POST(request)
}
