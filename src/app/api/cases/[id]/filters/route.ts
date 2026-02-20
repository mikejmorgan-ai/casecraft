import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'
import { ErrorCodes, type FieldError } from '@/lib/api-error'

const createFilterTermSchema = z.object({
  term: z
    .string()
    .min(1, 'Term is required')
    .max(500, 'Term must be less than 500 characters')
    .trim(),

  filter_type: z.enum(
    ['exclude', 'include'] as const,
    { message: 'Filter type must be either "exclude" or "include"' }
  ),

  category: z
    .string()
    .max(100, 'Category must be less than 100 characters')
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse(
        'Please sign in to view filter terms',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }

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

    // Check for optional query params
    const { searchParams } = new URL(request.url)
    const filterType = searchParams.get('filter_type')
    const activeOnly = searchParams.get('active_only') !== 'false' // default true

    let query = supabase
      .from('filter_key_terms')
      .select('*')
      .eq('case_id', caseId)

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (filterType && (filterType === 'exclude' || filterType === 'include')) {
      query = query.eq('filter_type', filterType)
    }

    query = query.order('category', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Database error fetching filter terms:', error)
      return errorResponse(
        'Failed to load filter terms. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases/[id]/filters error:', err)
    return errorResponse(
      'An unexpected error occurred while loading filter terms',
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
    const supabase = await createServerSupabase()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse(
        'Please sign in to add a filter term',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }

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
    const parsed = createFilterTermSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = zodErrorToFieldErrors(parsed.error)
      return errorResponse(
        'Please check your input and fix the validation errors',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { fieldErrors }
      )
    }

    // Create filter term
    const { data, error } = await supabase
      .from('filter_key_terms')
      .insert({
        case_id: caseId,
        term: parsed.data.term,
        filter_type: parsed.data.filter_type,
        category: parsed.data.category,
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating filter term:', error)

      if (error.code === '23505') {
        return errorResponse(
          'This filter term already exists for this case',
          ErrorCodes.DUPLICATE_ENTRY,
          409
        )
      }

      return errorResponse(
        'Failed to create filter term. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases/[id]/filters error:', err)
    return errorResponse(
      'An unexpected error occurred while creating the filter term',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse(
        'Please sign in to remove a filter term',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }

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

    // Get term ID from query params
    const { searchParams } = new URL(request.url)
    const termId = searchParams.get('term_id')

    if (!termId) {
      return errorResponse(
        'term_id query parameter is required',
        ErrorCodes.INVALID_INPUT,
        400
      )
    }

    // Deactivate the filter term (soft delete)
    const { data, error } = await supabase
      .from('filter_key_terms')
      .update({ is_active: false })
      .eq('id', termId)
      .eq('case_id', caseId)
      .select()
      .single()

    if (error) {
      console.error('Database error deactivating filter term:', error)

      if (error.code === 'PGRST116') {
        return errorResponse(
          'Filter term not found',
          ErrorCodes.NOT_FOUND,
          404
        )
      }

      return errorResponse(
        'Failed to remove filter term. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    if (!data) {
      return errorResponse(
        'Filter term not found',
        ErrorCodes.NOT_FOUND,
        404
      )
    }

    return NextResponse.json({ success: true, deactivated: data })
  } catch (err) {
    console.error('DELETE /api/cases/[id]/filters error:', err)
    return errorResponse(
      'An unexpected error occurred while removing the filter term',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}
