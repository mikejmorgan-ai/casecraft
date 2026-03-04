import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Search,
  ArrowRight,
  Briefcase,
  FolderOpen,
  Hash,
  Package,
  FileText,
  Filter,
  Tag,
  CheckSquare,
  ClipboardList,
} from 'lucide-react'

export default function DiscoveryPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">Discovery</h1>
            <p className="text-muted-foreground">Document organization, review, and production tools</p>
          </div>
        </div>
        <Link href="/dashboard/cases">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Select a Case
          </Button>
        </Link>
      </div>

      {/* Discovery Tools */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Document Organization */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FolderOpen className="h-5 w-5 text-blue-500" />
              </div>
              <Badge variant="secondary" className="text-xs">Core Tool</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Document Organization</CardTitle>
            <CardDescription>
              Organize and categorize discovery documents using AI-assisted tagging and classification.
              Automatically group related documents and identify key materials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span>AI-powered document classification</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                <span>Smart tagging and categorization</span>
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

        {/* Bates Numbering */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Hash className="h-5 w-5 text-green-500" />
              </div>
              <Badge variant="secondary" className="text-xs">Core Tool</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Bates Numbering</CardTitle>
            <CardDescription>
              Apply consistent Bates numbering to your production documents. Manage numbering
              sequences, apply stamps, and maintain a master index of all numbered documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                <span>Sequential numbering management</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClipboardList className="h-3.5 w-3.5" />
                <span>Master index generation</span>
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

        {/* Production Sets */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
              <Badge variant="secondary" className="text-xs">Core Tool</Badge>
            </div>
            <CardTitle className="font-serif mt-3">Production Sets</CardTitle>
            <CardDescription>
              Create and manage document production sets for discovery responses. Track what has
              been produced, withheld, or designated as privileged with privilege log generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                <span>Production tracking & management</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span>Privilege log generation</span>
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

      {/* Discovery Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Discovery Workflow</CardTitle>
          <CardDescription>
            CaseBrake.ai streamlines the discovery process from collection through production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col items-center text-center space-y-2 p-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                1
              </div>
              <p className="text-sm font-medium">Collect</p>
              <p className="text-xs text-muted-foreground">
                Upload and ingest documents from multiple sources
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2 p-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                2
              </div>
              <p className="text-sm font-medium">Review</p>
              <p className="text-xs text-muted-foreground">
                AI-assisted review for relevance and privilege
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2 p-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                3
              </div>
              <p className="text-sm font-medium">Organize</p>
              <p className="text-xs text-muted-foreground">
                Categorize, tag, and apply Bates numbering
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-2 p-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                4
              </div>
              <p className="text-sm font-medium">Produce</p>
              <p className="text-xs text-muted-foreground">
                Generate production sets with logs
              </p>
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
                <p className="text-sm font-medium">Start Managing Discovery</p>
                <p className="text-sm text-muted-foreground">
                  Select a case to access its discovery workspace. Upload documents, manage review,
                  and prepare productions all in one place.
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
