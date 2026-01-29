import { NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { generateSpeech, AGENT_VOICES } from '@/lib/voice/openai-tts'
import type { AgentRole } from '@/lib/types'
import { applyRateLimit } from '@/lib/rate-limit'
import { recordUsage, checkUsageLimit } from '@/lib/usage/limits'

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

    // Check TTS minutes limit (estimate ~150 words per minute)
    const usageStatus = await checkUsageLimit(user.id, 'tts_minutes')
    if (!usageStatus.allowed) {
      return new Response(
        JSON.stringify({
          error: 'TTS usage limit exceeded',
          limit: usageStatus.limit,
          current: usageStatus.currentUsage,
          planTier: usageStatus.planTier,
          upgradeUrl: '/pricing',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { text, agentRole } = await request.json()

    if (!text || !agentRole) {
      return new Response('Missing text or agentRole', { status: 400 })
    }

    if (!AGENT_VOICES[agentRole as AgentRole]) {
      return new Response('Invalid agent role', { status: 400 })
    }

    const audioBuffer = await generateSpeech(text, agentRole as AgentRole)

    // Record TTS usage (estimate minutes based on text length, ~150 words per minute)
    const wordCount = text.split(/\s+/).length
    const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 150))
    await recordUsage(user.id, 'tts_minutes', estimatedMinutes)

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (err) {
    console.error('TTS error:', err)
    return new Response('TTS generation failed', { status: 500 })
  }
}
