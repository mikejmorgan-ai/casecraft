import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { z } from 'zod'

const createFactSchema = z.object({
  category: z.enum(['undisputed', 'disputed', 'evidence_based', 'testimony', 'expert_opinion', 'stipulated']),
  fact_text: z.string().min(1),
  source_document_id: z.string().uuid().optional().nullable(),
  is_disputed: z.boolean().optional(),
})

const updateFactSchema = z.object({
  category: z.enum(['undisputed', 'disputed', 'evidence_based', 'testimony', 'expert_opinion', 'stipulated']).optional(),
  fact_text: z.string().min(1).optional(),
  source_document_id: z.string().uuid().optional().nullable(),
  is_disputed: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('case_facts')
      .select(`
        *,
        documents:source_document_id(name)
      `)
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases/[id]/facts error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getSupabase()

    // Verify case ownership
    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = createFactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('case_facts')
      .insert({
        ...parsed.data,
        case_id: caseId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases/[id]/facts error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { searchParams } = new URL(request.url)
    const factId = searchParams.get('factId')

    if (!factId) {
      return NextResponse.json({ error: 'Fact ID required' }, { status: 400 })
    }

    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getSupabase()

    const body = await request.json()
    const parsed = updateFactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('case_facts')
      .update(parsed.data)
      .eq('id', factId)
      .eq('case_id', caseId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PATCH /api/cases/[id]/facts error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { searchParams } = new URL(request.url)
    const factId = searchParams.get('factId')

    if (!factId) {
      return NextResponse.json({ error: 'Fact ID required' }, { status: 400 })
    }

    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getSupabase()

    const { error } = await supabase
      .from('case_facts')
      .delete()
      .eq('id', factId)
      .eq('case_id', caseId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/cases/[id]/facts error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
