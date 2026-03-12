-- Copyright (c) 2026 AI Venture Holdings LLC
-- Licensed under the Business Source License 1.1
-- You may not use this file except in compliance with the License.

-- ROW LEVEL SECURITY POLICIES
-- Enforces multi-tenant data isolation for CaseBreak.ai

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fortress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bates_documents ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS TABLE
-- Users can only see organizations they are members of
CREATE POLICY "organization_member_access" ON organizations
    FOR ALL
    USING (
        id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid()::text
        )
    );

-- CASES TABLE
-- Users can access cases from their organization OR cases shared with them
CREATE POLICY "case_organization_access" ON cases
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid()::text
        )
        OR
        id IN (
            SELECT case_id
            FROM case_shares
            WHERE shared_with_user_id = auth.uid()::text
               OR shared_with_email = auth.email()
        )
    );

-- CASE_SHARES TABLE
-- Users can only see shares for cases they have access to
CREATE POLICY "case_shares_access" ON case_shares
    FOR ALL
    USING (
        case_id IN (
            SELECT id FROM cases WHERE
            organization_id IN (
                SELECT organization_id
                FROM organization_members
                WHERE user_id = auth.uid()::text
            )
        )
    );

-- ORGANIZATION_MEMBERS TABLE
-- Users can see organization membership for organizations they belong to
CREATE POLICY "org_member_visibility" ON organization_members
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members om
            WHERE om.user_id = auth.uid()::text
        )
    );

-- USER_PROFILES TABLE
-- Users can only access their own profile
CREATE POLICY "user_profile_self_access" ON user_profiles
    FOR ALL
    USING (id = auth.uid()::text);

-- FORTRESS_REPORTS TABLE
-- Reports are scoped to organization
CREATE POLICY "fortress_report_org_access" ON fortress_reports
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid()::text
        )
    );

-- BATES_DOCUMENTS TABLE
-- Documents are scoped to organization
CREATE POLICY "bates_document_org_access" ON bates_documents
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid()::text
        )
    );

-- ADMIN BYPASS POLICY (Emergency Only)
-- Super admins can bypass RLS for system operations
-- WARNING: Grant this role with extreme caution
CREATE ROLE casebake_super_admin;
GRANT casebake_super_admin TO postgres;

-- Grant super admin bypass (logged and audited)
CREATE POLICY "super_admin_bypass" ON organizations
    FOR ALL
    TO casebake_super_admin
    USING (true);

-- Log all super admin access
CREATE OR REPLACE FUNCTION log_super_admin_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO admin_audit_log (
        user_id,
        table_name,
        action,
        record_id,
        timestamp
    ) VALUES (
        current_user,
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        NOW()
    );

    -- Also log to application logs
    RAISE LOG 'SUPER ADMIN ACCESS: % performed % on % (ID: %)',
        current_user, TG_OP, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to all sensitive tables
CREATE TRIGGER audit_organizations
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW EXECUTE FUNCTION log_super_admin_access();

CREATE TRIGGER audit_cases
    AFTER INSERT OR UPDATE OR DELETE ON cases
    FOR EACH ROW EXECUTE FUNCTION log_super_admin_access();

-- Create admin audit table
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    table_name TEXT NOT NULL,
    action TEXT NOT NULL,
    record_id TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),

    INDEX idx_admin_audit_user (user_id),
    INDEX idx_admin_audit_timestamp (timestamp)
);

-- Enable RLS on audit log (only super admins can see)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_audit_super_admin_only" ON admin_audit_log
    FOR ALL
    TO casebake_super_admin
    USING (true);