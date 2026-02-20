import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI()

export const maxDuration = 120

interface OrganizedDocument {
  id: string
  title: string
  relevance: number
  summary: string
  keyExcerpts: string[]
  docType: string
  dateReference?: string
}

interface DiscoveryCategory {
  name: string
  description: string
  documents: OrganizedDocument[]
}

interface OrganizeResult {
  categories: DiscoveryCategory[]
  totalDocuments: number
  reviewedCount: number
  flaggedCount: number
}

const DISCOVERY_CATEGORIES = [
  'Correspondence',
  'Contracts',
  'Government Records',
  'Expert Reports',
  'Financial Records',
  'Photographs/Maps',
  'Depositions',
  'Pleadings',
  'Court Orders',
  'Discovery Requests/Responses',
  'Witness Statements',
  'Medical Records',
  'Electronic Communications',
  'Other',
]

const ORGANIZER_SYSTEM_PROMPT = `You are a legal discovery organization specialist. Your task is to analyze case documents and categorize them into standard discovery categories.

For each document, you must:
1. Determine the best category from this list: ${DISCOVERY_CATEGORIES.join(', ')}
2. Assign a relevance score (0-100) based on how important the document is to the case
3. Write a brief summary of the document's contents and significance
4. Extract 1-3 key excerpts that are most relevant to the case
5. Identify any date references within the document

Be thorough and precise. Legal discovery organization directly impacts case strategy.

Output your analysis as valid JSON matching this structure:
{
  "documents": [
    {
      "id": "document-id",
      "title": "document name",
      "category": "Category Name",
      "relevance": 0-100,
      "summary": "Brief summary of the document",
      "keyExcerpts": ["excerpt1", "excerpt2"],
      "dateReference": "YYYY-MM-DD or null"
    }
  ]
}`

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

    // Get case data
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, name, case_type, summary, plaintiff_name, defendant_name')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Get all documents for the case
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (docError) {
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        success: true,
        result: {
          categories: [],
          totalDocuments: 0,
          reviewedCount: 0,
          flaggedCount: 0,
        },
      })
    }

    // Build context for AI analysis
    const documentsContext = documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      doc_type: doc.doc_type,
      content_preview: doc.content_text?.substring(0, 2000) || 'No content available',
      file_size: doc.file_size,
      created_at: doc.created_at,
    }))

    const analysisPrompt = `Analyze and categorize the following discovery documents for case "${caseData.name}" (${caseData.case_type}).

Case Summary: ${caseData.summary || 'No summary provided'}
Parties: ${caseData.plaintiff_name || 'Unknown'} v. ${caseData.defendant_name || 'Unknown'}

DOCUMENTS TO CATEGORIZE:
${documentsContext.map((d, i) => `
--- Document ${i + 1} ---
ID: ${d.id}
Title: ${d.name}
Type: ${d.doc_type}
Content Preview:
${d.content_preview}
`).join('\n')}

Categorize ALL documents. Return your analysis as valid JSON.`

    // Process in batches if many documents
    const batchSize = 15
    const allOrganized: Array<{
      id: string
      title: string
      category: string
      relevance: number
      summary: string
      keyExcerpts: string[]
      dateReference?: string
    }> = []

    for (let i = 0; i < documentsContext.length; i += batchSize) {
      const batch = documentsContext.slice(i, i + batchSize)

      const batchPrompt = i === 0
        ? analysisPrompt
        : `Continue categorizing documents for case "${caseData.name}":

${batch.map((d, idx) => `
--- Document ${i + idx + 1} ---
ID: ${d.id}
Title: ${d.name}
Type: ${d.doc_type}
Content Preview:
${d.content_preview}
`).join('\n')}

Return your analysis as valid JSON.`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: ORGANIZER_SYSTEM_PROMPT },
          { role: 'user', content: batchPrompt },
        ],
        temperature: 0.2,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content || '{}'

      try {
        const parsed = JSON.parse(content)
        if (parsed.documents && Array.isArray(parsed.documents)) {
          allOrganized.push(...parsed.documents)
        }
      } catch {
        console.error('Failed to parse AI response for batch:', i)
      }
    }

    // Group into categories
    const categoryMap = new Map<string, OrganizedDocument[]>()

    for (const doc of allOrganized) {
      const category = DISCOVERY_CATEGORIES.includes(doc.category)
        ? doc.category
        : 'Other'

      if (!categoryMap.has(category)) {
        categoryMap.set(category, [])
      }

      categoryMap.get(category)!.push({
        id: doc.id,
        title: doc.title,
        relevance: Math.min(100, Math.max(0, doc.relevance || 50)),
        summary: doc.summary || '',
        keyExcerpts: doc.keyExcerpts || [],
        docType: doc.category,
        dateReference: doc.dateReference || undefined,
      })
    }

    // Build categorized result
    const categories: DiscoveryCategory[] = []

    for (const categoryName of DISCOVERY_CATEGORIES) {
      const docs = categoryMap.get(categoryName)
      if (docs && docs.length > 0) {
        // Sort by relevance within each category
        docs.sort((a, b) => b.relevance - a.relevance)

        categories.push({
          name: categoryName,
          description: getCategoryDescription(categoryName),
          documents: docs,
        })
      }
    }

    // Calculate stats
    const flaggedCount = allOrganized.filter((d) => d.relevance >= 80).length

    const result: OrganizeResult = {
      categories,
      totalDocuments: documents.length,
      reviewedCount: allOrganized.length,
      flaggedCount,
    }

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (err) {
    console.error('Discovery organize error:', err)
    return NextResponse.json({ error: 'Organization failed' }, { status: 500 })
  }
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    'Correspondence': 'Letters, emails, and written communications between parties',
    'Contracts': 'Agreements, contracts, amendments, and related documents',
    'Government Records': 'Government filings, permits, regulations, and public records',
    'Expert Reports': 'Expert witness reports, analyses, and opinions',
    'Financial Records': 'Financial statements, invoices, receipts, and accounting records',
    'Photographs/Maps': 'Photographs, maps, diagrams, and visual evidence',
    'Depositions': 'Deposition transcripts and related exhibits',
    'Pleadings': 'Complaints, answers, motions, and other court filings',
    'Court Orders': 'Court orders, rulings, and judicial decisions',
    'Discovery Requests/Responses': 'Interrogatories, requests for production, and responses',
    'Witness Statements': 'Witness statements, affidavits, and declarations',
    'Medical Records': 'Medical records, reports, and health-related documents',
    'Electronic Communications': 'Text messages, social media posts, and digital communications',
    'Other': 'Documents that do not fit into standard categories',
  }

  return descriptions[category] || ''
}
