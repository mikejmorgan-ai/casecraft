import type { AgentRole } from '@/lib/types'

// ElevenLabs voice IDs mapped to agent roles
// Using pre-made voices from ElevenLabs library
export const AGENT_VOICES: Record<AgentRole, { voiceId: string; name: string }> = {
  judge: { voiceId: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' }, // Deep, authoritative
  plaintiff_attorney: { voiceId: 'ErXwobaYiN019PkySvjV', name: 'Antoni' }, // Professional, assertive
  defense_attorney: { voiceId: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' }, // Calm, measured
  court_clerk: { voiceId: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' }, // Clear, procedural
  witness: { voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' }, // Natural, conversational
  expert_witness: { voiceId: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' }, // Technical, precise
  mediator: { voiceId: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' }, // Warm, diplomatic
  law_clerk: { voiceId: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' }, // Precise, scholarly
  county_recorder: { voiceId: 'pqHfZKP75CvOlQylNhV4', name: 'Bill' }, // Official, factual
  dogm_agent: { voiceId: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry' }, // Technical, regulatory
}

export async function generateSpeech(
  text: string,
  agentRole: AgentRole
): Promise<ArrayBuffer> {
  const voice = AGENT_VOICES[agentRole]

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`)
  }

  return response.arrayBuffer()
}

export async function streamSpeech(
  text: string,
  agentRole: AgentRole
): Promise<ReadableStream<Uint8Array>> {
  const voice = AGENT_VOICES[agentRole]

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  )

  if (!response.ok || !response.body) {
    throw new Error(`ElevenLabs API error: ${response.status}`)
  }

  return response.body
}
