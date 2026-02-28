import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createInitialDisclosureSchema, updateInitialDisclosureSchema } from '@/lib/validations/discovery'
import { z } from 'zod'

function zodErrorToFieldErrors(error: z.ZodError) {
  return error.issues.map((issue: z.ZodIssue) => ({
    field: issue.path.join('.') || 'unknown',
    message: issue.message,
    code: issue.code,
  }))
}

function errorResponse(
  error: string,
  code: string,
  statusCode: number,
  options?: { fieldErrors?: { field: string; message: string; code?: string }[]; details?: string }
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

// GET /api/cases/[id]/rule26/disclosures — Fetch all initial disclosures with their items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return errorResponse('Case not found', 'CASE_NOT_FOUND', 404)
    }

    const { data, error } = await supabase
      .from('initial_disclosures')
      .select(`
        *,
        disclosure_items(*)
      `)
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases/[id]/rule26/disclosures error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// POST /api/cases/[id]/rule26/disclosures — Create a new initial disclosure
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return errorResponse('Case not found', 'CASE_NOT_FOUND', 404)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return errorResponse('Invalid JSON body', 'INVALID_INPUT', 400)
    }

    const parsed = createInitialDisclosureSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation error', 'VALIDATION_ERROR', 400, {
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      })
    }

    const { data, error } = await supabase
      .from('initial_disclosures')
      .insert({ ...parsed.data, case_id: caseId })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases/[id]/rule26/disclosures error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// PATCH /api/cases/[id]/rule26/disclosures?disclosureId=... — Update an initial disclosure
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()
    const { searchParams } = new URL(request.url)
    const disclosureId = searchParams.get('disclosureId')

    if (!disclosureId) {
      return errorResponse('Disclosure ID required', 'MISSING_PARAM', 400)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return errorResponse('Case not found', 'CASE_NOT_FOUND', 404)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return errorResponse('Invalid JSON body', 'INVALID_INPUT', 400)
    }

    const parsed = updateInitialDisclosureSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation error', 'VALIDATION_ERROR', 400, {
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      })
    }

    const { data, error } = await supabase
      .from('initial_disclosures')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', disclosureId)
      .eq('case_id', caseId)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PATCH /api/cases/[id]/rule26/disclosures error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// DELETE /api/cases/[id]/rule26/disclosures?disclosureId=... — Delete an initial disclosure
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()
    const { searchParams } = new URL(request.url)
    const disclosureId = searchParams.get('disclosureId')

    if (!disclosureId) {
      return errorResponse('Disclosure ID required', 'MISSING_PARAM', 400)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return errorResponse('Case not found', 'CASE_NOT_FOUND', 404)
    }

    const { error } = await supabase
      .from('initial_disclosures')
      .delete()
      .eq('id', disclosureId)
      .eq('case_id', caseId)

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/cases/[id]/rule26/disclosures error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
