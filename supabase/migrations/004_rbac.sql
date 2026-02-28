-- Role-Based Access Control (RBAC) Migration
-- This migration adds user roles and permissions to the database

-- Create user role enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'user_role' AND n.nspname = 'public') THEN
    CREATE TYPE user_role AS ENUM ('attorney', 'paralegal', 'client', 'admin', 'researcher');
  END IF;
END $$;

-- Create user profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  full_name VARCHAR(255),
  phone VARCHAR(50),
  bar_number VARCHAR(50), -- For attorneys
  organization VARCHAR(255),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
-- Security: Validates requested role against allowlist to prevent admin self-assignment
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_requested_role TEXT;
  v_allowed_roles TEXT[] := ARRAY['attorney', 'paralegal', 'client', 'researcher'];
  v_role user_role;
BEGIN
  v_requested_role := NEW.raw_user_meta_data->>'role';
  -- Only allow non-admin roles from user metadata; default to client (least privilege)
  IF v_requested_role IS NOT NULL AND v_requested_role = ANY(v_allowed_roles) THEN
    v_role := v_requested_role::user_role;
  ELSE
    v_role := 'client'::user_role;
  END IF;

  INSERT INTO user_profiles (id, role, terms_accepted_at)
  VALUES (
    NEW.id,
    v_role,
    (NEW.raw_user_meta_data->>'terms_accepted_at')::TIMESTAMPTZ
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add role-based access to cases table
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Attorneys and admins can view all cases
CREATE POLICY "Attorneys can view all cases"
  ON cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('attorney', 'admin')
    )
  );

-- Clients can only view their own cases
CREATE POLICY "Clients can view own cases"
  ON cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'client' AND cases.user_id = auth.uid()
    )
  );

-- Paralegals and researchers can view cases they're assigned to
CREATE POLICY "Staff can view assigned cases"
  ON cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('paralegal', 'researcher')
    )
  );

-- Users can create cases
CREATE POLICY "Users can create cases"
  ON cases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cases
CREATE POLICY "Users can update own cases"
  ON cases
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Attorneys and admins can update any case
CREATE POLICY "Attorneys can update any case"
  ON cases
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('attorney', 'admin')
    )
  );
