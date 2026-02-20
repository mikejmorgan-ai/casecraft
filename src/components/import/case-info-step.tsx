'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const CASE_TYPES = [
  { value: 'civil', label: 'Civil', description: 'Non-criminal disputes between parties' },
  { value: 'criminal', label: 'Criminal', description: 'Cases involving criminal charges' },
  { value: 'family', label: 'Family', description: 'Divorce, custody, adoption' },
  { value: 'contract', label: 'Contract', description: 'Contract disputes and breaches' },
  { value: 'tort', label: 'Tort', description: 'Personal injury, negligence' },
  { value: 'property', label: 'Property', description: 'Real estate, land use disputes' },
  { value: 'constitutional', label: 'Constitutional', description: 'Constitutional rights cases' },
  { value: 'administrative', label: 'Administrative', description: 'Government agency decisions' },
] as const

const JURISDICTIONS = [
  'Federal - District Court',
  'Federal - Circuit Court',
  'Federal - Supreme Court',
  'State - Trial Court',
  'State - Appellate Court',
  'State - Supreme Court',
  'Utah District Court',
  'Utah Court of Appeals',
  'Utah Supreme Court',
]

export interface CaseInfoData {
  name: string
  case_number: string
  jurisdiction: string
  case_type: string
  plaintiff_name: string
  defendant_name: string
  summary: string
}

interface CaseInfoStepProps {
  data: CaseInfoData
  onChange: (data: CaseInfoData) => void
  errors: Record<string, string>
}

export function CaseInfoStep({ data, onChange, errors }: CaseInfoStepProps) {
  const updateField = (field: keyof CaseInfoData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="import-case-name">
          Case Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="import-case-name"
          placeholder="e.g., Smith v. Johnson"
          value={data.name}
          onChange={(e) => updateField('name', e.target.value)}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Use a descriptive name, typically Plaintiff v. Defendant
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="import-case-number">Case Number</Label>
          <Input
            id="import-case-number"
            placeholder="e.g., 2024-CV-00123"
            value={data.case_number}
            onChange={(e) => updateField('case_number', e.target.value)}
            className={errors.case_number ? 'border-destructive' : ''}
          />
          {errors.case_number && (
            <p className="text-sm text-destructive">{errors.case_number}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="import-jurisdiction">Jurisdiction</Label>
          <Select
            value={data.jurisdiction}
            onValueChange={(value) => updateField('jurisdiction', value)}
          >
            <SelectTrigger id="import-jurisdiction">
              <SelectValue placeholder="Select jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              {JURISDICTIONS.map((j) => (
                <SelectItem key={j} value={j}>
                  {j}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Case Type <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CASE_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateField('case_type', type.value)}
              className={cn(
                'p-3 rounded-lg border text-left transition-colors',
                data.case_type === type.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-muted hover:border-primary/50',
                errors.case_type && !data.case_type && 'border-destructive'
              )}
            >
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{type.description}</div>
            </button>
          ))}
        </div>
        {errors.case_type && (
          <p className="text-sm text-destructive">{errors.case_type}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="import-plaintiff">Plaintiff / Petitioner</Label>
          <Input
            id="import-plaintiff"
            placeholder="e.g., John Smith"
            value={data.plaintiff_name}
            onChange={(e) => updateField('plaintiff_name', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            The party bringing the case
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="import-defendant">Defendant / Respondent</Label>
          <Input
            id="import-defendant"
            placeholder="e.g., ABC Corporation"
            value={data.defendant_name}
            onChange={(e) => updateField('defendant_name', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            The party being sued or responding
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="import-summary">Case Summary</Label>
        <Textarea
          id="import-summary"
          placeholder="Brief description of the case, key issues, and relevant background..."
          value={data.summary}
          onChange={(e) => updateField('summary', e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          This summary will help AI agents understand the case context
        </p>
      </div>
    </div>
  )
}
