import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Scale,
  ArrowRight,
  Briefcase,
  FileText,
  Clock,
  Users,
  Shield,
  BookOpen,
  CheckSquare,
  AlertTriangle,
  Calendar,
  ScrollText,
} from 'lucide-react'

export default function Rule26Page() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">Rule 26 Discovery Management</h1>
            <p className="text-muted-foreground">Disclosure tracking, deadline management, and compliance tools</p>
          </div>
        </div>
        <Link href="/dashboard/cases">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Select a Case
          </Button>
        </Link>
      </div>

      {/* Rule 26 Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Initial Disclosures */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <Badge variant="secondary" className="text-xs">26(a)(1)</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Initial Disclosures</CardTitle>
            <CardDescription>
              Track witnesses, documents, damage computations, and insurance agreements.
              Manage both federal and Utah initial disclosure requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>Witness identification & subjects</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span>Document & ESI disclosure</span>
              </div>
            </div>
            <Link href="/dashboard/cases">
              <Button className="w-full gap-2" variant="outline">
                Select a Case
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Expert Disclosures */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <Badge variant="secondary" className="text-xs">26(a)(2)</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Expert Disclosures</CardTitle>
            <CardDescription>
              Manage expert witness reports, qualifications, compensation, and deposition tracking.
              Supports retained and non-retained expert requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ScrollText className="h-3.5 w-3.5" />
                <span>Report content compliance</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Sequential deadline tracking</span>
              </div>
            </div>
            <Link href="/dashboard/cases">
              <Button className="w-full gap-2" variant="outline">
                Select a Case
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Deadline Engine */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <Badge variant="secondary" className="text-xs">Deadlines</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Deadline Engine</CardTitle>
            <CardDescription>
              Auto-calculated deadlines from key dates. Tracks initial disclosures, expert reports,
              pretrial deadlines, discovery cutoffs, and response due dates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Overdue alerts & reminders</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Completion tracking</span>
              </div>
            </div>
            <Link href="/dashboard/cases">
              <Button className="w-full gap-2" variant="outline">
                Select a Case
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Privilege Log */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <Badge variant="secondary" className="text-xs">26(b)(5)</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Privilege Log</CardTitle>
            <CardDescription>
              Attorney-client privilege, work product, and joint defense tracking.
              Clawback management and privilege waiver monitoring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>Privilege type classification</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span>Automated log generation</span>
              </div>
            </div>
            <Link href="/dashboard/cases">
              <Button className="w-full gap-2" variant="outline">
                Select a Case
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Written Discovery */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-500" />
              </div>
              <Badge variant="secondary" className="text-xs">Discovery</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Written Discovery</CardTitle>
            <CardDescription>
              Track interrogatories, requests for production, and requests for admission.
              Utah tier limit compliance with real-time count tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Interrogatories, RFPs, RFAs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Scale className="h-3.5 w-3.5" />
                <span>Utah tier limit tracking</span>
              </div>
            </div>
            <Link href="/dashboard/cases">
              <Button className="w-full gap-2" variant="outline">
                Select a Case
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Discovery Configuration */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Scale className="h-5 w-5 text-indigo-500" />
              </div>
              <Badge variant="secondary" className="text-xs">Config</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Jurisdiction & Tier Config</CardTitle>
            <CardDescription>
              Configure federal or Utah jurisdiction, set Utah discovery tiers,
              and define key case dates for automatic deadline generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Scale className="h-3.5 w-3.5" />
                <span>Federal / Utah / Custom rules</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Key date configuration</span>
              </div>
            </div>
            <Link href="/dashboard/cases">
              <Button className="w-full gap-2" variant="outline">
                Select a Case
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Supported Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Supported Rule 26 Subsections</CardTitle>
          <CardDescription>
            CaseCraft supports both Federal Rules of Civil Procedure and Utah Rules of Civil Procedure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Federal (FRCP 26)</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>26(a)(1) - Initial Disclosures</p>
                <p>26(a)(2) - Expert Disclosures</p>
                <p>26(a)(3) - Pretrial Disclosures</p>
                <p>26(b) - Discovery Scope & Limits</p>
                <p>26(c) - Protective Orders</p>
                <p>26(d) - Timing & Sequence</p>
                <p>26(e) - Supplementation Duty</p>
                <p>26(f) - Conference of Parties</p>
                <p>26(g) - Signing Requirements</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Utah (URCP 26)</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Tier 1 - $50K or less</p>
                <p>Tier 2 - $50K-$300K</p>
                <p>Tier 3 - Over $300K / injunctive</p>
                <p>Automatic initial disclosures</p>
                <p>Standard written discovery</p>
                <p>Expert election (depo vs report)</p>
                <p>Proportionality requirements</p>
                <p>Extraordinary discovery</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Platform Features</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Auto-calculated deadlines</p>
                <p>Overdue alerts & reminders</p>
                <p>Tier limit compliance tracking</p>
                <p>Privilege log generation</p>
                <p>Supplementation tracking</p>
                <p>Compliance dashboard</p>
                <p>Rule 26(g) certification</p>
                <p>Export & reporting</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Start Managing Rule 26 Compliance</p>
                <p className="text-sm text-muted-foreground">
                  Select a case to configure jurisdiction, set deadlines, and begin tracking
                  disclosure obligations under Rule 26.
                </p>
              </div>
            </div>
            <Link href="/dashboard/cases" className="shrink-0">
              <Button className="gap-2">
                Go to Cases
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
