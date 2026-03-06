import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'

// Helper function to extract text from PDF
async function extractPdfText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(Buffer.from(arrayBuffer))
    return data.text || ''
  } catch (error) {
    console.error('PDF extraction failed:', error)
    return ''
  }
}

// Helper function to extract text from text files
async function extractTextContent(file: File): Promise<string> {
  try {
    return await file.text()
  } catch (error) {
    console.error('Text extraction failed:', error)
    return ''
  }
}

// Detect document type from filename
function detectDocType(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.includes('motion')) return 'motion'
  if (lower.includes('brief')) return 'brief'
  if (lower.includes('complaint')) return 'complaint'
  if (lower.includes('answer')) return 'answer'
  if (lower.includes('discovery')) return 'discovery'
  if (lower.includes('deposition')) return 'deposition'
  if (lower.includes('exhibit')) return 'exhibit'
  if (lower.includes('order')) return 'order'
  if (lower.includes('judgment') || lower.includes('ruling')) return 'judgment'
  return 'other'
}

/**
 * POST /api/cases/[id]/documents/bulk
 *
 * Upload multiple documents at once for a given case.
 * Accepts multipart form data with multiple files under the "files" key.
 * Extracts text from PDFs using pdf-parse.
 * Creates document records in Supabase.
 * Returns array of created document IDs.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = await getSupabase()

    // Verify case exists and belongs to user
    const { data: caseData } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      )
    }

    // Collect all files from the "files" field
    const files: File[] = []
    const entries = formData.getAll('files')
    for (const entry of entries) {
      if (entry instanceof File && entry.size > 0) {
        files.push(entry)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided. Attach files under the "files" field.' },
        { status: 400 }
      )
    }

    const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx', '.md']
    const allowedMimeTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    const documentIds: string[] = []
    const results: { name: string; id?: string; error?: string }[] = []

    for (const file of files) {
      const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '')
      const isAllowed =
        allowedMimeTypes.includes(file.type) ||
        allowedExtensions.includes(ext)

      if (!isAllowed) {
        results.push({
          name: file.name,
          error: `Unsupported file type. Allowed: ${allowedExtensions.join(', ')}`,
        })
        continue
      }

      try {
        // Extract content based on file type
        let contentText = ''
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          contentText = await extractPdfText(file)
        } else if (
          file.type === 'text/plain' ||
          file.name.endsWith('.txt') ||
          file.name.endsWith('.md')
        ) {
          contentText = await extractTextContent(file)
        }

        // Generate unique file path
        const fileExt = file.name.split('.').pop() || 'bin'
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 15)
        const filePath = `${caseId}/${timestamp}-${randomId}.${fileExt}`

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('case-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error(`Storage upload error for ${file.name}:`, uploadError)
          results.push({ name: file.name, error: 'File upload to storage failed' })
          continue
        }

        // Create document record
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            name: file.name,
            doc_type: detectDocType(file.name),
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            content_text: contentText,
            case_id: caseId,
            metadata: {
              original_filename: file.name,
              upload_timestamp: new Date().toISOString(),
              uploaded_via: 'bulk_upload',
            },
          })
          .select()
          .single()

        if (docError) {
          console.error(`Database insert error for ${file.name}:`, docError)
          // Clean up uploaded file on database error
          await supabase.storage.from('case-documents').remove([filePath])
          results.push({ name: file.name, error: 'Failed to create document record' })
          continue
        }

        documentIds.push(docData.id)
        results.push({ name: file.name, id: docData.id })
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err)
        results.push({
          name: file.name,
          error: err instanceof Error ? err.message : 'Processing error',
        })
      }
    }

    return NextResponse.json(
      {
        uploaded: documentIds.length,
        total: files.length,
        document_ids: documentIds,
        results,
      },
      { status: documentIds.length > 0 ? 201 : 400 }
    )
  } catch (err) {
    console.error('POST /api/cases/[id]/documents/bulk error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
