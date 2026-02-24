import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Shield,
  Search,
  FileWarning,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export default function WeaknessesPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">Weakness Analysis</h1>
            <p className="text-muted-foreground">Identify and address vulnerabilities in your cases</p>
          </div>
        </div>
        <Link href="/dashboard/cases">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Select a Case
          </Button>
        </Link>
      </div>

      {/* Description Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">How Weakness Analysis Works</CardTitle>
          <CardDescription>
            Our AI examines your case from the opposing counsel&apos;s perspective to uncover potential vulnerabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Search className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-sm">1. Deep Analysis</h3>
              <p className="text-xs text-muted-foreground">
                AI agents review all case materials, claims, evidence, and legal arguments to identify
                gaps and inconsistencies.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="p-3 bg-orange-500/10 rounded-full">
                <FileWarning className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-sm">2. Weakness Identification</h3>
              <p className="text-xs text-muted-foreground">
                Each potential weakness is categorized by severity, type, and potential impact on
                your case outcome.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-sm">3. Mitigation Strategy</h3>
              <p className="text-xs text-muted-foreground">
                For each weakness, CaseCraft provides actionable recommendations to address,
                mitigate, or preemptively counter the issue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weakness Categories */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Critical Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Issues that could fundamentally undermine your case or lead to adverse rulings.
              These require immediate attention and strategic response.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs">Standing Issues</Badge>
              <Badge variant="outline" className="text-xs">Statute of Limitations</Badge>
              <Badge variant="outline" className="text-xs">Jurisdictional Defects</Badge>
              <Badge variant="outline" className="text-xs">Evidentiary Gaps</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Moderate Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Issues that could weaken your position or provide leverage to opposing counsel.
              These should be addressed proactively in your litigation strategy.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs">Credibility Concerns</Badge>
              <Badge variant="outline" className="text-xs">Conflicting Evidence</Badge>
              <Badge variant="outline" className="text-xs">Precedent Gaps</Badge>
              <Badge variant="outline" className="text-xs">Procedural Risks</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Minor Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Issues to be aware of that are unlikely to be decisive but could be raised by
              opposing counsel. Being prepared strengthens your overall position.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs">Technical Deficiencies</Badge>
              <Badge variant="outline" className="text-xs">Formatting Issues</Badge>
              <Badge variant="outline" className="text-xs">Citation Gaps</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Strategic Considerations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Not weaknesses per se, but strategic factors that could affect litigation approach,
              settlement posture, or resource allocation decisions.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs">Cost Analysis</Badge>
              <Badge variant="outline" className="text-xs">Timeline Risks</Badge>
              <Badge variant="outline" className="text-xs">Settlement Value</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="p-3 bg-orange-500/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h3 className="text-lg font-semibold font-serif">Analyze Your Case Weaknesses</h3>
              <p className="text-sm text-muted-foreground">
                Select a case to run a comprehensive weakness analysis. The AI will examine your case
                from multiple adversarial perspectives and deliver categorized findings with
                actionable mitigation strategies.
              </p>
            </div>
            <Link href="/dashboard/cases">
              <Button className="gap-2">
                Select a Case to Analyze
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
