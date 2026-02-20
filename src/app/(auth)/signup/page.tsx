'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { signUpWithGoogle } from '@/lib/supabase/oauth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Scale, Loader2, Briefcase, FileText, User, Search, HelpCircle } from 'lucide-react'
import { type UserRole, ROLE_INFO } from '@/lib/auth/rbac'

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

const SIGNUP_ROLES: { role: UserRole; icon: React.ReactNode }[] = [
  { role: 'attorney', icon: <Briefcase className="h-5 w-5" /> },
  { role: 'paralegal', icon: <FileText className="h-5 w-5" /> },
  { role: 'client', icon: <User className="h-5 w-5" /> },
  { role: 'researcher', icon: <Search className="h-5 w-5" /> },
]

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="dark min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Loading...</div></div>}>
      <SignupPageContent />
    </Suspense>
  )
}

function SignupPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for OAuth errors in URL params (read once on initial render)
  const errorParam = searchParams.get('error')
  const initialError = errorParam ? decodeURIComponent(errorParam) : null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('attorney')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleSignUp = async () => {
    if (!acceptedTerms) {
      setError('Please accept the Terms of Service to create an account')
      return
    }

    setGoogleLoading(true)
    setError(null)

    const result = await signUpWithGoogle({ redirectTo: '/dashboard' })

    if (!result.success) {
      setError(result.error || 'Google sign-up failed')
      setGoogleLoading(false)
    }
    // If successful, the user will be redirected to Google's auth page
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!acceptedTerms) {
      setError('You must accept the Terms of Service to create an account')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: {
          role: selectedRole,
          terms_accepted_at: new Date().toISOString(),
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Redirect to verify email page
    router.push(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <div id="signup-page-container" className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <Card id="signup-card" className="w-full max-w-md bg-card border-border">
        <CardHeader id="signup-header" className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Scale className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Create Account</CardTitle>
          <CardDescription>Start simulating legal proceedings</CardDescription>
        </CardHeader>

        <CardContent id="signup-form-content" className="space-y-4">
          {error && (
            <div id="signup-error-message" className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-md">
              {error}
            </div>
          )}

          {/* Terms acceptance for OAuth - shown at top for visibility */}
          <div className="flex items-start space-x-2 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="terms-google"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              disabled={loading || googleLoading}
            />
            <label
              htmlFor="terms-google"
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
            >
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Google Sign-Up Button */}
          <Button
            id="btn-google-signup"
            type="button"
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 dark:border-gray-300"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            Sign up with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-signup-email">Email</Label>
              <Input
                id="input-signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="input-signup-password">Password</Label>
              <Input
                id="input-signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="input-signup-confirm">Confirm Password</Label>
              <Input
                id="input-signup-confirm"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  <Label>I am a...</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p>Select your role to customize your CaseCraft experience. This determines your default permissions and dashboard view. You can change this later in settings.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
              <div className="grid grid-cols-2 gap-2">
                {SIGNUP_ROLES.map(({ role, icon }) => (
                  <TooltipProvider key={role}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          disabled={loading || googleLoading}
                          className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                            selectedRole === role
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {icon}
                          <div>
                            <div className="font-medium text-sm">{ROLE_INFO[role].label}</div>
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{ROLE_INFO[role].description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-medium">{ROLE_INFO[selectedRole].label}:</span>{' '}
                {ROLE_INFO[selectedRole].description}
              </p>
            </div>

            <Button
              id="btn-signup-submit"
              type="submit"
              className="w-full"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter id="signup-footer" className="flex flex-col gap-4">
          <Button
            id="btn-beta-bypass"
            type="button"
            variant="outline"
            className="w-full border-dashed border-yellow-600 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
            onClick={() => {
              // Don't use Secure flag — prevents cookie from being set on HTTP (localhost)
              document.cookie = 'beta_bypass=true; path=/; SameSite=Lax'
              router.push('/dashboard')
            }}
          >
            Beta Bypass (Skip Login)
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="dark min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Loading...</div></div>}>
      <SignupContent />
    </Suspense>
  )
}
