import Link from "next/link"
import { Scale, Home, ArrowLeft, Search, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
      <div className="text-center space-y-6 max-w-lg" id="notfound-container">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 rounded-full">
            <Scale className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900" id="notfound-title">404</h1>
          <h2 className="text-xl font-medium text-gray-700">Page Not Found</h2>
          <p className="text-gray-500">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col gap-3" id="notfound-links">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="gap-2 w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Homepage
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Search className="h-4 w-4" />
                Features
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                Pricing
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                Contact Us
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
