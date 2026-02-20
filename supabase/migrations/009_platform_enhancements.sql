-- Migration 009: Platform Enhancements
-- Adds motion analyses, brief drafts, discovery categories, and document categories

-- ============================================================
-- TABLES
-- ============================================================

-- Motion analyses table
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

-- Brief drafts table
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

-- Discovery organization results
CREATE TABLE IF NOT EXISTS discovery_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  document_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document category assignments
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

-- ============================================================
-- INDEXES
-- ============================================================

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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE motion_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for motion_analyses (user sees own data via case ownership)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'motion_analyses' AND policyname = 'Users can manage case motion analyses') THEN
    CREATE POLICY "Users can manage case motion analyses" ON motion_analyses FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = motion_analyses.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

-- RLS Policies for brief_drafts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'brief_drafts' AND policyname = 'Users can manage case brief drafts') THEN
    CREATE POLICY "Users can manage case brief drafts" ON brief_drafts FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = brief_drafts.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

-- RLS Policies for discovery_categories
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discovery_categories' AND policyname = 'Users can manage case discovery categories') THEN
    CREATE POLICY "Users can manage case discovery categories" ON discovery_categories FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = discovery_categories.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

-- RLS Policies for document_categories
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

-- ============================================================
-- TRIGGERS (updated_at auto-update)
-- ============================================================

DROP TRIGGER IF EXISTS update_motion_analyses_updated_at ON motion_analyses;
CREATE TRIGGER update_motion_analyses_updated_at
  BEFORE UPDATE ON motion_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_brief_drafts_updated_at ON brief_drafts;
CREATE TRIGGER update_brief_drafts_updated_at
  BEFORE UPDATE ON brief_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
