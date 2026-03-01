import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Scale } from 'lucide-react'

export default function ResetPasswordPage() {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Scale className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Reset Password</CardTitle>
          <CardDescription>
            Password reset is handled through the sign-in page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/login" className="text-primary hover:underline">
            Go to Sign In
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
