import { getPineconeIndex } from './client'
import { routeDocument, DocumentMeta } from './namespaces'
import { generateEmbeddingsBatch, chunkText } from '@/lib/ai/embeddings'

export interface DocumentToIngest {
  id: string
  name: string
  content: string
  doc_type: string
  filed_by?: string
  filed_date?: string
  case_number?: string
  page_numbers?: number[]
  metadata?: Record<string, unknown>
}

export interface ChunkMetadata {
  [key: string]: string | number | boolean | string[]
  doc_id: string
  doc_name: string
  doc_type: string
  namespace: string
  content: string
  filed_by: string
  filed_date: string
  case_number: string
  page_number: number
  chunk_index: number
  total_chunks: number
}

export interface ChunkRecord {
  id: string
  values: number[]
  metadata: ChunkMetadata
}

// Ingest a single document
export async function ingestDocument(
  doc: DocumentToIngest,
  options: { chunkSize?: number; overlap?: number } = {}
): Promise<{ success: boolean; namespace: string; chunks: number }> {
  const { chunkSize = 1000, overlap = 200 } = options

  // Determine target namespace
  const meta: DocumentMeta = {
    doc_type: doc.doc_type,
    filed_by: doc.filed_by,
  }
  const namespace = routeDocument(meta)

  // Chunk the content
  const chunks = chunkText(doc.content, chunkSize, overlap)

  if (chunks.length === 0) {
    console.warn(`No chunks generated for document: ${doc.name}`)
    return { success: false, namespace, chunks: 0 }
  }

  // Generate embeddings in batches of 100
  const batchSize = 100
  const records: ChunkRecord[] = []

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    const embeddings = await generateEmbeddingsBatch(batch)

    for (let j = 0; j < batch.length; j++) {
      const chunkIndex = i + j
      records.push({
        id: `${doc.id}-chunk-${chunkIndex}`,
        values: embeddings[j],
        metadata: {
          doc_id: doc.id,
          doc_name: doc.name,
          doc_type: doc.doc_type,
          namespace,
          content: batch[j],
          filed_by: doc.filed_by || '',
          filed_date: doc.filed_date || '',
          case_number: doc.case_number || '',
          page_number: doc.page_numbers?.[chunkIndex] || 0,
          chunk_index: chunkIndex,
          total_chunks: chunks.length,
        },
      })
    }
  }

  // Upsert to Pinecone
  const index = getPineconeIndex()
  const nsIndex = index.namespace(namespace)

  // Upsert in batches of 100
  for (let i = 0; i < records.length; i += 100) {
    const batch = records.slice(i, i + 100)
    await nsIndex.upsert(batch)
  }

  console.log(`Ingested ${doc.name}: ${records.length} chunks → ${namespace}`)
  return { success: true, namespace, chunks: records.length }
}

// Batch ingest multiple documents
export async function ingestDocuments(
  docs: DocumentToIngest[],
  options: { chunkSize?: number; overlap?: number } = {}
): Promise<{ total: number; succeeded: number; failed: number }> {
  let succeeded = 0
  let failed = 0

  for (const doc of docs) {
    try {
      const result = await ingestDocument(doc, options)
      if (result.success) {
        succeeded++
      } else {
        failed++
      }
    } catch (err) {
      console.error(`Failed to ingest ${doc.name}:`, err)
      failed++
    }
  }

  return { total: docs.length, succeeded, failed }
}

// Delete all chunks for a document
export async function deleteDocument(docId: string, namespace: string): Promise<void> {
  const index = getPineconeIndex()
  const nsIndex = index.namespace(namespace)

  // Delete by prefix (document ID)
  await nsIndex.deleteMany({
    filter: { doc_id: { $eq: docId } },
  })
}

// Clear an entire namespace
export async function clearNamespace(namespace: string): Promise<void> {
  const index = getPineconeIndex()
  await index.namespace(namespace).deleteAll()
}
