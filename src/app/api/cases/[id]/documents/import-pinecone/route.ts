import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getPineconeIndex } from '@/lib/pinecone/client'
import { z } from 'zod'

const importPineconeSchema = z.object({
  namespace: z.string().min(1),
  doc_type: z.enum(['complaint', 'answer', 'motion', 'brief', 'discovery', 'deposition', 'exhibit', 'order', 'judgment', 'other']).optional(),
  filed_by: z.string().optional(),
  limit: z.number().min(1).max(1000).default(100),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify case ownership
    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = importPineconeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { namespace, doc_type, filed_by, limit } = parsed.data

    // Query Pinecone namespace
    const index = getPineconeIndex()
    const nsIndex = index.namespace(namespace)

    // Query all vectors in namespace with metadata
    const queryResponse = await nsIndex.query({
      topK: limit,
      includeMetadata: true,
      includeValues: false,
      vector: new Array(1536).fill(0), // Dummy vector to get all docs
    })

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return NextResponse.json({
        error: 'No documents found in Pinecone namespace',
        namespace
      }, { status: 404 })
    }

    // Pinecone metadata type
    interface PineconeDocMetadata {
      doc_id?: string
      doc_name?: string
      doc_type?: string
      content?: string
      filed_by?: string
      filed_date?: string
      [key: string]: string | number | boolean | undefined
    }

    // Group chunks by document ID
    const documentMap = new Map<string, {
      doc_id: string
      doc_name: string
      doc_type: string
      content_chunks: string[]
      filed_by: string
      filed_date: string
      metadata: Record<string, string | number | boolean | undefined>
    }>()

    for (const match of queryResponse.matches) {
      const metadata = match.metadata as PineconeDocMetadata
      const docId = metadata.doc_id || match.id

      if (!documentMap.has(docId)) {
        documentMap.set(docId, {
          doc_id: docId,
          doc_name: metadata.doc_name || 'Unknown Document',
          doc_type: metadata.doc_type || 'other',
          content_chunks: [],
          filed_by: metadata.filed_by || '',
          filed_date: metadata.filed_date || '',
          metadata: {}
        })
      }

      const doc = documentMap.get(docId)!
      doc.content_chunks.push(metadata.content || '')
    }

    // Convert to documents array and insert
    const documentsToInsert = Array.from(documentMap.values())
      .filter(doc => {
        // Apply filters if specified
        if (doc_type && doc.doc_type !== doc_type) return false
        if (filed_by && doc.filed_by !== filed_by) return false
        return true
      })
      .map(doc => ({
        name: doc.doc_name,
        doc_type: doc.doc_type as 'complaint' | 'answer' | 'motion' | 'brief' | 'discovery' | 'deposition' | 'exhibit' | 'order' | 'judgment' | 'other' || 'other',
        content_text: doc.content_chunks.join('\n\n'),
        metadata: {
          filed_by: doc.filed_by,
          filed_date: doc.filed_date,
          imported_from_pinecone: true,
          pinecone_namespace: namespace,
          pinecone_doc_id: doc.doc_id,
          import_timestamp: new Date().toISOString()
        },
        case_id: caseId,
      }))

    if (documentsToInsert.length === 0) {
      return NextResponse.json({
        error: 'No documents matched the specified filters',
        total_found: documentMap.size
      }, { status: 404 })
    }

    // Insert documents into database
    const { data: insertedDocs, error } = await supabase
      .from('documents')
      .insert(documentsToInsert)
      .select()

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Auto-embed imported documents
    const embeddingPromises = insertedDocs.map(async (doc) => {
      try {
        const embedResponse = await fetch(
          `${request.nextUrl.origin}/api/cases/${caseId}/documents/${doc.id}/embed`,
          { method: 'POST' }
        )
        return embedResponse.ok
      } catch {
        return false
      }
    })

    const embedResults = await Promise.allSettled(embeddingPromises)
    const successfulEmbeddings = embedResults.filter(r => r.status === 'fulfilled' && r.value).length

    return NextResponse.json({
      success: true,
      imported: insertedDocs.length,
      total_available: documentMap.size,
      embedded: successfulEmbeddings,
      namespace,
      documents: insertedDocs.map(d => ({
        id: d.id,
        name: d.name,
        doc_type: d.doc_type,
        filed_by: d.metadata?.filed_by
      }))
    }, { status: 201 })

  } catch (err) {
    console.error('POST /api/cases/[id]/documents/import-pinecone error:', err)
    return NextResponse.json({
      error: 'Internal server error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}