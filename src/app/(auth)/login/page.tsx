import { Suspense } from 'react'
import { SignIn } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

function LoginPage() {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-card border-border shadow-lg',
          },
        }}
        routing="hash"
        signUpUrl="/signup"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  )
}
