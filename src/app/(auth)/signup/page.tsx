import { Suspense } from 'react'
import { SignUp } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

function SignupPage() {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-card border-border shadow-lg',
          },
        }}
        routing="hash"
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}

export default function SignupPageWrapper() {
  return (
    <Suspense fallback={null}>
      <SignupPage />
    </Suspense>
  )
}
