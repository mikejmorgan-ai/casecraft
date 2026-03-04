import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  FileText,
  Upload,
  Clock,
  Loader2,
  Briefcase,
  ArrowRight,
  FolderOpen,
  FileSearch,
  FilePlus,
} from 'lucide-react'

export default function DocumentsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">Documents</h1>
            <p className="text-muted-foreground">Cross-case document library and management</p>
          </div>
        </div>
        <Link href="/dashboard/cases">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Go to Cases
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-3xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <FolderOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Uploads</p>
                <p className="text-3xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500">
                <Upload className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-3xl font-bold">--</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-orange-500/10 text-orange-500">
                <Loader2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Document Library</CardTitle>
          <CardDescription>
            Access and manage documents across all your cases from one central location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 bg-muted/50 rounded-full">
              <FileSearch className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-semibold">Select a Case to View Documents</h3>
              <p className="text-sm text-muted-foreground">
                Documents are organized by case. Navigate to a specific case to view, upload,
                and manage its associated documents, exhibits, and filings.
              </p>
            </div>
            <Link href="/dashboard/cases">
              <Button className="gap-2 mt-2">
                Browse Cases
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Document Types */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm">Pleadings & Motions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Complaints, answers, motions, briefs, and other court filings organized by case.
            </p>
            <Badge variant="secondary" className="mt-3 text-xs">Case-specific</Badge>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FilePlus className="h-4 w-4 text-green-500" />
              <CardTitle className="text-sm">Discovery Materials</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Interrogatories, depositions, requests for production, and document productions.
            </p>
            <Badge variant="secondary" className="mt-3 text-xs">Case-specific</Badge>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <CardTitle className="text-sm">Exhibits & Evidence</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Trial exhibits, demonstrative evidence, expert reports, and supporting documentation.
            </p>
            <Badge variant="secondary" className="mt-3 text-xs">Case-specific</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
