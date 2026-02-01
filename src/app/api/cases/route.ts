import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'
import { AGENT_ROLE_TEMPLATES } from '@/lib/ai/prompts'
import { ApiError, ErrorCodes, type FieldError } from '@/lib/api-error'
import type { AgentRole } from '@/lib/types'

const caseTypes = [
  'civil', 'criminal', 'family', 'contract',
  'tort', 'property', 'constitutional', 'administrative'
] as const

const createCaseSchema = z.object({
  name: z.string()
    .min(1, 'Case name is required')
    .max(255, 'Case name must be less than 255 characters'),
  case_type: z.enum(caseTypes, 'Please select a valid case type'),
  case_number: z.string()
    .max(50, 'Case number must be less than 50 characters')
    .optional()
    .nullable()
    .transform(val => val || undefined),
  jurisdiction: z.string()
    .max(100, 'Jurisdiction must be less than 100 characters')
    .optional()
    .nullable()
    .transform(val => val || undefined),
  summary: z.string()
    .max(5000, 'Summary must be less than 5000 characters')
    .optional()
    .nullable()
    .transform(val => val || undefined),
  plaintiff_name: z.string()
    .max(255, 'Plaintiff name must be less than 255 characters')
    .optional()
    .nullable()
    .transform(val => val || undefined),
  defendant_name: z.string()
    .max(255, 'Defendant name must be less than 255 characters')
    .optional()
    .nullable()
    .transform(val => val || undefined),
  // Blind test fields
  status: z.enum(['draft', 'active', 'closed', 'archived'])
    .optional()
    .default('draft'),
  is_blind_test: z.boolean()
    .optional()
    .default(false),
  actual_ruling: z.string()
    .max(100, 'Ruling must be less than 100 characters')
    .optional()
    .nullable()
    .transform(val => val || undefined),
  actual_ruling_date: z.string()
    .optional()
    .nullable()
    .transform(val => val || undefined),
  actual_ruling_summary: z.string()
    .max(5000, 'Ruling summary must be less than 5000 characters')
    .optional()
    .nullable()
    .transform(val => val || undefined),
  ruling_revealed: z.boolean()
    .optional()
    .default(false),
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

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse(
        'Please sign in to view your cases',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }

    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        agents(count),
        documents(count),
        conversations(count)
      `)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Database error fetching cases:', error)
      return errorResponse(
        'Failed to load cases. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: error.message }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases error:', err)
    return errorResponse(
      'An unexpected error occurred while loading cases',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse(
        'Please sign in to create a case',
        ErrorCodes.UNAUTHORIZED,
        401
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
    const parsed = createCaseSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = zodErrorToFieldErrors(parsed.error)
      return errorResponse(
        'Please check your input and fix the validation errors',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { fieldErrors }
      )
    }

    // Create case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()

    if (caseError) {
      console.error('Database error creating case:', caseError)

      // Handle specific database errors
      if (caseError.code === '23505') {
        return errorResponse(
          'A case with this name already exists',
          ErrorCodes.DUPLICATE_ENTRY,
          409
        )
      }

      return errorResponse(
        'Failed to create case. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: caseError.message }
      )
    }

    // Create default agents (Judge, Plaintiff Attorney, Defense Attorney)
    const defaultRoles: AgentRole[] = ['judge', 'plaintiff_attorney', 'defense_attorney']
    const agentsToInsert = defaultRoles.map(role => ({
      case_id: caseData.id,
      role,
      name: AGENT_ROLE_TEMPLATES[role].defaultName,
      persona_prompt: AGENT_ROLE_TEMPLATES[role].defaultPrompt,
      temperature: AGENT_ROLE_TEMPLATES[role].defaultTemperature,
    }))

    const { error: agentsError } = await supabase.from('agents').insert(agentsToInsert)

    if (agentsError) {
      // Log but don't fail - the case was created successfully
      console.error('Failed to create default agents:', agentsError)
    }

    return NextResponse.json(caseData, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases error:', err)
    return errorResponse(
      'An unexpected error occurred while creating the case',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}
