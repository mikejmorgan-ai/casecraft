import type { AgentRole } from '@/lib/types'
import type OpenAI from 'openai'
import { getOpenAIClient } from '@/lib/ai/openai'

// OpenAI TTS voices mapped to agent roles
export const AGENT_VOICES: Record<AgentRole, OpenAI.Audio.Speech.SpeechCreateParams['voice']> = {
  judge: 'onyx',           // Deep, authoritative
  plaintiff_attorney: 'echo', // Professional, assertive
  defense_attorney: 'nova',   // Calm, measured
  court_clerk: 'alloy',       // Clear, neutral
  witness: 'shimmer',         // Natural, conversational
  expert_witness: 'fable',    // Technical, precise
  mediator: 'echo',           // Warm, diplomatic
  law_clerk: 'sage',          // Precise, scholarly
  county_recorder: 'alloy',   // Official, factual
  dogm_agent: 'onyx',         // Technical, regulatory
}

export async function generateSpeech(
  text: string,
  agentRole: AgentRole
): Promise<ArrayBuffer> {
  const voice = AGENT_VOICES[agentRole]

  const response = await getOpenAIClient().audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    response_format: 'mp3',
  })

  return response.arrayBuffer()
}

export async function streamSpeech(
  text: string,
  agentRole: AgentRole
): Promise<ReadableStream<Uint8Array>> {
  const voice = AGENT_VOICES[agentRole]

  const response = await getOpenAIClient().audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    response_format: 'mp3',
  })

  // Convert to stream
  const buffer = await response.arrayBuffer()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(buffer))
      controller.close()
    },
  })
}
