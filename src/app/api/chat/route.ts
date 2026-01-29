import { NextRequest } from 'next/server'
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/embeddings'
import { buildAgentSystemPrompt } from '@/lib/ai/prompts'
import { searchByRole, formatResultsForContext } from '@/lib/pinecone/search'
import { openai } from '@ai-sdk/openai'
import { streamText, createUIMessageStream, createUIMessageStreamResponse } from 'ai'
import type { AgentRole } from '@/lib/types'
import { applyRateLimit } from '@/lib/rate-limit'
import { enforceUsageLimit } from '@/lib/usage/limits'

// All cases use Pinecone for RAG (39K+ Tree Farm documents indexed)
const USE_PINECONE = true

export const maxDuration = 60

export async function POST(request: NextRequest) {
  // Apply rate limiting (AI operations: 10 req/min)
  const rateLimitResponse = await applyRateLimit(request, 'ai')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const supabase = await createServerSupabase()
    const serviceSupabase = createServiceSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Enforce usage limits
    const usageLimitResponse = await enforceUsageLimit(user.id, 'chat_messages')
    if (usageLimitResponse) return usageLimitResponse

    const {
      messages: rawMessages,
      conversation_id,
      agent_id,
      case_id
    } = await request.json()

    // Convert v4 SDK message format (parts) to model format (content)
    const messages = rawMessages.map((m: { role: string; content?: string; parts?: Array<{ type: string; text?: string }> }) => {
      let content = m.content || ''
      if (m.parts && !content) {
        content = m.parts
          .filter((p): p is { type: string; text: string } => p.type === 'text' && typeof p.text === 'string')
          .map(p => p.text)
          .join('')
      }
      return { role: m.role, content }
    })

    // Fetch case context
    const { data: caseData } = await supabase
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .single()

    if (!caseData) {
      return new Response('Case not found', { status: 404 })
    }

    // Fetch agent
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agent_id)
      .single()

    if (!agent) {
      return new Response('Agent not found', { status: 404 })
    }

    // Fetch case facts
    const { data: facts } = await supabase
      .from('case_facts')
      .select('fact_text')
      .eq('case_id', case_id)
      .limit(20)

    // RAG: Find relevant document chunks
    const lastUserMessage = messages.filter((m: { role: string; content: string }) => m.role === 'user').pop() as { role: string; content: string } | undefined
    let documentContext = ''
    const citations: {
      document_id: string
      document_name: string
      chunk_id: string
      content_preview: string
      similarity: number
    }[] = []

    // Use Pinecone for RAG (role-based document filtering)
    const usePinecone = USE_PINECONE

    if (lastUserMessage) {
      try {
        if (usePinecone) {
          // Pinecone RAG with role-based namespace permissions
          const pineconeResults = await searchByRole(
            lastUserMessage.content,
            agent.role as AgentRole,
            { topK: 8, minScore: 0.55 }
          )

          if (pineconeResults.length > 0) {
            documentContext = formatResultsForContext(pineconeResults)

            pineconeResults.forEach((result) => {
              const docName = result.metadata.filename || result.metadata.source.split('/').pop() || 'Unknown'
              citations.push({
                document_id: result.id,
                document_name: docName,
                chunk_id: result.id,
                content_preview: result.content.substring(0, 200),
                similarity: result.score,
              })
            })

            console.log(`Pinecone RAG: Found ${pineconeResults.length} results for ${agent.role}`)
          }
        } else {
          // Supabase pgvector RAG (original behavior)
          const queryEmbedding = await generateEmbedding(lastUserMessage.content)

          const { data: relevantChunks } = await serviceSupabase
            .rpc('match_document_chunks', {
              query_embedding: queryEmbedding,
              match_case_id: case_id,
              match_threshold: 0.6,
              match_count: 5,
            }) as { data: { id: string; document_id: string; content: string; similarity: number }[] | null }

          if (relevantChunks && relevantChunks.length > 0) {
            const docIds = [...new Set(relevantChunks.map((c: { document_id: string }) => c.document_id))]
            const { data: docs } = await supabase
              .from('documents')
              .select('id, name')
              .in('id', docIds)

            const docMap = new Map(docs?.map((d: { id: string; name: string }) => [d.id, d.name]) || [])

            relevantChunks.forEach((chunk, i) => {
              citations.push({
                document_id: chunk.document_id,
                document_name: docMap.get(chunk.document_id) || 'Unknown',
                chunk_id: chunk.id,
                content_preview: chunk.content.substring(0, 200),
                similarity: chunk.similarity,
              })

              documentContext += `[${i + 1}] From "${docMap.get(chunk.document_id) || 'Unknown'}":\n${chunk.content}\n\n`
            })
          }
        }
      } catch (err) {
        console.error('RAG search error:', err)
        // Continue without RAG if it fails
      }
    }

    // Build system prompt
    const systemPrompt = buildAgentSystemPrompt(
      { role: agent.role as AgentRole, name: agent.name, persona_prompt: agent.persona_prompt },
      caseData,
      facts?.map(f => f.fact_text) || [],
      documentContext || undefined
    )

    // Stream response using UI message stream for v4 SDK
    const stream = createUIMessageStream({
      async execute({ writer }) {
        const result = streamText({
          model: openai('gpt-4o'),
          system: systemPrompt,
          messages,
          temperature: agent.temperature,
        })

        let fullText = ''
        const messageId = crypto.randomUUID()

        for await (const chunk of result.textStream) {
          fullText += chunk
          writer.write({
            type: 'text-delta',
            id: messageId,
            delta: chunk,
          })
        }

        // Save messages after streaming completes
        if (lastUserMessage && conversation_id) {
          await supabase.from('messages').insert({
            conversation_id,
            role: 'user',
            content: lastUserMessage.content,
            citations: [],
          })
        }

        if (conversation_id) {
          await supabase.from('messages').insert({
            conversation_id,
            agent_id,
            role: 'assistant',
            content: fullText,
            citations,
          })
        }
      },
    })

    return createUIMessageStreamResponse({ stream })
  } catch (err) {
    console.error('POST /api/chat error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}
