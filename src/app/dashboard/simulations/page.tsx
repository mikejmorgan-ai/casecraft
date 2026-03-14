import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Play,
  Users,
  Gavel,
  Handshake,
  ArrowRight,
  Briefcase,
  Clock,
  BarChart3,
  MessageSquare,
  Target,
} from 'lucide-react'

export default function SimulationsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Play className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">Simulations</h1>
            <p className="text-muted-foreground">AI-powered hearing and proceeding simulations</p>
          </div>
        </div>
        <Link href="/dashboard/cases">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Select a Case
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Simulations</p>
                <p className="text-3xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Play className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Duration</p>
                <p className="text-3xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Insights Generated</p>
                <p className="text-3xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Types */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mock Hearings */}
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-all group-hover:bg-primary/10" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Gavel className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">Interactive</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Mock Hearings</CardTitle>
            <CardDescription>
              Practice oral arguments before an AI judge. Get real-time feedback on your
              presentation, objection handling, and persuasiveness in a simulated courtroom
              environment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Real-time AI judicial responses</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                <span>Performance scoring & feedback</span>
              </div>
            </div>
            <Link href="/dashboard/cases">
              <Button className="w-full gap-2" variant="outline">
                Select a Case to Begin
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Depositions */}
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full transition-all group-hover:bg-blue-500/10" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <Badge variant="secondary" className="text-xs">Interactive</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Depositions</CardTitle>
            <CardDescription>
              Simulate deposition sessions with AI witnesses. Prepare your questioning strategy,
              test different approaches, and identify areas requiring further investigation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>AI-generated witness personas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Timed practice sessions</span>
              </div>
            </div>
            <Link href="/dashboard/cases">
              <Button className="w-full gap-2" variant="outline">
                Select a Case to Begin
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Mediations */}
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full transition-all group-hover:bg-green-500/10" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <Handshake className="h-5 w-5 text-green-500" />
              </div>
              <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs border-0">Coming Soon</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Mediations</CardTitle>
            <CardDescription>
              Practice mediation and settlement negotiation scenarios. Test different strategies,
              evaluate settlement ranges, and prepare for alternative dispute resolution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Handshake className="h-3.5 w-3.5" />
                <span>Settlement range modeling</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Negotiation strategy analysis</span>
              </div>
            </div>
            <Button className="w-full gap-2" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Ready to Practice?</p>
                <p className="text-sm text-muted-foreground">
                  Select a case from your active matters to start a simulation session.
                  Each simulation is tailored to your specific case facts and legal issues.
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
