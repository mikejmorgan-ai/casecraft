import { z } from 'zod'

// Case type enum for validation
export const caseTypes = [
  'civil', 'criminal', 'family', 'contract',
  'tort', 'property', 'constitutional', 'administrative'
] as const

// Case number pattern: allows formats like "2024-CV-00123", "CV-2024-123", "24CV0123"
const caseNumberPattern = /^[A-Z0-9]{2,4}[-\s]?[A-Z0-9]{2,6}[-\s]?[A-Z0-9]{2,8}$/i

export const createCaseSchema = z.object({
  name: z
    .string()
    .min(3, 'Case name must be at least 3 characters')
    .max(100, 'Case name cannot exceed 100 characters')
    .trim(),

  case_type: z.enum(caseTypes, 'Please select a valid case type'),

  case_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || caseNumberPattern.test(val),
      'Case number format is invalid. Expected format like "2024-CV-00123"'
    ),

  jurisdiction: z
    .string()
    .max(200, 'Jurisdiction cannot exceed 200 characters')
    .optional()
    .transform(val => val?.trim() || undefined),

  plaintiff_name: z
    .string()
    .max(150, 'Plaintiff name cannot exceed 150 characters')
    .optional()
    .transform(val => val?.trim() || undefined),

  defendant_name: z
    .string()
    .max(150, 'Defendant name cannot exceed 150 characters')
    .optional()
    .transform(val => val?.trim() || undefined),

  summary: z
    .string()
    .max(1000, 'Summary cannot exceed 1000 characters')
    .optional()
    .transform(val => val?.trim() || undefined),
})

// Schema for updating an existing case (all fields optional)
export const updateCaseSchema = createCaseSchema.partial()

// TypeScript types inferred from schemas
export type CreateCaseInput = z.infer<typeof createCaseSchema>
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>

// Field-level validation for real-time feedback
export const caseFieldValidators = {
  name: z
    .string()
    .min(3, 'Case name must be at least 3 characters')
    .max(100, 'Case name cannot exceed 100 characters'),

  case_number: z
    .string()
    .refine(
      (val) => !val || caseNumberPattern.test(val),
      'Invalid format. Example: 2024-CV-00123'
    ),

  summary: z
    .string()
    .max(1000, 'Summary cannot exceed 1000 characters'),
}
