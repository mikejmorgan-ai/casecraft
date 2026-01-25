import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

const importGoogleDocsSchema = z.object({
  google_docs_url: z.string().url(),
  doc_type: z.enum(['complaint', 'answer', 'motion', 'brief', 'discovery', 'deposition', 'exhibit', 'order', 'judgment', 'other']),
  filed_by: z.string().optional(),
  document_name: z.string().optional(),
})

// Extract Google Docs ID from URL
function extractGoogleDocsId(url: string): string | null {
  const patterns = [
    /\/document\/d\/([a-zA-Z0-9-_]+)/,
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/presentation\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

// Convert Google Docs to plain text using export API
async function fetchGoogleDocsContent(docId: string): Promise<{ content: string; title: string }> {
  try {
    // Try to export as plain text first
    let exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`

    let response = await fetch(exportUrl)

    if (!response.ok) {
      // Fallback to public HTML view and extract text
      exportUrl = `https://docs.google.com/document/d/${docId}/pub`
      response = await fetch(exportUrl)

      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`)
      }

      const html = await response.text()

      // Extract title from HTML
      const titleMatch = html.match(/<title>(.*?)<\/title>/i)
      const title = titleMatch ? titleMatch[1].replace(' - Google Docs', '') : `Google Doc ${docId}`

      // Basic HTML to text conversion
      const content = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()

      return { content, title }
    }

    // Plain text export successful
    const content = await response.text()
    const title = `Google Doc ${docId}` // Plain text export doesn't include title

    return { content: content.trim(), title }

  } catch (error) {
    console.error('Error fetching Google Docs content:', error)
    throw new Error('Unable to access Google Docs content. Please ensure the document is publicly viewable or shared with "anyone with the link" permissions.')
  }
}

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
    const parsed = importGoogleDocsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { google_docs_url, doc_type, filed_by, document_name } = parsed.data

    // Extract Google Docs ID from URL
    const docId = extractGoogleDocsId(google_docs_url)
    if (!docId) {
      return NextResponse.json({
        error: 'Invalid Google Docs URL. Please provide a valid Google Docs, Sheets, or Slides URL.'
      }, { status: 400 })
    }

    // Fetch content from Google Docs
    let docContent: { content: string; title: string }
    try {
      docContent = await fetchGoogleDocsContent(docId)
    } catch (error) {
      return NextResponse.json({
        error: error instanceof Error ? error.message : 'Failed to fetch Google Docs content'
      }, { status: 400 })
    }

    if (!docContent.content || docContent.content.length < 10) {
      return NextResponse.json({
        error: 'Document appears to be empty or inaccessible. Please check sharing permissions.'
      }, { status: 400 })
    }

    // Prepare document data
    const documentData = {
      name: document_name || docContent.title || `Google Doc ${docId}`,
      doc_type: doc_type,
      content_text: docContent.content,
      metadata: {
        filed_by: filed_by || '',
        imported_from_google_docs: true,
        google_docs_url,
        google_docs_id: docId,
        original_title: docContent.title,
        import_timestamp: new Date().toISOString(),
        content_length: docContent.content.length
      },
      case_id: caseId,
    }

    // Insert document record
    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Auto-embed imported document
    let embedded = false
    try {
      const embedResponse = await fetch(
        `${request.nextUrl.origin}/api/cases/${caseId}/documents/${data.id}/embed`,
        { method: 'POST' }
      )
      embedded = embedResponse.ok
    } catch (error) {
      console.error('Embedding failed:', error)
      // Non-fatal error, document is still imported
    }

    return NextResponse.json({
      success: true,
      document: {
        id: data.id,
        name: data.name,
        doc_type: data.doc_type,
        content_preview: docContent.content.substring(0, 200) + (docContent.content.length > 200 ? '...' : ''),
        content_length: docContent.content.length,
        filed_by: filed_by,
        embedded
      }
    }, { status: 201 })

  } catch (err) {
    console.error('POST /api/cases/[id]/documents/import-google-docs error:', err)
    return NextResponse.json({
      error: 'Internal server error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}