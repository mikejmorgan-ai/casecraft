import { z } from 'zod'

// Document type enum for validation
const documentTypes = [
  'complaint', 'answer', 'motion', 'brief', 'discovery',
  'deposition', 'exhibit', 'order', 'judgment', 'other'
] as const

// Allowed MIME types for document uploads
const allowedMimeTypes = [
  'application/pdf',
  'text/plain',
  'text/markdown',
] as const

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

export const uploadDocumentSchema = z.object({
  name: z
    .string()
    .min(1, 'Document name is required')
    .max(255, 'Document name cannot exceed 255 characters')
    .trim(),

  doc_type: z.enum(documentTypes, 'Please select a valid document type'),

  filed_by: z
    .string()
    .max(150, 'Filed by cannot exceed 150 characters')
    .optional(),
})

// Schema for validating file metadata (separate from content)
export const documentFileSchema = z.object({
  name: z
    .string()
    .min(1, 'File name is required'),

  size: z
    .number()
    .max(MAX_FILE_SIZE, 'File size cannot exceed 10MB'),

  type: z
    .string()
    .refine(
      (type) => allowedMimeTypes.includes(type as typeof allowedMimeTypes[number]) || type === '',
      'Only PDF, TXT, and Markdown files are allowed'
    ),
})

// Schema for updating document metadata
export const updateDocumentSchema = z.object({
  name: z
    .string()
    .min(1, 'Document name is required')
    .max(255, 'Document name cannot exceed 255 characters')
    .trim()
    .optional(),

  doc_type: z.enum(documentTypes, 'Please select a valid document type').optional(),
})

// TypeScript types inferred from schemas
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>
export type DocumentFileInput = z.infer<typeof documentFileSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>

// Export document types for reuse
export const DOCUMENT_TYPES = documentTypes
export const ALLOWED_MIME_TYPES = allowedMimeTypes
export const MAX_DOCUMENT_SIZE = MAX_FILE_SIZE

// Field-level validation for real-time feedback
export const documentFieldValidators = {
  name: z
    .string()
    .min(1, 'Document name is required')
    .max(255, 'Document name cannot exceed 255 characters'),
}
