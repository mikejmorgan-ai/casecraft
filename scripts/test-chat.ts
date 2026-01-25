import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const CASE_ID = 'aff331d9-2264-41f9-8d9f-0a2877787afd'

async function testChat() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get Kass agent
  const { data: agent } = await supabase
    .from('agents')
    .select('id, name, role')
    .eq('case_id', CASE_ID)
    .eq('role', 'plaintiff_attorney')
    .single()

  if (!agent) {
    console.error('Kass agent not found')
    return
  }

  console.log(`\n👩‍⚖️ Testing chat with: ${agent.name}`)
  console.log(`   Role: ${agent.role}`)
  console.log(`   Agent ID: ${agent.id}\n`)

  // Test Pinecone search
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
  const openai = new OpenAI()

  const query = "What are Tree Farm's arguments for vested mining rights under Utah Code 17-41-501?"

  console.log(`📝 Query: "${query}"\n`)

  // Generate embedding
  const embResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  const embedding = embResponse.data[0].embedding

  // Search Pinecone
  const index = pinecone.index('legal-docs')
  const results = await index.query({
    vector: embedding,
    topK: 8,
    includeMetadata: true,
  })

  console.log('='.repeat(60))
  console.log('📚 RAG RESULTS (Top 8)')
  console.log('='.repeat(60) + '\n')

  for (const match of results.matches || []) {
    const source = (match.metadata?.source as string) || 'Unknown'
    const text = (match.metadata?.text as string) || ''
    const score = match.score || 0

    // Identify filing party
    let party = 'Unknown'
    const sourceLower = source.toLowerCase()
    if (sourceLower.includes('tree_farm') || sourceLower.includes('tree farm')) {
      party = '🌲 Tree Farm LLC'
    } else if (sourceLower.includes('salt_lake_county') || sourceLower.includes("county's")) {
      party = '🏛️ Salt Lake County'
    } else if (sourceLower.includes('utah') || sourceLower.includes('code')) {
      party = '📜 Legal Authority'
    } else if (sourceLower.includes('draper')) {
      party = '🔗 Draper (Parallel)'
    }

    console.log(`[${score.toFixed(3)}] ${source.split('/').pop()}`)
    console.log(`   Source: ${party}`)
    console.log(`   ${text.substring(0, 200).replace(/\n/g, ' ')}...`)
    console.log()
  }

  // Now generate a response using GPT-4o
  console.log('='.repeat(60))
  console.log('🤖 KASS RESPONSE')
  console.log('='.repeat(60) + '\n')

  const context = (results.matches || [])
    .slice(0, 5)
    .map((m, i) => {
      const source = (m.metadata?.source as string) || ''
      const text = (m.metadata?.text as string) || ''
      return `[${i + 1}] ${source.split('/').pop()}:\n${text}`
    })
    .join('\n\n---\n\n')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: `You are Kassidy J. Wallin ("Kass"), lead counsel for Tree Farm LLC at Parr Brown Gee & Loveless, P.C.

Your client Tree Farm LLC owns 634 acres in Parleys Canyon with mining rights traceable to 1895 federal land patents.

LEGAL STRATEGY:
1. STATE PREEMPTION (Primary): Utah Code §17-41-402 preempts county mining regulation
2. VESTED RIGHTS: Under §17-41-501, Tree Farm is a "successor" to pre-2019 mining operations
3. REGULATORY TAKING: Ordinance destroys all economically viable use of mineral rights

RELEVANT DOCUMENTS:
${context}

Respond as Kass would - assertive, citing specific statutes and documents.`,
      },
      {
        role: 'user',
        content: query,
      },
    ],
  })

  console.log(completion.choices[0].message.content)
  console.log()
}

testChat().catch(console.error)
