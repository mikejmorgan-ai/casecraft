import { createServerSupabase } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, FileText, MessageSquare, Scale, ClipboardList, Gavel } from 'lucide-react'
import { CaseSharing } from '@/components/cases/case-sharing'
import { AgentsList } from '@/components/agents/agents-list'
import { DocumentsList } from '@/components/documents/documents-list'
import { DocumentUpload } from '@/components/documents/document-upload'
import { PineconeImport } from '@/components/documents/pinecone-import'
import { GoogleDocsImport } from '@/components/documents/google-docs-import'
import { ConversationsList } from '@/components/chat/conversations-list'
import { FactsList } from '@/components/facts/facts-list'
import { HearingRunner } from '@/components/hearing/hearing-runner'
import { CaseStrengthMeter } from '@/components/cases/case-strength-meter'
import { TurboSimulator } from '@/components/cases/turbo-simulator'
import { CaseActions } from '@/components/cases/case-actions'
import { ExportCaseButton } from '@/components/cases/export-case-button'
import { BlindPrediction } from '@/components/predictions/blind-prediction'
import { Target } from 'lucide-react'
import type { CaseStatus, CaseType, Case, Agent, Document, CaseFact } from '@/lib/types'

const STATUS_COLORS: Record<CaseStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-500',
}

const TYPE_LABELS: Record<CaseType, string> = {
  civil: 'Civil',
  criminal: 'Criminal',
  family: 'Family',
  contract: 'Contract',
  tort: 'Tort',
  property: 'Property',
  constitutional: 'Constitutional',
  administrative: 'Administrative',
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: caseData, error } = await supabase
    .from('cases')
    .select(`
      *,
      agents (*),
      documents (*),
      conversations (*),
      case_facts (*)
    `)
    .eq('id', id)
    .single()

  if (error || !caseData) {
    notFound()
  }

  return (
    <div id="case-detail-page-container" className="min-h-screen bg-[var(--color-legal-cream)]">
      {/* Header */}
      <header id="case-detail-header" className="bg-primary text-primary-foreground py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-3 sm:mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold truncate">{caseData.name}</h1>
                <Badge className={`${STATUS_COLORS[caseData.status as CaseStatus]} shrink-0 w-fit`}>
                  {caseData.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-300 text-xs sm:text-sm">
                {caseData.case_number && <span>{caseData.case_number}</span>}
                <span>{TYPE_LABELS[caseData.case_type as CaseType]}</span>
                {caseData.jurisdiction && <span className="hidden sm:inline">{caseData.jurisdiction}</span>}
              </div>

              {caseData.plaintiff_name && caseData.defendant_name && (
                <p className="text-secondary mt-2 text-sm sm:text-base truncate">
                  {caseData.plaintiff_name} v. {caseData.defendant_name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <CaseSharing
                caseId={id}
                caseName={caseData.name}
                isOwner={caseData.user_id === user.id}
              />
              <ExportCaseButton
                caseId={id}
                caseData={caseData as Case}
                agents={caseData.agents as Agent[]}
                documents={caseData.documents as Document[]}
                facts={caseData.case_facts as CaseFact[]}
              />
              <CaseActions caseId={id} caseName={caseData.name} />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="case-detail-content" className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList id="case-detail-tabs" className="bg-white border w-full overflow-x-auto flex justify-start sm:justify-center no-scrollbar">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
              <Scale className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Overview</span>
              <span className="xs:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Agents</span> ({caseData.agents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Docs</span> ({caseData.documents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="facts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
              <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Facts</span> ({caseData.case_facts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Chat</span> ({caseData.conversations?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="hearing" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
              <Gavel className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Hearing</span>
            </TabsTrigger>
            <TabsTrigger value="predict" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 shrink-0">
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Predict</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <Card id="case-overview-summary">
                <CardHeader>
                  <CardTitle>Case Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {caseData.summary ? (
                    <p className="text-muted-foreground">{caseData.summary}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No summary provided</p>
                  )}
                </CardContent>
              </Card>

              <Card id="case-overview-details">
                <CardHeader>
                  <CardTitle>Case Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailRow label="Case Number" value={caseData.case_number || 'Not assigned'} />
                  <DetailRow label="Type" value={TYPE_LABELS[caseData.case_type as CaseType]} />
                  <DetailRow label="Jurisdiction" value={caseData.jurisdiction || 'Not specified'} />
                  <DetailRow label="Status" value={caseData.status} />
                  <DetailRow label="Filed Date" value={caseData.filed_date || 'Not filed'} />
                </CardContent>
              </Card>

              <Card id="case-overview-stats" className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                    <StatBox label="Agents" value={caseData.agents?.length || 0} icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />} />
                    <StatBox label="Documents" value={caseData.documents?.length || 0} icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />} />
                    <StatBox label="Facts" value={caseData.case_facts?.length || 0} icon={<ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />} />
                    <StatBox label="Conversations" value={caseData.conversations?.length || 0} icon={<MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />} />
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-2">
                <CaseStrengthMeter
                  caseId={id}
                  facts={caseData.case_facts || []}
                  caseName={caseData.name}
                  plaintiffName={caseData.plaintiff_name}
                  defendantName={caseData.defendant_name}
                />
              </div>

              <div className="md:col-span-2">
                <TurboSimulator caseId={id} />
              </div>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <AgentsList caseId={id} agents={caseData.agents || []} />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="space-y-6">
              {/* Import Options */}
              <div className="grid lg:grid-cols-3 gap-6">
                <DocumentUpload
                  caseId={id}
                  onUploadComplete={() => window.location.reload()}
                />
                <PineconeImport
                  caseId={id}
                  onImportComplete={() => window.location.reload()}
                />
                <GoogleDocsImport
                  caseId={id}
                  onImportComplete={() => window.location.reload()}
                />
              </div>

              {/* Documents List */}
              <DocumentsList caseId={id} documents={caseData.documents || []} />
            </div>
          </TabsContent>

          {/* Facts Tab */}
          <TabsContent value="facts">
            <FactsList caseId={id} facts={caseData.case_facts || []} documents={caseData.documents || []} />
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations">
            <ConversationsList caseId={id} conversations={caseData.conversations || []} agents={caseData.agents || []} />
          </TabsContent>

          {/* Hearing Tab */}
          <TabsContent value="hearing">
            <HearingRunner
              caseId={id}
              conversationId={caseData.conversations?.[0]?.id || ''}
              agents={caseData.agents?.filter((a: { is_active: boolean }) => a.is_active) || []}
              caseName={caseData.name}
              caseNumber={caseData.case_number}
              jurisdiction={caseData.jurisdiction}
              plaintiffName={caseData.plaintiff_name}
              defendantName={caseData.defendant_name}
            />
          </TabsContent>

          {/* Predict Tab */}
          <TabsContent value="predict">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Case Outcome Prediction
                </CardTitle>
                <CardDescription>
                  {caseData.is_blind_test 
                    ? 'Generate a prediction and compare against the actual ruling'
                    : 'Use AI to predict the likely outcome based on case documents and facts'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlindPrediction
                  caseId={id}
                  caseName={caseData.name}
                  isBlindTest={caseData.is_blind_test || false}
                  rulingRevealed={caseData.ruling_revealed || false}
                  actualRuling={caseData.actual_ruling}
                  actualRulingSummary={caseData.actual_ruling_summary}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="p-3 sm:p-4 bg-primary/5 rounded-lg">
      <div className="flex justify-center text-primary mb-1 sm:mb-2">{icon}</div>
      <p className="text-xl sm:text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
