// CaseCraft Type Definitions

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

// Retell Voice Call Types
export type CallStatus = 'registered' | 'ongoing' | 'ended' | 'error'

export interface RetellAgentMapping {
  id: string
  casecraft_agent_id: string
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
