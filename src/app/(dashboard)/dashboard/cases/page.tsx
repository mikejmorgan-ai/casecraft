import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  Plus,
  Scale,
  FileText,
  Target,
} from 'lucide-react'
import { CasesListClient } from '@/components/cases/cases-list-client'
import { getUserProfile } from '@/lib/auth/check-permission'
import { hasPermission } from '@/lib/auth/rbac'

export default async function CasesPage() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user profile for permissions
  const profile = await getUserProfile()
  const userRole = profile?.role || 'attorney'
  const canCreateCase = hasPermission(userRole, 'cases:create')

  // Fetch cases with counts
  const { data: cases, error } = await supabase
    .from('cases')
    .select(`
      *,
      agents(count),
      documents(count),
      conversations(count),
      case_predictions(count)
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching cases:', error)
  }

  const casesList = cases || []

  // Calculate stats
  const totalCases = casesList.length
  const activeCases = casesList.filter(c => c.status === 'active').length
  const draftCases = casesList.filter(c => c.status === 'draft').length
  const blindTests = casesList.filter(c => c.is_blind_test).length

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cases</h1>
          <p className="text-muted-foreground mt-1">
            Manage your litigation matters and case files
          </p>
        </div>
        {canCreateCase && (
          <Link href="/dashboard/cases/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Case
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cases</p>
                <p className="text-2xl font-bold">{totalCases}</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeCases}</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500">
                <Scale className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{draftCases}</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-orange-500/10 text-orange-500">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blind Tests</p>
                <p className="text-2xl font-bold">{blindTests}</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
                <Target className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases List with Client-Side Filtering */}
      <CasesListClient cases={casesList} canCreateCase={canCreateCase} />
    </div>
  )
}
