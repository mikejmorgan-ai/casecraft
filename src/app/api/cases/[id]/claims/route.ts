import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { createClaimSchema } from '@/lib/validations/claim'
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse(
        'Please sign in to view claims',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }
    const supabase = getSupabase()

    // Verify case exists and user has access
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
      .eq('case_id', caseId)
      .order('claim_number', { ascending: true })

    if (error) {
      console.error('Database error fetching claims:', error)
      return errorResponse(
        'Failed to load claims. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases/[id]/claims error:', err)
    return errorResponse(
      'An unexpected error occurred while loading claims',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse(
        'Please sign in to create a claim',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }
    const supabase = getSupabase()

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
    const parsed = createClaimSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = zodErrorToFieldErrors(parsed.error)
      return errorResponse(
        'Please check your input and fix the validation errors',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { fieldErrors }
      )
    }

    // Create claim
    const { data, error } = await supabase
      .from('claims_for_relief')
      .insert({
        ...parsed.data,
        case_id: caseId,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating claim:', error)

      if (error.code === '23505') {
        return errorResponse(
          'A claim with this number already exists for this case',
          ErrorCodes.DUPLICATE_ENTRY,
          409
        )
      }

      return errorResponse(
        'Failed to create claim. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases/[id]/claims error:', err)
    return errorResponse(
      'An unexpected error occurred while creating the claim',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}
