/**
 * Copyright (c) 2026 CaseBrake.ai Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

-- ===============================================================
-- ORGANIZATION PARTITIONING SCHEMA
-- Ensures data isolation between different law firms/organizations
-- ===============================================================

-- Organizations table
CREATE TABLE organizations (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan_type VARCHAR(50) DEFAULT 'starter',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table with organization foreign key
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  organization_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'User',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_user_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE
);

-- Cases table with organization partitioning
CREATE TABLE cases (
  id SERIAL PRIMARY KEY,
  case_id VARCHAR(255) UNIQUE NOT NULL,
  organization_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  case_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  plaintiff VARCHAR(255),
  defendant VARCHAR(255),
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_case_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_case_created_by
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE RESTRICT
);

-- Documents table with organization partitioning
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  organization_id VARCHAR(255) NOT NULL,
  case_id VARCHAR(255),
  bates_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000),
  file_type VARCHAR(50),
  content_hash VARCHAR(64),
  ocr_confidence DECIMAL(5,2),
  source_origin VARCHAR(20) CHECK (source_origin IN ('Repo', 'Drive', 'Transfer')),
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_document_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_document_case
    FOREIGN KEY (case_id)
    REFERENCES cases(case_id)
    ON DELETE SET NULL,

  CONSTRAINT fk_document_uploaded_by
    FOREIGN KEY (uploaded_by)
    REFERENCES users(id)
    ON DELETE RESTRICT
);

-- Adversarial simulations table with organization partitioning
CREATE TABLE adversarial_simulations (
  id SERIAL PRIMARY KEY,
  simulation_id VARCHAR(255) UNIQUE NOT NULL,
  organization_id VARCHAR(255) NOT NULL,
  case_id VARCHAR(255) NOT NULL,
  simulation_type VARCHAR(100) NOT NULL,
  overall_strength VARCHAR(50),
  risk_level VARCHAR(50),
  results JSONB NOT NULL,
  confidence_scores JSONB,
  agents_deployed TEXT[],
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_simulation_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_simulation_case
    FOREIGN KEY (case_id)
    REFERENCES cases(case_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_simulation_created_by
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE RESTRICT
);

-- Predictions table with organization partitioning
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  organization_id VARCHAR(255) NOT NULL,
  case_id VARCHAR(255),
  predicted_outcome VARCHAR(255) NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,
  is_correct BOOLEAN,
  accuracy_score DECIMAL(5,2),
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_prediction_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_prediction_case
    FOREIGN KEY (case_id)
    REFERENCES cases(case_id)
    ON DELETE SET NULL,

  CONSTRAINT fk_prediction_created_by
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE RESTRICT
);

-- Audit log for security and compliance
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  organization_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_audit_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_audit_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT
);

-- ===============================================================
-- INDEXES FOR ORGANIZATION PARTITIONING
-- Critical for performance with multi-tenant queries
-- ===============================================================

-- Organization-based indexes for fast queries
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_cases_organization_id ON cases(organization_id);
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_adversarial_simulations_organization_id ON adversarial_simulations(organization_id);
CREATE INDEX idx_predictions_organization_id ON predictions(organization_id);
CREATE INDEX idx_audit_log_organization_id ON audit_log(organization_id);

-- Composite indexes for common queries
CREATE INDEX idx_cases_org_status ON cases(organization_id, status);
CREATE INDEX idx_documents_org_case ON documents(organization_id, case_id);
CREATE INDEX idx_simulations_org_case ON adversarial_simulations(organization_id, case_id);
CREATE INDEX idx_predictions_org_created ON predictions(organization_id, created_at);

-- User role and permission indexes
CREATE INDEX idx_users_org_role ON users(organization_id, role);
CREATE INDEX idx_audit_log_org_user ON audit_log(organization_id, user_id);

-- ===============================================================
-- ROW LEVEL SECURITY POLICIES
-- Enforce organization isolation at the database level
-- ===============================================================

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE adversarial_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (requires setting organization_id in session)
-- These policies ensure users can only access data from their organization

CREATE POLICY users_organization_isolation ON users
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true));

CREATE POLICY cases_organization_isolation ON cases
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true));

CREATE POLICY documents_organization_isolation ON documents
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true));

CREATE POLICY simulations_organization_isolation ON adversarial_simulations
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true));

CREATE POLICY predictions_organization_isolation ON predictions
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true));

CREATE POLICY audit_organization_isolation ON audit_log
  FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true));

-- ===============================================================
-- EXAMPLE DATA FOR TREE FARM CASE
-- ===============================================================

-- Sample organization
INSERT INTO organizations (id, name, slug) VALUES
  ('org_tree_farm', 'Tree Farm LLC Legal Team', 'tree-farm-legal');

-- Sample users with different roles
INSERT INTO users (id, email, organization_id, role) VALUES
  ('user_attorney_1', 'attorney@treefarm.legal', 'org_tree_farm', 'Attorney'),
  ('user_admin_1', 'admin@treefarm.legal', 'org_tree_farm', 'Admin'),
  ('user_paralegal_1', 'paralegal@treefarm.legal', 'org_tree_farm', 'Paralegal'),
  ('user_client_1', 'client@treefarm.legal', 'org_tree_farm', 'Client');

-- Sample case
INSERT INTO cases (case_id, organization_id, name, case_type, plaintiff, defendant, created_by) VALUES
  ('tree-farm', 'org_tree_farm', 'Tree Farm LLC v. Salt Lake County', 'Land Use Dispute', 'Tree Farm LLC', 'Salt Lake County', 'user_attorney_1');

-- ===============================================================
-- HELPER FUNCTIONS FOR APPLICATION USE
-- ===============================================================

-- Function to set organization context for session
CREATE OR REPLACE FUNCTION set_organization_context(org_id VARCHAR(255))
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_organization_id', org_id, true);
END;
$$ LANGUAGE plpgsql;

-- Function to get organization context
CREATE OR REPLACE FUNCTION get_organization_context()
RETURNS VARCHAR(255) AS $$
BEGIN
  RETURN current_setting('app.current_organization_id', true);
END;
$$ LANGUAGE plpgsql;

-- ===============================================================
-- USAGE EXAMPLE IN APPLICATION
-- ===============================================================

/*
-- In your application, before each database operation:

1. Extract organization_id from JWT/session
2. Set organization context:
   SELECT set_organization_context('org_tree_farm');

3. All subsequent queries automatically respect organization isolation:
   SELECT * FROM cases WHERE status = 'active';
   -- Only returns cases for org_tree_farm due to RLS policy

4. For API routes, use the organization context from middleware:
   const { organizationId } = await getOrganizationContext()
   await db.query('SELECT set_organization_context($1)', [organizationId])

This ensures complete data isolation between organizations at the database level.
*/