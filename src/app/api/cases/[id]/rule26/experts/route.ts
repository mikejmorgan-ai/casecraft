import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { createExpertDisclosureSchema, updateExpertDisclosureSchema } from '@/lib/validations/discovery'
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

// GET /api/cases/[id]/rule26/experts — Fetch all expert disclosures for a case
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
      .from('expert_disclosures')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases/[id]/rule26/experts error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// POST /api/cases/[id]/rule26/experts — Create an expert disclosure
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

    const parsed = createExpertDisclosureSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation error', 'VALIDATION_ERROR', 400, {
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      })
    }

    const { data, error } = await supabase
      .from('expert_disclosures')
      .insert({ ...parsed.data, case_id: caseId })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases/[id]/rule26/experts error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// PATCH /api/cases/[id]/rule26/experts?expertId=... — Update an expert disclosure
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { searchParams } = new URL(request.url)
    const expertId = searchParams.get('expertId')

    if (!expertId) {
      return errorResponse('Expert ID required', 'MISSING_PARAMETER', 400)
    }

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

    const parsed = updateExpertDisclosureSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation error', 'VALIDATION_ERROR', 400, {
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      })
    }

    const { data, error } = await supabase
      .from('expert_disclosures')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', expertId)
      .eq('case_id', caseId)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PATCH /api/cases/[id]/rule26/experts error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// DELETE /api/cases/[id]/rule26/experts?expertId=... — Delete an expert disclosure
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { searchParams } = new URL(request.url)
    const expertId = searchParams.get('expertId')

    if (!expertId) {
      return errorResponse('Expert ID required', 'MISSING_PARAMETER', 400)
    }

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

    const { error } = await supabase
      .from('expert_disclosures')
      .delete()
      .eq('id', expertId)
      .eq('case_id', caseId)

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/cases/[id]/rule26/experts error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
