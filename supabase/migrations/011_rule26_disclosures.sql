-- Migration: Rule 26 Discovery Management Module
-- Supports both Federal Rule 26 and Utah Rule 26 (tier-based discovery)
-- Tracks disclosures, deadlines, experts, privilege logs, and compliance

-- ============================================================
-- 1. Discovery configuration per case (jurisdiction + tier)
-- ============================================================
CREATE TABLE IF NOT EXISTS discovery_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Jurisdiction determines which rule set applies
  jurisdiction_type text NOT NULL DEFAULT 'federal'
    CHECK (jurisdiction_type IN ('federal', 'utah', 'other')),

  -- Utah tier system: determines discovery limits
  utah_tier integer CHECK (utah_tier IN (1, 2, 3)),
  utah_tier_basis text, -- e.g. 'damages_under_50k', 'damages_50k_300k', 'damages_over_300k_or_injunctive'

  -- Key dates that drive all deadline calculations
  filed_date date,
  rule26f_conference_date date,
  scheduling_order_date date,
  discovery_cutoff_date date,
  expert_disclosure_deadline date,
  expert_rebuttal_deadline date,
  pretrial_conference_date date,
  trial_date date,

  -- Discovery limits (auto-populated from tier, overridable by court order)
  max_interrogatories integer DEFAULT 25,
  max_rfas integer DEFAULT 25,
  max_rfps integer DEFAULT 25,
  max_fact_depositions integer DEFAULT 10,
  max_fact_depo_hours integer DEFAULT 7,
  max_expert_depositions integer,
  max_expert_depo_hours integer DEFAULT 4,

  -- Tracking
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discovery_configs_case ON discovery_configs(case_id);

-- ============================================================
-- 2. Rule 26(a)(1) — Initial Disclosures
-- ============================================================
CREATE TABLE IF NOT EXISTS initial_disclosures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,

  -- Disclosure metadata
  disclosure_type text NOT NULL DEFAULT 'initial'
    CHECK (disclosure_type IN ('initial', 'supplemental')),
  served_date date,
  due_date date,
  served_to text, -- party served
  served_by text, -- attorney serving

  -- Status tracking
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'served', 'supplemented', 'overdue')),

  -- Certification (Rule 26(g))
  certified_by text,
  certified_date date,
  certification_basis text, -- 'reasonable_inquiry' per Rule 26(g)(1)

  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_initial_disclosures_case ON initial_disclosures(case_id);
CREATE INDEX IF NOT EXISTS idx_initial_disclosures_status ON initial_disclosures(status);

-- ============================================================
-- 3. Disclosure items (witnesses, documents, damages, insurance)
-- ============================================================
CREATE TABLE IF NOT EXISTS disclosure_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disclosure_id uuid REFERENCES initial_disclosures(id) ON DELETE CASCADE NOT NULL,
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,

  -- Item type per Rule 26(a)(1)(A)-(D)
  item_type text NOT NULL
    CHECK (item_type IN (
      'witness',           -- 26(a)(1)(A): individuals likely to have discoverable info
      'document',          -- 26(a)(1)(A)(ii): documents, ESI, tangible things
      'damage_computation',-- 26(a)(1)(A)(iii): computation of damages
      'insurance'          -- 26(a)(1)(A)(iv): insurance agreements
    )),

  -- Witness fields (when item_type = 'witness')
  witness_name text,
  witness_address text,
  witness_phone text,
  witness_email text,
  witness_subject text, -- subjects of discoverable information

  -- Document fields (when item_type = 'document')
  document_title text,
  document_description text,
  document_location text,
  custodian text,
  bates_range text,
  linked_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,

  -- Damage computation fields
  damage_category text,
  damage_amount numeric,
  damage_basis text, -- computation methodology
  supporting_docs text,

  -- Insurance fields
  insurer_name text,
  policy_number text,
  coverage_type text,
  coverage_amount numeric,
  policy_period text,

  -- Common fields
  description text,
  is_supplemented boolean DEFAULT false,
  supplemented_date date,
  supplemented_reason text,

  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_disclosure_items_disclosure ON disclosure_items(disclosure_id);
CREATE INDEX IF NOT EXISTS idx_disclosure_items_case ON disclosure_items(case_id);
CREATE INDEX IF NOT EXISTS idx_disclosure_items_type ON disclosure_items(item_type);

-- ============================================================
-- 4. Rule 26(a)(2) — Expert Disclosures
-- ============================================================
CREATE TABLE IF NOT EXISTS expert_disclosures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,

  -- Expert identity
  expert_name text NOT NULL,
  expert_type text NOT NULL DEFAULT 'retained'
    CHECK (expert_type IN ('retained', 'non_retained', 'hybrid')),
  field_of_expertise text,

  -- Report status
  report_status text NOT NULL DEFAULT 'pending'
    CHECK (report_status IN ('pending', 'draft', 'finalized', 'served', 'supplemented')),
  report_due_date date,
  report_served_date date,

  -- Rule 26(a)(2)(B) report content (for retained experts)
  opinions_summary text,
  bases_and_reasons text,
  data_and_exhibits text, -- JSON list of materials considered
  qualifications_cv text,
  publications_list text, -- publications in preceding 10 years
  compensation_rate text,
  compensation_terms text,
  prior_testimony text, -- cases testified in preceding 4 years

  -- Non-retained expert (Rule 26(a)(2)(C))
  subject_matter text,
  facts_and_opinions_summary text,

  -- Deposition tracking
  deposition_scheduled boolean DEFAULT false,
  deposition_date date,
  deposition_duration_hours numeric,
  deposition_transcript_id uuid REFERENCES documents(id) ON DELETE SET NULL,

  -- Rebuttal
  is_rebuttal boolean DEFAULT false,
  rebuttal_to uuid REFERENCES expert_disclosures(id) ON DELETE SET NULL,
  rebuttal_due_date date,

  -- Supplementation tracking (Rule 26(e))
  last_supplemented_date date,
  supplement_count integer DEFAULT 0,

  designated_by text, -- 'plaintiff' or 'defendant'
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expert_disclosures_case ON expert_disclosures(case_id);
CREATE INDEX IF NOT EXISTS idx_expert_disclosures_status ON expert_disclosures(report_status);

-- ============================================================
-- 5. Rule 26(a)(3) — Pretrial Disclosures
-- ============================================================
CREATE TABLE IF NOT EXISTS pretrial_disclosures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,

  disclosure_date date,
  due_date date,
  objections_due_date date, -- 14 days after disclosure per Rule 26(a)(3)(B)

  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'served', 'objections_filed')),

  -- Witness list (Rule 26(a)(3)(A)(i))
  witnesses jsonb DEFAULT '[]'::jsonb,
  -- Format: [{ name, type: 'live'|'deposition', subject, deposition_transcript_id? }]

  -- Deposition designations (Rule 26(a)(3)(A)(ii))
  deposition_designations jsonb DEFAULT '[]'::jsonb,
  -- Format: [{ witness_name, transcript_id, page_line_ranges: ["p.10:1-15:25"] }]

  -- Exhibit list (Rule 26(a)(3)(A)(iii))
  exhibits jsonb DEFAULT '[]'::jsonb,
  -- Format: [{ exhibit_no, description, document_id?, will_offer: true, may_offer: false }]

  served_by text,
  served_to text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pretrial_disclosures_case ON pretrial_disclosures(case_id);

-- ============================================================
-- 6. Discovery deadlines engine
-- ============================================================
CREATE TABLE IF NOT EXISTS discovery_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,

  -- Deadline info
  title text NOT NULL,
  description text,
  deadline_type text NOT NULL
    CHECK (deadline_type IN (
      'initial_disclosure',
      'expert_disclosure',
      'expert_rebuttal',
      'pretrial_disclosure',
      'pretrial_objections',
      'discovery_cutoff',
      'deposition',
      'interrogatory_response',
      'rfa_response',
      'rfp_response',
      'supplementation',
      'rule26f_conference',
      'scheduling_conference',
      'protective_order',
      'custom'
    )),

  due_date date NOT NULL,

  -- Calculation basis
  calculated_from text, -- e.g. 'rule26f_conference_date + 14 days'
  rule_reference text, -- e.g. 'FRCP 26(a)(1)(C)' or 'URCP 26(a)(1)'

  -- Status
  status text NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'due_soon', 'overdue', 'completed', 'waived', 'extended')),
  completed_date date,

  -- Extensions
  original_due_date date,
  extended_by text,
  extension_reason text,
  court_order_id uuid REFERENCES documents(id) ON DELETE SET NULL,

  -- Alerts
  alert_days_before integer[] DEFAULT ARRAY[14, 7, 3, 1],
  last_alert_sent timestamptz,

  -- Links
  related_disclosure_id uuid, -- polymorphic: initial, expert, or pretrial disclosure
  assigned_to text,

  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discovery_deadlines_case ON discovery_deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_discovery_deadlines_due ON discovery_deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_discovery_deadlines_status ON discovery_deadlines(status);
CREATE INDEX IF NOT EXISTS idx_discovery_deadlines_type ON discovery_deadlines(deadline_type);

-- ============================================================
-- 7. Privilege log (Rule 26(b)(5))
-- ============================================================
CREATE TABLE IF NOT EXISTS privilege_log_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,

  -- Document identification
  document_title text NOT NULL,
  document_date date,
  bates_number text,
  linked_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,

  -- Privilege details
  privilege_type text NOT NULL
    CHECK (privilege_type IN (
      'attorney_client',
      'work_product',
      'joint_defense',
      'common_interest',
      'deliberative_process',
      'other'
    )),

  -- Required disclosure fields per Rule 26(b)(5)(A)
  author text,
  recipients text[], -- all recipients
  date_of_communication date,
  subject_matter text, -- general subject without revealing privileged content
  basis_for_privilege text,

  -- Work product specifics
  is_opinion_work_product boolean DEFAULT false,
  prepared_in_anticipation_of text,

  -- Status
  status text NOT NULL DEFAULT 'withheld'
    CHECK (status IN ('withheld', 'redacted', 'produced_in_part', 'clawback', 'waived')),

  -- Clawback (Rule 26(b)(5)(B))
  clawback_date date,
  clawback_notification_sent boolean DEFAULT false,

  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_privilege_log_case ON privilege_log_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_privilege_log_type ON privilege_log_entries(privilege_type);

-- ============================================================
-- 8. Rule 26(f) conference tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS rule26f_conferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,

  conference_date date,
  conference_type text DEFAULT 'initial'
    CHECK (conference_type IN ('initial', 'follow_up', 'modification')),

  -- Discovery plan topics (Rule 26(f)(3))
  discovery_plan jsonb DEFAULT '{}'::jsonb,
  -- Expected structure:
  -- {
  --   "changes_to_timing": "",
  --   "subjects_for_discovery": "",
  --   "esi_protocol": { "formats": [], "preservation": "", "search_terms": [] },
  --   "privilege_procedure": "",
  --   "discovery_limits_modifications": "",
  --   "scheduling_recommendations": "",
  --   "protective_order_needed": false,
  --   "phased_discovery": false,
  --   "clawback_agreement": false
  -- }

  -- Report filing
  report_filed boolean DEFAULT false,
  report_filed_date date,
  report_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,

  attendees text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rule26f_case ON rule26f_conferences(case_id);

-- ============================================================
-- 9. Written discovery tracking (interrogatories, RFPs, RFAs)
-- ============================================================
CREATE TABLE IF NOT EXISTS written_discovery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,

  discovery_type text NOT NULL
    CHECK (discovery_type IN ('interrogatory', 'rfp', 'rfa')),

  -- Direction
  direction text NOT NULL DEFAULT 'outgoing'
    CHECK (direction IN ('outgoing', 'incoming')),

  -- Set info
  set_number integer NOT NULL DEFAULT 1,
  title text NOT NULL,

  -- Tracking
  served_date date,
  response_due_date date,
  response_received_date date,

  -- Counts (for tier compliance)
  request_count integer DEFAULT 0,

  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'served', 'response_due', 'response_received', 'objections_pending', 'complete', 'overdue')),

  -- Documents
  request_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  response_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,

  -- Motion to compel
  motion_to_compel_filed boolean DEFAULT false,
  motion_to_compel_date date,

  served_by text,
  served_to text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_written_discovery_case ON written_discovery(case_id);
CREATE INDEX IF NOT EXISTS idx_written_discovery_type ON written_discovery(discovery_type);
CREATE INDEX IF NOT EXISTS idx_written_discovery_status ON written_discovery(status);

-- ============================================================
-- 10. RLS Policies
-- ============================================================
ALTER TABLE discovery_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE initial_disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclosure_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE pretrial_disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE privilege_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule26f_conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE written_discovery ENABLE ROW LEVEL SECURITY;

-- Policy: case owner can manage all discovery data
-- Uses a subquery to check case ownership
CREATE POLICY "Case owner manages discovery config" ON discovery_configs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = discovery_configs.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Case owner manages initial disclosures" ON initial_disclosures
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = initial_disclosures.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Case owner manages disclosure items" ON disclosure_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = disclosure_items.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Case owner manages expert disclosures" ON expert_disclosures
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = expert_disclosures.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Case owner manages pretrial disclosures" ON pretrial_disclosures
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = pretrial_disclosures.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Case owner manages discovery deadlines" ON discovery_deadlines
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = discovery_deadlines.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Case owner manages privilege log" ON privilege_log_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = privilege_log_entries.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Case owner manages 26f conferences" ON rule26f_conferences
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = rule26f_conferences.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Case owner manages written discovery" ON written_discovery
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = written_discovery.case_id AND cases.user_id = auth.uid())
  );

-- ============================================================
-- 11. Helper function: calculate Utah tier limits
-- ============================================================
CREATE OR REPLACE FUNCTION get_utah_tier_limits(tier integer)
RETURNS jsonb AS $$
BEGIN
  CASE tier
    WHEN 1 THEN
      RETURN jsonb_build_object(
        'max_interrogatories', 10,
        'max_rfas', 10,
        'max_rfps', 10,
        'max_fact_depositions', 3,
        'max_fact_depo_hours', 3,
        'max_expert_depositions', 0,
        'max_expert_depo_hours', 0,
        'discovery_period_days', 120
      );
    WHEN 2 THEN
      RETURN jsonb_build_object(
        'max_interrogatories', 10,
        'max_rfas', 10,
        'max_rfps', 10,
        'max_fact_depositions', 5,
        'max_fact_depo_hours', 4,
        'max_expert_depositions', 2,
        'max_expert_depo_hours', 4,
        'discovery_period_days', 180
      );
    WHEN 3 THEN
      RETURN jsonb_build_object(
        'max_interrogatories', 10,
        'max_rfas', 10,
        'max_rfps', 10,
        'max_fact_depositions', 10,
        'max_fact_depo_hours', 7,
        'max_expert_depositions', 2,
        'max_expert_depo_hours', 4,
        'discovery_period_days', 210
      );
    ELSE
      RETURN jsonb_build_object(
        'max_interrogatories', 25,
        'max_rfas', 25,
        'max_rfps', 25,
        'max_fact_depositions', 10,
        'max_fact_depo_hours', 7,
        'max_expert_depositions', null,
        'max_expert_depo_hours', 4,
        'discovery_period_days', null
      );
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- 12. Helper function: auto-generate deadlines from key dates
-- ============================================================
CREATE OR REPLACE FUNCTION generate_discovery_deadlines(p_case_id uuid)
RETURNS void AS $$
DECLARE
  v_config record;
BEGIN
  SELECT * INTO v_config FROM discovery_configs WHERE case_id = p_case_id;
  IF v_config IS NULL THEN RETURN; END IF;

  -- Clear existing auto-generated deadlines
  DELETE FROM discovery_deadlines
  WHERE case_id = p_case_id
    AND notes = 'auto-generated';

  -- Initial disclosures: 14 days after Rule 26(f) conference (Federal)
  -- or 14 days after first defendant's answer (Utah)
  IF v_config.rule26f_conference_date IS NOT NULL THEN
    INSERT INTO discovery_deadlines (case_id, title, description, deadline_type, due_date, calculated_from, rule_reference, notes)
    VALUES (
      p_case_id,
      'Initial Disclosures Due',
      'Serve Rule 26(a)(1) initial disclosures on all parties',
      'initial_disclosure',
      v_config.rule26f_conference_date + interval '14 days',
      'Rule 26(f) conference date + 14 days',
      CASE v_config.jurisdiction_type WHEN 'utah' THEN 'URCP 26(a)(1)' ELSE 'FRCP 26(a)(1)(C)' END,
      'auto-generated'
    );
  END IF;

  -- Expert disclosures
  IF v_config.expert_disclosure_deadline IS NOT NULL THEN
    INSERT INTO discovery_deadlines (case_id, title, description, deadline_type, due_date, calculated_from, rule_reference, notes)
    VALUES (
      p_case_id,
      'Expert Disclosures Due',
      'Serve Rule 26(a)(2) expert disclosures with reports',
      'expert_disclosure',
      v_config.expert_disclosure_deadline,
      'Per scheduling order or 90 days before trial',
      CASE v_config.jurisdiction_type WHEN 'utah' THEN 'URCP 26(a)(4)' ELSE 'FRCP 26(a)(2)(D)' END,
      'auto-generated'
    );
  END IF;

  -- Expert rebuttal
  IF v_config.expert_rebuttal_deadline IS NOT NULL THEN
    INSERT INTO discovery_deadlines (case_id, title, description, deadline_type, due_date, calculated_from, rule_reference, notes)
    VALUES (
      p_case_id,
      'Expert Rebuttal Disclosures Due',
      'Serve rebuttal expert disclosures',
      'expert_rebuttal',
      v_config.expert_rebuttal_deadline,
      'Per scheduling order or 30 days after initial expert disclosure',
      CASE v_config.jurisdiction_type WHEN 'utah' THEN 'URCP 26(a)(4)' ELSE 'FRCP 26(a)(2)(D)(ii)' END,
      'auto-generated'
    );
  END IF;

  -- Pretrial disclosures: 30 days before trial
  IF v_config.trial_date IS NOT NULL THEN
    INSERT INTO discovery_deadlines (case_id, title, description, deadline_type, due_date, calculated_from, rule_reference, notes)
    VALUES (
      p_case_id,
      'Pretrial Disclosures Due',
      'Serve Rule 26(a)(3) pretrial disclosures (witnesses, depositions, exhibits)',
      'pretrial_disclosure',
      v_config.trial_date - interval '30 days',
      'Trial date - 30 days',
      CASE v_config.jurisdiction_type WHEN 'utah' THEN 'URCP 26(a)(5)' ELSE 'FRCP 26(a)(3)(B)' END,
      'auto-generated'
    );

    -- Pretrial objections: 14 days after pretrial disclosures
    INSERT INTO discovery_deadlines (case_id, title, description, deadline_type, due_date, calculated_from, rule_reference, notes)
    VALUES (
      p_case_id,
      'Pretrial Disclosure Objections Due',
      'File objections to pretrial disclosures',
      'pretrial_objections',
      v_config.trial_date - interval '16 days',
      'Trial date - 30 days + 14 days',
      CASE v_config.jurisdiction_type WHEN 'utah' THEN 'URCP 26(a)(5)' ELSE 'FRCP 26(a)(3)(B)' END,
      'auto-generated'
    );
  END IF;

  -- Discovery cutoff
  IF v_config.discovery_cutoff_date IS NOT NULL THEN
    INSERT INTO discovery_deadlines (case_id, title, description, deadline_type, due_date, calculated_from, rule_reference, notes)
    VALUES (
      p_case_id,
      'Discovery Cutoff',
      'All discovery must be completed by this date',
      'discovery_cutoff',
      v_config.discovery_cutoff_date,
      'Per scheduling order',
      CASE v_config.jurisdiction_type WHEN 'utah' THEN 'URCP 26' ELSE 'FRCP 26(d)' END,
      'auto-generated'
    );
  END IF;

  -- Rule 26(f) conference: at least 21 days before scheduling conference
  IF v_config.scheduling_order_date IS NOT NULL AND v_config.rule26f_conference_date IS NULL THEN
    INSERT INTO discovery_deadlines (case_id, title, description, deadline_type, due_date, calculated_from, rule_reference, notes)
    VALUES (
      p_case_id,
      'Rule 26(f) Conference',
      'Parties must confer to develop discovery plan at least 21 days before scheduling conference',
      'rule26f_conference',
      v_config.scheduling_order_date - interval '21 days',
      'Scheduling conference date - 21 days',
      'FRCP 26(f)(1)',
      'auto-generated'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
