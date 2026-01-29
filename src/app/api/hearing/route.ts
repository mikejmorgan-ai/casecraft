import { NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import {
  HearingType,
  HearingPhase,
  getNextSpeaker,
  getCurrentPhase,
  buildHearingPrompt,
} from '@/lib/hearing/orchestrator'
import type { AgentRole } from '@/lib/types'
import { applyRateLimit } from '@/lib/rate-limit'
import { enforceUsageLimit } from '@/lib/usage/limits'

export const maxDuration = 300 // 5 minutes for full hearing

interface HearingTurn {
  role: AgentRole
  agentId: string
  agentName: string
  content: string
  phase: HearingPhase
  timestamp: string
}

export async function POST(request: NextRequest) {
  // Apply rate limiting (AI operations: 10 req/min)
  const rateLimitResponse = await applyRateLimit(request, 'ai')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Enforce usage limits for hearings
    const usageLimitResponse = await enforceUsageLimit(user.id, 'hearings')
    if (usageLimitResponse) return usageLimitResponse

    const {
      case_id,
      conversation_id,
      hearing_type = 'motion_hearing',
      max_turns = 10,
    } = await request.json()

    // Fetch case
    const { data: caseData } = await supabase
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .single()

    if (!caseData) {
      return new Response('Case not found', { status: 404 })
    }

    // Fetch all active agents for this case
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .eq('case_id', case_id)
      .eq('is_active', true)

    if (!agents || agents.length === 0) {
      return new Response('No active agents found', { status: 404 })
    }

    // Fetch case facts
    const { data: facts } = await supabase
      .from('case_facts')
      .select('fact_text')
      .eq('case_id', case_id)
      .limit(20)

    const caseContext = `
Case: ${caseData.name} (${caseData.case_number || 'No case number'})
Type: ${caseData.case_type}
Jurisdiction: ${caseData.jurisdiction || 'Not specified'}
Plaintiff: ${caseData.plaintiff_name || 'Unknown'}
Defendant: ${caseData.defendant_name || 'Unknown'}
Summary: ${caseData.summary || 'No summary provided'}

Key Facts:
${facts?.map((f) => `- ${f.fact_text}`).join('\n') || 'No facts recorded'}
`

    // Map agents by role
    const agentsByRole = new Map(
      agents.map((a) => [a.role as AgentRole, a])
    )

    // Run the hearing
    const transcript: HearingTurn[] = []
    let phaseIndex = 0
    let turnInPhase = 0
    let totalTurns = 0

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (totalTurns < max_turns) {
            const currentPhase = getCurrentPhase(hearing_type as HearingType, phaseIndex)

            if (currentPhase === 'complete') {
              break
            }

            const speakerRole = getNextSpeaker(
              hearing_type as HearingType,
              phaseIndex,
              turnInPhase
            )

            if (!speakerRole) {
              // Move to next phase
              phaseIndex++
              turnInPhase = 0
              continue
            }

            const agent = agentsByRole.get(speakerRole)
            if (!agent) {
              // Skip if agent not available
              turnInPhase++
              continue
            }

            // Build prompt for this turn
            const prompt = buildHearingPrompt(
              agent,
              currentPhase,
              transcript,
              caseContext
            )

            // Generate response
            const { text } = await generateText({
              model: openai('gpt-4o'),
              system: prompt,
              prompt: `Proceed with your ${currentPhase.replace('_', ' ')} as ${agent.name}. Be thorough and substantive in your argument.`,
              temperature: agent.temperature,
              maxOutputTokens: 1500,
            })

            const turn: HearingTurn = {
              role: speakerRole,
              agentId: agent.id,
              agentName: agent.name,
              content: text,
              phase: currentPhase,
              timestamp: new Date().toISOString(),
            }

            transcript.push(turn)

            // Stream the turn to client
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(turn)}\n\n`)
            )

            // Save to messages
            if (conversation_id) {
              await supabase.from('messages').insert({
                conversation_id,
                agent_id: agent.id,
                role: 'assistant',
                content: text,
                metadata: { phase: currentPhase, hearing_turn: totalTurns },
              })
            }

            turnInPhase++
            totalTurns++

            // Small delay between turns
            await new Promise((resolve) => setTimeout(resolve, 500))
          }

          // Send completion
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', transcript })}\n\n`)
          )
          controller.close()
        } catch (err) {
          console.error('Hearing error:', err)
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('POST /api/hearing error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}
