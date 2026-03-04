-- Migration: Add Retell AI voice call support
-- Purpose: Store voice call data and Retell agent mappings

-- Add 'voice_call' to the conversation_type enum
DO $$
BEGIN
  BEGIN
    ALTER TYPE conversation_type ADD VALUE IF NOT EXISTS 'voice_call';
  EXCEPTION
    WHEN undefined_object THEN
      NULL;
  END;
END $$;

-- Retell agent mappings (cache CaseBrake.ai agent -> Retell agent)
CREATE TABLE IF NOT EXISTS retell_agent_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  casebrake_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  retell_agent_id VARCHAR(100) NOT NULL,
  voice_id VARCHAR(100) NOT NULL,
  voice_provider VARCHAR(20) NOT NULL DEFAULT 'elevenlabs'
    CHECK (voice_provider IN ('elevenlabs', 'openai', 'deepgram')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(casebrake_agent_id)
);

-- Voice calls table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_voice_calls_conversation_id ON voice_calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_case_id ON voice_calls(case_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_retell_call_id ON voice_calls(retell_call_id);
CREATE INDEX IF NOT EXISTS idx_retell_agent_mappings_agent_id ON retell_agent_mappings(casebrake_agent_id);

-- RLS
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
        WHERE a.id = retell_agent_mappings.casebrake_agent_id
          AND c.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Timestamp trigger for retell_agent_mappings
DROP TRIGGER IF EXISTS update_retell_agent_mappings_updated_at ON retell_agent_mappings;
CREATE TRIGGER update_retell_agent_mappings_updated_at
  BEFORE UPDATE ON retell_agent_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Service role policy for webhook access (webhooks use service role key)
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

COMMENT ON TABLE voice_calls IS 'Tracks Retell AI voice calls linked to case conversations';
COMMENT ON TABLE retell_agent_mappings IS 'Maps CaseBrake.ai agents to Retell voice agents';
