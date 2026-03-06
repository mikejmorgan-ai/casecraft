import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { updateClaimSchema } from '@/lib/validations/claim'
import { ErrorCodes, type FieldError } from '@/lib/api-error'
import { z } from 'zod'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; claimId: string }> }
) {
  try {
    const { id: caseId, claimId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse(
        'Please sign in to view this claim',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }
    const supabase = await getSupabase()

    // Verify case exists
    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return errorResponse(
        'Case not found',
        ErrorCodes.CASE_NOT_FOUND,
        404
      )
    }

    const { data, error } = await supabase
      .from('claims_for_relief')
      .select(`
        *,
        claim_evidence (*)
      `)
      .eq('id', claimId)
      .eq('case_id', caseId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse(
          'Claim not found',
          ErrorCodes.NOT_FOUND,
          404
        )
      }
      console.error('Database error fetching claim:', error)
      return errorResponse(
        'Failed to load claim. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases/[id]/claims/[claimId] error:', err)
    return errorResponse(
      'An unexpected error occurred while loading the claim',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; claimId: string }> }
) {
  try {
    const { id: caseId, claimId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse(
        'Please sign in to update this claim',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }
    const supabase = await getSupabase()

    // Verify case ownership
    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return errorResponse(
        'Case not found',
        ErrorCodes.CASE_NOT_FOUND,
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
    const parsed = updateClaimSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = zodErrorToFieldErrors(parsed.error)
      return errorResponse(
        'Please check your input and fix the validation errors',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { fieldErrors }
      )
    }

    const { data, error } = await supabase
      .from('claims_for_relief')
      .update(parsed.data)
      .eq('id', claimId)
      .eq('case_id', caseId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse(
          'Claim not found',
          ErrorCodes.NOT_FOUND,
          404
        )
      }

      if (error.code === '23505') {
        return errorResponse(
          'A claim with this number already exists for this case',
          ErrorCodes.DUPLICATE_ENTRY,
          409
        )
      }

      console.error('Database error updating claim:', error)
      return errorResponse(
        'Failed to update claim. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PUT /api/cases/[id]/claims/[claimId] error:', err)
    return errorResponse(
      'An unexpected error occurred while updating the claim',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; claimId: string }> }
) {
  try {
    const { id: caseId, claimId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse(
        'Please sign in to delete this claim',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }
    const supabase = await getSupabase()

    // Verify case ownership
    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return errorResponse(
        'Case not found',
        ErrorCodes.CASE_NOT_FOUND,
        404
      )
    }

    // Delete associated evidence first
    const { error: evidenceError } = await supabase
      .from('claim_evidence')
      .delete()
      .eq('claim_id', claimId)

    if (evidenceError) {
      console.error('Database error deleting claim evidence:', evidenceError)
      return errorResponse(
        'Failed to delete claim evidence. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: evidenceError.message }
      )
    }

    // Delete the claim
    const { error } = await supabase
      .from('claims_for_relief')
      .delete()
      .eq('id', claimId)
      .eq('case_id', caseId)

    if (error) {
      console.error('Database error deleting claim:', error)
      return errorResponse(
        'Failed to delete claim. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/cases/[id]/claims/[claimId] error:', err)
    return errorResponse(
      'An unexpected error occurred while deleting the claim',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}
