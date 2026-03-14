import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  BarChart3,
  Shield,
  AlertTriangle,
  GitCompare,
  ArrowRight,
  Briefcase,
  TrendingUp,
  Scale,
} from 'lucide-react'

export default function AnalysisPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">Analysis</h1>
            <p className="text-muted-foreground">AI-powered legal analysis and case evaluation tools</p>
          </div>
        </div>
        <Link href="/dashboard/cases">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Select a Case
          </Button>
        </Link>
      </div>

      {/* Analysis Tools Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Case Strength Analysis */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Case Strength Analysis</CardTitle>
            <CardDescription>
              Evaluate the overall strength of your legal position with AI-driven scoring across
              multiple dimensions including evidence quality, legal precedent, and procedural posture.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Multi-factor scoring algorithm</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Scale className="h-3.5 w-3.5" />
                <span>Utah jurisdiction-aware analysis</span>
              </div>
              <Link href="/dashboard/cases">
                <Button className="w-full gap-2 mt-2" variant="outline">
                  Select a Case to Analyze
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Weakness Detection */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Weakness Detection</CardTitle>
            <CardDescription>
              Identify potential vulnerabilities in your case before opposing counsel does.
              Get actionable recommendations to address or mitigate each weakness.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Proactive vulnerability scanning</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>Mitigation recommendations</span>
              </div>
              <Link href="/dashboard/weaknesses">
                <Button className="w-full gap-2 mt-2" variant="outline">
                  Open Weakness Analysis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Analysis */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <GitCompare className="h-5 w-5 text-blue-500" />
              </div>
              <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs border-0">Coming Soon</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Comparative Analysis</CardTitle>
            <CardDescription>
              Compare your case against similar matters to benchmark strategies, outcomes, and
              identify patterns that can inform your litigation approach.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GitCompare className="h-3.5 w-3.5" />
                <span>Cross-case pattern matching</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Historical outcome benchmarking</span>
              </div>
              <Button className="w-full gap-2 mt-2" variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">How Analysis Works</p>
              <p className="text-sm text-muted-foreground">
                CaseBreak.ai uses multi-agent AI analysis to evaluate your cases from multiple perspectives.
                Each analysis considers the specific facts, applicable law, relevant precedent in Utah
                jurisdiction, and the overall litigation landscape to provide actionable insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
