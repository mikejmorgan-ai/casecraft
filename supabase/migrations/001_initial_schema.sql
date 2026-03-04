-- CaseBrake.ai Database Schema

-- Enable pgcrypto for gen_random_uuid (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ENUMS (idempotent - safe to run multiple times)

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'case_type' AND n.nspname = 'public') THEN
    CREATE TYPE public.case_type AS ENUM (
      'civil', 'criminal', 'family', 'contract',
      'tort', 'property', 'constitutional', 'administrative'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'case_status' AND n.nspname = 'public') THEN
    CREATE TYPE public.case_status AS ENUM (
      'draft', 'active', 'closed', 'archived'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'agent_role' AND n.nspname = 'public') THEN
    CREATE TYPE public.agent_role AS ENUM (
      'judge', 'plaintiff_attorney', 'defense_attorney',
      'court_clerk', 'witness', 'expert_witness', 'mediator'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'document_type' AND n.nspname = 'public') THEN
    CREATE TYPE public.document_type AS ENUM (
      'complaint', 'answer', 'motion', 'brief', 'discovery',
      'deposition', 'exhibit', 'order', 'judgment', 'other'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'conversation_type' AND n.nspname = 'public') THEN
    CREATE TYPE public.conversation_type AS ENUM (
      'hearing', 'deposition', 'mediation',
      'strategy_session', 'research', 'general'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'fact_category' AND n.nspname = 'public') THEN
    CREATE TYPE public.fact_category AS ENUM (
      'undisputed', 'disputed', 'evidence_based',
      'testimony', 'expert_opinion', 'stipulated'
    );
  END IF;
END $$;

-- TABLES

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  case_number VARCHAR(50),
  case_type case_type NOT NULL DEFAULT 'civil',
  jurisdiction VARCHAR(100),
  status case_status NOT NULL DEFAULT 'draft',
  summary TEXT,
  plaintiff_name VARCHAR(255),
  defendant_name VARCHAR(255),
  filed_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  role agent_role NOT NULL,
  name VARCHAR(100) NOT NULL,
  persona_prompt TEXT NOT NULL,
  temperature DECIMAL(2,1) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  is_active BOOLEAN DEFAULT true,
  avatar_url VARCHAR(500),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  doc_type document_type NOT NULL DEFAULT 'other',
  file_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  content_text TEXT,
  is_embedded BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document chunks for RAG
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  token_count INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  conversation_type conversation_type NOT NULL DEFAULT 'general',
  participants UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case facts table
CREATE TABLE IF NOT EXISTS case_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  category fact_category NOT NULL DEFAULT 'undisputed',
  fact_text TEXT NOT NULL,
  source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  is_disputed BOOLEAN DEFAULT false,
  supporting_evidence JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_agents_case_id ON agents(case_id);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_conversations_case_id ON conversations(case_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_case_facts_case_id ON case_facts(case_id);

-- ROW LEVEL SECURITY
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_facts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cases
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Users can view own cases') THEN
    CREATE POLICY "Users can view own cases" ON cases FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Users can insert own cases') THEN
    CREATE POLICY "Users can insert own cases" ON cases FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Users can update own cases') THEN
    CREATE POLICY "Users can update own cases" ON cases FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Users can delete own cases') THEN
    CREATE POLICY "Users can delete own cases" ON cases FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for agents
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agents' AND policyname = 'Users can manage case agents') THEN
    CREATE POLICY "Users can manage case agents" ON agents FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = agents.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

-- RLS Policies for documents
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can manage case documents') THEN
    CREATE POLICY "Users can manage case documents" ON documents FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = documents.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

-- RLS Policies for document_chunks
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_chunks' AND policyname = 'Users can view document chunks') THEN
    CREATE POLICY "Users can view document chunks" ON document_chunks FOR ALL USING (
      EXISTS (
        SELECT 1 FROM documents d
        JOIN cases c ON c.id = d.case_id
        WHERE d.id = document_chunks.document_id AND c.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- RLS Policies for conversations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can manage case conversations') THEN
    CREATE POLICY "Users can manage case conversations" ON conversations FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = conversations.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

-- RLS Policies for messages
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can manage conversation messages') THEN
    CREATE POLICY "Users can manage conversation messages" ON messages FOR ALL USING (
      EXISTS (
        SELECT 1 FROM conversations conv
        JOIN cases c ON c.id = conv.case_id
        WHERE conv.id = messages.conversation_id AND c.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- RLS Policies for case_facts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'case_facts' AND policyname = 'Users can manage case facts') THEN
    CREATE POLICY "Users can manage case facts" ON case_facts FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = case_facts.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

-- FUNCTIONS

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_case_id UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE d.case_id = match_case_id
    AND dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Auto-update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers (idempotent)
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_case_facts_updated_at ON case_facts;
CREATE TRIGGER update_case_facts_updated_at
  BEFORE UPDATE ON case_facts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
