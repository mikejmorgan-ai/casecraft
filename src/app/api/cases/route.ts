import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'
import { AGENT_ROLE_TEMPLATES } from '@/lib/ai/prompts'
import type { AgentRole } from '@/lib/types'

const createCaseSchema = z.object({
  name: z.string().min(1).max(255),
  case_type: z.enum(['civil', 'criminal', 'family', 'contract', 'tort', 'property', 'constitutional', 'administrative']),
  case_number: z.string().max(50).optional(),
  jurisdiction: z.string().max(100).optional(),
  summary: z.string().optional(),
  plaintiff_name: z.string().max(255).optional(),
  defendant_name: z.string().max(255).optional(),
})

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createCaseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    // Create case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()

    if (caseError) {
      return NextResponse.json({ error: caseError.message }, { status: 500 })
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
      console.error('Failed to create default agents:', agentsError)
    }

    return NextResponse.json(caseData, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
