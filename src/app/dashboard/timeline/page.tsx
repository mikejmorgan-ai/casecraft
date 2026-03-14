import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  History,
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Gavel,
  AlertCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react'

export default function TimelinePage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">Timeline</h1>
            <p className="text-muted-foreground">Visual case timeline and milestone tracking</p>
          </div>
        </div>
        <Link href="/dashboard/cases">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Select a Case
          </Button>
        </Link>
      </div>

      {/* Timeline Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Case Timeline</CardTitle>
          <CardDescription>
            Track key events, deadlines, filings, and milestones for each case
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Sample Timeline Visualization */}
          <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-border">
            {/* Sample Event 1 */}
            <div className="relative">
              <div className="absolute -left-8 top-1 flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 border-2 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              </div>
              <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">Filing</Badge>
                  <span className="text-xs text-muted-foreground">Sample Event</span>
                </div>
                <p className="text-sm font-medium">Complaint Filed</p>
                <p className="text-xs text-muted-foreground mt-1">Initial complaint and summons filed with the court</p>
              </div>
            </div>

            {/* Sample Event 2 */}
            <div className="relative">
              <div className="absolute -left-8 top-1 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 border-2 border-blue-500/30">
                <FileText className="h-3 w-3 text-blue-500" />
              </div>
              <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">Discovery</Badge>
                  <span className="text-xs text-muted-foreground">Sample Event</span>
                </div>
                <p className="text-sm font-medium">Discovery Requests Served</p>
                <p className="text-xs text-muted-foreground mt-1">Interrogatories and requests for production served on all parties</p>
              </div>
            </div>

            {/* Sample Event 3 */}
            <div className="relative">
              <div className="absolute -left-8 top-1 flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/10 border-2 border-orange-500/30">
                <AlertCircle className="h-3 w-3 text-orange-500" />
              </div>
              <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">Deadline</Badge>
                  <span className="text-xs text-muted-foreground">Sample Event</span>
                </div>
                <p className="text-sm font-medium">Motion Deadline</p>
                <p className="text-xs text-muted-foreground mt-1">Deadline for dispositive motions approaching</p>
              </div>
            </div>

            {/* Sample Event 4 */}
            <div className="relative">
              <div className="absolute -left-8 top-1 flex items-center justify-center w-6 h-6 rounded-full bg-muted border-2 border-muted-foreground/20">
                <Circle className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">Hearing</Badge>
                  <span className="text-xs text-muted-foreground">Sample Event</span>
                </div>
                <p className="text-sm font-medium">Oral Argument Scheduled</p>
                <p className="text-xs text-muted-foreground mt-1">Hearing on pending motions before the court</p>
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div className="mt-6 flex flex-col items-center justify-center py-4 text-center space-y-3 bg-gradient-to-t from-background via-background/80 to-transparent -mt-16 pt-20 relative">
            <p className="text-sm text-muted-foreground">
              This is a preview. Select a case to see its actual timeline.
            </p>
            <Link href="/dashboard/cases">
              <Button className="gap-2">
                Select a Case
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Event Types */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FileText className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Filings</p>
                <p className="text-xs text-muted-foreground">Court filings and submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Calendar className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Deadlines</p>
                <p className="text-xs text-muted-foreground">Important due dates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Gavel className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Hearings</p>
                <p className="text-xs text-muted-foreground">Court appearances and arguments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Clock className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Milestones</p>
                <p className="text-xs text-muted-foreground">Key case developments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
