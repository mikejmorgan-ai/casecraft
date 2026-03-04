-- Morra v. Grand County
-- Blind Test Case Seed Data
-- Case No. 070700108 | Judge Lyle R. Anderson | Seventh District Court, Grand County, Utah
--
-- IMPORTANT: This case has been fully adjudicated through the Utah Supreme Court
-- and a second round of summary judgment on remand.
-- The actual ruling is stored but HIDDEN until the user chooses to reveal it.
-- CaseBrake.ai's AI will predict the outcome based solely on the pleadings/motions,
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
    'Morra v. Grand County',
    '070700108',
    'property',
    'Seventh Judicial District Court, Grand County, Utah',
    'active',
    'Barbara A. Morra, Michael K. Suarez, John S. Weisheit, Harold Shepherd, Jennifer P. Speers, Tara Collins, William Love, Sarah M. Fields, John C. Dohrenwend, Paul Janos, Steve Mulligan',
    'Grand County, Utah and Grand County Council',
    'A group of Grand County citizens (the Morra plaintiffs) challenge Ordinance 454, which approved an Amended Master Plan and Development Agreement for the Cloudrock/Johnson''s Up-on-Top Mesa Planned Unit Development (PUD). The PUD is a proposed wilderness lodge, conference, and residential community on approximately 3,862 acres of state trust land (SITLA land) in the desert mesa country outside Moab. Plaintiffs allege the County violated mandatory procedural requirements in adopting the ordinance, that the land use decision was arbitrary, capricious, and illegal, and that the Board of Adjustment (not the district court) was the proper appeal body. The Intervenor, Cloudrock Land Company LLC, moves for summary judgment arguing the County followed all required procedures, the decision was a legislative act properly reviewed by the district court, and the ordinance rationally promotes general welfare.',
    '{"court": "Seventh Judicial District Court", "judge": "Lyle R. Anderson", "filed_year": 2007, "case_type_detail": "Land Use - PUD / Master Plan Approval", "parties_intervenor": "Cloudrock Land Company LLC", "supreme_court_cite": "2010 UT 71, 245 P.3d 145", "defendant_attorneys": "M. Scott Barrett (Barrett & Daines), Happy J. Morgan (Grand County Attorney)"}',
    true,
    'defendant',
    'First Round: The District Court (Judge Anderson) GRANTED Cloudrock''s (Intervenor''s) Motion for Summary Judgment and DENIED Plaintiffs'' Cross-Motion (Feb 2008 Memorandum Decision). The court found: (1) district court, not the Board of Adjustment, had jurisdiction to review Ordinance 454 because it was a legislative act; (2) the passage of Ordinance 454 was not arbitrary, capricious, or illegal because it was reasonably debatable that the PUD could promote the general welfare; (3) Grand County complied with all mandatory procedural requirements for PUD approval. The Utah Supreme Court (Morra v. Grand County, 2010 UT 71, 245 P.3d 145) REVERSED and REMANDED, not on the merits, but because the district court record was inadequate for appellate review. The court reporter had died before transcribing the hearing notes, and the parties'' attempts to reconstruct the record were insufficient. The Supreme Court held that when a record is inadequate through no fault of the appellant, the remedy is a new hearing, not dismissal. On remand (Second Round): The District Court again GRANTED Defendants'' Motion for Summary Judgment and DENIED Plaintiffs'' Cross-Motion (2011-2012). The court reaffirmed its prior analysis on all substantive issues. Final outcome: Defendant/Intervenor prevailed - Ordinance 454 upheld at all levels.',
    false
  );

  -- ============================================================
  -- 2. INSERT AGENTS
  -- ============================================================

  -- Judge
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_judge_id, v_case_id, 'judge', 'Judge Lyle R. Anderson',
   'You are Judge Lyle R. Anderson of the Seventh Judicial District Court in Grand County, Utah. You are reviewing cross-motions for summary judgment in a land use case challenging the approval of a large Planned Unit Development (PUD) on state trust land near Moab. You must determine: (1) whether the Board of Adjustment or the district court has jurisdiction over challenges to legislative land use decisions; (2) whether the County''s approval of Ordinance 454 was arbitrary, capricious, or illegal under the reasonably debatable standard; (3) whether mandatory procedural requirements were followed. You apply the deferential standard of review for legislative land use decisions, requiring only that the decision be reasonably debatable. You are experienced with rural land use disputes in southeastern Utah.',
   0.6, true);

  -- Plaintiff Attorney
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_plaintiff_id, v_case_id, 'plaintiff_attorney', 'J. Craig Smith - Smith Hartvigsen PLLC',
   'You are J. Craig Smith, lead attorney for the Morra plaintiffs, a group of Grand County citizens opposed to the Cloudrock PUD. You argue: (1) the Board of Adjustment, not the district court, is the proper appeal body for challenges to Ordinance 454 under Utah Code § 17-27a-701 and the Grand County Land Use Code; (2) the County violated mandatory procedural requirements including inadequate public notice, failure to comply with its own land use ordinances for PUD approval, and failure to obtain required agency reviews; (3) the approval of Ordinance 454 was arbitrary, capricious, and illegal because the PUD lacks adequate water supply, road infrastructure, and fire protection for a 3,862-acre development in remote desert terrain; (4) the County Council improperly delegated its legislative authority by approving a master plan that defers critical details to future development phases without adequate standards.',
   0.7, true);

  -- Defense Attorney
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_defense_id, v_case_id, 'defense_attorney', 'M. Scott Barrett - Barrett & Daines / Happy J. Morgan - Grand County Attorney',
   'You are the defense team for Grand County, consisting of M. Scott Barrett (outside counsel) and Happy J. Morgan (Grand County Attorney). You argue: (1) Ordinance 454 is a legislative act and challenges to it are properly heard by the district court, not the Board of Adjustment; (2) the County complied with all mandatory procedural requirements for PUD approval including proper notice and public hearings; (3) the approval was not arbitrary or capricious because it is reasonably debatable that the Cloudrock PUD promotes the general welfare through economic development, tourism, and responsible land stewardship; (4) the standard of review for legislative land use decisions is highly deferential, requiring the court to uphold the decision if any rational basis exists.',
   0.7, true);

  -- Intervenor Attorney
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_intervenor_id, v_case_id, 'expert_witness', 'Michael Zimmerman - Snell & Wilmer (for Cloudrock)',
   'You are Michael Zimmerman, former Utah Supreme Court Justice, now attorney at Snell & Wilmer representing Intervenor Cloudrock Land Company LLC. You defend the Cloudrock PUD approval and argue: (1) Ordinance 454 is a valid legislative act entitled to a strong presumption of validity under Bradley v. Payson City Corp. (2003 UT 16) and Springville Citizens for a Better Community v. City of Springville (1979 UT 25); (2) the district court has exclusive jurisdiction to review legislative land use decisions - the BOA only reviews administrative decisions; (3) the County followed all mandatory procedures and the plaintiffs confuse mandatory requirements with discretionary ones; (4) the reasonably debatable standard requires only that a rational person could conclude the PUD promotes public welfare, not that everyone agrees it is wise policy; (5) PUD master plans by their nature address details in phases, and this is expressly contemplated by the Grand County Land Use Code.',
   0.7, true);

  -- ============================================================
  -- 3. INSERT CASE FACTS (from pleadings - NO ruling information)
  -- ============================================================

  -- Undisputed Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'undisputed', 'Cloudrock Land Company LLC proposes a Planned Unit Development (PUD) known as "Johnson''s Up-on-Top Mesa" or "Cloudrock" on approximately 3,862 acres of state trust land (SITLA land) in the desert mesa country of Grand County, outside Moab, Utah.', false, '["Ordinance 454", "Amended Master Plan"]'),
  (v_case_id, 'undisputed', 'The Grand County Council passed Ordinance 454 on September 4, 2007, approving the Amended Master Plan and Development Agreement for the Cloudrock PUD.', false, '["Ordinance 454", "County Council minutes"]'),
  (v_case_id, 'undisputed', 'The PUD envisions a wilderness lodge, conference facilities, and residential community developed in phases over many years on remote desert mesa terrain.', false, '["Amended Master Plan", "Development Agreement"]'),
  (v_case_id, 'undisputed', 'The plaintiffs are a group of Grand County citizens and residents who opposed the PUD approval.', false, '["Complaint", "Petition for Judicial Review"]'),
  (v_case_id, 'undisputed', 'Cloudrock Land Company LLC intervened in the action to defend the validity of Ordinance 454 and the PUD approval.', false, '["Motion to Intervene", "Order granting intervention"]'),
  (v_case_id, 'undisputed', 'The Grand County Planning Commission reviewed the PUD application and recommended approval before the County Council voted on Ordinance 454.', false, '["Planning Commission minutes", "Staff report"]'),
  (v_case_id, 'undisputed', 'The court reporter who recorded the district court hearing died before the hearing notes were transcribed, resulting in an incomplete record for appellate review.', false, '["Supreme Court Opinion, 2010 UT 71"]');

  -- Disputed Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'disputed', 'Plaintiffs contend the Board of Adjustment has jurisdiction over this challenge because Ordinance 454 is an administrative land use decision. Defendants and Intervenor contend it is a legislative act properly reviewed only by the district court.', true, '["Utah Code § 17-27a-701", "Grand County Land Use Code"]'),
  (v_case_id, 'disputed', 'Plaintiffs allege the County failed to comply with mandatory procedural requirements for PUD approval, including inadequate public notice and failure to follow its own ordinances. Defendants argue all mandatory procedures were followed.', true, '["Grand County PUD Ordinance", "Public hearing notices", "County Council minutes"]'),
  (v_case_id, 'disputed', 'Plaintiffs argue the PUD lacks adequate infrastructure plans for water supply, roads, fire protection, and wastewater for a 3,862-acre development in remote desert terrain. Defendants argue these details are properly addressed in later development phases as contemplated by the PUD framework.', true, '["Amended Master Plan", "Development Agreement", "Infrastructure studies"]'),
  (v_case_id, 'disputed', 'Whether the County Council improperly delegated its authority by approving a master plan that defers critical development details to future phases without adequate standards or criteria.', true, '["Ordinance 454", "Grand County Land Use Code PUD provisions"]');

  -- Evidence-based Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'evidence_based', 'The Cloudrock PUD site is located on remote desert mesa land controlled by SITLA (School and Institutional Trust Lands Administration), accessible by limited roads in an arid environment.', false, '["Site plans", "SITLA lease documents"]'),
  (v_case_id, 'evidence_based', 'The Grand County Council held multiple public hearings on the PUD application before voting on Ordinance 454, and public notice was published in the local newspaper.', false, '["Public hearing notices", "County Council minutes"]'),
  (v_case_id, 'evidence_based', 'The Development Agreement includes phased development with specific conditions that must be met before each phase can proceed, including infrastructure and utility requirements.', false, '["Development Agreement"]'),
  (v_case_id, 'evidence_based', 'The plaintiffs initially appealed to the Board of Adjustment, which declined jurisdiction, leading to the district court filing.', false, '["BOA proceedings", "District court petition"]');

  -- Legal Arguments
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'expert_opinion', 'Cloudrock argues the approval of Ordinance 454 is a legislative act entitled to a strong presumption of validity, reviewable only under the reasonably debatable standard per Bradley v. Payson City Corp. (2003 UT 16) and Springville Citizens v. City of Springville (1979 UT 25).', false, '["Bradley v. Payson City Corp., 2003 UT 16", "Springville Citizens v. City of Springville, 1979 UT 25"]'),
  (v_case_id, 'expert_opinion', 'Plaintiffs argue the approval was arbitrary and capricious because the County approved a massive development without adequate evidence that basic infrastructure (water, roads, fire protection) could support it.', false, '["Complaint allegations", "Infrastructure concerns"]'),
  (v_case_id, 'expert_opinion', 'Cloudrock cites Smith Investment Co. v. Sandy City and Patterson v. Utah County Board of Adjustment for the proposition that PUD approvals and master plan adoptions are legislative acts, not administrative decisions reviewable by the BOA.', false, '["Smith Inv. Co. v. Sandy City", "Patterson v. Utah County Bd. of Adjustment"]'),
  (v_case_id, 'expert_opinion', 'Plaintiffs cite Springville Citizens for the principle that even legislative land use decisions can be overturned if they bear no reasonable relationship to public welfare, arguing the Cloudrock PUD fails this test.', false, '["Springville Citizens v. City of Springville, 1979 UT 25"]');

  RAISE NOTICE 'Successfully seeded Morra v. Grand County blind test case (ID: %)', v_case_id;

END $$;
