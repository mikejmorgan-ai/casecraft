import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Users,
  Briefcase,
  Target,
  TrendingUp,
  Activity,
  Clock,
  FileText,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">Analytics</h1>
            <p className="text-muted-foreground">Platform usage metrics and performance insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Last 30 days</Badge>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold">--</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">--% from last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cases Created</p>
                <p className="text-3xl font-bold">--</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">--% from last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Predictions Run</p>
                <p className="text-3xl font-bold">--</p>
                <div className="flex items-center gap-1 mt-1">
                  <Minus className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">No change</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-500">
                <Target className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                <p className="text-3xl font-bold">--%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-500">Needs more data</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-orange-500/10 text-orange-500">
                <Percent className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-serif">Usage Trends</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">30 days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Placeholder Chart Area */}
            <div className="h-48 flex items-center justify-center border border-dashed rounded-lg bg-muted/20">
              <div className="text-center space-y-2">
                <BarChart3 className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                <p className="text-xs text-muted-foreground">Usage chart will appear here</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold">--</p>
                <p className="text-xs text-muted-foreground">Daily Avg</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">--</p>
                <p className="text-xs text-muted-foreground">Peak Users</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">--</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-serif">Feature Usage</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">30 days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Case Management', percentage: 85, color: 'bg-blue-500' },
                { name: 'Document Upload', percentage: 72, color: 'bg-green-500' },
                { name: 'AI Predictions', percentage: 65, color: 'bg-purple-500' },
                { name: 'Weakness Analysis', percentage: 48, color: 'bg-orange-500' },
                { name: 'Simulations', percentage: 30, color: 'bg-pink-500' },
                { name: 'Blind Tests', percentage: 18, color: 'bg-cyan-500' },
              ].map((feature) => (
                <div key={feature.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{feature.name}</span>
                    <span className="text-muted-foreground">{feature.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${feature.color} opacity-70`}
                      style={{ width: `${feature.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-sm font-medium">Documents</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Uploaded</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processed</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg. per Case</span>
                <span className="font-medium">--</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Target className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm font-medium">Predictions</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Generated</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Blind Tests</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg. Confidence</span>
                <span className="font-medium">--%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Clock className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-sm font-medium">Performance</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg. Response Time</span>
                <span className="font-medium">-- ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">AI Processing Time</span>
                <span className="font-medium">-- s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-medium">--%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Detailed Analytics Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Full analytics dashboards with interactive charts, custom date ranges, exportable reports,
                and granular usage breakdowns by user, team, and practice area are under development.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
