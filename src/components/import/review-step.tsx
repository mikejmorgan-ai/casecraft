'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  FileText,
  Scale,
  Users,
  CheckCircle,
} from 'lucide-react'
import type { CaseInfoData } from './case-info-step'
import type { WizardFileUpload } from './document-upload-step'
import type { ClaimData } from './claims-setup-step'
import type { AgentRole } from '@/lib/types'
import { AGENT_ROLE_LABELS } from '@/lib/ai/prompts'

const CASE_TYPE_LABELS: Record<string, string> = {
  civil: 'Civil',
  criminal: 'Criminal',
  family: 'Family',
  contract: 'Contract',
  tort: 'Tort',
  property: 'Property',
  constitutional: 'Constitutional',
  administrative: 'Administrative',
}

const RELIEF_TYPE_LABELS: Record<string, string> = {
  declaratory: 'Declaratory Relief',
  injunctive: 'Injunctive Relief',
  regulatory_taking: 'Regulatory Taking',
  damages: 'Damages',
  restitution: 'Restitution',
  specific_performance: 'Specific Performance',
  attorneys_fees: "Attorney's Fees",
  other: 'Other',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface ReviewStepProps {
  caseInfo: CaseInfoData
  files: WizardFileUpload[]
  claims: ClaimData[]
  agentRoles: AgentRole[]
}

export function ReviewStep({ caseInfo, files, claims, agentRoles }: ReviewStepProps) {
  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0)

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm">
          Review your case configuration below. Once you click &quot;Create Case&quot;, the case
          will be created, documents uploaded, and agents activated.
        </p>
      </div>

      {/* Case Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4" />
            Case Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Case Name</div>
              <div className="font-medium text-sm">{caseInfo.name || 'Not provided'}</div>
            </div>

            <div className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Case Type</div>
              <div className="font-medium text-sm">
                {CASE_TYPE_LABELS[caseInfo.case_type] || 'Not selected'}
              </div>
            </div>

            {caseInfo.case_number && (
              <div className="p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Case Number</div>
                <div className="font-medium text-sm">{caseInfo.case_number}</div>
              </div>
            )}

            {caseInfo.jurisdiction && (
              <div className="p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Jurisdiction</div>
                <div className="font-medium text-sm">{caseInfo.jurisdiction}</div>
              </div>
            )}

            {caseInfo.plaintiff_name && (
              <div className="p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Plaintiff</div>
                <div className="font-medium text-sm">{caseInfo.plaintiff_name}</div>
              </div>
            )}

            {caseInfo.defendant_name && (
              <div className="p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Defendant</div>
                <div className="font-medium text-sm">{caseInfo.defendant_name}</div>
              </div>
            )}
          </div>

          {caseInfo.summary && (
            <div className="mt-4 p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Summary</div>
              <div className="text-sm">{caseInfo.summary}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Documents
            <Badge variant="secondary" className="ml-auto">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length > 0 ? (
            <>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                    <span className="truncate flex-1 mr-2">{f.file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatFileSize(f.file.size)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Total size: {formatFileSize(totalSize)}. Documents will be uploaded and
                text-extracted after case creation.
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No documents added. You can upload documents after case creation.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Claims */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4" />
            Claims
            <Badge variant="secondary" className="ml-auto">
              {claims.length} claim{claims.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length > 0 ? (
            <div className="space-y-3">
              {claims.map((claim, index) => (
                <div key={claim.id} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      Claim {index + 1}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {RELIEF_TYPE_LABELS[claim.relief_type] || claim.relief_type}
                    </Badge>
                  </div>
                  <div className="font-medium text-sm">
                    {claim.title || 'Untitled claim'}
                  </div>
                  {claim.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {claim.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No claims configured. Claims can be added after case creation.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Agents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            AI Agents
            <Badge variant="secondary" className="ml-auto">
              {agentRoles.length} agent{agentRoles.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agentRoles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {agentRoles.map((role) => (
                <Badge key={role} variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {AGENT_ROLE_LABELS[role]}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No agents selected. Default agents (Judge, Plaintiff Attorney, Defense Attorney) will be created.
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Agents will be created with default personas. You can customize them from the case dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
