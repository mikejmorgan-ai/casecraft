import { z } from 'zod'

// Relief type enum for validation
export const reliefTypes = [
  'declaratory', 'injunctive', 'regulatory_taking',
  'damages', 'restitution', 'specific_performance',
  'attorneys_fees', 'other'
] as const

export const createClaimSchema = z.object({
  claim_number: z
    .number()
    .int('Claim number must be a whole number')
    .min(1, 'Claim number must be at least 1')
    .max(999, 'Claim number cannot exceed 999'),

  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),

  relief_type: z.enum(reliefTypes, 'Please select a valid relief type'),

  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters')
    .trim(),

  legal_basis: z
    .string()
    .max(5000, 'Legal basis must be less than 5000 characters')
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),

  is_alternative: z
    .boolean()
    .optional()
    .default(false),

  alternative_to: z
    .string()
    .uuid('Invalid claim reference')
    .optional()
    .nullable()
    .transform(val => val || null),
})

// Schema for updating an existing claim (all fields optional except partial validation)
export const updateClaimSchema = z.object({
  claim_number: z
    .number()
    .int('Claim number must be a whole number')
    .min(1, 'Claim number must be at least 1')
    .max(999, 'Claim number cannot exceed 999')
    .optional(),

  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim()
    .optional(),

  relief_type: z.enum(reliefTypes, 'Please select a valid relief type').optional(),

  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters')
    .trim()
    .optional(),

  legal_basis: z
    .string()
    .max(5000, 'Legal basis must be less than 5000 characters')
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),

  is_alternative: z
    .boolean()
    .optional(),

  alternative_to: z
    .string()
    .uuid('Invalid claim reference')
    .optional()
    .nullable()
    .transform(val => val || null),
})

// TypeScript types inferred from schemas
export type CreateClaimInput = z.infer<typeof createClaimSchema>
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>
