import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { createWrittenDiscoverySchema, updateWrittenDiscoverySchema } from '@/lib/validations/discovery'
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

// GET /api/cases/[id]/rule26/written-discovery — Fetch all written discovery sets for case
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

    const { data, error } = await supabase
      .from('written_discovery')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases/[id]/rule26/written-discovery error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// POST /api/cases/[id]/rule26/written-discovery — Create a new written discovery set
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

    const parsed = createWrittenDiscoverySchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation error', 'VALIDATION_ERROR', 400, {
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      })
    }

    const { data, error } = await supabase
      .from('written_discovery')
      .insert({ ...parsed.data, case_id: caseId })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases/[id]/rule26/written-discovery error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// PATCH /api/cases/[id]/rule26/written-discovery?discoveryId=xxx — Update a written discovery set
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
    const discoveryId = searchParams.get('discoveryId')

    if (!discoveryId) {
      return errorResponse('Discovery ID is required', 'MISSING_PARAM', 400)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return errorResponse('Invalid JSON body', 'INVALID_INPUT', 400)
    }

    const parsed = updateWrittenDiscoverySchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation error', 'VALIDATION_ERROR', 400, {
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      })
    }

    const { data, error } = await supabase
      .from('written_discovery')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', discoveryId)
      .eq('case_id', caseId)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PATCH /api/cases/[id]/rule26/written-discovery error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// DELETE /api/cases/[id]/rule26/written-discovery?discoveryId=xxx — Delete a written discovery set
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
    const discoveryId = searchParams.get('discoveryId')

    if (!discoveryId) {
      return errorResponse('Discovery ID is required', 'MISSING_PARAM', 400)
    }

    const { error } = await supabase
      .from('written_discovery')
      .delete()
      .eq('id', discoveryId)
      .eq('case_id', caseId)

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/cases/[id]/rule26/written-discovery error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
