import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'
import { AGENT_ROLE_TEMPLATES } from '@/lib/ai/prompts'
import { ErrorCodes } from '@/lib/api-error'
import type { AgentRole } from '@/lib/types'
import { caseTypes } from '@/lib/validations/case'

const caseInfoSchema = z.object({
  name: z.string().min(1, 'Case name is required').max(255),
  case_number: z.string().max(50).optional().nullable().transform(val => val || undefined),
  jurisdiction: z.string().max(100).optional().nullable().transform(val => val || undefined),
  case_type: z.enum(caseTypes, 'Please select a valid case type'),
  plaintiff_name: z.string().max(255).optional().nullable().transform(val => val || undefined),
  defendant_name: z.string().max(255).optional().nullable().transform(val => val || undefined),
  summary: z.string().max(5000).optional().nullable().transform(val => val || undefined),
  status: z.enum(['draft', 'active', 'closed', 'archived']).optional().default('active'),
})

const claimSchema = z.object({
  title: z.string().min(1, 'Claim title is required').max(255),
  relief_type: z.enum([
    'declaratory', 'injunctive', 'regulatory_taking',
    'damages', 'restitution', 'specific_performance',
    'attorneys_fees', 'other',
  ]).default('other'),
  description: z.string().max(5000).optional().default(''),
  legal_basis: z.string().max(2000).optional().nullable().transform(val => val || undefined),
})

const agentRolesSchema = z.array(
  z.enum(['judge', 'plaintiff_attorney', 'defense_attorney', 'court_clerk', 'witness', 'expert_witness', 'mediator', 'law_clerk', 'county_recorder', 'dogm_agent'])
).optional()

function errorResponse(
  error: string,
  code: string,
  statusCode: number,
  options?: { details?: string }
) {
  return NextResponse.json(
    {
      error,
      code,
      message: error,
      details: options?.details,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

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
 * POST /api/cases/import
 *
 * Import a case from structured data with documents.
 * Accepts multipart form data with:
 * - case_info: JSON string with case name, number, jurisdiction, parties, type
 * - documents: array of files (PDF, TXT, DOCX)
 * - claims: optional JSON string array of claims
 * - agent_roles: optional JSON string array of agent roles to activate
 *
 * Creates the case, uploads documents to Supabase Storage, creates document records,
 * optionally creates claims and agents.
 * Returns the new case ID.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse(
        'Please sign in to import a case',
        ErrorCodes.UNAUTHORIZED,
        401
      )
    }

    // Parse multipart form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return errorResponse(
        'Invalid form data. Please submit a valid multipart form.',
        ErrorCodes.INVALID_INPUT,
        400
      )
    }

    // Extract and validate case info
    const caseInfoRaw = formData.get('case_info')
    if (!caseInfoRaw || typeof caseInfoRaw !== 'string') {
      return errorResponse(
        'case_info field is required and must be a JSON string',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    let caseInfoParsed: unknown
    try {
      caseInfoParsed = JSON.parse(caseInfoRaw)
    } catch {
      return errorResponse(
        'case_info must be valid JSON',
        ErrorCodes.INVALID_INPUT,
        400
      )
    }

    const caseInfoResult = caseInfoSchema.safeParse(caseInfoParsed)
    if (!caseInfoResult.success) {
      return errorResponse(
        'Invalid case information: ' + caseInfoResult.error.issues.map(i => i.message).join(', '),
        ErrorCodes.VALIDATION_ERROR,
        400,
        { details: JSON.stringify(caseInfoResult.error.issues) }
      )
    }

    // Parse optional claims
    let claims: z.infer<typeof claimSchema>[] = []
    const claimsRaw = formData.get('claims')
    if (claimsRaw && typeof claimsRaw === 'string') {
      try {
        const claimsParsed = JSON.parse(claimsRaw)
        if (Array.isArray(claimsParsed)) {
          const validatedClaims = claimsParsed.map(c => claimSchema.safeParse(c))
          const invalidClaim = validatedClaims.find(v => !v.success)
          if (invalidClaim && !invalidClaim.success) {
            return errorResponse(
              'Invalid claim data: ' + invalidClaim.error.issues.map(i => i.message).join(', '),
              ErrorCodes.VALIDATION_ERROR,
              400
            )
          }
          claims = validatedClaims.map(v => v.data!) as z.infer<typeof claimSchema>[]
        }
      } catch {
        return errorResponse(
          'claims must be a valid JSON array',
          ErrorCodes.INVALID_INPUT,
          400
        )
      }
    }

    // Parse optional agent roles
    let agentRoles: AgentRole[] = ['judge', 'plaintiff_attorney', 'defense_attorney']
    const agentRolesRaw = formData.get('agent_roles')
    if (agentRolesRaw && typeof agentRolesRaw === 'string') {
      try {
        const parsed = JSON.parse(agentRolesRaw)
        const result = agentRolesSchema.safeParse(parsed)
        if (result.success && result.data && result.data.length > 0) {
          agentRoles = result.data as AgentRole[]
        }
      } catch {
        // Ignore invalid agent_roles, use defaults
      }
    }

    // Collect document files
    const documentFiles: File[] = []
    const entries = formData.getAll('documents')
    for (const entry of entries) {
      if (entry instanceof File && entry.size > 0) {
        documentFiles.push(entry)
      }
    }

    // ---- Step 1: Create the case ----
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .insert({
        ...caseInfoResult.data,
        user_id: user.id,
      })
      .select()
      .single()

    if (caseError) {
      console.error('Database error creating case:', caseError)
      if (caseError.code === '23505') {
        return errorResponse(
          'A case with this name already exists',
          ErrorCodes.DUPLICATE_ENTRY,
          409
        )
      }
      return errorResponse(
        'Failed to create case. Please try again.',
        ErrorCodes.DATABASE_ERROR,
        500,
        { details: caseError.message }
      )
    }

    const caseId = caseData.id
    const documentIds: string[] = []
    const uploadErrors: string[] = []

    // ---- Step 2: Upload documents ----
    for (const file of documentFiles) {
      try {
        // Extract content based on file type
        let contentText = ''
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          contentText = await extractPdfText(file)
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          contentText = await extractTextContent(file)
        }

        // Generate unique file path
        const fileExt = file.name.split('.').pop() || 'bin'
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 15)
        const filePath = `${caseId}/${timestamp}-${randomId}.${fileExt}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('case-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error(`Storage upload error for ${file.name}:`, uploadError)
          uploadErrors.push(`Failed to upload ${file.name}`)
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
              imported_via: 'case_import_wizard',
            },
          })
          .select()
          .single()

        if (docError) {
          console.error(`Database error for ${file.name}:`, docError)
          await supabase.storage.from('case-documents').remove([filePath])
          uploadErrors.push(`Failed to save record for ${file.name}`)
          continue
        }

        documentIds.push(docData.id)
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err)
        uploadErrors.push(`Error processing ${file.name}`)
      }
    }

    // ---- Step 3: Create claims ----
    const claimIds: string[] = []
    if (claims.length > 0) {
      for (let i = 0; i < claims.length; i++) {
        const claim = claims[i]
        const { data: claimData, error: claimError } = await supabase
          .from('claims_for_relief')
          .insert({
            case_id: caseId,
            claim_number: i + 1,
            title: claim.title,
            relief_type: claim.relief_type,
            description: claim.description || '',
            legal_basis: claim.legal_basis,
            is_alternative: false,
            metadata: {},
          })
          .select()
          .single()

        if (claimError) {
          console.error(`Failed to create claim ${claim.title}:`, claimError)
        } else {
          claimIds.push(claimData.id)
        }
      }
    }

    // ---- Step 4: Create agents ----
    const agentsToInsert = agentRoles.map(role => ({
      case_id: caseId,
      role,
      name: AGENT_ROLE_TEMPLATES[role].defaultName,
      persona_prompt: AGENT_ROLE_TEMPLATES[role].defaultPrompt,
      temperature: AGENT_ROLE_TEMPLATES[role].defaultTemperature,
    }))

    const { error: agentsError } = await supabase.from('agents').insert(agentsToInsert)

    if (agentsError) {
      console.error('Failed to create agents:', agentsError)
    }

    return NextResponse.json(
      {
        id: caseId,
        case: caseData,
        documents_uploaded: documentIds.length,
        document_ids: documentIds,
        claims_created: claimIds.length,
        claim_ids: claimIds,
        agents_created: agentRoles.length,
        agent_roles: agentRoles,
        upload_errors: uploadErrors.length > 0 ? uploadErrors : undefined,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/cases/import error:', err)
    return errorResponse(
      'An unexpected error occurred while importing the case',
      ErrorCodes.INTERNAL_ERROR,
      500,
      { details: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}
