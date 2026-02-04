-- Northern Monticello Alliance LLC v. San Juan County
-- Blind Test Case Seed Data
-- Case No. 170700006 | Judge Lyle R. Anderson | Seventh District Court, San Juan County, Utah
--
-- IMPORTANT: This case has been fully adjudicated through the Utah Supreme Court.
-- The actual ruling is stored but HIDDEN until the user chooses to reveal it.
-- CaseCraft's AI will predict the outcome based solely on the pleadings/motions,
-- then compare its prediction against the actual ruling.

-- ============================================================
-- 1. INSERT THE CASE (with actual ruling hidden)
-- ============================================================
-- NOTE: Replace 'YOUR_USER_ID' with the actual authenticated user's UUID
-- This seed is meant to be run manually or adapted to your user context.

DO $$
DECLARE
  v_user_id UUID;
  v_case_id UUID := gen_random_uuid();
  v_agent_judge_id UUID := gen_random_uuid();
  v_agent_plaintiff_id UUID := gen_random_uuid();
  v_agent_defense_id UUID := gen_random_uuid();
  v_agent_intervenor_id UUID := gen_random_uuid();
BEGIN

  -- Get the first user (for local dev seeding)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No users found. Please sign up first, then run this seed.';
    RETURN;
  END IF;

  -- Insert the case as a blind test
  INSERT INTO cases (
    id, user_id, name, case_number, case_type, jurisdiction, status,
    plaintiff_name, defendant_name, summary, metadata,
    is_blind_test, actual_ruling, actual_ruling_summary, ruling_revealed
  ) VALUES (
    v_case_id,
    v_user_id,
    'Northern Monticello Alliance LLC v. San Juan County',
    '170700006',
    'property',
    'Seventh District Court, Monticello Department, San Juan County, Utah',
    'active',
    'Northern Monticello Alliance, LLC',
    'San Juan County Commission & San Juan County',
    'Northern Monticello Alliance (NMA), a group of landowners whose property is adjacent to and surrounded by a wind turbine facility in San Juan County, challenges the county''s decision not to revoke sPower''s conditional use permit (CUP). NMA alleges sPower failed to comply with CUP conditions requiring mitigation of flicker, light, sound, and ice throw impacts, and failed to provide financial mitigation. The case involves due process claims, administrative law challenges, and questions about the adequacy of county planning commission procedures.',
    '{"court": "Seventh District Court", "judge": "Lyle R. Anderson", "filed_year": 2017, "case_type_detail": "Land Use - Conditional Use Permit Revocation", "parties_intervenor": "Sustainable Power Group LLC (sPower) and Latigo Wind Park LLC"}',
    true,
    'defendant',
    'The District Court DENIED NMA''s Motion for Summary Judgment and GRANTED the County''s Cross-Motion for Summary Judgment (Feb 28, 2018). The court applied law of the case doctrine, finding that it had already determined in NMA I that the county commission''s decision was supported by substantial evidence and was not illegal (aside from a due process violation). On remand, the county commission remedied the due process violation by allowing NMA to present arguments. The court found the county commission did what was expected on remand. The Utah Supreme Court (2022 UT 10, 506 P.3d 593) later REVERSED the Court of Appeals, holding that while NMA had a right to appeal the Planning Commission''s decision, neither CLUDMA, the Zoning Ordinance, nor the CUP conditions created a right for NMA to participate in the revocation hearing or a protected interest in the enforcement of the CUP. Final outcome: NMA lost at all levels.',
    false
  );

  -- ============================================================
  -- 2. INSERT AGENTS
  -- ============================================================

  -- Judge
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_judge_id, v_case_id, 'judge', 'Judge Lyle R. Anderson',
   'You are Judge Lyle R. Anderson of the Seventh District Court in San Juan County, Utah. You are reviewing cross-motions for summary judgment in a land use case involving a wind farm conditional use permit. You must evaluate whether the county commission''s decision was arbitrary, capricious, or illegal under Utah Code § 17-27a-801. You apply the substantial evidence standard and give some non-binding deference to the land use authority''s interpretation. You are practical, experienced with rural land use disputes, and focused on procedural correctness.',
   0.6, true);

  -- Plaintiff Attorney
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_plaintiff_id, v_case_id, 'plaintiff_attorney', 'J. Craig Smith - Smith Hartvigsen PLLC',
   'You are J. Craig Smith, lead attorney for Northern Monticello Alliance LLC. Your clients are rural landowners whose property is adjacent to and surrounded by a 27-turbine wind farm. You argue that sPower violated multiple conditions of the Amended CUP including: (1) failure to mitigate flicker, light, sound, and ice throw as much as possible; (2) failure to install Dark Sky Technology for aviation warning lights; (3) selection of the noisiest turbine option; (4) unauthorized relocation of turbines closer to NMA property; (5) failure to provide financial mitigation including purchase option and value reduction payments. You emphasize that the Planning Commission made no written findings of fact, making the decision arbitrary and capricious under McElhaney v. City of Moab. You also argue due process violations.',
   0.7, true);

  -- Defense Attorney
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_defense_id, v_case_id, 'defense_attorney', 'Barton H. Kunz II - Goebel Anderson PC',
   'You are Barton H. Kunz II, lead attorney for San Juan County and the San Juan County Commission. You argue that the county commission''s decision not to revoke the conditional use permit was supported by substantial evidence and was not arbitrary, capricious, or illegal. You contend that sPower submitted evidence of compliance with mitigation requirements, including flicker studies, noise assessments, and light mitigation documentation. You argue that the county commission properly remedied the due process violation identified in NMA I by allowing NMA to present arguments on remand. You emphasize the presumption of validity afforded to land use decisions and the limited scope of judicial review.',
   0.7, true);

  -- Intervenor Attorney
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_intervenor_id, v_case_id, 'expert_witness', 'Paul W. Shakespear - Snell & Wilmer (for sPower)',
   'You are Paul W. Shakespear, attorney for intervening respondents Sustainable Power Group LLC (sPower) and Latigo Wind Park LLC. You defend the wind farm''s conditional use permit and argue that sPower has complied with all conditions. You present evidence of mitigation studies for flicker, sound, and light impacts. You argue that NMA has no protectable interest in the enforcement of the CUP and no right to participate in the revocation hearing beyond the right to appeal. You cite Utah Code and the San Juan County Zoning Ordinance to support your position.',
   0.7, true);

  -- ============================================================
  -- 3. INSERT CASE FACTS (from pleadings - NO ruling information)
  -- ============================================================

  -- Undisputed Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'undisputed', 'NMA Members own approximately 70 acres of land in San Juan County, adjacent to and abutting the wind turbine facility.', false, '["R0349", "R0779"]'),
  (v_case_id, 'undisputed', 'The Wind Facility consists of 27 turbines approximately 453 feet tall in an A-1 agricultural zone where residential use is permitted and wind facilities require a conditional use permit.', false, '["R0733-0734", "R1629-1630"]'),
  (v_case_id, 'undisputed', 'The Planning Commission issued an Amended CUP on October 4, 2012, requiring as much flicker, light, sound mitigation as possible.', false, '["R0855", "R1809"]'),
  (v_case_id, 'undisputed', 'The Amended CUP included self-imposed conditions binding upon all future owners/developers including limiting decibel levels at property boundaries to 55 dB.', false, '["R0027", "R1633", "R1808"]'),
  (v_case_id, 'undisputed', 'sPower constructed 15 turbines substantially closer to NMA Property than originally approved without any amendment to the Amended CUP.', false, '["R0001-R2205"]'),
  (v_case_id, 'undisputed', 'sPower selected the GE 2.3 MW Turbine with 107.5 dB sound power rating - the highest of any turbine under consideration - and did not use the available low noise blade option (105 dB).', false, '["R0061", "R1607", "R1631"]'),
  (v_case_id, 'undisputed', 'Building permit was issued February 3, 2014, without verification that Amended CUP conditions were met.', false, '["R0085", "R1615", "R1796", "R1178"]'),
  (v_case_id, 'undisputed', 'The Planning Commission did not issue a written decision or make any express findings of fact or conclusions of law regarding the decision not to revoke the CUP.', false, '["R0003", "R0581"]'),
  (v_case_id, 'undisputed', 'On December 3, 2015, sPower sent an ex parte letter threatening a $100 million damage claim and demanding reconsideration of the County Commission''s initial decision to reverse the Planning Commission.', false, '["R0025-0029"]'),
  (v_case_id, 'undisputed', 'The County Commission reconsidered in closed executive session on December 7, 2015, and reversed its own Final Written Decision without involving NMA.', false, '["R0002"]'),
  (v_case_id, 'undisputed', 'In NMA I, the District Court held the County Commission violated NMA''s due process rights but found the decision was otherwise supported by substantial evidence.', false, '["NMA I Memorandum Decision"]'),
  (v_case_id, 'undisputed', 'On remand (Jan 3, 2017), NMA was permitted to present only argument on evidence already in the record, not new evidence.', false, '["R1834"]');

  -- Disputed Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'disputed', 'NMA contends sPower failed to implement Dark Sky Technology for aviation warning lights despite commitments, while sPower claims it reduced lit turbines from 27 to 14 through FAA negotiations.', true, '["R0063-0064", "R0787"]'),
  (v_case_id, 'disputed', 'NMA argues no sound analysis was done for the actual GE turbines used; County/sPower argue mitigation studies demonstrate compliance with sound conditions.', true, '["R0587-611", "R1631"]'),
  (v_case_id, 'disputed', 'NMA argues sPower failed to provide any financial mitigation (purchase option or value reduction payments); sPower claims NMA property owners were paid full value.', true, '["R0009", "R0014-0016", "R0019-0020"]'),
  (v_case_id, 'disputed', 'Whether NMA had a right to participate in the revocation hearing or only a right to appeal the decision.', true, '["Utah Code §17-27a-701"]'),
  (v_case_id, 'disputed', 'Whether the County Commission properly remedied the due process violation on remand by allowing argument but not new evidence.', true, '["R1834", "R1836"]');

  -- Evidence-based Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'evidence_based', 'Commissioner Phil Lyman dissented, stating: Latigo did not mitigate in relation to the NMA Land Owners and sPower''s claim that NMA property owners have been paid full value is absurd.', false, '["R0019-0020"]'),
  (v_case_id, 'evidence_based', 'The Updated Shadow Flicker Impact Assessment (Jan 27, 2014) did not analyze flicker effects on NMA Property because it assumed the property would be purchased.', false, '["R0613", "R0619"]'),
  (v_case_id, 'evidence_based', 'sPower admitted that the single largest component of flicker and sound impact is proximity to turbine locations, and it relocated turbines significantly closer to NMA property.', false, '["R1894"]'),
  (v_case_id, 'evidence_based', 'The Option Agreement required sPower to purchase NMA Property at $10,450/acre before commencing significant construction, but sPower waited until after expiration and then offered only $3,000/acre.', false, '["R0476-0500", "R0315"]');

  -- Legal Arguments
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'expert_opinion', 'NMA argues the Planning Commission decision was arbitrary and capricious under McElhaney v. City of Moab (2017 UT 65) because it failed to produce findings of fact capable of review on appeal.', false, '["McElhaney v. City of Moab, 2017 UT 65"]'),
  (v_case_id, 'expert_opinion', 'County argues the decision is entitled to a presumption of validity and is supported by substantial evidence under Utah Code § 17-27a-801(3)(c).', false, '["Utah Code § 17-27a-801"]'),
  (v_case_id, 'expert_opinion', 'NMA argues due process violations: (1) excluded from September 2015 revocation hearing; (2) excluded from December 2015 reconsideration; (3) limited to argument only on remand.', false, '["14th Amendment", "Utah Code §17-27a-706"]'),
  (v_case_id, 'expert_opinion', 'County/sPower argue NMA has no protectable interest in the enforcement of the CUP and no constitutional right to participate in the revocation hearing.', false, '["CLUDMA", "San Juan County Zoning Ordinance"]');

  RAISE NOTICE 'Successfully seeded Northern Monticello Alliance v. San Juan County blind test case (ID: %)', v_case_id;

END $$;
