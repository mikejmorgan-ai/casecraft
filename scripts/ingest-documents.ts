/**
 * Document Ingestion Script for Tree Farm LLC v. Salt Lake County
 *
 * Maps documents from source directory to Pinecone namespaces based on:
 * 1. Document type (complaint, answer, motion, etc.)
 * 2. Filing party (Tree Farm LLC vs Salt Lake County)
 * 3. Document category (court orders, discovery, property records, etc.)
 *
 * Usage:
 *   npx tsx scripts/ingest-documents.ts <source-directory>
 *   npx tsx scripts/ingest-documents.ts /path/to/tree-farm-documents
 */

import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse')

const openai = new OpenAI()
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'treefarm-casebreak'

// Document routing rules based on filename patterns
const ROUTING_RULES: Array<{
  pattern: RegExp
  namespace: string
  doc_type: string
  filed_by?: string
}> = [
  // Complaints
  { pattern: /Complaint.*Pet.*Judicial/i, namespace: 'plaintiff-counsel--complaints', doc_type: 'complaint', filed_by: 'Tree Farm LLC' },
  { pattern: /Am.*Complaint/i, namespace: 'plaintiff-counsel--complaints', doc_type: 'amended_complaint', filed_by: 'Tree Farm LLC' },

  // Answers
  { pattern: /Salt_Lake_County.*Answer/i, namespace: 'defense-counsel--answers', doc_type: 'answer', filed_by: 'Salt Lake County' },
  { pattern: /Tree_Farm.*Answer.*CounterCl/i, namespace: 'plaintiff-counsel--motions', doc_type: 'answer', filed_by: 'Tree Farm LLC' },
  { pattern: /CounterCl/i, namespace: 'defense-counsel--answers', doc_type: 'counterclaim', filed_by: 'Salt Lake County' },

  // Scheduling Orders
  { pattern: /Scheduling.*Order/i, namespace: 'judge-stormont--scheduling-orders', doc_type: 'scheduling_order' },
  { pattern: /Signed.*Order/i, namespace: 'judge-stormont--court-orders', doc_type: 'court_order' },

  // Discovery - Tree Farm
  { pattern: /Tree_Farm.*Initial.*Disclosures/i, namespace: 'plaintiff-counsel--discovery-responses', doc_type: 'initial_disclosures', filed_by: 'Tree Farm LLC' },
  { pattern: /Tree_Farm.*Reqs.*Admis/i, namespace: 'plaintiff-counsel--discovery-sent', doc_type: 'rfa', filed_by: 'Tree Farm LLC' },
  { pattern: /Tree_Farm.*Rogs/i, namespace: 'plaintiff-counsel--discovery-sent', doc_type: 'interrogatories', filed_by: 'Tree Farm LLC' },
  { pattern: /Tree_Farm.*Reqs.*Prod/i, namespace: 'plaintiff-counsel--discovery-sent', doc_type: 'rfp', filed_by: 'Tree Farm LLC' },

  // Discovery - Salt Lake County
  { pattern: /Salt_Lake_County.*Initial.*Disclosures/i, namespace: 'defense-counsel--disclosures', doc_type: 'initial_disclosures', filed_by: 'Salt Lake County' },
  { pattern: /Salt_Lake_County.*Supplemental/i, namespace: 'defense-counsel--disclosures', doc_type: 'disclosures', filed_by: 'Salt Lake County' },

  // Affidavits
  { pattern: /Affidavit.*Hilberg/i, namespace: 'plaintiff-counsel--affidavits', doc_type: 'affidavit', filed_by: 'Tree Farm LLC' },
  { pattern: /Affidavit.*Sachs/i, namespace: 'plaintiff-counsel--affidavits', doc_type: 'affidavit', filed_by: 'Tree Farm LLC' },
  { pattern: /Declaration/i, namespace: 'plaintiff-counsel--affidavits', doc_type: 'declaration', filed_by: 'Tree Farm LLC' },

  // Historical Mining Records
  { pattern: /Portland.*Cement/i, namespace: 'dogm-agent--historical-mining', doc_type: 'historical_mining' },
  { pattern: /Lone_Star/i, namespace: 'dogm-agent--historical-mining', doc_type: 'historical_mining' },
  { pattern: /DOGM/i, namespace: 'dogm-agent--reclamation', doc_type: 'reclamation' },
  { pattern: /Mining/i, namespace: 'dogm-agent--historical-mining', doc_type: 'historical_mining' },

  // Property Records (deed numbers are typically 7-8 digit numbers)
  { pattern: /^\d{7,8}\.pdf$/i, namespace: 'county-recorder--deeds', doc_type: 'deed' },
  { pattern: /patent/i, namespace: 'county-recorder--patents', doc_type: 'land_patent' },
  { pattern: /survey/i, namespace: 'county-recorder--surveys', doc_type: 'survey' },
  { pattern: /easement/i, namespace: 'county-recorder--easements', doc_type: 'easement' },

  // Ordinances
  { pattern: /ordinance/i, namespace: 'county-clerk--ordinances', doc_type: 'ordinance' },
  { pattern: /zoning/i, namespace: 'county-clerk--ordinances', doc_type: 'zoning' },

  // News Articles
  { pattern: /KSL|Deseret|KUTV|Tribune|Herald|Republican/i, namespace: 'shared--news-coverage', doc_type: 'news_article' },
  { pattern: /\d{4}_\d{2}_\d{2}.*Page/i, namespace: 'shared--news-coverage', doc_type: 'news_article' },

  // Statutes and Rules
  { pattern: /Utah.*Code/i, namespace: 'judge-stormont--utah-code', doc_type: 'statute' },
  { pattern: /URCP|Rule/i, namespace: 'judge-stormont--urcp', doc_type: 'rule' },
]

// Determine namespace and doc_type from filename
function routeDocument(filename: string): { namespace: string; doc_type: string; filed_by?: string } {
  for (const rule of ROUTING_RULES) {
    if (rule.pattern.test(filename)) {
      return {
        namespace: rule.namespace,
        doc_type: rule.doc_type,
        filed_by: rule.filed_by,
      }
    }
  }

  // Default to shared namespace
  return {
    namespace: 'shared--news-coverage',
    doc_type: 'other',
  }
}

// Extract text from PDF
async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath)
    const data = await pdfParse(buffer)
    return data.text
  } else if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8')
  } else if (ext === '.md') {
    return fs.readFileSync(filePath, 'utf-8')
  }

  throw new Error(`Unsupported file type: ${ext}`)
}

// Chunk text for embedding
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    let breakPoint = end

    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end)
      const lastNewline = text.lastIndexOf('\n', end)
      const boundary = Math.max(lastPeriod, lastNewline)
      if (boundary > start + chunkSize / 2) {
        breakPoint = boundary + 1
      }
    }

    const chunk = text.slice(start, breakPoint).trim()
    if (chunk.length > 50) { // Skip very short chunks
      chunks.push(chunk)
    }

    start = breakPoint - overlap
    if (start < 0) start = 0
    if (breakPoint >= text.length) break
  }

  return chunks
}

// Generate embeddings in batches
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const truncated = texts.map(t => t.substring(0, 8000))

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: truncated,
    encoding_format: 'float',
  })

  return response.data.map(d => d.embedding)
}

// Main ingestion function
async function ingestDocuments(sourceDir: string) {
  console.log(`🌲 Ingesting documents from: ${sourceDir}\n`)

  if (!fs.existsSync(sourceDir)) {
    console.error(`Directory not found: ${sourceDir}`)
    process.exit(1)
  }

  const index = pinecone.index(INDEX_NAME)
  const files = fs.readdirSync(sourceDir).filter(f =>
    f.endsWith('.pdf') || f.endsWith('.txt') || f.endsWith('.md')
  )

  console.log(`Found ${files.length} documents to process\n`)

  let totalChunks = 0
  let successCount = 0
  let errorCount = 0

  const namespaceStats: Record<string, number> = {}

  for (const file of files) {
    const filePath = path.join(sourceDir, file)
    const { namespace, doc_type, filed_by } = routeDocument(file)

    console.log(`Processing: ${file}`)
    console.log(`  → Namespace: ${namespace}`)
    console.log(`  → Type: ${doc_type}`)
    if (filed_by) console.log(`  → Filed by: ${filed_by}`)

    try {
      // Extract text
      const text = await extractText(filePath)
      if (text.length < 100) {
        console.log(`  ⚠️ Skipped (too short: ${text.length} chars)\n`)
        continue
      }

      // Chunk text
      const chunks = chunkText(text)
      console.log(`  → Chunks: ${chunks.length}`)

      // Generate embeddings in batches
      const batchSize = 50
      const records: Array<{
        id: string
        values: number[]
        metadata: {
          doc_id: string
          doc_name: string
          doc_type: string
          namespace: string
          content: string
          filed_by: string
          case_number: string
          chunk_index: number
          total_chunks: number
          ingested_at: string
        }
      }> = []

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize)
        const embeddings = await generateEmbeddings(batch)

        for (let j = 0; j < batch.length; j++) {
          const chunkIndex = i + j
          const docId = file.replace(/\.[^/.]+$/, '') // Remove extension

          records.push({
            id: `${docId}-chunk-${chunkIndex}`,
            values: embeddings[j],
            metadata: {
              doc_id: docId,
              doc_name: file,
              doc_type,
              namespace,
              content: batch[j],
              filed_by: filed_by || '',
              case_number: '220902840',
              chunk_index: chunkIndex,
              total_chunks: chunks.length,
              ingested_at: new Date().toISOString(),
            },
          })
        }
      }

      // Upsert to Pinecone namespace
      const nsIndex = index.namespace(namespace)
      for (let i = 0; i < records.length; i += 100) {
        const batch = records.slice(i, i + 100)
        await nsIndex.upsert(batch)
      }

      totalChunks += records.length
      successCount++
      namespaceStats[namespace] = (namespaceStats[namespace] || 0) + records.length

      console.log(`  ✅ Ingested ${records.length} chunks\n`)

    } catch (err) {
      console.error(`  ❌ Error: ${err}\n`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 INGESTION SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total files: ${files.length}`)
  console.log(`Successful: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log(`Total chunks: ${totalChunks}`)

  console.log('\nChunks by namespace:')
  for (const [ns, count] of Object.entries(namespaceStats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${ns}: ${count}`)
  }

  console.log('\n🎉 Ingestion complete!')
}

// Run
const sourceDir = process.argv[2]
if (!sourceDir) {
  console.log('Usage: npx tsx scripts/ingest-documents.ts <source-directory>')
  console.log('\nExample:')
  console.log('  npx tsx scripts/ingest-documents.ts /path/to/tree-farm-documents')
  console.log('  npx tsx scripts/ingest-documents.ts ~/parleys-pinecone/documents')
  process.exit(1)
}

ingestDocuments(sourceDir).catch(console.error)
