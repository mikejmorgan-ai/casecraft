-- Claims for Relief
-- Tracks the specific claims (causes of action) asserted in a case

-- Relief type enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'relief_type' AND n.nspname = 'public') THEN
    CREATE TYPE public.relief_type AS ENUM (
      'declaratory',
      'injunctive',
      'regulatory_taking',
      'damages',
      'restitution',
      'specific_performance',
      'attorneys_fees',
      'other'
    );
  END IF;
END $$;

-- Claims for relief table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_claims_case_id ON claims_for_relief(case_id);
CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON claims_for_relief(case_id, claim_number);

-- Row Level Security
ALTER TABLE claims_for_relief ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'claims_for_relief' AND policyname = 'Users can manage case claims') THEN
    CREATE POLICY "Users can manage case claims" ON claims_for_relief FOR ALL USING (
      EXISTS (SELECT 1 FROM cases WHERE cases.id = claims_for_relief.case_id AND cases.user_id = auth.uid())
    );
  END IF;
END $$;

-- Auto-update timestamps trigger
DROP TRIGGER IF EXISTS update_claims_for_relief_updated_at ON claims_for_relief;
CREATE TRIGGER update_claims_for_relief_updated_at
  BEFORE UPDATE ON claims_for_relief
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
