import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

const createShareSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  permission_level: z.enum(['view', 'comment', 'edit', 'admin']).default('view'),
  expires_at: z.string().datetime().optional().nullable(),
})

const updateShareSchema = z.object({
  permission_level: z.enum(['view', 'comment', 'edit', 'admin']),
  expires_at: z.string().datetime().optional().nullable(),
})

// GET /api/cases/[id]/shares - List all shares for a case
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (caseData.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all shares with user profile info if available
    const { data: shares, error: sharesError } = await supabase
      .from('case_shares')
      .select(`
        *,
        shared_user:shared_with_user_id(
          id,
          email:raw_user_meta_data->email
        )
      `)
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (sharesError) {
      console.error('Error fetching shares:', sharesError)
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 })
    }

    return NextResponse.json(shares)
  } catch (err) {
    console.error('GET /api/cases/[id]/shares error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cases/[id]/shares - Create a new share
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('user_id, name')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (caseData.user_id !== user.id) {
      return NextResponse.json({ error: 'Only case owners can share cases' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createShareSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: parsed.error.issues
      }, { status: 400 })
    }

    const { email, permission_level, expires_at } = parsed.data

    // Prevent sharing with self
    if (email.toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot share a case with yourself' }, { status: 400 })
    }

    // Check for existing share
    const { data: existingShare } = await supabase
      .from('case_shares')
      .select('id')
      .eq('case_id', caseId)
      .eq('shared_with_email', email.toLowerCase())
      .single()

    if (existingShare) {
      return NextResponse.json({ error: 'This case is already shared with this user' }, { status: 409 })
    }

    // Create the share - we share by email, the user doesn't need to exist yet.
    // When the user signs up/logs in, they can claim shares by matching email.
    const { data: share, error: shareError } = await supabase
      .from('case_shares')
      .insert({
        case_id: caseId,
        shared_with_email: email.toLowerCase(),
        shared_with_user_id: null,
        permission_level,
        expires_at: expires_at || null,
        shared_by: user.id,
      })
      .select()
      .single()

    if (shareError) {
      console.error('Error creating share:', shareError)
      return NextResponse.json({ error: 'Failed to create share' }, { status: 500 })
    }

    return NextResponse.json(share, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases/[id]/shares error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/cases/[id]/shares - Update a share (expects shareId in body)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (caseData.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { shareId, ...updateData } = body

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID is required' }, { status: 400 })
    }

    const parsed = updateShareSchema.safeParse(updateData)
    if (!parsed.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: parsed.error.issues
      }, { status: 400 })
    }

    const { data: share, error: shareError } = await supabase
      .from('case_shares')
      .update(parsed.data)
      .eq('id', shareId)
      .eq('case_id', caseId)
      .select()
      .single()

    if (shareError) {
      console.error('Error updating share:', shareError)
      return NextResponse.json({ error: 'Failed to update share' }, { status: 500 })
    }

    return NextResponse.json(share)
  } catch (err) {
    console.error('PATCH /api/cases/[id]/shares error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/cases/[id]/shares - Delete a share (expects shareId in search params)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID is required' }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (caseData.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('case_shares')
      .delete()
      .eq('id', shareId)
      .eq('case_id', caseId)

    if (deleteError) {
      console.error('Error deleting share:', deleteError)
      return NextResponse.json({ error: 'Failed to delete share' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/cases/[id]/shares error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
