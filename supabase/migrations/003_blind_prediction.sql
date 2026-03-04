-- Migration: Add blind prediction fields to cases table
-- Enables testing adjudicated cases to validate prediction accuracy

-- Add blind test fields to cases
ALTER TABLE cases ADD COLUMN IF NOT EXISTS is_blind_test boolean DEFAULT false;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS actual_ruling text;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS actual_ruling_date date;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS actual_ruling_summary text;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS ruling_revealed boolean DEFAULT false;

-- Create predictions table to track prediction history
CREATE TABLE IF NOT EXISTS case_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Prediction details
  predicted_outcome text NOT NULL, -- 'plaintiff' | 'defendant' | 'dismissed' | 'settled'
  predicted_ruling_summary text NOT NULL,
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Reasoning
  key_factors jsonb DEFAULT '[]'::jsonb,
  reasoning text,
  citations jsonb DEFAULT '[]'::jsonb,
  
  -- Comparison (filled after reveal)
  is_correct boolean,
  accuracy_score integer, -- 0-100 based on how close prediction was
  comparison_notes text,
  missed_factors jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata
  model_used text DEFAULT 'gpt-4o',
  prediction_mode text DEFAULT 'standard', -- 'standard' | 'monte_carlo' | 'multi_agent'
  raw_response jsonb,
  
  created_at timestamptz DEFAULT now(),
  revealed_at timestamptz
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_predictions_case ON case_predictions(case_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON case_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_correct ON case_predictions(is_correct) WHERE is_correct IS NOT NULL;

-- RLS policies
ALTER TABLE case_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own predictions" ON case_predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create predictions" ON case_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions" ON case_predictions
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to calculate prediction accuracy after reveal
CREATE OR REPLACE FUNCTION calculate_prediction_accuracy(
  p_prediction_id uuid
) RETURNS integer AS $$
DECLARE
  v_prediction record;
  v_case record;
  v_accuracy integer := 0;
BEGIN
  -- Get prediction and case
  SELECT * INTO v_prediction FROM case_predictions WHERE id = p_prediction_id;
  SELECT * INTO v_case FROM cases WHERE id = v_prediction.case_id;
  
  -- Base accuracy on outcome match
  IF v_case.actual_ruling IS NOT NULL THEN
    -- Simple matching for now - can be enhanced
    IF lower(v_prediction.predicted_outcome) = lower(v_case.actual_ruling) THEN
      v_accuracy := 100;
    ELSIF v_prediction.predicted_outcome IN ('plaintiff', 'defendant') 
      AND v_case.actual_ruling IN ('plaintiff', 'defendant') THEN
      v_accuracy := 0; -- Wrong outcome
    ELSIF v_case.actual_ruling IN ('dismissed', 'moot') THEN
      v_accuracy := 30; -- Procedural dismissal is hard to predict
    ELSE
      v_accuracy := 50; -- Partial match
    END IF;
  END IF;
  
  -- Update prediction record
  UPDATE case_predictions 
  SET 
    is_correct = (v_accuracy >= 80),
    accuracy_score = v_accuracy,
    revealed_at = now()
  WHERE id = p_prediction_id;
  
  RETURN v_accuracy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
