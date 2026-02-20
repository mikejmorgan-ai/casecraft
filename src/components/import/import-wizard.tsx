'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  FileText,
  Scale,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Import,
} from 'lucide-react'

import { CaseInfoStep, type CaseInfoData } from './case-info-step'
import { DocumentUploadStep, type WizardFileUpload } from './document-upload-step'
import { ClaimsSetupStep, type ClaimData } from './claims-setup-step'
import { AgentsSetupStep } from './agents-setup-step'
import { ReviewStep } from './review-step'
import type { AgentRole } from '@/lib/types'

const STEPS = [
  { id: 1, name: 'Case Info', icon: Briefcase },
  { id: 2, name: 'Documents', icon: FileText },
  { id: 3, name: 'Claims', icon: Scale },
  { id: 4, name: 'Agents', icon: Users },
  { id: 5, name: 'Review', icon: CheckCircle },
]

export function ImportWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Step 1: Case Info
  const [caseInfo, setCaseInfo] = useState<CaseInfoData>({
    name: '',
    case_number: '',
    jurisdiction: '',
    case_type: '',
    plaintiff_name: '',
    defendant_name: '',
    summary: '',
  })

  // Step 2: Documents
  const [files, setFiles] = useState<WizardFileUpload[]>([])

  // Step 3: Claims
  const [claims, setClaims] = useState<ClaimData[]>([])

  // Step 4: Agent Roles
  const [agentRoles, setAgentRoles] = useState<AgentRole[]>([
    'judge',
    'plaintiff_attorney',
    'defense_attorney',
  ])

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!caseInfo.name.trim()) {
        errors.name = 'Case name is required'
      } else if (caseInfo.name.trim().length < 3) {
        errors.name = 'Case name must be at least 3 characters'
      }
      if (!caseInfo.case_type) {
        errors.case_type = 'Please select a case type'
      }
    }

    // Steps 2-4 have no required fields -- they are all optional
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setError(null)
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const prevStep = () => {
    setError(null)
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const goToStep = (step: number) => {
    // Only allow going to previously visited steps or next step
    if (step < currentStep) {
      setError(null)
      setCurrentStep(step)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    setError(null)
    setUploadProgress(5)

    try {
      // Build multipart form data for the import API
      const formData = new FormData()

      // Case info as JSON
      formData.append('case_info', JSON.stringify({
        name: caseInfo.name.trim(),
        case_number: caseInfo.case_number.trim() || undefined,
        jurisdiction: caseInfo.jurisdiction || undefined,
        case_type: caseInfo.case_type,
        plaintiff_name: caseInfo.plaintiff_name.trim() || undefined,
        defendant_name: caseInfo.defendant_name.trim() || undefined,
        summary: caseInfo.summary.trim() || undefined,
        status: 'active',
      }))

      setUploadProgress(10)

      // Documents
      for (const fileUpload of files) {
        formData.append('documents', fileUpload.file)
      }

      // Claims as JSON
      if (claims.length > 0) {
        const validClaims = claims
          .filter(c => c.title.trim())
          .map(c => ({
            title: c.title.trim(),
            relief_type: c.relief_type,
            description: c.description.trim(),
            legal_basis: c.legal_basis.trim() || undefined,
          }))
        if (validClaims.length > 0) {
          formData.append('claims', JSON.stringify(validClaims))
        }
      }

      // Agent roles as JSON
      if (agentRoles.length > 0) {
        formData.append('agent_roles', JSON.stringify(agentRoles))
      }

      setUploadProgress(20)

      // Submit to the import API
      const response = await fetch('/api/cases/import', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(80)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to import case')
      }

      setUploadProgress(100)

      // Redirect to the case dashboard
      router.push(`/case/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setUploadProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <Card className="w-full max-w-3xl mx-auto">
      {/* Progress Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="flex items-center gap-2">
            <Import className="h-5 w-5" />
            Import Case
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>

        {/* Step Progress Bar */}
        <Progress value={progressPercent} className="h-1.5 mb-6" />

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  disabled={step.id > currentStep}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                    currentStep > step.id
                      ? 'bg-primary border-primary text-primary-foreground cursor-pointer'
                      : currentStep === step.id
                        ? 'border-primary text-primary'
                        : 'border-muted text-muted-foreground cursor-not-allowed',
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </button>
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
                    'w-8 sm:w-12 lg:w-16 h-0.5 mx-1 sm:mx-2',
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <div className="mt-6">
          <CardTitle className="text-lg">
            {currentStep === 1 && 'Case Information'}
            {currentStep === 2 && 'Upload Documents'}
            {currentStep === 3 && 'Configure Claims'}
            {currentStep === 4 && 'Set Up Agents'}
            {currentStep === 5 && 'Review & Create'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Enter the basic case information and parties involved'}
            {currentStep === 2 && 'Add documents for analysis - PDF, DOC, DOCX, or TXT files'}
            {currentStep === 3 && 'Define the legal claims and relief sought (optional)'}
            {currentStep === 4 && 'Choose which AI agent roles to activate for this case'}
            {currentStep === 5 && 'Review everything before creating your case'}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Upload Progress */}
        {isSubmitting && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {uploadProgress < 20
                  ? 'Preparing import...'
                  : uploadProgress < 80
                    ? 'Uploading documents and creating case...'
                    : uploadProgress < 100
                      ? 'Finalizing...'
                      : 'Complete!'}
              </span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <CaseInfoStep
            data={caseInfo}
            onChange={setCaseInfo}
            errors={fieldErrors}
          />
        )}

        {currentStep === 2 && (
          <DocumentUploadStep
            files={files}
            onFilesChange={setFiles}
          />
        )}

        {currentStep === 3 && (
          <ClaimsSetupStep
            claims={claims}
            onClaimsChange={setClaims}
          />
        )}

        {currentStep === 4 && (
          <AgentsSetupStep
            selectedRoles={agentRoles}
            onRolesChange={setAgentRoles}
          />
        )}

        {currentStep === 5 && (
          <ReviewStep
            caseInfo={caseInfo}
            files={files}
            claims={claims}
            agentRoles={agentRoles}
          />
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-4 pt-6 border-t">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
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
                  Creating Case...
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
