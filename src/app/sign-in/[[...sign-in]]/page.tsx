import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-card border border-border shadow-lg',
            headerTitle: 'font-serif',
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
          },
        }}
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}
