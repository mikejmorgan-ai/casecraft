import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { generateEmbeddingsBatch, chunkText } from '@/lib/ai/embeddings'

export const maxDuration = 60

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id: caseId, docId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getSupabase()

    // Verify case ownership
    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Fetch document
    const { data: doc } = await supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .eq('case_id', caseId)
      .single()

    if (!doc || !doc.content_text) {
      return NextResponse.json(
        { error: 'Document not found or has no content' },
        { status: 404 }
      )
    }

    // Delete existing chunks
    await supabase
      .from('document_chunks')
      .delete()
      .eq('document_id', docId)

    // Chunk the document
    const chunks = chunkText(doc.content_text)

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No content to embed' },
        { status: 400 }
      )
    }

    // Generate embeddings in batches
    const BATCH_SIZE = 10
    const allChunks: {
      document_id: string
      chunk_index: number
      content: string
      embedding: number[]
      token_count: number
    }[] = []

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      const embeddings = await generateEmbeddingsBatch(batch)

      batch.forEach((content, j) => {
        allChunks.push({
          document_id: docId,
          chunk_index: i + j,
          content,
          embedding: embeddings[j],
          token_count: Math.ceil(content.length / 4),
        })
      })
    }

    // Insert chunks using service role (bypasses RLS for vector column)
    const { error: insertError } = await supabase
      .from('document_chunks')
      .insert(allChunks)

    if (insertError) {
      console.error('Failed to insert chunks:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Update document as embedded
    await supabase
      .from('documents')
      .update({ is_embedded: true })
      .eq('id', docId)

    return NextResponse.json({
      success: true,
      chunks_created: allChunks.length,
    })
  } catch (err) {
    console.error('POST /api/cases/[id]/documents/[docId]/embed error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
