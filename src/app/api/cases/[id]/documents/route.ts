import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { z } from 'zod'

const createDocumentSchema = z.object({
  name: z.string().min(1).max(255),
  doc_type: z.enum(['complaint', 'answer', 'motion', 'brief', 'discovery', 'deposition', 'exhibit', 'order', 'judgment', 'other']),
  file_path: z.string().optional(),
  file_size: z.number().optional(),
  mime_type: z.string().optional(),
  content_text: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Helper function to extract text from PDF
async function extractPdfText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    // Use require for CommonJS module
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(Buffer.from(arrayBuffer))
    return data.text || ''
  } catch (error) {
    console.error('PDF extraction failed:', error)
    // Fallback to empty string if PDF parsing fails
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/cases/[id]/documents error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    const docType = formData.get('doc_type') as string
    const filedBy = formData.get('filed_by') as string

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Extract content based on file type
    let contentText = ''
    if (file.type === 'application/pdf') {
      contentText = await extractPdfText(file)
    } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
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
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
    }

    // Prepare document data
    const documentData = {
      name: file.name,
      doc_type: docType,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      content_text: contentText,
      metadata: {
        filed_by: filedBy,
        original_filename: file.name,
        upload_timestamp: new Date().toISOString()
      },
      case_id: caseId,
    }

    // Validate document data
    const parsed = createDocumentSchema.safeParse(documentData)
    if (!parsed.success) {
      // Clean up uploaded file on validation error
      await supabase.storage.from('case-documents').remove([filePath])
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    // Insert document record
    const { data, error } = await supabase
      .from('documents')
      .insert(parsed.data)
      .select()
      .single()

    if (error) {
      // Clean up uploaded file on database error
      await supabase.storage.from('case-documents').remove([filePath])
      console.error('Database insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ document: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/cases/[id]/documents error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { searchParams } = new URL(request.url)
    const docId = searchParams.get('docId')

    if (!docId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getSupabase()

    // Get file path before deleting
    const { data: doc } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', docId)
      .eq('case_id', caseId)
      .single()

    // Delete from storage if file exists
    if (doc?.file_path) {
      await supabase.storage.from('case-documents').remove([doc.file_path])
    }

    // Delete document (chunks will cascade)
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)
      .eq('case_id', caseId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/cases/[id]/documents error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
