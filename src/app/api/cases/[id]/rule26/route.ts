import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createDiscoveryConfigSchema, updateDiscoveryConfigSchema } from '@/lib/validations/discovery'
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

// GET /api/cases/[id]/rule26 — Get discovery config + summary stats
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

    // Fetch config
    const { data: config } = await supabase
      .from('discovery_configs')
      .select('*')
      .eq('case_id', caseId)
      .single()

    // Fetch counts for summary dashboard
    const [
      { count: disclosureCount },
      { count: expertCount },
      { count: deadlineCount },
      { count: privilegeCount },
      { count: writtenCount },
    ] = await Promise.all([
      supabase.from('initial_disclosures').select('*', { count: 'exact', head: true }).eq('case_id', caseId),
      supabase.from('expert_disclosures').select('*', { count: 'exact', head: true }).eq('case_id', caseId),
      supabase.from('discovery_deadlines').select('*', { count: 'exact', head: true }).eq('case_id', caseId),
      supabase.from('privilege_log_entries').select('*', { count: 'exact', head: true }).eq('case_id', caseId),
      supabase.from('written_discovery').select('*', { count: 'exact', head: true }).eq('case_id', caseId),
    ])

    // Fetch upcoming deadlines
    const { data: upcomingDeadlines } = await supabase
      .from('discovery_deadlines')
      .select('*')
      .eq('case_id', caseId)
      .in('status', ['upcoming', 'due_soon', 'overdue'])
      .order('due_date', { ascending: true })
      .limit(5)

    return NextResponse.json({
      config,
      summary: {
        disclosures: disclosureCount || 0,
        experts: expertCount || 0,
        deadlines: deadlineCount || 0,
        privilege_entries: privilegeCount || 0,
        written_discovery: writtenCount || 0,
      },
      upcoming_deadlines: upcomingDeadlines || [],
    })
  } catch (err) {
    console.error('GET /api/cases/[id]/rule26 error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// POST /api/cases/[id]/rule26 — Create or update discovery config
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

    const parsed = createDiscoveryConfigSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation error', 'VALIDATION_ERROR', 400, {
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      })
    }

    // Upsert: create if not exists, update if exists
    const { data: existing } = await supabase
      .from('discovery_configs')
      .select('id')
      .eq('case_id', caseId)
      .single()

    let data
    if (existing) {
      const { data: updated, error } = await supabase
        .from('discovery_configs')
        .update({ ...parsed.data, updated_at: new Date().toISOString() })
        .eq('case_id', caseId)
        .select()
        .single()

      if (error) {
        return errorResponse(error.message, 'DATABASE_ERROR', 500)
      }
      data = updated
    } else {
      const { data: created, error } = await supabase
        .from('discovery_configs')
        .insert({ ...parsed.data, case_id: caseId })
        .select()
        .single()

      if (error) {
        return errorResponse(error.message, 'DATABASE_ERROR', 500)
      }
      data = created
    }

    return NextResponse.json(data, { status: existing ? 200 : 201 })
  } catch (err) {
    console.error('POST /api/cases/[id]/rule26 error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

// PATCH /api/cases/[id]/rule26 — Update discovery config
export async function PATCH(
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

    let body
    try {
      body = await request.json()
    } catch {
      return errorResponse('Invalid JSON body', 'INVALID_INPUT', 400)
    }

    const parsed = updateDiscoveryConfigSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('Validation error', 'VALIDATION_ERROR', 400, {
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      })
    }

    const { data, error } = await supabase
      .from('discovery_configs')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('case_id', caseId)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 'DATABASE_ERROR', 500)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PATCH /api/cases/[id]/rule26 error:', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
