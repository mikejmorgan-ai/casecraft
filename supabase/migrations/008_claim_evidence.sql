-- Claim Evidence Junction Table
-- Maps evidence (case_facts and documents) to specific claims/causes of action
-- Each piece of evidence can support multiple claims, and each claim can have multiple evidence items

-- Relevance strength enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'evidence_relevance' AND n.nspname = 'public') THEN
    CREATE TYPE public.evidence_relevance AS ENUM (
      'direct',        -- Directly proves an element of the claim
      'corroborative', -- Supports/strengthens other direct evidence
      'circumstantial', -- Suggests but doesn't directly prove
      'impeachment'    -- Undermines opposing position on this claim
    );
  END IF;
END $$;

-- Junction table: claims <-> case_facts
CREATE TABLE IF NOT EXISTS claim_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims_for_relief(id) ON DELETE CASCADE,
  fact_id UUID REFERENCES case_facts(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  relevance evidence_relevance NOT NULL DEFAULT 'corroborative',
  discovery_file VARCHAR(50),           -- e.g. "SLCo017826" for quick reference
  tier INTEGER,                         -- smoking gun tier (1-12) from inventory
  description TEXT,                     -- How this evidence supports this specific claim
  is_smoking_gun BOOLEAN DEFAULT false, -- Flagged as particularly damaging
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- At least one of fact_id or document_id must be set
  CONSTRAINT claim_evidence_has_source CHECK (fact_id IS NOT NULL OR document_id IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim ON claim_evidence(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_fact ON claim_evidence(fact_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_document ON claim_evidence(document_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_discovery_file ON claim_evidence(discovery_file);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_smoking_gun ON claim_evidence(is_smoking_gun) WHERE is_smoking_gun = true;

-- Prevent duplicate mappings
CREATE UNIQUE INDEX IF NOT EXISTS idx_claim_evidence_unique_fact
  ON claim_evidence(claim_id, fact_id) WHERE fact_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_claim_evidence_unique_doc
  ON claim_evidence(claim_id, document_id) WHERE document_id IS NOT NULL AND fact_id IS NULL;

-- Row Level Security
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

-- Auto-update timestamps trigger
DROP TRIGGER IF EXISTS update_claim_evidence_updated_at ON claim_evidence;
CREATE TRIGGER update_claim_evidence_updated_at
  BEFORE UPDATE ON claim_evidence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
