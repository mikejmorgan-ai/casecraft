'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Scale,
  Calendar,
  Hash,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Gavel,
  Clock,
  Users,
  FileText,
} from 'lucide-react'
import type { DiscoveryConfig, JurisdictionType, UtahTier } from '@/lib/types'
import { UTAH_TIER_LIMITS } from '@/lib/types'

interface DiscoveryConfigFormProps {
  caseId: string
  existingConfig?: DiscoveryConfig
  jurisdiction?: string | null
  onSave: () => void
}

interface FormState {
  jurisdiction_type: JurisdictionType
  utah_tier: UtahTier | null
  filed_date: string
  rule26f_conference_date: string
  scheduling_order_date: string
  discovery_cutoff_date: string
  expert_disclosure_deadline: string
  expert_rebuttal_deadline: string
  pretrial_conference_date: string
  trial_date: string
  max_interrogatories: number
  max_rfas: number
  max_rfps: number
  max_fact_depositions: number
  max_fact_depo_hours: number
  max_expert_depositions: number
  max_expert_depo_hours: number
}

function buildInitialState(existingConfig?: DiscoveryConfig, jurisdiction?: string | null): FormState {
  if (existingConfig) {
    return {
      jurisdiction_type: existingConfig.jurisdiction_type,
      utah_tier: existingConfig.utah_tier,
      filed_date: existingConfig.filed_date || '',
      rule26f_conference_date: existingConfig.rule26f_conference_date || '',
      scheduling_order_date: existingConfig.scheduling_order_date || '',
      discovery_cutoff_date: existingConfig.discovery_cutoff_date || '',
      expert_disclosure_deadline: existingConfig.expert_disclosure_deadline || '',
      expert_rebuttal_deadline: existingConfig.expert_rebuttal_deadline || '',
      pretrial_conference_date: existingConfig.pretrial_conference_date || '',
      trial_date: existingConfig.trial_date || '',
      max_interrogatories: existingConfig.max_interrogatories,
      max_rfas: existingConfig.max_rfas,
      max_rfps: existingConfig.max_rfps,
      max_fact_depositions: existingConfig.max_fact_depositions,
      max_fact_depo_hours: existingConfig.max_fact_depo_hours,
      max_expert_depositions: existingConfig.max_expert_depositions ?? 0,
      max_expert_depo_hours: existingConfig.max_expert_depo_hours ?? 0,
    }
  }

  // Infer jurisdiction type from case jurisdiction string
  let inferredType: JurisdictionType = 'federal'
  if (jurisdiction) {
    const lower = jurisdiction.toLowerCase()
    if (lower.includes('utah')) inferredType = 'utah'
    else if (lower.includes('federal') || lower.includes('district')) inferredType = 'federal'
    else inferredType = 'other'
  }

  return {
    jurisdiction_type: inferredType,
    utah_tier: inferredType === 'utah' ? 2 : null,
    filed_date: '',
    rule26f_conference_date: '',
    scheduling_order_date: '',
    discovery_cutoff_date: '',
    expert_disclosure_deadline: '',
    expert_rebuttal_deadline: '',
    pretrial_conference_date: '',
    trial_date: '',
    max_interrogatories: inferredType === 'utah' ? UTAH_TIER_LIMITS[2].max_interrogatories : 25,
    max_rfas: inferredType === 'utah' ? UTAH_TIER_LIMITS[2].max_rfas : 25,
    max_rfps: inferredType === 'utah' ? UTAH_TIER_LIMITS[2].max_rfps : 25,
    max_fact_depositions: inferredType === 'utah' ? UTAH_TIER_LIMITS[2].max_fact_depositions : 10,
    max_fact_depo_hours: inferredType === 'utah' ? UTAH_TIER_LIMITS[2].max_fact_depo_hours : 7,
    max_expert_depositions: inferredType === 'utah' ? UTAH_TIER_LIMITS[2].max_expert_depositions : 5,
    max_expert_depo_hours: inferredType === 'utah' ? UTAH_TIER_LIMITS[2].max_expert_depo_hours : 7,
  }
}

const JURISDICTION_OPTIONS: { value: JurisdictionType; label: string; description: string }[] = [
  { value: 'federal', label: 'Federal', description: 'FRCP Rules 26-37' },
  { value: 'utah', label: 'Utah', description: 'URCP Rules 26-37' },
  { value: 'other', label: 'Other', description: 'Custom limits' },
]

const DATE_FIELDS: { key: keyof FormState; label: string; description: string }[] = [
  { key: 'filed_date', label: 'Filed Date', description: 'Date the complaint was filed' },
  { key: 'rule26f_conference_date', label: 'Rule 26(f) Conference', description: 'Discovery planning conference' },
  { key: 'scheduling_order_date', label: 'Scheduling Order', description: 'Date of the scheduling order' },
  { key: 'discovery_cutoff_date', label: 'Discovery Cutoff', description: 'Last day to conduct discovery' },
  { key: 'expert_disclosure_deadline', label: 'Expert Disclosure', description: 'Deadline for expert reports' },
  { key: 'expert_rebuttal_deadline', label: 'Expert Rebuttal', description: 'Deadline for rebuttal reports' },
  { key: 'pretrial_conference_date', label: 'Pretrial Conference', description: 'Final pretrial conference date' },
  { key: 'trial_date', label: 'Trial Date', description: 'Scheduled trial date' },
]

const LIMIT_FIELDS: { key: keyof FormState; label: string; icon: React.ReactNode; rule_federal: string; rule_utah: string }[] = [
  { key: 'max_interrogatories', label: 'Max Interrogatories', icon: <FileText className="h-4 w-4" />, rule_federal: 'FRCP 33 (25 default)', rule_utah: 'URCP 33' },
  { key: 'max_rfas', label: 'Max Requests for Admission', icon: <CheckCircle className="h-4 w-4" />, rule_federal: 'FRCP 36', rule_utah: 'URCP 36' },
  { key: 'max_rfps', label: 'Max Requests for Production', icon: <FileText className="h-4 w-4" />, rule_federal: 'FRCP 34', rule_utah: 'URCP 34' },
  { key: 'max_fact_depositions', label: 'Max Fact Depositions', icon: <Users className="h-4 w-4" />, rule_federal: 'FRCP 30 (10 default)', rule_utah: 'URCP 30' },
  { key: 'max_fact_depo_hours', label: 'Fact Deposition Hours (each)', icon: <Clock className="h-4 w-4" />, rule_federal: 'FRCP 30(d) (7 hrs)', rule_utah: 'URCP 30' },
  { key: 'max_expert_depositions', label: 'Max Expert Depositions', icon: <Users className="h-4 w-4" />, rule_federal: 'FRCP 26(b)(4)', rule_utah: 'URCP 26(b)(4)' },
  { key: 'max_expert_depo_hours', label: 'Expert Deposition Hours (each)', icon: <Clock className="h-4 w-4" />, rule_federal: 'FRCP 30(d)', rule_utah: 'URCP 30' },
]

export function DiscoveryConfigForm({ caseId, existingConfig, jurisdiction, onSave }: DiscoveryConfigFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(existingConfig, jurisdiction))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Reset success/error when form changes
  useEffect(() => {
    if (success) setSuccess(false)
    if (error) setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleJurisdictionChange(type: JurisdictionType) {
    const updates: Partial<FormState> = { jurisdiction_type: type }

    if (type === 'utah') {
      const tier = form.utah_tier || 2
      const limits = UTAH_TIER_LIMITS[tier as UtahTier]
      updates.utah_tier = tier as UtahTier
      updates.max_interrogatories = limits.max_interrogatories
      updates.max_rfas = limits.max_rfas
      updates.max_rfps = limits.max_rfps
      updates.max_fact_depositions = limits.max_fact_depositions
      updates.max_fact_depo_hours = limits.max_fact_depo_hours
      updates.max_expert_depositions = limits.max_expert_depositions
      updates.max_expert_depo_hours = limits.max_expert_depo_hours
    } else if (type === 'federal') {
      updates.utah_tier = null
      updates.max_interrogatories = 25
      updates.max_rfas = 25
      updates.max_rfps = 25
      updates.max_fact_depositions = 10
      updates.max_fact_depo_hours = 7
      updates.max_expert_depositions = 5
      updates.max_expert_depo_hours = 7
    } else {
      updates.utah_tier = null
    }

    setForm(prev => ({ ...prev, ...updates }))
  }

  function handleTierChange(tier: UtahTier) {
    const limits = UTAH_TIER_LIMITS[tier]
    setForm(prev => ({
      ...prev,
      utah_tier: tier,
      max_interrogatories: limits.max_interrogatories,
      max_rfas: limits.max_rfas,
      max_rfps: limits.max_rfps,
      max_fact_depositions: limits.max_fact_depositions,
      max_fact_depo_hours: limits.max_fact_depo_hours,
      max_expert_depositions: limits.max_expert_depositions,
      max_expert_depo_hours: limits.max_expert_depo_hours,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const payload = {
        jurisdiction_type: form.jurisdiction_type,
        utah_tier: form.utah_tier,
        filed_date: form.filed_date || null,
        rule26f_conference_date: form.rule26f_conference_date || null,
        scheduling_order_date: form.scheduling_order_date || null,
        discovery_cutoff_date: form.discovery_cutoff_date || null,
        expert_disclosure_deadline: form.expert_disclosure_deadline || null,
        expert_rebuttal_deadline: form.expert_rebuttal_deadline || null,
        pretrial_conference_date: form.pretrial_conference_date || null,
        trial_date: form.trial_date || null,
        max_interrogatories: form.max_interrogatories,
        max_rfas: form.max_rfas,
        max_rfps: form.max_rfps,
        max_fact_depositions: form.max_fact_depositions,
        max_fact_depo_hours: form.max_fact_depo_hours,
        max_expert_depositions: form.max_expert_depositions,
        max_expert_depo_hours: form.max_expert_depo_hours,
      }

      const response = await fetch(`/api/cases/${caseId}/rule26`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || `Failed to save configuration (${response.status})`)
      }

      setSuccess(true)
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isUtah = form.jurisdiction_type === 'utah'
  const limitsReadOnly = isUtah

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Jurisdiction Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif font-bold">
            <Scale className="h-5 w-5 text-primary" />
            Jurisdiction
          </CardTitle>
          <CardDescription>
            Select the governing rules of civil procedure for this case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {JURISDICTION_OPTIONS.map((option) => {
              const isSelected = form.jurisdiction_type === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleJurisdictionChange(option.value)}
                  className={`relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-4 transition-all text-center ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <Gavel className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Utah Tier Selection */}
      {isUtah && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif font-bold">
              <Scale className="h-5 w-5 text-primary" />
              Utah Discovery Tier
            </CardTitle>
            <CardDescription>
              Utah Rule 26 assigns discovery tiers based on the amount in controversy.
              Selecting a tier will auto-populate discovery limits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([1, 2, 3] as UtahTier[]).map((tier) => {
                const limits = UTAH_TIER_LIMITS[tier]
                const isSelected = form.utah_tier === tier
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleTierChange(tier)}
                    className={`relative flex flex-col rounded-lg border-2 p-4 transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={isSelected ? 'default' : 'outline'}
                        className={isSelected ? '' : 'bg-muted'}
                      >
                        Tier {tier}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold mb-1">{limits.damages_range}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>{limits.max_fact_depositions} fact depositions ({limits.max_fact_depo_hours} hrs each)</p>
                      <p>{limits.max_interrogatories} interrogatories</p>
                      <p>{limits.max_rfps} requests for production</p>
                      <p>{limits.max_rfas} requests for admission</p>
                      {limits.max_expert_depositions > 0 ? (
                        <p>{limits.max_expert_depositions} expert depositions ({limits.max_expert_depo_hours} hrs each)</p>
                      ) : (
                        <p className="italic">No expert depositions</p>
                      )}
                      <p className="pt-1 font-medium text-foreground/70">
                        {limits.discovery_period_days}-day discovery period
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Dates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif font-bold">
            <Calendar className="h-5 w-5 text-primary" />
            Key Dates
          </CardTitle>
          <CardDescription>
            Enter the key dates for this case. These will be used to calculate and track discovery deadlines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {DATE_FIELDS.map((field) => (
              <div key={field.key} className="grid gap-1.5">
                <Label htmlFor={`date-${field.key}`} className="text-sm font-medium">
                  {field.label}
                </Label>
                <Input
                  id={`date-${field.key}`}
                  type="date"
                  value={form[field.key] as string}
                  onChange={(e) => updateField(field.key, e.target.value as never)}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">{field.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discovery Limits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif font-bold">
            <Hash className="h-5 w-5 text-primary" />
            Discovery Limits
          </CardTitle>
          <CardDescription>
            {isUtah
              ? 'These limits are set by the selected Utah tier. Change the tier above to adjust.'
              : form.jurisdiction_type === 'federal'
                ? 'Federal default limits are pre-populated. Adjust as needed based on the scheduling order or court rules.'
                : 'Set the discovery limits for this jurisdiction.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {limitsReadOnly && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-primary/10 text-sm">
              <Scale className="h-4 w-4 text-primary shrink-0" />
              <span>
                Limits are governed by Utah Tier {form.utah_tier} rules and cannot be edited directly.
                Select a different tier above to change limits.
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {LIMIT_FIELDS.map((field) => (
              <div key={field.key} className="grid gap-1.5">
                <Label htmlFor={`limit-${field.key}`} className="text-sm font-medium flex items-center gap-1.5">
                  <span className="text-primary">{field.icon}</span>
                  {field.label}
                </Label>
                <Input
                  id={`limit-${field.key}`}
                  type="number"
                  min={0}
                  value={form[field.key] as number}
                  onChange={(e) => updateField(field.key, parseInt(e.target.value, 10) || 0 as never)}
                  readOnly={limitsReadOnly}
                  className={`h-10 ${limitsReadOnly ? 'bg-muted cursor-not-allowed' : ''}`}
                />
                <p className="text-xs text-muted-foreground">
                  {isUtah ? field.rule_utah : field.rule_federal}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback and Save */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Discovery configuration saved successfully.</span>
            </div>
          )}
        </div>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[180px]">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : existingConfig ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Configuration
            </>
          ) : (
            <>
              <Scale className="h-4 w-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
