import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Target,
  TrendingUp,
  Award,
  ArrowRight,
  Briefcase,
  BarChart3,
  Percent,
  Trophy,
  Eye,
  Scale,
  Zap,
} from 'lucide-react'

export default function PredictionsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">Predictions</h1>
            <p className="text-muted-foreground">AI-powered case outcome predictions and analytics</p>
          </div>
        </div>
        <Link href="/dashboard/cases">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Select a Case
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Predictions</p>
                <p className="text-3xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                <p className="text-3xl font-bold">--%</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
                <Percent className="h-5 w-5" />
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
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blind Tests</p>
                <p className="text-3xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-500">
                <Eye className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blind Test Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle className="font-serif">Blind Test Leaderboard</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </div>
          <CardDescription>
            Track how CaseCraft&apos;s predictions compare against actual case outcomes.
            Import resolved cases to validate AI accuracy and build confidence in predictions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 p-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
              <div className="col-span-2">Case Name</div>
              <div>Predicted</div>
              <div>Actual</div>
              <div className="text-right">Accuracy</div>
            </div>
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Award className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">No Blind Test Results Yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Import a case with a known outcome to run a blind test and see how CaseCraft performs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Features */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Multi-Agent Predictions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our prediction engine uses multiple AI agents analyzing your case from different
              perspectives -- plaintiff, defendant, and neutral -- to generate balanced,
              well-reasoned outcome predictions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Utah Jurisdiction Focus</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Predictions are calibrated for Utah state and federal courts, incorporating
              local rules, judicial tendencies, and jurisdiction-specific precedent to
              deliver the most relevant analysis.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h3 className="text-lg font-semibold font-serif">Generate a Prediction</h3>
              <p className="text-sm text-muted-foreground">
                Select a case to run AI-powered outcome predictions. The more case details,
                documents, and claims you provide, the more accurate the prediction.
              </p>
            </div>
            <Link href="/dashboard/cases">
              <Button className="gap-2">
                Select a Case
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
