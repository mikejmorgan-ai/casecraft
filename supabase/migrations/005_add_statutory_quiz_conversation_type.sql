-- Migration: Add 'statutory_quiz' conversation type
-- Purpose: Allow clients to quiz the judge on Utah statute knowledge

-- Add 'statutory_quiz' to the conversation_type enum if it exists as an enum,
-- otherwise the conversations table uses a text column and the validation
-- is handled at the application layer (Zod schema).

-- Check if conversation_type is an enum and add the value
DO $$
BEGIN
  -- Try to add the enum value (will silently fail if enum doesn't exist or value already exists)
  BEGIN
    ALTER TYPE conversation_type ADD VALUE IF NOT EXISTS 'statutory_quiz';
  EXCEPTION
    WHEN undefined_object THEN
      -- conversation_type is not an enum (likely text column), no action needed
      NULL;
  END;
END $$;

-- Add a comment documenting the new type
COMMENT ON COLUMN conversations.conversation_type IS 'Type of conversation: hearing, deposition, mediation, strategy_session, research, general, statutory_quiz';
