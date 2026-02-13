-- Migration 004: Role-Based Access Control (RBAC)
-- Adds user roles, organizations, and permissions

-- User roles enum
CREATE TYPE user_role AS ENUM ('attorney', 'paralegal', 'client', 'admin', 'researcher');

-- Create user profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'attorney',
  full_name VARCHAR(255),
  phone VARCHAR(50),
  bar_number VARCHAR(50), -- For attorneys
  jurisdiction VARCHAR(100),
  organization_id UUID, -- Will reference organizations table
  terms_accepted_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations for team/firm support
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  type VARCHAR(50) DEFAULT 'law_firm', -- law_firm, legal_aid, corporate, academic
  billing_email VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  subscription_status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(100),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for organization_id
ALTER TABLE user_profiles
  ADD CONSTRAINT fk_user_organization
  FOREIGN KEY (organization_id)
  REFERENCES organizations(id) ON DELETE SET NULL;

-- Organization members with roles
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, member
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Case sharing for granular permissions
CREATE TABLE IF NOT EXISTS case_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email VARCHAR(255), -- For pending invites
  permission_level VARCHAR(20) NOT NULL DEFAULT 'view',
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_permission CHECK (permission_level IN ('view', 'comment', 'edit', 'admin')),
  CONSTRAINT has_recipient CHECK (shared_with_user_id IS NOT NULL OR shared_with_email IS NOT NULL)
);

-- Add organization_id to cases for team cases
ALTER TABLE cases ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_case_shares_case ON case_shares(case_id);
CREATE INDEX IF NOT EXISTS idx_case_shares_user ON case_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_cases_org ON cases(organization_id);

-- RLS Policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view organization"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can update organization"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.org_role IN ('owner', 'admin')
    )
  );

-- RLS Policies for organization_members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view members"
  ON organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can manage members"
  ON organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.org_role IN ('owner', 'admin')
    )
  );

-- RLS Policies for case_shares
ALTER TABLE case_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case owners can manage shares"
  ON case_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cases WHERE cases.id = case_shares.case_id AND cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view shares they received"
  ON case_shares FOR SELECT
  USING (shared_with_user_id = auth.uid());

-- Update cases RLS to include shared cases
DROP POLICY IF EXISTS "Users can view own cases" ON cases;

CREATE POLICY "Users can view own and shared cases"
  ON cases FOR SELECT
  USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM case_shares
      WHERE case_shares.case_id = cases.id
      AND case_shares.shared_with_user_id = auth.uid()
      AND (case_shares.expires_at IS NULL OR case_shares.expires_at > NOW())
    )
  );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, role, terms_accepted_at)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'attorney'),
    (NEW.raw_user_meta_data->>'terms_accepted_at')::TIMESTAMPTZ
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper function to check user permission on a case
CREATE OR REPLACE FUNCTION user_has_case_permission(
  p_user_id UUID,
  p_case_id UUID,
  p_required_permission VARCHAR(20) DEFAULT 'view'
) RETURNS BOOLEAN AS $$
DECLARE
  v_is_owner BOOLEAN;
  v_share_permission VARCHAR(20);
  v_permission_hierarchy VARCHAR(20)[] := ARRAY['view', 'comment', 'edit', 'admin'];
BEGIN
  -- Check if user is owner
  SELECT EXISTS(SELECT 1 FROM cases WHERE id = p_case_id AND user_id = p_user_id)
  INTO v_is_owner;

  IF v_is_owner THEN
    RETURN TRUE;
  END IF;

  -- Check share permission
  SELECT permission_level INTO v_share_permission
  FROM case_shares
  WHERE case_id = p_case_id
    AND shared_with_user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > NOW());

  IF v_share_permission IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if share permission meets required level
  RETURN array_position(v_permission_hierarchy, v_share_permission) >=
         array_position(v_permission_hierarchy, p_required_permission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
