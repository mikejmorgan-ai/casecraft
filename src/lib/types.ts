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

export type FactCategory =
  | 'undisputed' | 'disputed' | 'evidence_based'
  | 'testimony' | 'expert_opinion' | 'stipulated'

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

// Extended types for queries with relations
export interface CaseWithRelations extends Case {
  agents?: Agent[]
  documents?: Document[]
  conversations?: Conversation[]
  case_facts?: CaseFact[]
}

// Turbo simulation types
export interface TurnResult {
  turn: number
  party: 'plaintiff' | 'defendant'
  action: string
  evidence_cited: string
  judge_ruling: 'sustained' | 'overruled' | 'admitted' | 'excluded' | 'granted' | 'denied'
  impact: 'favorable' | 'unfavorable' | 'neutral'
  reasoning: string
}

export interface SimulationResponse {
  turns: TurnResult[]
  plaintiff_final_score: number
  defendant_final_score: number
  vulnerabilities: string[]
  path_to_100: string[]
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
