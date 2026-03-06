import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { z } from 'zod'
import { ErrorCodes, type FieldError } from '@/lib/api-error'
import type { EvidenceRelevance } from '@/lib/types'

const updateEvidenceSchema = z.object({
  relevance: z.enum(
    ['direct', 'corroborative', 'circumstantial', 'impeachment'] as const,
    'Please select a valid relevance type'
  ).optional(),
  tier: z.number()
    .int('Tier must be a whole number')
    .min(1, 'Tier must be between 1 and 12')
    .max(12, 'Tier must be between 1 and 12')
    .optional()
    .nullable()
    .transform(val => val ?? null),
  is_smoking_gun: z.boolean()
    .optional(),
  notes: z.string()
    .max(5000, 'Notes must be less than 5000 characters')
    .optional()
    .nullable()
    .transform(val => val || null),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .nullable()
    .transform(val => val || null),
  discovery_file: z.string()
    .max(500, 'Discovery file reference must be less than 500 characters')
    .optional()
    .nullable()
    .transform(val => val || null),
})

/**
 * Convert Zod validation errors to field errors
 */
function zodErrorToFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue: z.ZodIssue) => ({
    field: issue.path.join('.') || 'unknown',
    message: issue.message,
    code: issue.code,
  }))
}

/**
 * Create a standardized error response
 */
function errorResponse(
  error: string,
  code: string,
  statusCode: number,
  options?: { fieldErrors?: FieldError[]; details?: string }
) {
  return NextResponse.json(
    {
      error,
      code,
      message: error,
      fieldErrors: options?.fieldErrors,
      details: options?.details,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const { id: caseId, evidenceId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse(
        'Please sign in to update evidence',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }
    const supabase = await getSupabase()

    // Verify case exists
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return errorResponse(
        'Case not found',
        ErrorCodes.CASE_NOT_FOUND,
        404
      )
    }

    // Verify evidence exists and belongs to this case (via claim)
    const { data: existingEvidence, error: evidenceCheckError } = await supabase
      .from('claim_evidence')
      .select(`
        id,
        claims_for_relief!inner (
          case_id
        )
      `)
      .eq('id', evidenceId)
      .eq('claims_for_relief.case_id', caseId)
      .single()

    if (evidenceCheckError || !existingEvidence) {
      return errorResponse(
        'Evidence not found in this case',
        ErrorCodes.NOT_FOUND,
        404
      )
    }

    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return errorResponse(
        'Invalid request body. Please provide valid JSON.',
        ErrorCodes.INVALID_INPUT,
        400
      )
    }

    // Validate input
    const parsed = updateEvidenceSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = zodErrorToFieldErrors(parsed.error)
      return errorResponse(
        'Please check your input and fix the validation errors',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { fieldErrors }
      )
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}
    if (parsed.data.relevance !== undefined) updateData.relevance = parsed.data.relevance as EvidenceRelevance
    if (parsed.data.tier !== undefined) updateData.tier = parsed.data.tier
    if (parsed.data.is_smoking_gun !== undefined) updateData.is_smoking_gun = parsed.data.is_smoking_gun
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description
    if (parsed.data.discovery_file !== undefined) updateData.discovery_file = parsed.data.discovery_file

    if (Object.keys(updateData).length === 0) {
      return errorResponse(
        'No fields to update',
        ErrorCodes.INVALID_INPUT,
        400
      )
    }

    // Update evidence
    const { data, error } = await supabase
      .from('claim_evidence')
      .update(updateData)
      .eq('id', evidenceId)
      .select(`
        *,
        claims_for_relief (
          id,
          case_id,
          claim_number,
          title,
          relief_type,
          description,
          legal_basis
        ),
        documents (
          id,
          name,
          doc_type,
          file_path
        ),
        case_facts (
          id,
          fact_text,
          category,
          is_disputed
        )
      `)
      .single()

    if (error) {
      console.error('Database error updating evidence:', error)
      return errorResponse(
        'Failed to update evidence. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PUT /api/cases/[id]/evidence/[evidenceId] error:', err)
    return errorResponse(
      'An unexpected error occurred while updating evidence',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const { id: caseId, evidenceId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse(
        'Please sign in to remove evidence',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }
    const supabase = await getSupabase()

    // Verify case exists
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return errorResponse(
        'Case not found',
        ErrorCodes.CASE_NOT_FOUND,
        404
      )
    }

    // Verify evidence exists and belongs to this case (via claim)
    const { data: existingEvidence, error: evidenceCheckError } = await supabase
      .from('claim_evidence')
      .select(`
        id,
        claims_for_relief!inner (
          case_id
        )
      `)
      .eq('id', evidenceId)
      .eq('claims_for_relief.case_id', caseId)
      .single()

    if (evidenceCheckError || !existingEvidence) {
      return errorResponse(
        'Evidence not found in this case',
        ErrorCodes.NOT_FOUND,
        404
      )
    }

    // Delete evidence link
    const { error } = await supabase
      .from('claim_evidence')
      .delete()
      .eq('id', evidenceId)

    if (error) {
      console.error('Database error deleting evidence:', error)
      return errorResponse(
        'Failed to remove evidence. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json({ success: true, message: 'Evidence link removed' })
  } catch (err) {
    console.error('DELETE /api/cases/[id]/evidence/[evidenceId] error:', err)
    return errorResponse(
      'An unexpected error occurred while removing evidence',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}
