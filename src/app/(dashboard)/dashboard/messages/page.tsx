import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  MessageSquare,
  Users,
  Bell,
  ArrowRight,
  Briefcase,
  Mail,
  UserPlus,
  AtSign,
  Share2,
} from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">Messages</h1>
            <p className="text-muted-foreground">Team collaboration and case communications</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" disabled>
            <UserPlus className="h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="relative">
              <div className="p-4 bg-muted/50 rounded-full">
                <Mail className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <div className="absolute -top-1 -right-1 p-1.5 bg-primary/10 rounded-full">
                <Bell className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-semibold font-serif">No Messages Yet</h3>
              <p className="text-sm text-muted-foreground">
                Your inbox is empty. When team members share cases, leave comments, or send
                updates, they will appear here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Collaboration Features */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs border-0">Coming Soon</Badge>
            <CardTitle className="text-sm">Collaboration Features</CardTitle>
          </div>
          <CardDescription>
            Enhanced team collaboration tools are on the roadmap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
              <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                <AtSign className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">@Mentions</p>
                <p className="text-xs text-muted-foreground">
                  Tag colleagues in case notes and analysis to get their input directly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
              <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                <Share2 className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Case Sharing</p>
                <p className="text-xs text-muted-foreground">
                  Share case insights, predictions, and analysis with team members securely.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
              <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
                <Users className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Team Channels</p>
                <p className="text-xs text-muted-foreground">
                  Organize team discussions by practice area, case, or project.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Link */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                In the meantime, you can collaborate by sharing cases directly from the case detail page.
              </p>
            </div>
            <Link href="/dashboard/cases" className="shrink-0">
              <Button variant="outline" className="gap-2">
                View Cases
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
