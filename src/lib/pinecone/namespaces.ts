import type { AgentRole } from '@/lib/types'

// Namespace structure for role-based document partitioning
export const NAMESPACES = {
  // Judge Stormont's materials
  'judge-stormont': {
    'utah-code': 'Utah statutes (Title 17, 57, 78B)',
    'case-law': 'Utah Supreme Court, Court of Appeals decisions',
    'court-orders': 'All orders issued in this case',
    'scheduling-orders': 'Scheduling orders, deadlines',
    'urcp': 'Utah Rules of Civil Procedure',
  },

  // Plaintiff counsel (Tree Farm)
  'plaintiff-counsel': {
    'complaints': 'Original + Amended Complaints',
    'motions': 'Tree Farm motions',
    'briefs': 'Tree Farm legal briefs',
    'discovery-sent': 'Discovery requests TO County',
    'discovery-responses': 'Responses TO County discovery',
    'strategy-memos': 'Internal attorney work product',
    'affidavits': 'Hilberg, Sachs declarations',
  },

  // Defense counsel (Salt Lake County)
  'defense-counsel': {
    'answers': 'County Answers, Counterclaims',
    'motions': 'County motions',
    'briefs': 'County legal briefs',
    'discovery-sent': 'Discovery requests TO Tree Farm',
    'discovery-responses': 'Responses TO Tree Farm discovery',
    'disclosures': 'County initial/supplemental disclosures',
  },

  // Court Clerk
  'court-clerk': {
    'docket': 'Case docket entries',
    'filing-records': 'All filed documents (metadata)',
    'service-records': 'Certificates of service, returns',
    'procedural-rules': 'Local court rules, standing orders',
  },

  // Salt Lake County Clerk
  'county-clerk': {
    'ordinances': 'Ordinance 1895, zoning codes',
    'meeting-minutes': 'County council proceedings',
    'public-records': 'Public filings, notices',
  },

  // Salt Lake County Recorder
  'county-recorder': {
    'deeds': 'All deed documents',
    'patents': 'Federal land patents (1895)',
    'chain-of-title': 'Complete ownership history',
    'easements': 'Recorded easements',
    'surveys': 'Property surveys, plats',
  },

  // Division of Oil, Gas and Mining
  'dogm-agent': {
    'permits': 'Mining permit records',
    'reclamation': 'Reclamation letters, requirements',
    'regulations': 'DOGM rules and regulations',
    'historical-mining': 'Historical mining operation records',
  },

  // Judge's Clerk
  'judges-clerk': {
    'calendar': 'Court calendar, hearing dates',
    'chambers-rules': 'Judge standing orders, preferences',
    'case-management': 'Case status, deadlines tracking',
  },

  // Shared resources
  'shared': {
    'news-coverage': 'KSL, Deseret News, KUTV articles',
  },
} as const

// Agent permission mappings - what each role can access
export const AGENT_PERMISSIONS: Record<AgentRole, string[]> = {
  judge: [
    'judge-stormont/*',
    'court-clerk/docket',
    'court-clerk/filing-records',
  ],

  plaintiff_attorney: [
    'plaintiff-counsel/*',
    'judge-stormont/*',
    'court-clerk/*',
    'county-recorder/*',
    'dogm-agent/*',
    'defense-counsel/answers',
    'defense-counsel/motions',
    'defense-counsel/disclosures',
    'shared/*',
  ],

  defense_attorney: [
    'defense-counsel/*',
    'judge-stormont/*',
    'court-clerk/*',
    'county-clerk/*',
    'plaintiff-counsel/complaints',
    'plaintiff-counsel/motions',
    'plaintiff-counsel/discovery-sent',
    'shared/*',
  ],

  court_clerk: [
    'court-clerk/*',
    'judge-stormont/scheduling-orders',
    'judge-stormont/court-orders',
  ],

  witness: [
    'county-recorder/*',
    'dogm-agent/historical-mining',
    'shared/*',
  ],

  expert_witness: [
    'county-recorder/*',
    'dogm-agent/*',
    'shared/*',
  ],

  mediator: [
    'judge-stormont/utah-code',
    'judge-stormont/case-law',
    'shared/*',
  ],

  law_clerk: [
    'judge-stormont/utah-code',
    'judge-stormont/case-law',
    'court-clerk/*',
  ],

  county_recorder: [
    'county-recorder/*',
    'shared/*',
  ],

  dogm_agent: [
    'dogm-agent/*',
    'shared/*',
  ],
}

// Extended permissions for Tree Farm specific roles
export const EXTENDED_PERMISSIONS: Record<string, string[]> = {
  'county-clerk-agent': [
    'county-clerk/*',
  ],

  'county-recorder-agent': [
    'county-recorder/*',
  ],

  'dogm-agent': [
    'dogm-agent/*',
    'judge-stormont/utah-code',
  ],

  'judges-clerk': [
    'judges-clerk/*',
    'judge-stormont/*',
    'court-clerk/docket',
  ],
}

// Get namespaces an agent can query
export function getAgentNamespaces(role: AgentRole): string[] {
  const permissions = AGENT_PERMISSIONS[role] || []
  const namespaces: string[] = []

  for (const perm of permissions) {
    if (perm.endsWith('/*')) {
      // Wildcard - add all sub-namespaces
      const base = perm.replace('/*', '')
      const baseNamespaces = NAMESPACES[base as keyof typeof NAMESPACES]
      if (baseNamespaces) {
        for (const sub of Object.keys(baseNamespaces)) {
          namespaces.push(`${base}/${sub}`)
        }
      }
    } else {
      namespaces.push(perm)
    }
  }

  return [...new Set(namespaces)]
}

// Flatten namespace for Pinecone (use hyphen format)
export function flattenNamespace(category: string, subcategory: string): string {
  return `${category}--${subcategory}`
}

// Document type to namespace routing
export const DOCUMENT_ROUTING: Record<string, string | ((meta: DocumentMeta) => string)> = {
  // Complaints
  complaint: 'plaintiff-counsel--complaints',
  amended_complaint: 'plaintiff-counsel--complaints',

  // Answers
  answer: (meta) =>
    meta.filed_by === 'Tree Farm LLC'
      ? 'plaintiff-counsel--motions'
      : 'defense-counsel--answers',
  counterclaim: 'defense-counsel--answers',

  // Motions
  motion: (meta) =>
    meta.filed_by === 'Tree Farm LLC'
      ? 'plaintiff-counsel--motions'
      : 'defense-counsel--motions',

  // Briefs
  brief: (meta) =>
    meta.filed_by === 'Tree Farm LLC'
      ? 'plaintiff-counsel--briefs'
      : 'defense-counsel--briefs',

  // Court Orders
  court_order: 'judge-stormont--court-orders',
  scheduling_order: 'judge-stormont--scheduling-orders',
  order: 'judge-stormont--court-orders',

  // Law
  utah_code: 'judge-stormont--utah-code',
  statute: 'judge-stormont--utah-code',
  case_law: 'judge-stormont--case-law',
  urcp: 'judge-stormont--urcp',
  rule: 'judge-stormont--urcp',

  // Discovery
  interrogatories: (meta) =>
    meta.filed_by === 'Tree Farm LLC'
      ? 'plaintiff-counsel--discovery-sent'
      : 'defense-counsel--discovery-sent',
  rfp: (meta) =>
    meta.filed_by === 'Tree Farm LLC'
      ? 'plaintiff-counsel--discovery-sent'
      : 'defense-counsel--discovery-sent',
  rfa: (meta) =>
    meta.filed_by === 'Tree Farm LLC'
      ? 'plaintiff-counsel--discovery-sent'
      : 'defense-counsel--discovery-sent',
  initial_disclosures: (meta) =>
    meta.filed_by === 'Tree Farm LLC'
      ? 'plaintiff-counsel--discovery-responses'
      : 'defense-counsel--disclosures',
  disclosures: (meta) =>
    meta.filed_by === 'Tree Farm LLC'
      ? 'plaintiff-counsel--discovery-responses'
      : 'defense-counsel--disclosures',
  discovery: (meta) =>
    meta.filed_by === 'Tree Farm LLC'
      ? 'plaintiff-counsel--discovery-sent'
      : 'defense-counsel--discovery-sent',

  // Property Records
  deed: 'county-recorder--deeds',
  patent: 'county-recorder--patents',
  land_patent: 'county-recorder--patents',
  survey: 'county-recorder--surveys',
  easement: 'county-recorder--easements',
  chain_of_title: 'county-recorder--chain-of-title',

  // County Records
  ordinance: 'county-clerk--ordinances',
  zoning: 'county-clerk--ordinances',
  meeting_minutes: 'county-clerk--meeting-minutes',

  // Mining Records
  mining_permit: 'dogm-agent--permits',
  permit: 'dogm-agent--permits',
  reclamation: 'dogm-agent--reclamation',
  historical_mining: 'dogm-agent--historical-mining',
  mining_record: 'dogm-agent--historical-mining',

  // Affidavits/Declarations
  affidavit: 'plaintiff-counsel--affidavits',
  declaration: 'plaintiff-counsel--affidavits',

  // News
  news_article: 'shared--news-coverage',
  news: 'shared--news-coverage',
  article: 'shared--news-coverage',

  // Docket
  docket: 'court-clerk--docket',
  filing_record: 'court-clerk--filing-records',

  // Default
  other: 'shared--news-coverage',
}

export interface DocumentMeta {
  doc_type: string
  filed_by?: string
  source?: string
}

// Get namespace for a document
export function routeDocument(meta: DocumentMeta): string {
  const route = DOCUMENT_ROUTING[meta.doc_type]

  if (!route) {
    console.warn(`No routing rule for doc_type: ${meta.doc_type}, using default`)
    return 'shared--news-coverage'
  }

  if (typeof route === 'function') {
    return route(meta)
  }

  return route
}

// Convert flat namespace back to readable format
export function parseNamespace(flat: string): { category: string; subcategory: string } {
  const [category, subcategory] = flat.split('--')
  return { category, subcategory }
}
