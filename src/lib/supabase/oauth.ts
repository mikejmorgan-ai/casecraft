/**
 * OAuth Utility Functions for CaseCraft
 *
 * This module provides helper functions for OAuth authentication operations
 * using Supabase. Currently supports Google OAuth with extensibility for
 * additional providers.
 *
 * Required Environment Variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 *
 * Google OAuth Configuration (Supabase Dashboard):
 * 1. Navigate to Authentication > Providers > Google
 * 2. Enable the Google provider
 * 3. Enter your Google Cloud Console OAuth credentials:
 *    - Client ID
 *    - Client Secret
 * 4. In Google Cloud Console, add authorized redirect URI:
 *    https://<your-project-ref>.supabase.co/auth/v1/callback
 *
 * Local Development:
 * - Ensure localhost:3000 is added to authorized JavaScript origins in Google Cloud Console
 * - The OAuth callback will redirect to /auth/callback which handles session creation
 */

import { createClient } from './client'
import type { Provider } from '@supabase/supabase-js'

/**
 * Result type for OAuth operations
 */
export interface OAuthResult {
  success: boolean
  error?: string
  url?: string
}

/**
 * Options for OAuth sign-in
 */
export interface OAuthOptions {
  /** URL to redirect to after successful authentication */
  redirectTo?: string
  /** Additional scopes to request from the OAuth provider */
  scopes?: string
  /** Query parameters to pass to the OAuth provider */
  queryParams?: Record<string, string>
}

/**
 * Sign in with Google OAuth
 *
 * Initiates the Google OAuth flow by redirecting the user to Google's
 * authentication page. After successful authentication, the user is
 * redirected back to the application's callback URL.
 *
 * @param options - Configuration options for the OAuth flow
 * @returns Promise resolving to the OAuth result
 *
 * @example
 * ```typescript
 * const result = await signInWithGoogle()
 * if (!result.success) {
 *   console.error(result.error)
 * }
 * ```
 */
export async function signInWithGoogle(options?: OAuthOptions): Promise<OAuthResult> {
  return signInWithOAuth('google', options)
}

/**
 * Sign up with Google OAuth
 *
 * For OAuth providers, sign-up and sign-in use the same flow.
 * If the user doesn't exist, a new account is created automatically.
 *
 * @param options - Configuration options for the OAuth flow
 * @returns Promise resolving to the OAuth result
 */
export async function signUpWithGoogle(options?: OAuthOptions): Promise<OAuthResult> {
  return signInWithGoogle(options)
}

/**
 * Generic OAuth sign-in function
 *
 * Can be used with any OAuth provider supported by Supabase.
 *
 * @param provider - The OAuth provider to use (e.g., 'google', 'github', 'azure')
 * @param options - Configuration options for the OAuth flow
 * @returns Promise resolving to the OAuth result
 */
export async function signInWithOAuth(
  provider: Provider,
  options?: OAuthOptions
): Promise<OAuthResult> {
  try {
    const supabase = createClient()

    // Build the redirect URL
    const redirectTo = options?.redirectTo
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(options.redirectTo)}`
      : `${window.location.origin}/auth/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        scopes: options?.scopes,
        queryParams: options?.queryParams,
      },
    })

    if (error) {
      console.error(`OAuth ${provider} error:`, error.message)
      return {
        success: false,
        error: getOAuthErrorMessage(error.message),
      }
    }

    // If we get here with a URL, the OAuth flow was initiated successfully
    // The user will be redirected to the provider's auth page
    return {
      success: true,
      url: data?.url,
    }
  } catch (err) {
    console.error(`Unexpected OAuth ${provider} error:`, err)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Get user-friendly error messages for common OAuth errors
 */
function getOAuthErrorMessage(errorMessage: string): string {
  const lowerMessage = errorMessage.toLowerCase()

  if (lowerMessage.includes('popup')) {
    return 'The sign-in popup was blocked. Please enable popups for this site.'
  }

  if (lowerMessage.includes('cancelled') || lowerMessage.includes('canceled')) {
    return 'Sign-in was cancelled. Please try again.'
  }

  if (lowerMessage.includes('network')) {
    return 'A network error occurred. Please check your connection and try again.'
  }

  if (lowerMessage.includes('provider')) {
    return 'This sign-in method is not currently available. Please try another method.'
  }

  // Default message
  return errorMessage || 'Sign-in failed. Please try again.'
}

/**
 * Check if OAuth is properly configured
 *
 * This is a utility function to help developers verify their OAuth setup.
 * It checks if the required environment variables are present.
 *
 * @returns Object indicating configuration status
 */
export function checkOAuthConfig(): {
  isConfigured: boolean
  missingVars: string[]
} {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missingVars = requiredVars.filter((v) => !process.env[v])

  return {
    isConfigured: missingVars.length === 0,
    missingVars,
  }
}
