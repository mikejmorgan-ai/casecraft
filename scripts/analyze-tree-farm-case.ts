import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'legal-docs'

interface AnalysisResult {
  summary: string
  plaintiffStrengths: string[]
  plaintiffWeaknesses: string[]
  defendantStrengths: string[]
  defendantWeaknesses: string[]
  keyLegalIssues: string[]
  prediction: {
    likelyOutcome: string
    confidence: number
    reasoning: string
  }
  recommendations: string[]
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

async function queryPinecone(query: string, topK: number = 30): Promise<string[]> {
  const embedding = await generateEmbedding(query)
  const index = pinecone.index(INDEX_NAME)

  // Try multiple namespaces
  const namespaces = ['', 'legal-docs', 'treefarm', 'case-documents', 'documents']
  let allResults: string[] = []

  for (const ns of namespaces) {
    try {
      const nsIndex = ns ? index.namespace(ns) : index
      const response = await nsIndex.query({
        vector: embedding,
        topK,
        includeMetadata: true,
      })

      if (response.matches && response.matches.length > 0) {
        const texts = response.matches
          .filter(m => m.score && m.score > 0.5)
          .map(m => {
            const content = (m.metadata?.text as string) || (m.metadata?.content as string) || ''
            const source = (m.metadata?.source as string) || (m.metadata?.filename as string) || 'Unknown'
            return `[Source: ${source}]\n${content}`
          })
        allResults = [...allResults, ...texts]

        if (texts.length > 0) {
          console.log(`Found ${texts.length} results in namespace: ${ns || 'default'}`)
        }
      }
    } catch (e) {
      // Namespace doesn't exist, continue
    }
  }

  // Deduplicate
  return [...new Set(allResults)].slice(0, topK)
}

async function analyzeWithGPT(context: string[], query: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert legal analyst specializing in Utah property law, mining rights, and land use litigation.
Analyze the provided case documents and give detailed, specific answers based on the evidence.
Always cite specific documents and facts when making arguments.`
      },
      {
        role: 'user',
        content: `CASE DOCUMENTS:\n\n${context.join('\n\n---\n\n')}\n\n---\n\nQUESTION: ${query}`
      }
    ],
    temperature: 0.3,
    max_tokens: 4000,
  })

  return response.choices[0].message.content || ''
}

async function runCaseAnalysis(): Promise<void> {
  console.log('═'.repeat(60))
  console.log('  TREE FARM LLC v. SALT LAKE COUNTY - CASE ANALYSIS')
  console.log('  Case No. 220902840 | Utah Third District Court')
  console.log('═'.repeat(60))
  console.log()

  // Step 1: Gather all relevant documents
  console.log('📚 Gathering case documents from Pinecone...\n')

  const queries = [
    'Tree Farm LLC Salt Lake County mining rights vested rights preemption',
    'Utah Code 17-41-402 preemption mining regulation',
    'Ordinance 1895 Salt Lake County forestry recreation zone',
    'Portland Cement Union mining operations Parleys Canyon',
    'property rights mineral rights federal land patent 1895',
    'regulatory taking economic viable use',
  ]

  let allDocs: string[] = []
  for (const q of queries) {
    const docs = await queryPinecone(q, 15)
    allDocs = [...allDocs, ...docs]
  }

  // Deduplicate
  allDocs = [...new Set(allDocs)]
  console.log(`\n📄 Total unique document chunks retrieved: ${allDocs.length}\n`)

  if (allDocs.length === 0) {
    console.log('❌ No documents found in Pinecone. Please ensure documents are ingested.')
    console.log('   Run: npx tsx scripts/ingest-documents.ts')
    return
  }

  // Step 2: Analyze plaintiff's case
  console.log('⚖️  Analyzing Plaintiff (Tree Farm LLC) arguments...\n')
  const plaintiffAnalysis = await analyzeWithGPT(allDocs, `
Analyze Tree Farm LLC's legal position. Specifically address:
1. State preemption argument under Utah Code §17-41-402
2. Vested rights claim under Utah Code §17-41-501
3. "Successor" status under §17-41-101(13) for small mining operations
4. Evidence of historical mining operations (Portland Cement, Lone Star)
5. Regulatory taking argument

List specific STRENGTHS and WEAKNESSES of their case, citing evidence.
`)

  console.log('PLAINTIFF ANALYSIS:')
  console.log('─'.repeat(50))
  console.log(plaintiffAnalysis)
  console.log()

  // Step 3: Analyze defendant's case
  console.log('🏛️  Analyzing Defendant (Salt Lake County) arguments...\n')
  const defendantAnalysis = await analyzeWithGPT(allDocs, `
Analyze Salt Lake County's legal position. Specifically address:
1. County's zoning authority and Ordinance 1895
2. Why preemption doesn't apply (no active permits)
3. Gap in mining operations breaking vested rights chain
4. Environmental protection justification
5. Alternative economic uses of the property

List specific STRENGTHS and WEAKNESSES of their defense, citing evidence.
`)

  console.log('DEFENDANT ANALYSIS:')
  console.log('─'.repeat(50))
  console.log(defendantAnalysis)
  console.log()

  // Step 4: Key legal issues
  console.log('📋 Identifying key legal issues...\n')
  const legalIssues = await analyzeWithGPT(allDocs, `
What are the 5 most critical legal issues that will determine the outcome of this case?
For each issue, explain:
- What the legal question is
- What evidence supports each side
- How Utah courts have ruled on similar issues
`)

  console.log('KEY LEGAL ISSUES:')
  console.log('─'.repeat(50))
  console.log(legalIssues)
  console.log()

  // Step 5: Prediction
  console.log('🔮 Generating case prediction...\n')
  const prediction = await analyzeWithGPT(allDocs, `
Based on your analysis of all the evidence, predict the outcome of this case.

Provide:
1. PREDICTED OUTCOME: (Plaintiff wins / Defendant wins / Mixed ruling / Settlement likely)
2. CONFIDENCE LEVEL: (1-100%)
3. DETAILED REASONING: Why this outcome is most likely based on:
   - Utah case law precedent
   - Strength of evidence
   - Key legal issues
   - Procedural posture

4. KEY FACTORS that could change the outcome
5. RECOMMENDED STRATEGY for each party going forward
`)

  console.log('═'.repeat(60))
  console.log('  CASE PREDICTION')
  console.log('═'.repeat(60))
  console.log(prediction)
  console.log()

  // Step 6: Summary
  console.log('═'.repeat(60))
  console.log('  EXECUTIVE SUMMARY')
  console.log('═'.repeat(60))

  const summary = await analyzeWithGPT(allDocs, `
Provide a 3-paragraph executive summary of this case suitable for a legal brief:
1. Background and procedural history
2. Core legal dispute
3. Likely outcome and implications
`)

  console.log(summary)
  console.log()
  console.log('═'.repeat(60))
  console.log('  Analysis Complete')
  console.log('═'.repeat(60))
}

// Run the analysis
runCaseAnalysis()
  .then(() => {
    console.log('\n✅ Case analysis complete.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error)
    process.exit(1)
  })
