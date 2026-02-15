'use client'

import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailPageContent />
    </Suspense>
  )
}

function VerifyEmailPageContent() {
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const verificationAttempted = useRef(false)

  const verifyEmail = useCallback(async (tokenHash: string) => {
    setStatus('verifying')
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    })

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('success')
      setMessage('Email verified successfully!')
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }, [router])

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (tokenHash && type === 'email' && !verificationAttempted.current) {
      verificationAttempted.current = true
      // Schedule outside effect to avoid synchronous setState warning
      setTimeout(() => verifyEmail(tokenHash), 0)
    }
  }, [searchParams, verifyEmail])

  const resendVerification = async () => {
    if (!email) return

    setResending(true)
    const supabase = createClient()

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Verification email resent! Check your inbox.')
    }
    setResending(false)
  }

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              {status === 'success' ? (
                <CheckCircle className="h-8 w-8 text-primary-foreground" />
              ) : status === 'error' ? (
                <AlertCircle className="h-8 w-8 text-primary-foreground" />
              ) : status === 'verifying' ? (
                <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
              ) : (
                <Mail className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">
            {status === 'success' ? 'Email Verified!' :
             status === 'error' ? 'Verification Failed' :
             status === 'verifying' ? 'Verifying...' :
             'Check Your Email'}
          </CardTitle>
          <CardDescription>
            {status === 'success' ? 'Redirecting to dashboard...' :
             status === 'error' ? message :
             status === 'verifying' ? 'Please wait while we verify your email' :
             `We sent a verification link to ${email || 'your email'}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'pending' && (
            <>
              <div className="text-center text-sm text-muted-foreground">
                <p>Click the link in the email to verify your account.</p>
                <p className="mt-2">Didn&apos;t receive the email? Check your spam folder.</p>
              </div>

              {message && (
                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md text-center">
                  {message}
                </div>
              )}
            </>
          )}

          {status === 'error' && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md text-center">
              {message || 'Something went wrong. Please try again.'}
            </div>
          )}

          {status === 'success' && (
            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md text-center">
              Your email has been verified. Welcome to CaseCraft!
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {status === 'pending' && email && (
            <Button
              variant="outline"
              className="w-full"
              onClick={resendVerification}
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          )}

          {status === 'error' && (
            <Button
              className="w-full"
              onClick={() => router.push('/signup')}
            >
              Try Again
            </Button>
          )}

          <p className="text-sm text-muted-foreground text-center">
            <Link href="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
