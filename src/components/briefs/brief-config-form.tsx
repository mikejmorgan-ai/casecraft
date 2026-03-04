'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { ClaimForRelief } from '@/lib/types'

export type BriefType = 'response' | 'motion' | 'memorandum' | 'opposition' | 'reply'
export type BriefTone = 'formal' | 'aggressive' | 'measured'

export interface BriefConfig {
  brief_type: BriefType
  topic: string
  instructions: string
  tone: BriefTone
  include_case_law: boolean
  claim_ids: string[]
}

const BRIEF_TYPE_OPTIONS: { value: BriefType; label: string; description: string }[] = [
  { value: 'response', label: 'Response Brief', description: 'Responding to opposing motion or brief' },
  { value: 'motion', label: 'Motion', description: 'Filing a motion with the court' },
  { value: 'memorandum', label: 'Memorandum of Law', description: 'Legal memorandum supporting arguments' },
  { value: 'opposition', label: 'Opposition Brief', description: 'Opposing a motion filed by other party' },
  { value: 'reply', label: 'Reply Brief', description: 'Reply in support of original motion' },
]

const TONE_OPTIONS: { value: BriefTone; label: string; description: string }[] = [
  { value: 'formal', label: 'Formal', description: 'Standard professional legal tone' },
  { value: 'aggressive', label: 'Aggressive', description: 'Assertive advocacy with strong language' },
  { value: 'measured', label: 'Measured', description: 'Balanced and deliberate reasoning' },
]

const RELIEF_TYPE_COLORS: Record<string, string> = {
  declaratory: 'bg-blue-100 text-blue-800',
  injunctive: 'bg-purple-100 text-purple-800',
  regulatory_taking: 'bg-red-100 text-red-800',
  damages: 'bg-orange-100 text-orange-800',
  restitution: 'bg-green-100 text-green-800',
  specific_performance: 'bg-teal-100 text-teal-800',
  attorneys_fees: 'bg-gray-100 text-gray-800',
  other: 'bg-gray-100 text-gray-600',
}

interface BriefConfigFormProps {
  config: BriefConfig
  onConfigChange: (config: BriefConfig) => void
  claims: ClaimForRelief[]
  disabled?: boolean
}

export function BriefConfigForm({
  config,
  onConfigChange,
  claims,
  disabled = false,
}: BriefConfigFormProps) {
  const updateConfig = (updates: Partial<BriefConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  const toggleClaim = (claimId: string) => {
    const newClaimIds = config.claim_ids.includes(claimId)
      ? config.claim_ids.filter(id => id !== claimId)
      : [...config.claim_ids, claimId]
    updateConfig({ claim_ids: newClaimIds })
  }

  const selectAllClaims = () => {
    if (config.claim_ids.length === claims.length) {
      updateConfig({ claim_ids: [] })
    } else {
      updateConfig({ claim_ids: claims.map(c => c.id) })
    }
  }

  return (
    <div className="space-y-6">
      {/* Brief Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brief Type</CardTitle>
          <CardDescription>Select the type of legal brief to draft</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={config.brief_type}
            onValueChange={(value: BriefType) => updateConfig({ brief_type: value })}
            disabled={disabled}
          >
            <SelectTrigger id="select-brief-type" className="w-full">
              <SelectValue placeholder="Select brief type" />
            </SelectTrigger>
            <SelectContent>
              {BRIEF_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Topic and Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Topic &amp; Instructions</CardTitle>
          <CardDescription>Define the subject matter and any special instructions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brief-topic">Topic</Label>
            <Input
              id="brief-topic"
              placeholder="e.g., Motion to Compel Discovery, Opposition to Summary Judgment..."
              value={config.topic}
              onChange={(e) => updateConfig({ topic: e.target.value })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brief-instructions">Additional Instructions (optional)</Label>
            <Textarea
              id="brief-instructions"
              placeholder="e.g., Emphasize the procedural failures. Focus on the statute of limitations issue. Include arguments about standing..."
              value={config.instructions}
              onChange={(e) => updateConfig({ instructions: e.target.value })}
              disabled={disabled}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tone and Case Law */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tone &amp; Style</CardTitle>
          <CardDescription>Configure the writing style of the brief</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="select-brief-tone">Tone</Label>
            <Select
              value={config.tone}
              onValueChange={(value: BriefTone) => updateConfig({ tone: value })}
              disabled={disabled}
            >
              <SelectTrigger id="select-brief-tone" className="w-full">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-case-law"
              checked={config.include_case_law}
              onCheckedChange={(checked) =>
                updateConfig({ include_case_law: checked === true })
              }
              disabled={disabled}
            />
            <Label htmlFor="include-case-law" className="cursor-pointer">
              Include case law citations
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Claims Selection */}
      {claims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Claims for Relief</CardTitle>
            <CardDescription>
              Select which claims to focus on in the brief ({config.claim_ids.length} of {claims.length} selected)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                id="select-all-claims"
                checked={config.claim_ids.length === claims.length && claims.length > 0}
                onCheckedChange={selectAllClaims}
                disabled={disabled}
              />
              <Label htmlFor="select-all-claims" className="cursor-pointer text-sm font-medium">
                Select All Claims
              </Label>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`claim-${claim.id}`}
                    checked={config.claim_ids.includes(claim.id)}
                    onCheckedChange={() => toggleClaim(claim.id)}
                    disabled={disabled}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`claim-${claim.id}`} className="cursor-pointer">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          Claim {claim.claim_number}: {claim.title}
                        </span>
                        <Badge
                          className={RELIEF_TYPE_COLORS[claim.relief_type] || RELIEF_TYPE_COLORS.other}
                        >
                          {claim.relief_type.replace(/_/g, ' ')}
                        </Badge>
                        {claim.is_alternative && (
                          <Badge variant="outline" className="text-xs">
                            Alternative
                          </Badge>
                        )}
                      </div>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {claim.description}
                    </p>
                    {claim.legal_basis && (
                      <p className="text-xs text-blue-600 mt-1">
                        Legal Basis: {claim.legal_basis}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
