'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { createCaseSchema, caseFieldValidators, type CreateCaseInput } from '@/lib/validations/case'
import { handleApiError } from '@/lib/api-error'
import type { CaseType } from '@/lib/types'
import { z } from 'zod'

const CASE_TYPES: { value: CaseType; label: string }[] = [
  { value: 'civil', label: 'Civil' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'family', label: 'Family' },
  { value: 'contract', label: 'Contract' },
  { value: 'tort', label: 'Tort' },
  { value: 'property', label: 'Property' },
  { value: 'constitutional', label: 'Constitutional' },
  { value: 'administrative', label: 'Administrative' },
]

type FormErrors = Partial<Record<keyof CreateCaseInput, string>>
type TouchedFields = Partial<Record<keyof CreateCaseInput, boolean>>

export function CreateCaseDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCaseInput>({
    name: '',
    case_type: 'civil',
    case_number: '',
    jurisdiction: '',
    plaintiff_name: '',
    defendant_name: '',
    summary: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<TouchedFields>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const router = useRouter()

  // Validate a single field
  const validateField = useCallback((field: keyof CreateCaseInput, value: unknown): string | undefined => {
    try {
      if (field === 'name') {
        caseFieldValidators.name.parse(value)
      } else if (field === 'case_number' && value) {
        caseFieldValidators.case_number.parse(value)
      } else if (field === 'summary' && value) {
        caseFieldValidators.summary.parse(value)
      }
      return undefined
    } catch (err) {
      if (err instanceof z.ZodError) {
        return err.issues[0]?.message
      }
      return 'Invalid value'
    }
  }, [])

  // Handle field blur (validate on blur)
  const handleBlur = useCallback((field: keyof CreateCaseInput) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [formData, validateField])

  // Update form data and clear error for the field
  const updateField = useCallback(<K extends keyof CreateCaseInput>(
    field: K,
    value: CreateCaseInput[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing (if field was touched or submit attempted)
    if (touched[field] || submitAttempted) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }, [touched, submitAttempted, validateField])

  // Reset form state
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      case_type: 'civil',
      case_number: '',
      jurisdiction: '',
      plaintiff_name: '',
      defendant_name: '',
      summary: '',
    })
    setErrors({})
    setTouched({})
    setSubmitAttempted(false)
  }, [])

  // Handle dialog close
  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      resetForm()
    }
  }, [resetForm])

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const result = createCaseSchema.safeParse(formData)

    if (!result.success) {
      const newErrors: FormErrors = {}
      result.error.issues.forEach((issue: z.ZodIssue) => {
        const field = issue.path[0] as keyof CreateCaseInput
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

    // Validate the entire form
    if (!validateForm()) {
      toast.error('Please fix the validation errors', {
        description: 'Check the highlighted fields below.',
      })
      return
    }

    setLoading(true)

    try {
      // Parse and transform the data through the schema
      const validatedData = createCaseSchema.parse(formData)

      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const apiError = await handleApiError(response)

        // Map field errors from API response
        if (apiError.fieldErrors && apiError.fieldErrors.length > 0) {
          const newErrors: FormErrors = {}
          apiError.fieldErrors.forEach(err => {
            const field = err.field as keyof CreateCaseInput
            if (!newErrors[field]) {
              newErrors[field] = err.message
            }
          })
          setErrors(newErrors)
          toast.error('Validation error', {
            description: 'Please check the highlighted fields.',
          })
        } else {
          toast.error('Failed to create case', {
            description: apiError.message,
          })
        }
        return
      }

      const newCase = await response.json()

      // Success notification
      toast.success('Case created successfully', {
        description: `"${newCase.name}" has been created with default agents.`,
      })

      handleOpenChange(false)
      router.push(`/case/${newCase.id}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to create case:', error)

      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {}
        error.issues.forEach((issue: z.ZodIssue) => {
          const field = issue.path[0] as keyof CreateCaseInput
          if (!newErrors[field]) {
            newErrors[field] = issue.message
          }
        })
        setErrors(newErrors)
        toast.error('Validation error', {
          description: 'Please fix the highlighted fields.',
        })
      } else {
        // Network or unexpected errors
        const errorMessage = error instanceof Error
          ? error.message
          : 'An unexpected error occurred'

        toast.error('Failed to create case', {
          description: errorMessage,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Helper to determine if we should show an error for a field
  const shouldShowError = (field: keyof CreateCaseInput): boolean => {
    return (touched[field] || submitAttempted) && !!errors[field]
  }

  // Helper to get error input class
  const getErrorInputClass = (field: keyof CreateCaseInput): string => {
    return shouldShowError(field) ? 'border-red-500 focus-visible:ring-red-500' : ''
  }

  // Memoized field handlers to prevent unnecessary re-renders
  const fieldHandlers = useMemo(() => ({
    name: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value),
      onBlur: () => handleBlur('name'),
    },
    case_number: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField('case_number', e.target.value),
      onBlur: () => handleBlur('case_number'),
    },
    jurisdiction: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField('jurisdiction', e.target.value),
      onBlur: () => handleBlur('jurisdiction'),
    },
    plaintiff_name: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField('plaintiff_name', e.target.value),
      onBlur: () => handleBlur('plaintiff_name'),
    },
    defendant_name: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField('defendant_name', e.target.value),
      onBlur: () => handleBlur('defendant_name'),
    },
    summary: {
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('summary', e.target.value),
      onBlur: () => handleBlur('summary'),
    },
  }), [updateField, handleBlur])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button id="btn-create-case" title="Create a new case (N)">
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent id="create-case-dialog" className="w-[calc(100%-2rem)] max-w-[500px] mx-auto">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
            <DialogDescription>
              Set up a new case simulation. Default agents will be created automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="input-case-name">Case Name *</Label>
              <Input
                id="input-case-name"
                placeholder="e.g., Smith v. Jones"
                value={formData.name}
                onChange={fieldHandlers.name.onChange}
                onBlur={fieldHandlers.name.onBlur}
                aria-invalid={shouldShowError('name')}
                aria-describedby={shouldShowError('name') ? 'name-error' : undefined}
                className={`h-11 sm:h-10 ${getErrorInputClass('name')}`}
              />
              {shouldShowError('name') && (
                <FormError message={errors.name} />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="select-case-type">Case Type *</Label>
                <Select
                  value={formData.case_type}
                  onValueChange={(value: CaseType) => updateField('case_type', value)}
                >
                  <SelectTrigger id="select-case-type" className="h-11 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {shouldShowError('case_type') && (
                  <FormError message={errors.case_type} />
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="input-case-number">Case Number</Label>
                <Input
                  id="input-case-number"
                  placeholder="e.g., 2024-CV-00123"
                  value={formData.case_number || ''}
                  onChange={fieldHandlers.case_number.onChange}
                  onBlur={fieldHandlers.case_number.onBlur}
                  aria-invalid={shouldShowError('case_number')}
                  aria-describedby={shouldShowError('case_number') ? 'case-number-error' : undefined}
                  className={`h-11 sm:h-10 ${getErrorInputClass('case_number')}`}
                />
                {shouldShowError('case_number') && (
                  <FormError message={errors.case_number} />
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="input-jurisdiction">Jurisdiction</Label>
              <Input
                id="input-jurisdiction"
                placeholder="e.g., Federal - Northern District of California"
                value={formData.jurisdiction || ''}
                onChange={fieldHandlers.jurisdiction.onChange}
                onBlur={fieldHandlers.jurisdiction.onBlur}
                aria-invalid={shouldShowError('jurisdiction')}
                className={`h-11 sm:h-10 ${getErrorInputClass('jurisdiction')}`}
              />
              {shouldShowError('jurisdiction') && (
                <FormError message={errors.jurisdiction} />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="input-plaintiff">Plaintiff</Label>
                <Input
                  id="input-plaintiff"
                  placeholder="Plaintiff name"
                  value={formData.plaintiff_name || ''}
                  onChange={fieldHandlers.plaintiff_name.onChange}
                  onBlur={fieldHandlers.plaintiff_name.onBlur}
                  aria-invalid={shouldShowError('plaintiff_name')}
                  className={`h-11 sm:h-10 ${getErrorInputClass('plaintiff_name')}`}
                />
                {shouldShowError('plaintiff_name') && (
                  <FormError message={errors.plaintiff_name} />
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="input-defendant">Defendant</Label>
                <Input
                  id="input-defendant"
                  placeholder="Defendant name"
                  value={formData.defendant_name || ''}
                  onChange={fieldHandlers.defendant_name.onChange}
                  onBlur={fieldHandlers.defendant_name.onBlur}
                  aria-invalid={shouldShowError('defendant_name')}
                  className={`h-11 sm:h-10 ${getErrorInputClass('defendant_name')}`}
                />
                {shouldShowError('defendant_name') && (
                  <FormError message={errors.defendant_name} />
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="input-summary">Case Summary</Label>
                <span className="text-xs text-muted-foreground">
                  {(formData.summary?.length || 0)}/1000
                </span>
              </div>
              <Textarea
                id="input-summary"
                placeholder="Brief description of the case..."
                value={formData.summary || ''}
                onChange={fieldHandlers.summary.onChange}
                onBlur={fieldHandlers.summary.onBlur}
                rows={3}
                aria-invalid={shouldShowError('summary')}
                aria-describedby={shouldShowError('summary') ? 'summary-error' : undefined}
                className={getErrorInputClass('summary')}
              />
              {shouldShowError('summary') && (
                <FormError message={errors.summary} />
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="w-full sm:w-auto h-11 sm:h-10">
              Cancel
            </Button>
            <Button id="btn-submit-case" type="submit" disabled={loading} className="w-full sm:w-auto h-11 sm:h-10">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Case'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
