// CaseBreak.ai Type Definitions

export type CaseType =
  | 'civil' | 'criminal' | 'family' | 'contract'
  | 'tort' | 'property' | 'constitutional' | 'administrative'

export type CaseStatus = 'draft' | 'active' | 'closed' | 'archived'

export type AgentRole =
  | 'judge' | 'plaintiff_attorney' | 'defense_attorney'
  | 'court_clerk' | 'witness' | 'expert_witness' | 'mediator'
  | 'law_clerk' | 'county_recorder' | 'dogm_agent'

export type DocumentType =
  | 'complaint' | 'answer' | 'motion' | 'brief' | 'discovery'
  | 'deposition' | 'exhibit' | 'order' | 'judgment' | 'other'

export type ConversationType =
  | 'hearing' | 'deposition' | 'mediation'
  | 'strategy_session' | 'research' | 'general'
  | 'statutory_quiz' | 'voice_call'

export type FactCategory =
  | 'undisputed' | 'disputed' | 'evidence_based'
  | 'testimony' | 'expert_opinion' | 'stipulated'

export type ReliefType =
  | 'declaratory' | 'injunctive' | 'regulatory_taking'
  | 'damages' | 'restitution' | 'specific_performance'
  | 'attorneys_fees' | 'other'

export type EvidenceRelevance = 'direct' | 'corroborative' | 'circumstantial' | 'impeachment'

export interface Case {
  id: string
  user_id: string
  name: string
  case_number: string | null
  case_type: CaseType
  jurisdiction: string | null
  status: CaseStatus
  summary: string | null
  plaintiff_name: string | null
  defendant_name: string | null
  filed_date: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Blind test fields
  is_blind_test?: boolean
  actual_ruling?: string | null
  actual_ruling_date?: string | null
  actual_ruling_summary?: string | null
  ruling_revealed?: boolean
}

export type PredictionOutcome = 'plaintiff' | 'defendant' | 'dismissed' | 'settled' | 'moot'

export interface CasePrediction {
  id: string
  case_id: string
  user_id: string
  predicted_outcome: PredictionOutcome
  predicted_ruling_summary: string
  confidence_score: number
  key_factors: KeyFactor[]
  reasoning: string | null
  citations: PredictionCitation[]
  is_correct: boolean | null
  accuracy_score: number | null
  comparison_notes: string | null
  missed_factors: string[]
  model_used: string
  prediction_mode: 'standard' | 'multi_agent' | 'monte_carlo'
  created_at: string
  revealed_at: string | null
}

export interface KeyFactor {
  factor: string
  weight: 'high' | 'medium' | 'low'
  favors: 'plaintiff' | 'defendant' | 'neutral'
  evidence: string
}

export interface PredictionCitation {
  source: string
  relevance: number
}

export interface Agent {
  id: string
  case_id: string
  role: AgentRole
  name: string
  persona_prompt: string
  temperature: number
  is_active: boolean
  avatar_url: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  case_id: string
  name: string
  doc_type: DocumentType
  file_path: string | null
  file_size: number | null
  mime_type: string | null
  content_text: string | null
  is_embedded: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  chunk_index: number
  content: string
  embedding: number[] | null
  token_count: number | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface Conversation {
  id: string
  case_id: string
  name: string
  conversation_type: ConversationType
  participants: string[]
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  agent_id: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  citations: Citation[]
  metadata: Record<string, unknown>
  created_at: string
}

export interface Citation {
  document_id: string
  document_name: string
  chunk_id: string
  content_preview: string
  similarity: number
}

export interface CaseFact {
  id: string
  case_id: string
  category: FactCategory
  fact_text: string
  source_document_id: string | null
  is_disputed: boolean
  supporting_evidence: unknown[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ClaimForRelief {
  id: string
  case_id: string
  claim_number: number
  title: string
  relief_type: ReliefType
  description: string
  legal_basis: string | null
  is_alternative: boolean
  alternative_to: number | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined evidence (populated via query)
  evidence?: ClaimEvidence[]
}

export interface ClaimEvidence {
  id: string
  claim_id: string
  fact_id: string | null
  document_id: string | null
  relevance: EvidenceRelevance
  discovery_file: string | null
  tier: number | null
  description: string | null
  is_smoking_gun: boolean
  created_at: string
  updated_at: string
}

// Brief draft types
export type BriefType = 'response' | 'motion' | 'memorandum' | 'opposition' | 'reply'

export type BriefTone = 'formal' | 'aggressive' | 'measured'

export interface MotionAnalysis {
  id: string
  case_id: string
  user_id: string
  title: string
  motion_text: string
  analysis_result: string | null
  source_document_id: string | null
  created_at: string
  updated_at: string
}

export interface BriefDraft {
  id: string
  case_id: string
  user_id: string
  brief_type: BriefType
  title: string
  topic: string | null
  instructions: string | null
  tone: BriefTone
  content: string | null
  claim_ids: string[]
  created_at: string
  updated_at: string
}

export interface DiscoveryCategory {
  id: string
  case_id: string
  name: string
  description: string | null
  document_count: number
  created_at: string
  // Joined document categories (populated via query)
  document_categories?: DocumentCategory[]
}

export interface DocumentCategory {
  id: string
  document_id: string
  category_id: string
  relevance_score: number | null
  ai_summary: string | null
  is_reviewed: boolean
  created_at: string
}

// Legal standard types for statutory analysis
export type LegalStandardType =
  | 'constitutional'
  | 'statutory'
  | 'regulatory'
  | 'common_law'
  | 'procedural'

export interface LegalStandard {
  id: string
  title: string
  citation: string
  standard_type: LegalStandardType
  jurisdiction: string | null
  text: string
  summary: string | null
  elements: LegalElement[]
  effective_date: string | null
  is_active: boolean
}

export interface LegalElement {
  element: string
  description: string
  burden: 'plaintiff' | 'defendant' | 'court'
  is_required: boolean
}

// Filter Key Terms Types
export type FilterType = 'exclude' | 'include'

export interface FilterKeyTerm {
  id: string
  case_id: string
  term: string
  filter_type: FilterType
  category: string | null
  created_by: string
  created_at: string
  is_active: boolean
}

// Retell Voice Call Types
export type CallStatus = 'registered' | 'ongoing' | 'ended' | 'error'

export interface RetellAgentMapping {
  id: string
  casebreak_agent_id: string
  retell_agent_id: string
  voice_id: string
  voice_provider: 'elevenlabs' | 'openai' | 'deepgram'
  created_at: string
  updated_at: string
}

export interface VoiceCall {
  id: string
  conversation_id: string
  case_id: string
  agent_id: string
  retell_call_id: string
  retell_agent_id: string
  call_status: CallStatus
  from_number: string | null
  to_number: string | null
  call_duration_seconds: number | null
  call_summary: string | null
  recording_url: string | null
  metadata: Record<string, unknown>
  started_at: string | null
  ended_at: string | null
  created_at: string
}

// Extended types for queries with relations
export interface CaseWithRelations extends Case {
  agents?: Agent[]
  documents?: Document[]
  conversations?: Conversation[]
  case_facts?: CaseFact[]
  claims_for_relief?: ClaimForRelief[]
  motion_analyses?: MotionAnalysis[]
  brief_drafts?: BriefDraft[]
  discovery_categories?: DiscoveryCategory[]
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      cases: {
        Row: Case
        Insert: Omit<Case, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Case, 'id' | 'created_at' | 'updated_at'>>
      }
      agents: {
        Row: Agent
        Insert: Omit<Agent, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Agent, 'id' | 'created_at' | 'updated_at'>>
      }
      documents: {
        Row: Document
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Document, 'id' | 'created_at' | 'updated_at'>>
      }
      document_chunks: {
        Row: DocumentChunk
        Insert: Omit<DocumentChunk, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<DocumentChunk, 'id' | 'created_at'>>
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<Message, 'id' | 'created_at'>>
      }
      case_facts: {
        Row: CaseFact
        Insert: Omit<CaseFact, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<CaseFact, 'id' | 'created_at' | 'updated_at'>>
      }
      claims_for_relief: {
        Row: ClaimForRelief
        Insert: Omit<ClaimForRelief, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<ClaimForRelief, 'id' | 'created_at' | 'updated_at'>>
      }
      claim_evidence: {
        Row: ClaimEvidence
        Insert: Omit<ClaimEvidence, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<ClaimEvidence, 'id' | 'created_at' | 'updated_at'>>
      }
      motion_analyses: {
        Row: MotionAnalysis
        Insert: Omit<MotionAnalysis, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<MotionAnalysis, 'id' | 'created_at' | 'updated_at'>>
      }
      brief_drafts: {
        Row: BriefDraft
        Insert: Omit<BriefDraft, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<BriefDraft, 'id' | 'created_at' | 'updated_at'>>
      }
      discovery_categories: {
        Row: DiscoveryCategory
        Insert: Omit<DiscoveryCategory, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<DiscoveryCategory, 'id' | 'created_at'>>
      }
      document_categories: {
        Row: DocumentCategory
        Insert: Omit<DocumentCategory, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<DocumentCategory, 'id' | 'created_at'>>
      }
      filter_key_terms: {
        Row: FilterKeyTerm
        Insert: Omit<FilterKeyTerm, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<FilterKeyTerm, 'id' | 'created_at'>>
      }
    }
    Functions: {
      match_document_chunks: {
        Args: {
          query_embedding: number[]
          match_case_id: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          document_id: string
          content: string
          similarity: number
        }[]
      }
    }
  }
}
// ============================================================
// Rule 26 Discovery Management Types
// ============================================================

export type JurisdictionType = 'federal' | 'utah' | 'other'
export type UtahTier = 1 | 2 | 3

export interface DiscoveryConfig {
  id: string
  case_id: string
  jurisdiction_type: JurisdictionType
  utah_tier: UtahTier | null
  utah_tier_basis: string | null
  filed_date: string | null
  rule26f_conference_date: string | null
  scheduling_order_date: string | null
  discovery_cutoff_date: string | null
  expert_disclosure_deadline: string | null
  expert_rebuttal_deadline: string | null
  pretrial_conference_date: string | null
  trial_date: string | null
  max_interrogatories: number
  max_rfas: number
  max_rfps: number
  max_fact_depositions: number
  max_fact_depo_hours: number
  max_expert_depositions: number | null
  max_expert_depo_hours: number | null
  created_at: string
  updated_at: string
}

export type DisclosureStatus = 'draft' | 'in_review' | 'served' | 'supplemented' | 'overdue'
export type DisclosureType = 'initial' | 'supplemental'

export interface InitialDisclosure {
  id: string
  case_id: string
  disclosure_type: DisclosureType
  served_date: string | null
  due_date: string | null
  served_to: string | null
  served_by: string | null
  status: DisclosureStatus
  certified_by: string | null
  certified_date: string | null
  certification_basis: string | null
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined items
  disclosure_items?: DisclosureItem[]
}

export type DisclosureItemType = 'witness' | 'document' | 'damage_computation' | 'insurance'

export interface DisclosureItem {
  id: string
  disclosure_id: string
  case_id: string
  item_type: DisclosureItemType
  // Witness
  witness_name: string | null
  witness_address: string | null
  witness_phone: string | null
  witness_email: string | null
  witness_subject: string | null
  // Document
  document_title: string | null
  document_description: string | null
  document_location: string | null
  custodian: string | null
  bates_range: string | null
  linked_document_id: string | null
  // Damage computation
  damage_category: string | null
  damage_amount: number | null
  damage_basis: string | null
  supporting_docs: string | null
  // Insurance
  insurer_name: string | null
  policy_number: string | null
  coverage_type: string | null
  coverage_amount: number | null
  policy_period: string | null
  // Common
  description: string | null
  is_supplemented: boolean
  supplemented_date: string | null
  supplemented_reason: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type ExpertType = 'retained' | 'non_retained' | 'hybrid'
export type ExpertReportStatus = 'pending' | 'draft' | 'finalized' | 'served' | 'supplemented'

export interface ExpertDisclosure {
  id: string
  case_id: string
  expert_name: string
  expert_type: ExpertType
  field_of_expertise: string | null
  report_status: ExpertReportStatus
  report_due_date: string | null
  report_served_date: string | null
  opinions_summary: string | null
  bases_and_reasons: string | null
  data_and_exhibits: string | null
  qualifications_cv: string | null
  publications_list: string | null
  compensation_rate: string | null
  compensation_terms: string | null
  prior_testimony: string | null
  subject_matter: string | null
  facts_and_opinions_summary: string | null
  deposition_scheduled: boolean
  deposition_date: string | null
  deposition_duration_hours: number | null
  deposition_transcript_id: string | null
  is_rebuttal: boolean
  rebuttal_to: string | null
  rebuttal_due_date: string | null
  last_supplemented_date: string | null
  supplement_count: number
  designated_by: string | null
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type PretrialDisclosureStatus = 'draft' | 'in_review' | 'served' | 'objections_filed'

export interface PretrialWitness {
  name: string
  type: 'live' | 'deposition'
  subject: string
  deposition_transcript_id?: string
}

export interface DepositionDesignation {
  witness_name: string
  transcript_id: string
  page_line_ranges: string[]
}

export interface PretrialExhibit {
  exhibit_no: string
  description: string
  document_id?: string
  will_offer: boolean
  may_offer: boolean
}

export interface PretrialDisclosure {
  id: string
  case_id: string
  disclosure_date: string | null
  due_date: string | null
  objections_due_date: string | null
  status: PretrialDisclosureStatus
  witnesses: PretrialWitness[]
  deposition_designations: DepositionDesignation[]
  exhibits: PretrialExhibit[]
  served_by: string | null
  served_to: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type DeadlineType =
  | 'initial_disclosure'
  | 'expert_disclosure'
  | 'expert_rebuttal'
  | 'pretrial_disclosure'
  | 'pretrial_objections'
  | 'discovery_cutoff'
  | 'deposition'
  | 'interrogatory_response'
  | 'rfa_response'
  | 'rfp_response'
  | 'supplementation'
  | 'rule26f_conference'
  | 'scheduling_conference'
  | 'protective_order'
  | 'custom'

export type DeadlineStatus = 'upcoming' | 'due_soon' | 'overdue' | 'completed' | 'waived' | 'extended'

export interface DiscoveryDeadline {
  id: string
  case_id: string
  title: string
  description: string | null
  deadline_type: DeadlineType
  due_date: string
  calculated_from: string | null
  rule_reference: string | null
  status: DeadlineStatus
  completed_date: string | null
  original_due_date: string | null
  extended_by: string | null
  extension_reason: string | null
  court_order_id: string | null
  alert_days_before: number[]
  last_alert_sent: string | null
  related_disclosure_id: string | null
  assigned_to: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type PrivilegeType =
  | 'attorney_client'
  | 'work_product'
  | 'joint_defense'
  | 'common_interest'
  | 'deliberative_process'
  | 'other'

export type PrivilegeLogStatus = 'withheld' | 'redacted' | 'produced_in_part' | 'clawback' | 'waived'

export interface PrivilegeLogEntry {
  id: string
  case_id: string
  document_title: string
  document_date: string | null
  bates_number: string | null
  linked_document_id: string | null
  privilege_type: PrivilegeType
  author: string | null
  recipients: string[]
  date_of_communication: string | null
  subject_matter: string | null
  basis_for_privilege: string | null
  is_opinion_work_product: boolean
  prepared_in_anticipation_of: string | null
  status: PrivilegeLogStatus
  clawback_date: string | null
  clawback_notification_sent: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export type WrittenDiscoveryType = 'interrogatory' | 'rfp' | 'rfa'
export type WrittenDiscoveryDirection = 'outgoing' | 'incoming'
export type WrittenDiscoveryStatus = 'draft' | 'served' | 'response_due' | 'response_received' | 'objections_pending' | 'complete' | 'overdue'

export interface WrittenDiscovery {
  id: string
  case_id: string
  discovery_type: WrittenDiscoveryType
  direction: WrittenDiscoveryDirection
  set_number: number
  title: string
  served_date: string | null
  response_due_date: string | null
  response_received_date: string | null
  request_count: number
  status: WrittenDiscoveryStatus
  request_document_id: string | null
  response_document_id: string | null
  motion_to_compel_filed: boolean
  motion_to_compel_date: string | null
  served_by: string | null
  served_to: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Rule26fConference {
  id: string
  case_id: string
  conference_date: string | null
  conference_type: 'initial' | 'follow_up' | 'modification'
  discovery_plan: Record<string, unknown>
  report_filed: boolean
  report_filed_date: string | null
  report_document_id: string | null
  attendees: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

// Utah tier limits helper
export const UTAH_TIER_LIMITS: Record<UtahTier, {
  max_interrogatories: number
  max_rfas: number
  max_rfps: number
  max_fact_depositions: number
  max_fact_depo_hours: number
  max_expert_depositions: number
  max_expert_depo_hours: number
  discovery_period_days: number
  damages_range: string
}> = {
  1: {
    max_interrogatories: 10, max_rfas: 10, max_rfps: 10,
    max_fact_depositions: 3, max_fact_depo_hours: 3,
    max_expert_depositions: 0, max_expert_depo_hours: 0,
    discovery_period_days: 120, damages_range: '$50,000 or less',
  },
  2: {
    max_interrogatories: 10, max_rfas: 10, max_rfps: 10,
    max_fact_depositions: 5, max_fact_depo_hours: 4,
    max_expert_depositions: 2, max_expert_depo_hours: 4,
    discovery_period_days: 180, damages_range: '$50,001 - $300,000',
  },
  3: {
    max_interrogatories: 10, max_rfas: 10, max_rfps: 10,
    max_fact_depositions: 10, max_fact_depo_hours: 7,
    max_expert_depositions: 2, max_expert_depo_hours: 4,
    discovery_period_days: 210, damages_range: 'Over $300,000 or injunctive relief',
  },
}

// Extended types for queries with relations
export interface CaseWithRelations extends Case {
  agents?: Agent[]
  documents?: Document[]
  conversations?: Conversation[]
  case_facts?: CaseFact[]
  discovery_config?: DiscoveryConfig
}

