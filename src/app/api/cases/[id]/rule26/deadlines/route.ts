import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { createDeadlineSchema, updateDeadlineSchema } from '@/lib/validations/discovery'
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

// GET /api/cases/[id]/rule26/deadlines — Fetch all discovery deadlines for case
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }
    const supabase = await getSupabase()

    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return errorResponse('Case not found', 'CASE_NOT_FOUND', 404)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('discovery_deadlines')
      .select('*')
      .eq('case_id', caseId)
      .order('due_date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases/[id]/rule26/deadlines error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// POST /api/cases/[id]/rule26/deadlines — Create a new discovery deadline
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }
    const supabase = await getSupabase()

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

    const parsed = createDeadlineSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation error', 'VALIDATION_ERROR', 400, {
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      })
    }

    const { data, error } = await supabase
      .from('discovery_deadlines')
      .insert({ ...parsed.data, case_id: caseId })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases/[id]/rule26/deadlines error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// PATCH /api/cases/[id]/rule26/deadlines?deadlineId=xxx — Update a discovery deadline
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }
    const supabase = await getSupabase()

    const { searchParams } = new URL(request.url)
    const deadlineId = searchParams.get('deadlineId')

    if (!deadlineId) {
      return errorResponse('Deadline ID is required', 'MISSING_PARAM', 400)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return errorResponse('Invalid JSON body', 'INVALID_INPUT', 400)
    }

    const parsed = updateDeadlineSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation error', 'VALIDATION_ERROR', 400, {
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      })
    }

    const { data, error } = await supabase
      .from('discovery_deadlines')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', deadlineId)
      .eq('case_id', caseId)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PATCH /api/cases/[id]/rule26/deadlines error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// DELETE /api/cases/[id]/rule26/deadlines?deadlineId=xxx — Delete a discovery deadline
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }
    const supabase = await getSupabase()

    const { searchParams } = new URL(request.url)
    const deadlineId = searchParams.get('deadlineId')

    if (!deadlineId) {
      return errorResponse('Deadline ID is required', 'MISSING_PARAM', 400)
    }

    const { error } = await supabase
      .from('discovery_deadlines')
      .delete()
      .eq('id', deadlineId)
      .eq('case_id', caseId)

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/cases/[id]/rule26/deadlines error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
