'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type UserRole } from '@/lib/auth/rbac'
import {
  Briefcase,
  FileText,
  Target,
  Play,
  AlertTriangle,
  Plus,
  ArrowRight,
  Upload,
  CheckCircle,
  Scale,
  TrendingUp,
  MessageSquare,
  Users,
  Settings,
  BarChart3,
  Clock,
  Eye,
  Search,
  BookOpen,
  Gavel,
} from 'lucide-react'

// Shared types
interface CaseData {
  id: string
  name: string
  status: string
  case_type: string
  is_blind_test?: boolean
  updated_at: string
}

interface PredictionData {
  id: string
  predicted_outcome: string
  confidence_score: number
  is_correct: boolean | null
  accuracy_score: number | null
  created_at: string
  cases: { name: string } | null
}

interface DashboardProps {
  cases: CaseData[]
  predictions: PredictionData[]
  totalDocs: number
  totalCases: number
  blindTests: number
  avgAccuracy: number
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
          </div>
          <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Action Card Component
function QuickActionCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
        <CardContent className="pt-6">
          <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h3 className="font-semibold group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

// Case List Component
function CaseList({ cases, title, description }: { cases: CaseData[], title: string, description: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Link href="/dashboard/cases">
          <Button variant="ghost" size="sm" className="gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {cases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No cases yet</p>
          </div>
        ) : (
          cases.map((c) => (
            <Link key={c.id} href={`/case/${c.id}`}>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {c.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.case_type} • {new Date(c.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.is_blind_test && (
                    <Badge variant="outline" className="text-xs">Blind Test</Badge>
                  )}
                  <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {c.status}
                  </Badge>
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// ATTORNEY DASHBOARD
// Full access to all features
// ============================================
export function AttorneyDashboard({ cases, predictions, totalDocs, totalCases, blindTests, avgAccuracy }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Attorney Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Full case management, predictions, and litigation intelligence.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/import-test">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Test Case
            </Button>
          </Link>
          <Link href="/dashboard/cases">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cases" value={totalCases} icon={<Briefcase className="h-5 w-5" />} trend="+2 this week" />
        <StatCard title="Documents" value={totalDocs} icon={<FileText className="h-5 w-5" />} trend="Indexed & searchable" />
        <StatCard title="Blind Tests" value={blindTests} icon={<Target className="h-5 w-5" />} trend="Predictions ready" />
        <StatCard title="Avg Accuracy" value={`${avgAccuracy}%`} icon={<TrendingUp className="h-5 w-5" />} trend={avgAccuracy >= 80 ? 'Excellent' : avgAccuracy >= 60 ? 'Good' : 'Needs data'} />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <QuickActionCard title="Run Prediction" description="Analyze case documents and predict outcomes" icon={<Target className="h-6 w-6" />} href="/dashboard/predictions" />
        <QuickActionCard title="Start Simulation" description="Mock trial with AI attorneys and judge" icon={<Play className="h-6 w-6" />} href="/dashboard/simulations" />
        <QuickActionCard title="Find Weaknesses" description="Identify gaps and strategic fixes" icon={<AlertTriangle className="h-6 w-6" />} href="/dashboard/weaknesses" />
      </div>

      {/* Cases and Predictions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CaseList cases={cases} title="Recent Cases" description="Your active litigation matters" />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Predictions</CardTitle>
              <CardDescription>AI outcome analysis results</CardDescription>
            </div>
            <Link href="/dashboard/predictions">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {predictions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No predictions yet</p>
                <Link href="/dashboard/predictions">
                  <Button variant="link" className="mt-2">Run your first prediction</Button>
                </Link>
              </div>
            ) : (
              predictions.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      p.is_correct === true ? 'bg-green-500/10' :
                      p.is_correct === false ? 'bg-red-500/10' :
                      'bg-primary/10'
                    }`}>
                      {p.is_correct === true ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : p.is_correct === false ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Target className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.cases?.name || 'Unknown Case'}</p>
                      <p className="text-xs text-muted-foreground">{p.predicted_outcome} • {p.confidence_score}% confidence</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.accuracy_score !== null && (
                      <Badge variant={p.accuracy_score >= 80 ? 'default' : 'secondary'} className="text-xs">
                        {p.accuracy_score}% accurate
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// PARALEGAL / LEGAL ASSISTANT DASHBOARD
// Case support, document management, research
// ============================================
export function ParalegalDashboard({ cases, totalDocs, totalCases }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Legal Assistant Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Case support, document management, and research tools.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/documents">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Documents
            </Button>
          </Link>
          <Link href="/dashboard/cases">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Cases" value={totalCases} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard title="Documents" value={totalDocs} icon={<FileText className="h-5 w-5" />} trend="Ready for review" />
        <StatCard title="Pending Tasks" value={5} icon={<Clock className="h-5 w-5" />} trend="3 due today" />
        <StatCard title="Research Items" value={12} icon={<Search className="h-5 w-5" />} />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <QuickActionCard title="Document Review" description="Review and annotate case documents" icon={<FileText className="h-6 w-6" />} href="/dashboard/documents" />
        <QuickActionCard title="Run Prediction" description="Analyze outcomes for assigned cases" icon={<Target className="h-6 w-6" />} href="/dashboard/predictions" />
        <QuickActionCard title="Legal Research" description="Search statutes and case law" icon={<BookOpen className="h-6 w-6" />} href="/dashboard/discovery" />
      </div>

      {/* Cases */}
      <CaseList cases={cases} title="Assigned Cases" description="Cases requiring your attention" />
    </div>
  )
}

// ============================================
// CLIENT DASHBOARD
// View-only with case status and communication
// ============================================
export function ClientDashboard({ cases }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Cases</h1>
          <p className="text-muted-foreground mt-1">
            View your case status and communicate with your legal team.
          </p>
        </div>
        <Link href="/dashboard/messages">
          <Button className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Contact Attorney
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Active Cases" value={cases.filter(c => c.status === 'active').length} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard title="Updates" value={3} icon={<Clock className="h-5 w-5" />} trend="New this week" />
        <StatCard title="Messages" value={2} icon={<MessageSquare className="h-5 w-5" />} trend="Unread" />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <QuickActionCard title="View Case Status" description="Check the latest updates on your cases" icon={<Eye className="h-6 w-6" />} href="/dashboard/cases" />
        <QuickActionCard title="Chat with AI Agent" description="Get answers about your case" icon={<MessageSquare className="h-6 w-6" />} href="/dashboard/chat" />
      </div>

      {/* Cases */}
      <CaseList cases={cases} title="Your Cases" description="Current legal matters" />

      {/* Important Notice */}
      <Card className="bg-muted/30 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Need to share documents?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact your attorney directly to securely share any documents related to your case.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// RESEARCHER DASHBOARD
// Read access with prediction capabilities
// ============================================
export function ResearcherDashboard({ cases, predictions, blindTests, avgAccuracy }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Research Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Case analysis, predictions, and legal research tools.
          </p>
        </div>
        <Link href="/import-test">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Import Test Case
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Cases Analyzed" value={cases.length} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard title="Predictions Run" value={predictions.length} icon={<Target className="h-5 w-5" />} />
        <StatCard title="Blind Tests" value={blindTests} icon={<Gavel className="h-5 w-5" />} />
        <StatCard title="Avg Accuracy" value={`${avgAccuracy}%`} icon={<TrendingUp className="h-5 w-5" />} trend={avgAccuracy >= 80 ? 'Excellent' : avgAccuracy >= 60 ? 'Good' : 'Needs data'} />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <QuickActionCard title="Run Prediction" description="Test AI prediction accuracy" icon={<Target className="h-6 w-6" />} href="/dashboard/predictions" />
        <QuickActionCard title="View Analytics" description="Analyze prediction performance" icon={<BarChart3 className="h-6 w-6" />} href="/dashboard/analysis" />
        <QuickActionCard title="Export Data" description="Download research datasets" icon={<FileText className="h-6 w-6" />} href="/dashboard/export" />
      </div>

      {/* Cases and Predictions Side by Side */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CaseList cases={cases} title="Research Cases" description="Cases available for analysis" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prediction Accuracy</CardTitle>
            <CardDescription>Track AI prediction performance</CardDescription>
          </CardHeader>
          <CardContent>
            {predictions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No predictions to analyze yet</p>
                <Link href="/dashboard/predictions">
                  <Button variant="link" className="mt-2">Run your first prediction</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Overall Accuracy</span>
                  <span className="text-2xl font-bold">{avgAccuracy}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Correct</p>
                    <p className="text-xl font-bold text-green-500">
                      {predictions.filter(p => p.is_correct === true).length}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Incorrect</p>
                    <p className="text-xl font-bold text-red-500">
                      {predictions.filter(p => p.is_correct === false).length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// ADMIN DASHBOARD
// Full system access with user management
// ============================================
export function AdminDashboard({ totalDocs, totalCases, avgAccuracy }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            System administration and analytics overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/users">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cases" value={totalCases} icon={<Briefcase className="h-5 w-5" />} trend="All users" />
        <StatCard title="Documents" value={totalDocs} icon={<FileText className="h-5 w-5" />} trend="Total indexed" />
        <StatCard title="Active Users" value={15} icon={<Users className="h-5 w-5" />} trend="This month" />
        <StatCard title="System Accuracy" value={`${avgAccuracy}%`} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <QuickActionCard title="User Management" description="Add, edit, and manage users" icon={<Users className="h-6 w-6" />} href="/admin/users" />
        <QuickActionCard title="System Analytics" description="View platform usage stats" icon={<BarChart3 className="h-6 w-6" />} href="/admin/analytics" />
        <QuickActionCard title="Billing" description="Manage subscriptions" icon={<FileText className="h-6 w-6" />} href="/admin/billing" />
        <QuickActionCard title="Settings" description="Configure system options" icon={<Settings className="h-6 w-6" />} href="/admin/settings" />
      </div>

      {/* Activity Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>System-wide activity log</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { action: 'New user registered', user: 'john@example.com', time: '2 hours ago' },
              { action: 'Case created', user: 'sarah@firm.com', time: '4 hours ago' },
              { action: 'Prediction completed', user: 'mike@legal.co', time: '5 hours ago' },
              { action: 'Documents uploaded', user: 'anna@law.com', time: '1 day ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
            <CardDescription>Platform status and metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
              <span className="text-sm font-medium">API Status</span>
              <Badge className="bg-green-500">Operational</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
              <span className="text-sm font-medium">Database</span>
              <Badge className="bg-green-500">Healthy</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
              <span className="text-sm font-medium">Vector Store</span>
              <Badge className="bg-green-500">Connected</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm font-medium">2.4 GB / 10 GB</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// DASHBOARD SELECTOR
// Renders the appropriate dashboard based on role
// ============================================
export function RoleDashboard({ role, ...props }: { role: UserRole } & DashboardProps) {
  switch (role) {
    case 'attorney':
      return <AttorneyDashboard {...props} />
    case 'paralegal':
      return <ParalegalDashboard {...props} />
    case 'client':
      return <ClientDashboard {...props} />
    case 'researcher':
      return <ResearcherDashboard {...props} />
    case 'admin':
      return <AdminDashboard {...props} />
    default:
      return <AttorneyDashboard {...props} />
  }
}
