'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FormError } from '@/components/ui/form-error'
import { Plus, Loader2 } from 'lucide-react'
import { createClaimSchema, reliefTypes, type CreateClaimInput } from '@/lib/validations/claim'
import { handleApiError } from '@/lib/api-error'
import type { ReliefType } from '@/lib/types'
import { z } from 'zod'

const RELIEF_TYPE_LABELS: Record<ReliefType, string> = {
  declaratory: 'Declaratory',
  injunctive: 'Injunctive',
  regulatory_taking: 'Regulatory Taking',
  damages: 'Damages',
  restitution: 'Restitution',
  specific_performance: 'Specific Performance',
  attorneys_fees: "Attorney's Fees",
  other: 'Other',
}

interface FormData {
  claim_number: number | ''
  title: string
  relief_type: ReliefType
  description: string
  legal_basis: string
  is_alternative: boolean
}

type FormErrors = Partial<Record<keyof CreateClaimInput, string>>
type TouchedFields = Partial<Record<keyof CreateClaimInput, boolean>>

interface CreateClaimDialogProps {
  caseId: string
  nextClaimNumber?: number
}

export function CreateClaimDialog({ caseId, nextClaimNumber = 1 }: CreateClaimDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    claim_number: nextClaimNumber,
    title: '',
    relief_type: 'damages',
    description: '',
    legal_basis: '',
    is_alternative: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<TouchedFields>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const router = useRouter()

  // Handle field blur (validate on blur)
  const handleBlur = useCallback((field: keyof CreateClaimInput) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  // Update form data
  const updateField = useCallback(<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (touched[field as keyof CreateClaimInput] || submitAttempted) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [touched, submitAttempted])

  // Reset form state
  const resetForm = useCallback(() => {
    setFormData({
      claim_number: nextClaimNumber,
      title: '',
      relief_type: 'damages',
      description: '',
      legal_basis: '',
      is_alternative: false,
    })
    setErrors({})
    setTouched({})
    setSubmitAttempted(false)
  }, [nextClaimNumber])

  // Handle dialog close
  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      resetForm()
    }
  }, [resetForm])

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const dataToValidate = {
      ...formData,
      claim_number: typeof formData.claim_number === 'number' ? formData.claim_number : 0,
      legal_basis: formData.legal_basis || null,
    }

    const result = createClaimSchema.safeParse(dataToValidate)

    if (!result.success) {
      const newErrors: FormErrors = {}
      result.error.issues.forEach((issue: z.ZodIssue) => {
        const field = issue.path[0] as keyof CreateClaimInput
        if (!newErrors[field]) {
          newErrors[field] = issue.message
        }
      })
      setErrors(newErrors)
      return false
    }

    setErrors({})
    return true
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)

    if (!validateForm()) {
      toast.error('Please fix the validation errors', {
        description: 'Check the highlighted fields below.',
      })
      return
    }

    setLoading(true)

    try {
      const dataToSubmit = {
        ...formData,
        claim_number: typeof formData.claim_number === 'number' ? formData.claim_number : 0,
        legal_basis: formData.legal_basis || null,
      }

      const validatedData = createClaimSchema.parse(dataToSubmit)

      const response = await fetch(`/api/cases/${caseId}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const apiError = await handleApiError(response)

        if (apiError.fieldErrors && apiError.fieldErrors.length > 0) {
          const newErrors: FormErrors = {}
          apiError.fieldErrors.forEach(err => {
            const field = err.field as keyof CreateClaimInput
            if (!newErrors[field]) {
              newErrors[field] = err.message
            }
          })
          setErrors(newErrors)
          toast.error('Validation error', {
            description: 'Please check the highlighted fields.',
          })
        } else {
          toast.error('Failed to create claim', {
            description: apiError.message,
          })
        }
        return
      }

      const newClaim = await response.json()

      toast.success('Claim created successfully', {
        description: `Claim #${newClaim.claim_number}: "${newClaim.title}" has been added.`,
      })

      handleOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to create claim:', error)

      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {}
        error.issues.forEach((issue: z.ZodIssue) => {
          const field = issue.path[0] as keyof CreateClaimInput
          if (!newErrors[field]) {
            newErrors[field] = issue.message
          }
        })
        setErrors(newErrors)
        toast.error('Validation error', {
          description: 'Please fix the highlighted fields.',
        })
      } else {
        const errorMessage = error instanceof Error
          ? error.message
          : 'An unexpected error occurred'

        toast.error('Failed to create claim', {
          description: errorMessage,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Helper to determine if we should show an error for a field
  const shouldShowError = (field: keyof CreateClaimInput): boolean => {
    return (touched[field] || submitAttempted) && !!errors[field]
  }

  // Helper to get error input class
  const getErrorInputClass = (field: keyof CreateClaimInput): string => {
    return shouldShowError(field) ? 'border-red-500 focus-visible:ring-red-500' : ''
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button id="btn-add-claim">
          <Plus className="h-4 w-4 mr-2" />
          Add Claim
        </Button>
      </DialogTrigger>
      <DialogContent id="create-claim-dialog" className="w-[calc(100%-2rem)] max-w-[500px] mx-auto">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add Claim for Relief</DialogTitle>
            <DialogDescription>
              Add a new claim for relief to this case. Define the type of relief sought and its legal basis.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="input-claim-number">Claim Number *</Label>
                <Input
                  id="input-claim-number"
                  type="number"
                  min={1}
                  max={999}
                  placeholder="1"
                  value={formData.claim_number}
                  onChange={(e) => updateField('claim_number', e.target.value ? parseInt(e.target.value) : '')}
                  onBlur={() => handleBlur('claim_number')}
                  aria-invalid={shouldShowError('claim_number')}
                  className={`h-11 sm:h-10 ${getErrorInputClass('claim_number')}`}
                />
                {shouldShowError('claim_number') && (
                  <FormError message={errors.claim_number} />
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="select-relief-type">Relief Type *</Label>
                <Select
                  value={formData.relief_type}
                  onValueChange={(value: ReliefType) => updateField('relief_type', value)}
                >
                  <SelectTrigger id="select-relief-type" className="h-11 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reliefTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {RELIEF_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {shouldShowError('relief_type') && (
                  <FormError message={errors.relief_type} />
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="input-claim-title">Title *</Label>
              <Input
                id="input-claim-title"
                placeholder="e.g., Fifth Amendment Taking Without Just Compensation"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                aria-invalid={shouldShowError('title')}
                aria-describedby={shouldShowError('title') ? 'title-error' : undefined}
                className={`h-11 sm:h-10 ${getErrorInputClass('title')}`}
              />
              {shouldShowError('title') && (
                <FormError message={errors.title} />
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="input-claim-description">Description *</Label>
                <span className="text-xs text-muted-foreground">
                  {formData.description.length}/5000
                </span>
              </div>
              <Textarea
                id="input-claim-description"
                placeholder="Describe the claim and the relief being sought..."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                onBlur={() => handleBlur('description')}
                rows={3}
                aria-invalid={shouldShowError('description')}
                aria-describedby={shouldShowError('description') ? 'description-error' : undefined}
                className={getErrorInputClass('description')}
              />
              {shouldShowError('description') && (
                <FormError message={errors.description} />
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="input-claim-legal-basis">Legal Basis</Label>
                <span className="text-xs text-muted-foreground">
                  {(formData.legal_basis?.length || 0)}/5000
                </span>
              </div>
              <Textarea
                id="input-claim-legal-basis"
                placeholder="Cite relevant statutes, regulations, or case law..."
                value={formData.legal_basis}
                onChange={(e) => updateField('legal_basis', e.target.value)}
                onBlur={() => handleBlur('legal_basis')}
                rows={3}
                aria-invalid={shouldShowError('legal_basis')}
                className={getErrorInputClass('legal_basis')}
              />
              {shouldShowError('legal_basis') && (
                <FormError message={errors.legal_basis} />
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="input-claim-alternative"
                checked={formData.is_alternative}
                onCheckedChange={(checked) =>
                  updateField('is_alternative', checked === true)
                }
              />
              <Label htmlFor="input-claim-alternative" className="text-sm font-normal">
                This is an alternative claim (pleaded in the alternative)
              </Label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="w-full sm:w-auto h-11 sm:h-10">
              Cancel
            </Button>
            <Button id="btn-submit-claim" type="submit" disabled={loading} className="w-full sm:w-auto h-11 sm:h-10">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Claim'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
