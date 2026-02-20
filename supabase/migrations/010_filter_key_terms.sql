-- Migration 010: Filter Key Terms
-- Allows attorneys to add/remove filter terms to exclude or include document categories
-- without requiring code changes. Supports grouping by category (e.g., "CIM", "Environmental").

-- ============================================================
-- TABLES
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

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_filter_key_terms_case_id ON filter_key_terms(case_id);
CREATE INDEX IF NOT EXISTS idx_filter_key_terms_created_by ON filter_key_terms(created_by);
CREATE INDEX IF NOT EXISTS idx_filter_key_terms_filter_type ON filter_key_terms(filter_type);
CREATE INDEX IF NOT EXISTS idx_filter_key_terms_active ON filter_key_terms(is_active) WHERE is_active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_filter_key_terms_unique_term
  ON filter_key_terms(case_id, term, filter_type) WHERE is_active = true;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE filter_key_terms ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage filter key terms for cases they own
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'filter_key_terms' AND policyname = 'Users can manage case filter key terms') THEN
    CREATE POLICY "Users can manage case filter key terms" ON filter_key_terms FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = filter_key_terms.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed default filter terms for the Tree Farm case (if it exists)
-- These serve as examples; the actual case_id will vary per environment.
DO $$
DECLARE
  tree_farm_case_id UUID;
  tree_farm_owner_id UUID;
BEGIN
  -- Find the Tree Farm case
  SELECT id, user_id INTO tree_farm_case_id, tree_farm_owner_id
  FROM cases
  WHERE name ILIKE '%tree farm%'
  LIMIT 1;

  IF tree_farm_case_id IS NOT NULL AND tree_farm_owner_id IS NOT NULL THEN
    -- Exclude filters
    INSERT INTO filter_key_terms (case_id, term, filter_type, category, created_by)
    VALUES
      (tree_farm_case_id, 'critical infrastructure material', 'exclude', 'CIM', tree_farm_owner_id),
      (tree_farm_case_id, 'classified defense supply', 'exclude', 'CIM', tree_farm_owner_id),
      (tree_farm_case_id, 'nuclear regulatory', 'exclude', 'CIM', tree_farm_owner_id)
    ON CONFLICT DO NOTHING;

    -- Include filters
    INSERT INTO filter_key_terms (case_id, term, filter_type, category, created_by)
    VALUES
      (tree_farm_case_id, 'environmental impact', 'include', 'Environmental', tree_farm_owner_id),
      (tree_farm_case_id, 'water rights', 'include', 'Environmental', tree_farm_owner_id),
      (tree_farm_case_id, 'land use permit', 'include', 'Property', tree_farm_owner_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
