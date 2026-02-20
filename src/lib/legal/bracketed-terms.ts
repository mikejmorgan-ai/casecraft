/**
 * BRACKETED TERMS — Exact Phrase Matching & Statutory Cross-Reference Engine
 * Tree Farm LLC v. Salt Lake County (Case No. 220903418)
 *
 * RULE 1: BRACKETED TERM MATCHING
 * Every legal term is an exact phrase. "vested mining use" means ALL THREE
 * words must appear together. The word "vested" alone is NOT a hit.
 *
 * RULE 2: STATUTORY CROSS-REFERENCING
 * When a claim uses a statutory code (e.g., 17-41-501), find documents
 * that reference that statute AND contain bracketed terms.
 * Statute + bracketed terms = critical document.
 */

// ═══════════════════════════════════════════════════════════════════════
// BRACKETED TERMS — Every term is an EXACT PHRASE (all words together)
// ═══════════════════════════════════════════════════════════════════════

export const CLAIM3_BRACKETED_TERMS = [
  // Statutory defined terms (Utah Code 17-41-101 et seq.)
  'vested mining use',
  'vested mining right',
  'mine operator',
  'mining protection area',
  'mining use',
  'declaration of vested',
  'notice of vested',
  // Statutory qualifiers
  'owns, controls, or manages',
  'produced commercial quantities',
  'commercial quantities of a mineral deposit',
  'as of january 1, 2009',
  'as of january 1, 2019',
  // Statutory rights language
  'runs with the land',
  'runs with and bind',
  'conclusively presumed',
  'highest priority use',
  'written declaration of abandonment',
  'express abandonment',
  'sound mining practices',
  // Expansion rights
  'expand the vested mining use',
  'contiguous and related in mineralization',
  'same mineral trend',
  'geologic offshoot',
  // Nonconforming use
  'nonconforming use status',
  'legal nonconforming',
  'nonconforming use',
  'non-conforming use',
  'pre-existing use',
  'pre-existing mining',
  // Historical mining
  'portland cement',
  'large mine permit',
  'small mine permit',
  'notice of intention',
  // Key staff language
  'such language is not necessary',
  'continue to be a conditional use',
] as const

export const CLAIM2_BRACKETED_TERMS = [
  ...CLAIM3_BRACKETED_TERMS,
  // Enforcement-specific
  'cease and desist',
  'enforcement action',
  'stop work order',
  'notice of violation',
  'code enforcement',
  'business license denial',
  'conditional use permit',
  'irreparable harm',
  'ongoing harm',
  'shut down',
  'cannot operate',
  'operating without',
  'operating in violation',
  'administrative trap',
] as const

export const CLAIM1_BRACKETED_TERMS = [
  // CIM statutory terms
  'critical infrastructure materials',
  'critical infrastructure materials operations',
  'sand, gravel and/or rock aggregate',
  'sand, gravel, or rock aggregate',
  'mineral extraction and processing',
  'mineral extraction',
  // Preemption language
  'may not adopt',
  'may not enact',
  'may not amend',
  'prohibit critical infrastructure',
  // Ordinance language
  'explicitly prohibited',
  'conditional use',
  'forestry and recreation zone',
  // Key case language
  'long prohibited',
  'confident in the legality',
  'fight to enforce',
] as const

// ═══════════════════════════════════════════════════════════════════════
// STATUTORY CODES
// ═══════════════════════════════════════════════════════════════════════

export const CLAIM3_STATUTES = [
  /17[\-\s]*41[\-\s]*501/i,
  /17[\-\s]*41[\-\s]*502/i,
  /17[\-\s]*41[\-\s]*503/i,
  /17[\-\s]*41[\-\s]*101/i,
  /17[\-\s]*41[\-\s]*402/i,
  /17[\-\s]*41[\-\s]*403/i,
  /17[\-\s]*27a[\-\s]*100[1-5]/i,
  /10[\-\s]*9a[\-\s]*90[1-5]/i,
  /17[\-\s]*81[\-\s]*401/i,
  /17[\-\s]*81[\-\s]*402/i,
  /17[\-\s]*81[\-\s]*403/i,
]

export const CLAIM1_STATUTES = [
  /17[\-\s]*41[\-\s]*402/i,
  /17[\-\s]*41[\-\s]*406/i,
  /10[\-\s]*9a[\-\s]*901/i,
  /10[\-\s]*9a[\-\s]*902/i,
  /19[\.\-]12[\.\-]030/i,
  ...CLAIM3_STATUTES,
]

export const CLAIM2_STATUTES = [
  ...CLAIM3_STATUTES,
  /19[\.\-]12[\.\-]030/i,
]

// Consolidated lookups
export const CLAIM_TERMS: Record<number, readonly string[]> = {
  1: CLAIM1_BRACKETED_TERMS,
  2: CLAIM2_BRACKETED_TERMS,
  3: CLAIM3_BRACKETED_TERMS,
}

export const CLAIM_STATUTES: Record<number, RegExp[]> = {
  1: CLAIM1_STATUTES,
  2: CLAIM2_STATUTES,
  3: CLAIM3_STATUTES,
}

// ═══════════════════════════════════════════════════════════════════════
// RULE 1: BRACKETED TERM MATCHING
// ═══════════════════════════════════════════════════════════════════════

/**
 * Build a regex that matches an exact phrase with flexible whitespace.
 * "vested mining use" → matches "vested  mining   use" but NOT "vested" alone
 */
function buildPhraseRegex(phrase: string): RegExp {
  const words = phrase.toLowerCase().split(/\s+/)
  if (words.length === 1) {
    return new RegExp(`\\b${escapeRegex(words[0])}\\b`, 'gi')
  }
  const pattern = '\\b' + words.map(escapeRegex).join('\\s+') + '\\b'
  return new RegExp(pattern, 'gi')
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Pre-compile patterns
const compiledTermPatterns: Record<number, Array<{ term: string; pattern: RegExp }>> = {}
for (const [claimNum, terms] of Object.entries(CLAIM_TERMS)) {
  compiledTermPatterns[Number(claimNum)] = terms.map((term) => ({
    term,
    pattern: buildPhraseRegex(term),
  }))
}

export interface TermMatch {
  term: string
  count: number
}

export interface StatuteMatch {
  pattern: string
  count: number
}

export interface CrossReference {
  statute: string
  terms: string[]
}

export interface BracketedScoreResult {
  score: number
  relevance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  termHits: TermMatch[]
  statuteHits: StatuteMatch[]
  crossReferences: CrossReference[]
}

/**
 * Find all bracketed term matches in text for a given claim.
 * Only returns terms where the COMPLETE phrase appears in the text.
 * Single words are NEVER matched independently.
 */
export function matchBracketedTerms(text: string, claimNum: number): TermMatch[] {
  const patterns = compiledTermPatterns[claimNum]
  if (!patterns) return []

  const hits: TermMatch[] = []
  for (const { term, pattern } of patterns) {
    // Reset regex state
    pattern.lastIndex = 0
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      hits.push({ term, count: matches.length })
    }
  }
  return hits
}

/**
 * Find all statutory code references in text for a given claim.
 */
export function matchStatutes(text: string, claimNum: number): StatuteMatch[] {
  const statutes = CLAIM_STATUTES[claimNum]
  if (!statutes) return []

  const hits: StatuteMatch[] = []
  for (const pattern of statutes) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      hits.push({ pattern: pattern.source, count: matches.length })
    }
  }
  return hits
}

// ═══════════════════════════════════════════════════════════════════════
// RULE 2: STATUTORY CROSS-REFERENCING
// ═══════════════════════════════════════════════════════════════════════

/**
 * Find documents where a statutory code AND bracketed terms co-occur.
 * Both together = critical document.
 */
export function findStatutoryCrossReferences(
  text: string,
  claimNum: number
): CrossReference[] {
  const statuteHits = matchStatutes(text, claimNum)
  if (statuteHits.length === 0) return []

  const termHits = matchBracketedTerms(text, claimNum)
  if (termHits.length === 0) return []

  const matchedTerms = termHits.map((h) => h.term)
  return statuteHits.map((s) => ({
    statute: s.pattern,
    terms: matchedTerms,
  }))
}

/**
 * Score a document using ONLY bracketed term matching (Rule 1) and
 * statutory cross-referencing (Rule 2).
 */
export function scoreDocumentBracketed(
  text: string,
  claimNum: number
): BracketedScoreResult | null {
  const termHits = matchBracketedTerms(text, claimNum)
  const statuteHits = matchStatutes(text, claimNum)
  const crossRefs = findStatutoryCrossReferences(text, claimNum)

  if (termHits.length === 0 && statuteHits.length === 0) return null

  const termScore = termHits.reduce((sum, h) => sum + h.count, 0) * 10
  const statuteScore = statuteHits.length * 5
  const crossRefScore =
    crossRefs.reduce((sum, cr) => sum + cr.terms.length, 0) * 15
  const totalScore = termScore + statuteScore + crossRefScore

  if (totalScore === 0) return null

  let relevance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  if (crossRefs.length > 0 && totalScore >= 40) {
    relevance = 'CRITICAL'
  } else if (termHits.length >= 3 && totalScore >= 30) {
    relevance = 'CRITICAL'
  } else if ((crossRefs.length > 0 || termHits.length >= 2) && totalScore >= 20) {
    relevance = 'HIGH'
  } else if (termHits.length > 0 && totalScore >= 10) {
    relevance = 'MEDIUM'
  } else {
    relevance = 'LOW'
  }

  return {
    score: totalScore,
    relevance,
    termHits,
    statuteHits,
    crossReferences: crossRefs,
  }
}

/**
 * Check if document has ANY relevant context using ONLY bracketed terms.
 * Replaces any single-word pre-filters.
 */
export function hasRelevantContext(text: string, claimNum: number): boolean {
  const termHits = matchBracketedTerms(text, claimNum)
  const statuteHits = matchStatutes(text, claimNum)
  return termHits.length > 0 || statuteHits.length > 0
}

/**
 * Extract the best quote from text that contains the most bracketed terms.
 */
export function extractBestQuoteBracketed(
  text: string,
  claimNum: number,
  maxLen = 500
): string {
  const lines = text.split('\n')
  let bestLine = ''
  let bestScore = 0

  const patterns = compiledTermPatterns[claimNum] || []
  const statutes = CLAIM_STATUTES[claimNum] || []

  for (const line of lines) {
    const stripped = line.trim()
    if (stripped.length < 10 || stripped.length > 1000) continue

    let score = 0
    for (const { pattern } of patterns) {
      pattern.lastIndex = 0
      if (pattern.test(stripped)) score += 10
    }
    for (const statute of statutes) {
      if (statute.test(stripped)) score += 5
    }

    if (score > bestScore) {
      bestScore = score
      bestLine = stripped
    }
  }

  return bestLine.slice(0, maxLen)
}
