import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ImportBlindTest } from '@/components/cases/import-blind-test'

export default async function ImportTestPage() {
  const supabase = await createServerSupabase()
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user && !hasBetaBypass) redirect('/login')

  return (
    <div className="min-h-screen bg-[var(--color-legal-cream)]">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-serif font-bold">Import Blind Test Case</h1>
          <p className="text-gray-300 mt-1">
            Import an adjudicated case to test prediction accuracy
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        <ImportBlindTest />
      </main>
    </div>
  )
}
