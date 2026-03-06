-- ============================================================
-- Combined Migrations 006-010 for CaseBreak.ai
-- Paste this entire file into Supabase SQL Editor and click "Run"
-- ============================================================

-- ============================================================
-- 006: Retell AI Voice Calls
-- ============================================================

DO $$
BEGIN
  BEGIN
    ALTER TYPE conversation_type ADD VALUE IF NOT EXISTS 'voice_call';
  EXCEPTION
    WHEN undefined_object THEN
      NULL;
  END;
END $$;

CREATE TABLE IF NOT EXISTS retell_agent_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  casebreak_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  retell_agent_id VARCHAR(100) NOT NULL,
  voice_id VARCHAR(100) NOT NULL,
  voice_provider VARCHAR(20) NOT NULL DEFAULT 'elevenlabs'
    CHECK (voice_provider IN ('elevenlabs', 'openai', 'deepgram')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(casebreak_agent_id)
);

CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE SET NULL,
  retell_call_id VARCHAR(100) UNIQUE NOT NULL,
  retell_agent_id VARCHAR(100) NOT NULL,
  call_status VARCHAR(20) NOT NULL DEFAULT 'registered'
    CHECK (call_status IN ('registered', 'ongoing', 'ended', 'error')),
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  call_duration_seconds INTEGER,
  call_summary TEXT,
  recording_url VARCHAR(500),
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_calls_conversation_id ON voice_calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_case_id ON voice_calls(case_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_retell_call_id ON voice_calls(retell_call_id);
CREATE INDEX IF NOT EXISTS idx_retell_agent_mappings_agent_id ON retell_agent_mappings(casebreak_agent_id);

ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE retell_agent_mappings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voice_calls'
    AND policyname = 'Users can manage case voice calls') THEN
    CREATE POLICY "Users can manage case voice calls" ON voice_calls FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = voice_calls.case_id
        AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'retell_agent_mappings'
    AND policyname = 'Users can view agent mappings') THEN
    CREATE POLICY "Users can view agent mappings" ON retell_agent_mappings FOR ALL USING (
      EXISTS (
        SELECT 1 FROM agents a
        JOIN cases c ON c.id = a.case_id
        WHERE a.id = retell_agent_mappings.casebreak_agent_id
          AND c.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_retell_agent_mappings_updated_at ON retell_agent_mappings;
CREATE TRIGGER update_retell_agent_mappings_updated_at
  BEFORE UPDATE ON retell_agent_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voice_calls'
    AND policyname = 'Service role can manage all voice calls') THEN
    CREATE POLICY "Service role can manage all voice calls" ON voice_calls
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'retell_agent_mappings'
    AND policyname = 'Service role can manage all agent mappings') THEN
    CREATE POLICY "Service role can manage all agent mappings" ON retell_agent_mappings
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- 007: Claims for Relief
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'relief_type' AND n.nspname = 'public') THEN
    CREATE TYPE public.relief_type AS ENUM (
      'declaratory', 'injunctive', 'regulatory_taking', 'damages',
      'restitution', 'specific_performance', 'attorneys_fees', 'other'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS claims_for_relief (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  claim_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  relief_type relief_type NOT NULL DEFAULT 'other',
  description TEXT NOT NULL,
  legal_basis TEXT,
  is_alternative BOOLEAN DEFAULT false,
  alternative_to INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_case_id ON claims_for_relief(case_id);
CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON claims_for_relief(case_id, claim_number);

ALTER TABLE claims_for_relief ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'claims_for_relief' AND policyname = 'Users can manage case claims') THEN
    CREATE POLICY "Users can manage case claims" ON claims_for_relief FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = claims_for_relief.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_claims_for_relief_updated_at ON claims_for_relief;
CREATE TRIGGER update_claims_for_relief_updated_at
  BEFORE UPDATE ON claims_for_relief
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 008: Claim Evidence
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'evidence_relevance' AND n.nspname = 'public') THEN
    CREATE TYPE public.evidence_relevance AS ENUM (
      'direct', 'corroborative', 'circumstantial', 'impeachment'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS claim_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims_for_relief(id) ON DELETE CASCADE,
  fact_id UUID REFERENCES case_facts(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  relevance evidence_relevance NOT NULL DEFAULT 'corroborative',
  discovery_file VARCHAR(50),
  tier INTEGER,
  description TEXT,
  is_smoking_gun BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT claim_evidence_has_source CHECK (fact_id IS NOT NULL OR document_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim ON claim_evidence(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_fact ON claim_evidence(fact_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_document ON claim_evidence(document_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_discovery_file ON claim_evidence(discovery_file);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_smoking_gun ON claim_evidence(is_smoking_gun) WHERE is_smoking_gun = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_claim_evidence_unique_fact
  ON claim_evidence(claim_id, fact_id) WHERE fact_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_claim_evidence_unique_doc
  ON claim_evidence(claim_id, document_id) WHERE document_id IS NOT NULL AND fact_id IS NULL;

ALTER TABLE claim_evidence ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'claim_evidence' AND policyname = 'Users can manage claim evidence') THEN
    CREATE POLICY "Users can manage claim evidence" ON claim_evidence FOR ALL USING (
      EXISTS (
        SELECT 1 FROM claims_for_relief cr
        JOIN cases c ON c.id = cr.case_id
        WHERE cr.id = claim_evidence.claim_id AND c.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_claim_evidence_updated_at ON claim_evidence;
CREATE TRIGGER update_claim_evidence_updated_at
  BEFORE UPDATE ON claim_evidence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 009: Platform Enhancements
-- ============================================================

CREATE TABLE IF NOT EXISTS motion_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  motion_text TEXT NOT NULL,
  analysis_result TEXT,
  source_document_id UUID REFERENCES documents(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brief_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  brief_type TEXT NOT NULL CHECK (brief_type IN ('response', 'motion', 'memorandum', 'opposition', 'reply')),
  title TEXT NOT NULL,
  topic TEXT,
  instructions TEXT,
  tone TEXT DEFAULT 'formal' CHECK (tone IN ('formal', 'aggressive', 'measured')),
  content TEXT,
  claim_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discovery_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  document_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES discovery_categories(id) ON DELETE CASCADE,
  relevance_score FLOAT,
  ai_summary TEXT,
  is_reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_motion_analyses_case_id ON motion_analyses(case_id);
CREATE INDEX IF NOT EXISTS idx_motion_analyses_user_id ON motion_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_motion_analyses_source_doc ON motion_analyses(source_document_id);
CREATE INDEX IF NOT EXISTS idx_brief_drafts_case_id ON brief_drafts(case_id);
CREATE INDEX IF NOT EXISTS idx_brief_drafts_user_id ON brief_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_brief_drafts_type ON brief_drafts(brief_type);
CREATE INDEX IF NOT EXISTS idx_discovery_categories_case_id ON discovery_categories(case_id);
CREATE INDEX IF NOT EXISTS idx_document_categories_document_id ON document_categories(document_id);
CREATE INDEX IF NOT EXISTS idx_document_categories_category_id ON document_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_document_categories_reviewed ON document_categories(is_reviewed) WHERE is_reviewed = false;

ALTER TABLE motion_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'motion_analyses' AND policyname = 'Users can manage case motion analyses') THEN
    CREATE POLICY "Users can manage case motion analyses" ON motion_analyses FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = motion_analyses.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'brief_drafts' AND policyname = 'Users can manage case brief drafts') THEN
    CREATE POLICY "Users can manage case brief drafts" ON brief_drafts FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = brief_drafts.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discovery_categories' AND policyname = 'Users can manage case discovery categories') THEN
    CREATE POLICY "Users can manage case discovery categories" ON discovery_categories FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = discovery_categories.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_categories' AND policyname = 'Users can manage document categories') THEN
    CREATE POLICY "Users can manage document categories" ON document_categories FOR ALL USING (
      EXISTS (
        SELECT 1 FROM documents d
        JOIN cases c ON c.id = d.case_id
        WHERE d.id = document_categories.document_id AND c.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_motion_analyses_updated_at ON motion_analyses;
CREATE TRIGGER update_motion_analyses_updated_at
  BEFORE UPDATE ON motion_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_brief_drafts_updated_at ON brief_drafts;
CREATE TRIGGER update_brief_drafts_updated_at
  BEFORE UPDATE ON brief_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 010: Filter Key Terms
-- ============================================================

CREATE TABLE IF NOT EXISTS filter_key_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  filter_type TEXT NOT NULL CHECK (filter_type IN ('exclude', 'include')),
  category TEXT,
  created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_filter_key_terms_case_id ON filter_key_terms(case_id);
CREATE INDEX IF NOT EXISTS idx_filter_key_terms_created_by ON filter_key_terms(created_by);
CREATE INDEX IF NOT EXISTS idx_filter_key_terms_filter_type ON filter_key_terms(filter_type);
CREATE INDEX IF NOT EXISTS idx_filter_key_terms_active ON filter_key_terms(is_active) WHERE is_active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_filter_key_terms_unique_term
  ON filter_key_terms(case_id, term, filter_type) WHERE is_active = true;

ALTER TABLE filter_key_terms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'filter_key_terms' AND policyname = 'Users can manage case filter key terms') THEN
    CREATE POLICY "Users can manage case filter key terms" ON filter_key_terms FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = filter_key_terms.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

-- ============================================================
-- DONE! All 9 new tables created.
-- ============================================================
