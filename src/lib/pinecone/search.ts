import { getPineconeIndex } from './client'
import { generateEmbedding } from '@/lib/ai/embeddings'
import type { AgentRole } from '@/lib/types'

export interface SearchResult {
  id: string
  score: number
  content: string
  source: string
  metadata: {
    source: string
    filename?: string
    chunk_index?: number
    total_chunks?: number
    [key: string]: unknown
  }
}

export interface SearchOptions {
  topK?: number
  minScore?: number
}

// Source path patterns for role-based filtering
const ROLE_SOURCE_FILTERS: Record<AgentRole, RegExp[] | null> = {
  // Attorneys see everything - no filter
  judge: null,
  plaintiff_attorney: null,
  defense_attorney: null,

  // Court clerk - procedural docs, scheduling orders
  court_clerk: [
    /scheduling/i,
    /order/i,
    /docket/i,
    /procedural/i,
    /certificate.*service/i,
  ],

  // Witness - limited to general case docs
  witness: [
    /01_CASE_DOCUMENTS/i,
    /affidavit/i,
  ],

  // Expert witness (DOGM) - mining and technical docs
  expert_witness: [
    /08_TECHNICAL_DOCS/i,
    /mining/i,
    /dogm/i,
    /geological/i,
    /reclamation/i,
    /Portland.*Cement/i,
    /Lone.*Star/i,
  ],

  // Mediator - case summaries and key docs
  mediator: [
    /01_CASE_DOCUMENTS/i,
    /02_LEGAL_AUTHORITY/i,
  ],

  // Law Clerk - statutory and legal authority docs
  law_clerk: [
    /02_LEGAL_AUTHORITY/i,
    /utah.*code/i,
    /statute/i,
    /title.*17/i,
    /HB|SB/i,
  ],

  // County Recorder - title, deeds, declarations
  county_recorder: [
    /recorder/i,
    /deed/i,
    /title/i,
    /declaration/i,
    /entry.*no/i,
    /chain.*title/i,
  ],

  // DOGM Agent - permits, production records, mining
  dogm_agent: [
    /dogm/i,
    /permit/i,
    /production/i,
    /mining/i,
    /noi/i,
    /M\/035/i,
    /S\/035/i,
  ],
}

// Extended roles for Tree Farm case
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _EXTENDED_ROLE_FILTERS: Record<string, RegExp[]> = {
  // County Clerk - county records and ordinances
  'county_clerk': [
    /SL County/i,
    /ordinance/i,
    /county.*rec/i,
    /zoning/i,
  ],

  // County Recorder - deeds, chain of title
  'county_recorder': [
    /SL County Rec Docs/i,
    /04_PROPERTY_HISTORY/i,
    /deed/i,
    /patent/i,
    /chain.*title/i,
    /conveyance/i,
  ],

  // DOGM Agent - mining specific
  'dogm_agent': [
    /08_TECHNICAL_DOCS/i,
    /mining/i,
    /dogm/i,
    /reclamation/i,
    /Portland.*Cement/i,
    /geological/i,
  ],

  // Judge's Clerk - case management
  'judges_clerk': [
    /scheduling/i,
    /order/i,
    /calendar/i,
  ],
}

// Check if a source path matches the role's allowed patterns
function sourceMatchesRole(source: string, role: AgentRole): boolean {
  const patterns = ROLE_SOURCE_FILTERS[role]

  // null means no filter - see everything
  if (patterns === null) {
    return true
  }

  // Check if source matches any allowed pattern
  return patterns.some((pattern) => pattern.test(source))
}

// Identify document source/party from filename
function identifySource(source: string): string {
  const lower = source.toLowerCase()

  // Tree Farm filings
  if (lower.includes('tree_farm') || lower.includes('tree farm')) {
    return 'Tree Farm LLC'
  }

  // Salt Lake County filings
  if (
    lower.includes('salt_lake_county') ||
    lower.includes('slc') ||
    lower.includes("county's")
  ) {
    return 'Salt Lake County'
  }

  // Draper City (parallel case)
  if (lower.includes('draper')) {
    return 'Draper City (Parallel Case)'
  }

  // Court orders
  if (lower.includes('order') || lower.includes('signed')) {
    return 'Court'
  }

  // Property records
  if (lower.includes('sl county rec') || /^\d{6,}\.pdf/.test(source)) {
    return 'County Recorder'
  }

  // Technical/Mining
  if (lower.includes('08_technical') || lower.includes('portland') || lower.includes('lone_star')) {
    return 'Historical Mining Record'
  }

  // Legal authority
  if (lower.includes('02_legal') || lower.includes('utah') || lower.includes('code')) {
    return 'Legal Authority'
  }

  return 'Unknown'
}

// Search with role-based filtering
export async function searchByRole(
  query: string,
  role: AgentRole,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  // Increased topK for Claude's larger context window (200K+)
  const { topK = 20, minScore = 0.60 } = options

  const embedding = await generateEmbedding(query)
  const index = getPineconeIndex()

  // Query more results for filtering
  const queryCount = ROLE_SOURCE_FILTERS[role] === null ? topK : topK * 3

  const response = await index.query({
    vector: embedding,
    topK: queryCount,
    includeMetadata: true,
  })

  const results: SearchResult[] = []

  for (const match of response.matches || []) {
    if (!match.score || match.score < minScore) continue

    const source = (match.metadata?.source as string) || ''

    // Apply role-based filter
    if (!sourceMatchesRole(source, role)) continue

    results.push({
      id: match.id,
      score: match.score,
      content: (match.metadata?.text as string) || '',
      source: identifySource(source),
      metadata: {
        source,
        filename: match.metadata?.filename as string,
        chunk_index: match.metadata?.chunk_index as number,
        total_chunks: match.metadata?.total_chunks as number,
      },
    })

    if (results.length >= topK) break
  }

  return results
}

// Search without role filter (for admin/debugging)
// Will search default namespace first, then try common namespaces if no results
export async function searchAll(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  // Increased topK for Claude's larger context window (200K+)
  const { topK = 20, minScore = 0.60 } = options

  const embedding = await generateEmbedding(query)
  const index = getPineconeIndex()

  // Try default namespace first
  let response = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
  })

  // If no results in default namespace, try common namespaces
  const commonNamespaces = ['legal-docs', 'treefarm', 'case-documents', 'documents']
  if (!response.matches || response.matches.length === 0) {
    for (const ns of commonNamespaces) {
      try {
        const nsResponse = await index.namespace(ns).query({
          vector: embedding,
          topK,
          includeMetadata: true,
        })
        if (nsResponse.matches && nsResponse.matches.length > 0) {
          response = nsResponse
          break
        }
      } catch {
        // Namespace doesn't exist, continue
      }
    }
  }

  return (response.matches || [])
    .filter((m) => m.score && m.score >= minScore)
    .map((match) => ({
      id: match.id,
      score: match.score!,
      content: (match.metadata?.text as string) || (match.metadata?.content as string) || '',
      source: identifySource((match.metadata?.source as string) || ''),
      metadata: {
        source: (match.metadata?.source as string) || '',
        filename: match.metadata?.filename as string,
        chunk_index: match.metadata?.chunk_index as number,
        total_chunks: match.metadata?.total_chunks as number,
      },
    }))
}

// Format results for LLM context with source attribution
export function formatResultsForContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant documents found.'
  }

  return results
    .map((r, i) => {
      const docName = r.metadata.filename || r.metadata.source.split('/').pop() || 'Unknown'
      return `[${i + 1}] ${docName} (Source: ${r.source}):\n${r.content}`
    })
    .join('\n\n---\n\n')
}
