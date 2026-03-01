import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-card border-border shadow-lg',
          },
        }}
        routing="path"
        path="/login"
        signUpUrl="/signup"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}
