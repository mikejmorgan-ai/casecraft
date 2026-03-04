import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scale, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Scale className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold font-serif text-foreground">404</h1>
          <h2 className="text-xl font-medium text-foreground">Case Not Found</h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            This matter has been dismissed.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Home Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
