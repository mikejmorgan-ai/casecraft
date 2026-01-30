import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormErrorProps {
  message?: string
  className?: string
}

/**
 * FormError - Displays inline validation error messages for form fields
 *
 * Usage:
 * <FormError message={errors.fieldName?.message} />
 */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-1.5 text-sm text-red-600 mt-1.5',
        className
      )}
    >
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

interface FormFieldProps {
  children: React.ReactNode
  error?: string
  className?: string
}

/**
 * FormField - Wrapper component that combines a form field with its error message
 *
 * Usage:
 * <FormField error={errors.fieldName?.message}>
 *   <Input {...register('fieldName')} />
 * </FormField>
 */
export function FormField({ children, error, className }: FormFieldProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      {children}
      <FormError message={error} />
    </div>
  )
}

interface FormErrorSummaryProps {
  errors: Record<string, { message?: string } | undefined>
  className?: string
}

/**
 * FormErrorSummary - Displays a summary of all form errors at the top of a form
 *
 * Usage:
 * <FormErrorSummary errors={formErrors} />
 */
export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorMessages = Object.entries(errors)
    .filter(([, error]) => error?.message)
    .map(([field, error]) => ({ field, message: error!.message! }))

  if (errorMessages.length === 0) return null

  return (
    <div
      role="alert"
      className={cn(
        'bg-red-50 border border-red-200 rounded-lg p-4 mb-4',
        className
      )}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-red-800">
            Please fix the following errors:
          </h4>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
            {errorMessages.map(({ field, message }) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
