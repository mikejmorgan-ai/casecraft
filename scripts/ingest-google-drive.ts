/**
 * Google Drive Folder Ingestion Script
 *
 * Ingests all documents from a Google Drive folder into Pinecone
 * one document at a time.
 *
 * Usage:
 *   npx tsx scripts/ingest-google-drive.ts <folder-id>
 *   npx tsx scripts/ingest-google-drive.ts 1ImEyjpbLcAo4tRWbKzv4FYYaW5ZVfUP8
 */

import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const openai = new OpenAI()
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'treefarm-casecraft'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
}

// Namespace routing based on filename
function routeDocument(filename: string): { namespace: string; doc_type: string; filed_by?: string } {
  const lower = filename.toLowerCase()

  // Complaints
  if (lower.includes('complaint')) {
    return { namespace: 'plaintiff-counsel--complaints', doc_type: 'complaint', filed_by: 'Tree Farm LLC' }
  }

  // Answers
  if (lower.includes('answer') && lower.includes('county')) {
    return { namespace: 'defense-counsel--answers', doc_type: 'answer', filed_by: 'Salt Lake County' }
  }
  if (lower.includes('answer')) {
    return { namespace: 'plaintiff-counsel--motions', doc_type: 'answer', filed_by: 'Tree Farm LLC' }
  }

  // Orders
  if (lower.includes('order') || lower.includes('signed')) {
    return { namespace: 'judge-stormont--court-orders', doc_type: 'court_order' }
  }
  if (lower.includes('scheduling')) {
    return { namespace: 'judge-stormont--scheduling-orders', doc_type: 'scheduling_order' }
  }

  // Discovery
  if (lower.includes('disclosure') || lower.includes('discovery')) {
    if (lower.includes('tree') || lower.includes('plaintiff')) {
      return { namespace: 'plaintiff-counsel--discovery-responses', doc_type: 'discovery', filed_by: 'Tree Farm LLC' }
    }
    return { namespace: 'defense-counsel--disclosures', doc_type: 'discovery', filed_by: 'Salt Lake County' }
  }

  // Affidavits
  if (lower.includes('affidavit') || lower.includes('declaration')) {
    return { namespace: 'plaintiff-counsel--affidavits', doc_type: 'affidavit', filed_by: 'Tree Farm LLC' }
  }

  // Mining/DOGM
  if (lower.includes('mining') || lower.includes('dogm') || lower.includes('portland') || lower.includes('reclamation')) {
    return { namespace: 'dogm-agent--historical-mining', doc_type: 'historical_mining' }
  }

  // Property records (deed numbers)
  if (/^\d{6,8}/.test(filename)) {
    return { namespace: 'county-recorder--deeds', doc_type: 'deed' }
  }
  if (lower.includes('deed') || lower.includes('patent') || lower.includes('title')) {
    return { namespace: 'county-recorder--deeds', doc_type: 'deed' }
  }

  // Motions
  if (lower.includes('motion')) {
    if (lower.includes('tree') || lower.includes('plaintiff')) {
      return { namespace: 'plaintiff-counsel--motions', doc_type: 'motion', filed_by: 'Tree Farm LLC' }
    }
    return { namespace: 'defense-counsel--motions', doc_type: 'motion', filed_by: 'Salt Lake County' }
  }

  // Briefs
  if (lower.includes('brief') || lower.includes('memo')) {
    if (lower.includes('tree') || lower.includes('plaintiff')) {
      return { namespace: 'plaintiff-counsel--briefs', doc_type: 'brief', filed_by: 'Tree Farm LLC' }
    }
    return { namespace: 'defense-counsel--briefs', doc_type: 'brief', filed_by: 'Salt Lake County' }
  }

  // Utah Code
  if (lower.includes('utah') && lower.includes('code')) {
    return { namespace: 'judge-stormont--utah-code', doc_type: 'statute' }
  }

  // Default
  return { namespace: 'shared--news-coverage', doc_type: 'other' }
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
    if (chunk.length > 50) {
      chunks.push(chunk)
    }

    start = breakPoint - overlap
    if (start < 0) start = 0
    if (breakPoint >= text.length) break
  }

  return chunks
}

// Generate embeddings
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const truncated = texts.map(t => t.substring(0, 8000))
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: truncated,
    encoding_format: 'float',
  })
  return response.data.map(d => d.embedding)
}

// Fetch file content from Google Drive (public/shared files)
async function fetchDriveFileContent(fileId: string, mimeType: string): Promise<string | null> {
  try {
    // For Google Docs
    if (mimeType === 'application/vnd.google-apps.document') {
      const url = `https://docs.google.com/document/d/${fileId}/export?format=txt`
      const response = await fetch(url)
      if (response.ok) {
        return await response.text()
      }
    }

    // For PDFs and other files, try direct download
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
    const response = await fetch(downloadUrl)

    if (response.ok) {
      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('text')) {
        return await response.text()
      }

      // For PDFs, we'd need pdf-parse but that requires the buffer
      // For now, skip binary files from this simple approach
      console.log(`  ⚠️ Binary file (${contentType}) - use CLI ingestion for PDFs`)
      return null
    }

    return null
  } catch (error) {
    console.error(`  ❌ Error fetching file: ${error}`)
    return null
  }
}

// List files in a public Google Drive folder
async function listDriveFolder(folderId: string): Promise<DriveFile[]> {
  // Using the Google Drive API v3 files.list endpoint
  // This only works for publicly shared folders
  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    console.log('\n⚠️ GOOGLE_API_KEY not set in .env.local')
    console.log('Add: GOOGLE_API_KEY=your-api-key')
    console.log('\nAlternatively, download files manually and use:')
    console.log('  npx tsx scripts/ingest-documents.ts /path/to/downloaded/files\n')
    process.exit(1)
  }

  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,webViewLink)`

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to list folder: ${error}`)
  }

  const data = await response.json()
  return data.files || []
}

// Ingest a single document to Pinecone
async function ingestDocument(
  file: DriveFile,
  content: string,
  index: ReturnType<typeof pinecone.index>
): Promise<boolean> {
  const { namespace, doc_type, filed_by } = routeDocument(file.name)

  console.log(`\n📄 ${file.name}`)
  console.log(`   → Namespace: ${namespace}`)
  console.log(`   → Type: ${doc_type}`)
  if (filed_by) console.log(`   → Filed by: ${filed_by}`)

  if (content.length < 100) {
    console.log(`   ⚠️ Skipped (too short: ${content.length} chars)`)
    return false
  }

  // Chunk text
  const chunks = chunkText(content)
  console.log(`   → Chunks: ${chunks.length}`)

  // Generate embeddings in batches
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
      source: string
      google_drive_id: string
      ingested_at: string
    }
  }> = []

  const batchSize = 50
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    const embeddings = await generateEmbeddings(batch)

    for (let j = 0; j < batch.length; j++) {
      const chunkIndex = i + j
      const docId = file.id

      records.push({
        id: `${docId}-chunk-${chunkIndex}`,
        values: embeddings[j],
        metadata: {
          doc_id: docId,
          doc_name: file.name,
          doc_type,
          namespace,
          content: batch[j],
          filed_by: filed_by || '',
          case_number: '220902840',
          chunk_index: chunkIndex,
          total_chunks: chunks.length,
          source: 'google_drive',
          google_drive_id: file.id,
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

  console.log(`   ✅ Ingested ${records.length} chunks`)
  return true
}

// Main
async function main() {
  const folderId = process.argv[2]

  if (!folderId) {
    console.log('Usage: npx tsx scripts/ingest-google-drive.ts <folder-id>')
    console.log('\nExample:')
    console.log('  npx tsx scripts/ingest-google-drive.ts 1ImEyjpbLcAo4tRWbKzv4FYYaW5ZVfUP8')
    console.log('\nExtract folder ID from URL:')
    console.log('  https://drive.google.com/drive/folders/1ImEyjpbLcAo4tRWbKzv4FYYaW5ZVfUP8')
    console.log('                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
    process.exit(1)
  }

  console.log('🌲 GOOGLE DRIVE FOLDER INGESTION')
  console.log('='.repeat(50))
  console.log(`Folder ID: ${folderId}\n`)

  // List files
  console.log('📂 Listing folder contents...')
  const files = await listDriveFolder(folderId)

  if (files.length === 0) {
    console.log('No files found in folder. Check sharing permissions.')
    process.exit(1)
  }

  console.log(`Found ${files.length} files:\n`)
  files.forEach((f, i) => console.log(`  ${i + 1}. ${f.name}`))

  // Get Pinecone index
  const index = pinecone.index(INDEX_NAME)

  // Process each file
  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const file of files) {
    // Skip folders
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      console.log(`\n📁 ${file.name} (folder - skipping, run again with this folder ID)`)
      skipCount++
      continue
    }

    try {
      const content = await fetchDriveFileContent(file.id, file.mimeType)

      if (!content) {
        skipCount++
        continue
      }

      const success = await ingestDocument(file, content, index)
      if (success) {
        successCount++
      } else {
        skipCount++
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 500))

    } catch (error) {
      console.error(`\n❌ Error processing ${file.name}: ${error}`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 INGESTION SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total files: ${files.length}`)
  console.log(`Ingested: ${successCount}`)
  console.log(`Skipped: ${skipCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log('\n✅ Done!')
}

main().catch(console.error)
