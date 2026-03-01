import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { z } from 'zod'
import { ErrorCodes, type FieldError } from '@/lib/api-error'
import type { EvidenceRelevance } from '@/lib/types'

const createEvidenceSchema = z.object({
  claim_id: z.string()
    .uuid('Please provide a valid claim ID'),
  fact_id: z.string()
    .uuid('Please provide a valid fact ID')
    .optional()
    .nullable()
    .transform(val => val || null),
  document_id: z.string()
    .uuid('Please provide a valid document ID')
    .optional()
    .nullable()
    .transform(val => val || null),
  discovery_file: z.string()
    .max(500, 'Discovery file reference must be less than 500 characters')
    .optional()
    .nullable()
    .transform(val => val || null),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .nullable()
    .transform(val => val || null),
  relevance: z.enum(
    ['direct', 'corroborative', 'circumstantial', 'impeachment'] as const,
    'Please select a valid relevance type'
  ),
  tier: z.number()
    .int('Tier must be a whole number')
    .min(1, 'Tier must be between 1 and 12')
    .max(12, 'Tier must be between 1 and 12')
    .optional()
    .nullable()
    .transform(val => val ?? null),
  is_smoking_gun: z.boolean()
    .optional()
    .default(false),
  notes: z.string()
    .max(5000, 'Notes must be less than 5000 characters')
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse(
        'Please sign in to view evidence',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }
    const supabase = getSupabase()

    // Verify case exists and user has access
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

    // Check for claim_id filter
    const { searchParams } = new URL(request.url)
    const claimIdFilter = searchParams.get('claim_id')

    // Build query: join claim_evidence with claims_for_relief, documents, case_facts
    let query = supabase
      .from('claim_evidence')
      .select(`
        *,
        claims_for_relief!inner (
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
      .eq('claims_for_relief.case_id', caseId)

    if (claimIdFilter) {
      query = query.eq('claim_id', claimIdFilter)
    }

    query = query.order('tier', { ascending: true, nullsFirst: false })

    const { data, error } = await query

    if (error) {
      console.error('Database error fetching evidence:', error)
      return errorResponse(
        'Failed to load evidence. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases/[id]/evidence error:', err)
    return errorResponse(
      'An unexpected error occurred while loading evidence',
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
        'Please sign in to link evidence',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }
    const supabase = getSupabase()

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
    const parsed = createEvidenceSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = zodErrorToFieldErrors(parsed.error)
      return errorResponse(
        'Please check your input and fix the validation errors',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { fieldErrors }
      )
    }

    // Verify the claim belongs to this case
    const { data: claimData, error: claimError } = await supabase
      .from('claims_for_relief')
      .select('id')
      .eq('id', parsed.data.claim_id)
      .eq('case_id', caseId)
      .single()

    if (claimError || !claimData) {
      return errorResponse(
        'Claim not found in this case',
        ErrorCodes.NOT_FOUND,
        404
      )
    }

    // Verify document belongs to this case (if provided)
    if (parsed.data.document_id) {
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('id')
        .eq('id', parsed.data.document_id)
        .eq('case_id', caseId)
        .single()

      if (docError || !docData) {
        return errorResponse(
          'Document not found in this case',
          ErrorCodes.DOCUMENT_NOT_FOUND,
          404
        )
      }
    }

    // Verify fact belongs to this case (if provided)
    if (parsed.data.fact_id) {
      const { data: factData, error: factError } = await supabase
        .from('case_facts')
        .select('id')
        .eq('id', parsed.data.fact_id)
        .eq('case_id', caseId)
        .single()

      if (factError || !factData) {
        return errorResponse(
          'Fact not found in this case',
          ErrorCodes.NOT_FOUND,
          404
        )
      }
    }

    // Create evidence link
    const { data, error } = await supabase
      .from('claim_evidence')
      .insert({
        claim_id: parsed.data.claim_id,
        fact_id: parsed.data.fact_id,
        document_id: parsed.data.document_id,
        discovery_file: parsed.data.discovery_file,
        description: parsed.data.description,
        relevance: parsed.data.relevance as EvidenceRelevance,
        tier: parsed.data.tier,
        is_smoking_gun: parsed.data.is_smoking_gun,
        notes: parsed.data.notes,
      })
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
      console.error('Database error creating evidence:', error)

      if (error.code === '23505') {
        return errorResponse(
          'This evidence link already exists',
          ErrorCodes.DUPLICATE_ENTRY,
          409
        )
      }

      return errorResponse(
        'Failed to link evidence. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases/[id]/evidence error:', err)
    return errorResponse(
      'An unexpected error occurred while linking evidence',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}
