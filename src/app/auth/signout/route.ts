import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createServerSupabase()

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Signout error:', error)
      // Still redirect to login even if there's an error
    }

    // Redirect to login page
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), {
      status: 302,
    })
  } catch (err) {
    console.error('Signout error:', err)
    // Redirect to login even on error
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), {
      status: 302,
    })
  }
}

// Also support GET for direct navigation
export async function GET() {
  return POST()
}
