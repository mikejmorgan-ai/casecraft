import { NextRequest } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { generateSpeech, AGENT_VOICES } from '@/lib/voice/openai-tts'
import type { AgentRole } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { text, agentRole } = await request.json()

    if (!text || !agentRole) {
      return new Response('Missing text or agentRole', { status: 400 })
    }

    if (!AGENT_VOICES[agentRole as AgentRole]) {
      return new Response('Invalid agent role', { status: 400 })
    }

    const audioBuffer = await generateSpeech(text, agentRole as AgentRole)

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
