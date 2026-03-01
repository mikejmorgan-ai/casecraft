'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  FileText,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Scale,
  Loader2,
  AlertCircle,
} from 'lucide-react'

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

const STEPS = [
  { id: 1, name: 'Basic Info', icon: Briefcase },
  { id: 2, name: 'Parties', icon: Users },
  { id: 3, name: 'Details', icon: FileText },
  { id: 4, name: 'Review', icon: CheckCircle },
]

interface CaseFormData {
  name: string
  case_type: string
  case_number: string
  jurisdiction: string
  plaintiff_name: string
  defendant_name: string
  summary: string
  status: 'draft' | 'active'
}

interface CaseWizardProps {
  onClose?: () => void
  onSuccess?: (caseId: string) => void
}

export function CaseWizard({ onClose, onSuccess }: CaseWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<CaseFormData>({
    name: '',
    case_type: '',
    case_number: '',
    jurisdiction: '',
    plaintiff_name: '',
    defendant_name: '',
    summary: '',
    status: 'draft',
  })

  const updateField = (field: keyof CaseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) {
        errors.name = 'Case name is required'
      } else if (formData.name.length < 3) {
        errors.name = 'Case name must be at least 3 characters'
      }
      if (!formData.case_type) {
        errors.case_type = 'Please select a case type'
      }
    }

    if (step === 2) {
      // Parties are optional, no validation needed
    }

    if (step === 3) {
      // Summary is optional, no validation needed
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          case_type: formData.case_type,
          case_number: formData.case_number.trim() || undefined,
          jurisdiction: formData.jurisdiction.trim() || undefined,
          plaintiff_name: formData.plaintiff_name.trim() || undefined,
          defendant_name: formData.defendant_name.trim() || undefined,
          summary: formData.summary.trim() || undefined,
          status: formData.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.fieldErrors) {
          const errors: Record<string, string> = {}
          data.fieldErrors.forEach((err: { field: string; message: string }) => {
            errors[err.field] = err.message
          })
          setFieldErrors(errors)
          // Go back to the step with errors
          if (errors.name || errors.case_type) setCurrentStep(1)
          else if (errors.plaintiff_name || errors.defendant_name) setCurrentStep(2)
          else if (errors.summary || errors.jurisdiction) setCurrentStep(3)
        }
        throw new Error(data.message || 'Failed to create case')
      }

      // Success!
      if (onSuccess) {
        onSuccess(data.id)
      } else {
        router.push(`/case/${data.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCaseType = CASE_TYPES.find(t => t.value === formData.case_type)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {/* Progress Steps */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                    currentStep > step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : currentStep === step.id
                        ? 'border-primary text-primary'
                        : 'border-muted text-muted-foreground'
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1 hidden sm:block',
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-12 sm:w-16 h-0.5 mx-2',
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          {currentStep === 1 && 'Case Information'}
          {currentStep === 2 && 'Parties Involved'}
          {currentStep === 3 && 'Case Details'}
          {currentStep === 4 && 'Review & Create'}
        </CardTitle>
        <CardDescription>
          {currentStep === 1 && 'Enter the basic case information'}
          {currentStep === 2 && 'Add the parties involved in this case'}
          {currentStep === 3 && 'Provide additional details and summary'}
          {currentStep === 4 && 'Review your case before creating'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Case Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Smith v. Johnson"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={fieldErrors.name ? 'border-destructive' : ''}
              />
              {fieldErrors.name && (
                <p className="text-sm text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Case Type <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {CASE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField('case_type', type.value)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-colors',
                      formData.case_type === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50',
                      fieldErrors.case_type && !formData.case_type && 'border-destructive'
                    )}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </button>
                ))}
              </div>
              {fieldErrors.case_type && (
                <p className="text-sm text-destructive">{fieldErrors.case_type}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Parties */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plaintiff_name">Plaintiff / Petitioner</Label>
              <Input
                id="plaintiff_name"
                placeholder="e.g., John Smith"
                value={formData.plaintiff_name}
                onChange={(e) => updateField('plaintiff_name', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The party bringing the case or making the claim
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defendant_name">Defendant / Respondent</Label>
              <Input
                id="defendant_name"
                placeholder="e.g., ABC Corporation"
                value={formData.defendant_name}
                onChange={(e) => updateField('defendant_name', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The party being sued or responding to the claim
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                You can add additional parties, witnesses, and experts after creating the case.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="case_number">Case Number</Label>
                <Input
                  id="case_number"
                  placeholder="e.g., 2024-CV-00123"
                  value={formData.case_number}
                  onChange={(e) => updateField('case_number', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Input
                  id="jurisdiction"
                  placeholder="e.g., Utah District Court"
                  value={formData.jurisdiction}
                  onChange={(e) => updateField('jurisdiction', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Case Summary</Label>
              <Textarea
                id="summary"
                placeholder="Brief description of the case, key issues, and relevant background..."
                value={formData.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                This summary will help AI agents understand the case context
              </p>
            </div>

            <div className="space-y-2">
              <Label>Initial Status</Label>
              <Select value={formData.status} onValueChange={(value: 'draft' | 'active') => updateField('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft - Work in progress</SelectItem>
                  <SelectItem value="active">Active - Ready for analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Case Name</div>
                <div className="font-medium">{formData.name}</div>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Case Type</div>
                <div className="font-medium">{selectedCaseType?.label}</div>
              </div>

              {formData.plaintiff_name && (
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Plaintiff</div>
                  <div className="font-medium">{formData.plaintiff_name}</div>
                </div>
              )}

              {formData.defendant_name && (
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Defendant</div>
                  <div className="font-medium">{formData.defendant_name}</div>
                </div>
              )}

              {formData.case_number && (
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Case Number</div>
                  <div className="font-medium">{formData.case_number}</div>
                </div>
              )}

              {formData.jurisdiction && (
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Jurisdiction</div>
                  <div className="font-medium">{formData.jurisdiction}</div>
                </div>
              )}
            </div>

            {formData.summary && (
              <div className="p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Summary</div>
                <div className="text-sm">{formData.summary}</div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
                {formData.status === 'active' ? 'Active' : 'Draft'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formData.status === 'active'
                  ? 'Case will be ready for analysis immediately'
                  : 'Case will be saved as a draft'}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm">
                <strong>What happens next:</strong> Default AI agents (Judge, Plaintiff Attorney, Defense Attorney)
                will be automatically created. You can then upload documents and start analyzing your case.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-4 pt-6 border-t">
        <div>
          {onClose && (
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {currentStep < STEPS.length ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Case
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
