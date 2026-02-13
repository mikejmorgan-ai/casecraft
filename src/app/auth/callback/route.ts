import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * OAuth Callback Route
 *
 * This route handles the OAuth callback from providers (e.g., Google).
 * After a user authenticates with an OAuth provider, they are redirected
 * here with an authorization code that is exchanged for a session.
 *
 * Required Environment Variables for Google OAuth:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 *
 * Google OAuth Setup (in Supabase Dashboard):
 * 1. Go to Authentication > Providers > Google
 * 2. Enable Google provider
 * 3. Add your Google OAuth credentials:
 *    - Client ID (from Google Cloud Console)
 *    - Client Secret (from Google Cloud Console)
 * 4. Add authorized redirect URI in Google Cloud Console:
 *    https://your-project.supabase.co/auth/v1/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors from the provider
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorMessage = encodeURIComponent(errorDescription || error || 'auth_failed')
    return NextResponse.redirect(`${origin}/login?error=${errorMessage}`)
  }

  if (code) {
    try {
      const supabase = await createServerSupabase()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (!exchangeError) {
        // Successful authentication - redirect to the intended destination
        // Using 302 redirect for temporary redirect after auth
        return NextResponse.redirect(`${origin}${next}`, {
          status: 302,
        })
      }

      // Log the error for debugging (don't expose details to user)
      console.error('Code exchange error:', exchangeError.message)
    } catch (err) {
      console.error('Unexpected error during code exchange:', err)
    }
  }

  // Default: redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
