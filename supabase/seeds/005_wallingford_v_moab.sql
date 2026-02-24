-- Wallingford v. Moab City
-- Blind Test Case Seed Data
-- Case No. 170700009 | Judge Lyle R. Anderson | Seventh District Court, Grand County, Utah
--
-- IMPORTANT: This case has been fully adjudicated through the Utah Court of Appeals.
-- The actual ruling is stored but HIDDEN until the user chooses to reveal it.
-- CaseCraft's AI will predict the outcome based solely on the pleadings/motions,
-- then compare its prediction against the actual ruling.
--
-- NOTE: This is a unique blind test because the TRIAL COURT ruled for the defendant,
-- but the COURT OF APPEALS reversed. The actual_ruling reflects the FINAL outcome.

-- ============================================================
-- 1. INSERT THE CASE (with actual ruling hidden)
-- ============================================================

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
    'Wallingford v. Moab City',
    '170700009',
    'property',
    'Seventh Judicial District Court, Grand County, Utah',
    'active',
    'Lucy Wallingford, Kiley Miller, John Rzeczycki, Carol Mayer, David Bodner, Meeche Bodner, Sarah Stock, Josephine Kovash, Living Rivers',
    'Moab City and Moab City Council',
    'A group of Moab residents and Living Rivers challenge Resolution No. 14-2017, which approved a Zoning Status Agreement (ZSA) between Moab City, SITLA, and LB Moab Land Company (the developer). The ZSA classified proposed modifications to the Lionsback Resort project as "minor amendments" reviewable by staff without a public hearing, rather than "major changes" requiring planning commission review with a public hearing under Moab Municipal Code § 17.65.130. The modifications would consolidate 50 hotel units from nine separate buildings into one 150-room hotel with lockout doors. Plaintiffs allege the City violated LUDMA public hearing requirements, committed contract zoning, and that the ZSA was arbitrary, capricious, and illegal. The City and intervenors argue the ZSA was a valid settlement of a bona fide legal dispute involving SITLA''s statutory zoning exemption.',
    '{"court": "Seventh Judicial District Court", "judge": "Lyle R. Anderson", "filed_year": 2017, "case_type_detail": "Land Use - Contract Zoning / Settlement Agreement / PUD Amendment", "parties_intervenor": "Utah School and Institutional Trust Lands Administration (SITLA) and LB Moab Land Company LLC", "appeal_court": "Utah Court of Appeals", "appeal_number": "20180524-CA", "appeal_cite": "2020 UT App 12"}',
    true,
    'plaintiff',
    'The District Court (Judge Anderson) GRANTED Intervenors'' Motion for Summary Judgment (June 7, 2018), finding: (1) the City had authority to enter the ZSA as a settlement agreement; (2) review was limited to whether there was collusion or bad faith; (3) no collusion existed; (4) the ZSA was not arbitrary, capricious, or illegal. The Utah Court of Appeals (Wallingford v. Moab City, 2020 UT App 12) REVERSED, holding that the Zoning Status Agreement constituted an illegal act of contract zoning. The Court held that while a municipality''s power to enter contracts is broad, a municipality may NOT contract around public hearing requirements found in statute or municipal ordinance. The ZSA effectively modified the City''s land use regulations by reclassifying major changes as minor amendments and eliminating required public hearings — this constituted unlawful contract zoning regardless of whether the settlement resolved a genuine dispute. Certiorari was DENIED by the Utah Supreme Court. Final outcome: Plaintiffs prevailed — the ZSA was invalidated as illegal contract zoning.',
    false
  );

  -- ============================================================
  -- 2. INSERT AGENTS
  -- ============================================================

  -- Judge
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_judge_id, v_case_id, 'judge', 'Judge Lyle R. Anderson',
   'You are Judge Lyle R. Anderson of the Seventh Judicial District Court in Grand County, Utah. You are reviewing cross-motions for summary judgment challenging Moab City''s approval of a Zoning Status Agreement (ZSA) for the Lionsback Resort development. You must evaluate: (1) whether the ZSA constitutes a valid municipal settlement agreement or illegal contract zoning; (2) whether public hearing requirements under LUDMA and the Moab Municipal Code were violated; (3) whether the City''s classification of hotel modifications as "minor amendments" was arbitrary, capricious, or illegal; (4) whether the Moab Appeal Authority has jurisdiction. You apply the deferential standard for legislative decisions but must also consider whether municipalities can contract around mandatory procedural requirements.',
   0.6, true);

  -- Plaintiff Attorney
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_plaintiff_id, v_case_id, 'plaintiff_attorney', 'Daniel J. McDonald - McDonald Fielding PLLC',
   'You are Daniel J. McDonald, lead attorney for the Wallingford plaintiffs — a group of Moab residents and Living Rivers who oppose the Zoning Status Agreement. You argue: (1) the ZSA is illegal contract zoning that circumvents mandatory public hearing requirements under LUDMA § 10-9a-205 and Moab Municipal Code § 17.65.130; (2) the modifications — nearly doubling hotel square footage from 41,360 to 81,688 sq ft, more than doubling parking from 104 to 230 spaces — are unquestionably "major changes" requiring planning commission review with a public hearing; (3) the City''s own attorney initially concluded the changes required major amendment processing; (4) the record shows collusion to avoid public scrutiny — SITLA and the developer explicitly sought to avoid "risky" public hearings, and the City attorney acknowledged this desire was "driving" the agreement; (5) the trial court invented a novel "collusion or bad faith" standard never used in Utah land use law; (6) plaintiffs were denied meaningful public participation on a controversial close-vote decision.',
   0.7, true);

  -- Defense Attorney
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_defense_id, v_case_id, 'defense_attorney', 'Christopher G. McAnany - Dufford Waldeck Milburn & Krohn LLP',
   'You are Christopher G. McAnany, attorney for Moab City and the Moab City Council. You argue: (1) the ZSA is a valid settlement agreement resolving a genuine legal dispute about the scope of SITLA''s statutory zoning exemption under Utah Code § 10-9a-304; (2) SITLA threatened to withdraw from City jurisdiction if the dispute was not resolved, which would have meant the City lost all land use authority over the development; (3) municipalities have broad statutory and common law power to settle disputed claims under Utah Code § 10-1-202; (4) the ZSA is not a "land use regulation" requiring LUDMA public hearing — it is a one-off settlement agreement; (5) the City obtained significant benefits: developer assumed wastewater infrastructure, additional traffic studies required, SITLA indemnification for litigation costs; (6) the deferential "collusion or bad faith" standard from Clayton v. Salt Lake City properly applies to municipal settlements.',
   0.7, true);

  -- Intervenor Attorney
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_intervenor_id, v_case_id, 'expert_witness', 'Jody K. Burnett - Snow Christensen & Martineau (for SITLA/LB Moab)',
   'You are Jody K. Burnett, attorney for intervenor defendants SITLA and LB Moab Land Company LLC. You argue: (1) SITLA has a statutory zoning exemption under LUDMA § 10-9a-304 — state lands are not subject to municipal jurisdiction, so the City had a genuine legal dilemma; (2) LB Moab reasonably relied on City staff approvals (Planning Director''s 2014 email confirming the lockout concept was acceptable) and invested approximately $500,000 in architectural and engineering work; (3) the ZSA was a negotiated compromise where SITLA agreed to stay within City jurisdiction rather than withdraw; (4) overall project density remains identical at 50 hotel units — the change is architectural consolidation, not a density increase; (5) the Interlocal Cooperation Act authorizes public agencies to exempt other agencies from permit requirements; (6) the Appeal Authority lacked jurisdiction because the ZSA involves legislative and state-law questions beyond its scope.',
   0.7, true);

  -- ============================================================
  -- 3. INSERT CASE FACTS (from pleadings - NO ruling information)
  -- ============================================================

  -- Undisputed Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'undisputed', 'In October 2008, Moab City, SITLA, and LB Moab entered a Pre-Annexation Agreement. The property (175 acres at Slick Rock Trailhead near Lion''s Back) was annexed into City limits and assigned the Sensitive Area Resort (SAR) zone.', false, '["Pre-Annexation Agreement (2008)", "Annexation records"]'),
  (v_case_id, 'undisputed', 'In July 2009, the City approved a Development and Phasing Agreement authorizing 188 single-family lots, 18 employee units, and a 50-unit hotel in nine separate buildings (41,360 sq ft hotel, 38,760 sq ft parking, 104 spaces).', false, '["Development and Phasing Agreement (2009)"]'),
  (v_case_id, 'undisputed', 'In 2013, the developer proposed consolidating all hotel units into one larger building with three-bedroom lockout doors, creating 150-room capacity. In September 2013, City staff indicated this would be considered a "minor amendment" approvable by staff.', false, '["Staff communications (2013)"]'),
  (v_case_id, 'undisputed', 'On April 2, 2014, Planning Director Jeff Reinhart emailed confirming the lockout concept was acceptable and that "density or number of proposed units is the important thing for us." LB Moab invested approximately $500,000 in architectural and engineering based on these communications.', false, '["Reinhart email (Apr 2014)", "Investment records"]'),
  (v_case_id, 'undisputed', 'In Summer 2015, new City Manager Rebecca Davidson opposed the project. On September 12, 2016, the City attorney reversed course and concluded the modifications should be processed as a "major change" under MMC § 17.65.130.', false, '["City attorney letter (Sep 12, 2016)"]'),
  (v_case_id, 'undisputed', 'On October 13, 2016, SITLA informed the City of its intention to withdraw from municipal jurisdiction if the issues were not resolved, citing its statutory zoning exemption under Utah Code § 10-9a-304.', false, '["SITLA letter (Oct 13, 2016)"]'),
  (v_case_id, 'undisputed', 'The Zoning Status Agreement was negotiated over several weeks, presented to the City Council on December 13, 2016 (tabled), discussed at a public workshop on February 1, 2017 (limited public comment in last 10-12 minutes of 97-minute meeting), and approved by a 3-2 vote on February 28, 2017.', false, '["City Council minutes (Dec 2016 - Feb 2017)"]'),
  (v_case_id, 'undisputed', 'The ZSA provided that the amendment application "is deemed to be a Minor Amendment, which will be reviewed and acted upon by the Moab City planning department staff" — without planning commission review or public hearing. Future land use applications would also occur administratively.', false, '["ZSA text"]'),
  (v_case_id, 'undisputed', 'On March 30, 2017, plaintiffs filed both an administrative appeal to the Moab Appeal Authority and this district court action. On June 5, 2017, the City denied the administrative appeal, stating the Appeal Authority lacked jurisdiction.', false, '["Filing records (Mar 30, 2017)", "City denial (Jun 5, 2017)"]');

  -- Disputed Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'disputed', 'Plaintiffs argue the hotel modifications are "major changes" under MMC § 17.65.130 because hotel square footage nearly doubles (41,360 to 81,688 sq ft) and parking more than doubles (104 to 230 spaces). Defendants argue overall density remains the same at 50 units and the changes are architectural consolidation.', true, '["MMC § 17.65.130", "Original and amended plans"]'),
  (v_case_id, 'disputed', 'Plaintiffs argue the ZSA is illegal contract zoning that circumvents mandatory public hearing requirements. Defendants argue it is a valid settlement of a bona fide legal dispute about SITLA''s zoning exemption.', true, '["LUDMA § 10-9a-205", "Contract zoning doctrine"]'),
  (v_case_id, 'disputed', 'Plaintiffs argue the record shows collusion — developer and SITLA explicitly sought to avoid "risky" public hearings. Defendants argue the ZSA resolved genuine legal uncertainty about SITLA''s jurisdiction.', true, '["Meeting transcripts", "SITLA correspondence"]'),
  (v_case_id, 'disputed', 'Whether the Moab Appeal Authority has jurisdiction to review the ZSA — plaintiffs say yes (it''s a land use decision), defendants say no (it involves legislative policy and state law questions).', true, '["LUDMA § 10-9a-701", "City denial letter"]');

  -- Evidence-based Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'evidence_based', 'SITLA stated that processing the application as a major amendment would require "public hearings, public scrutiny, a lot of time" and that this was unacceptable. The City attorney acknowledged that "part of what is driving this" was the developer''s desire to avoid the public hearing process.', false, '["Meeting transcripts", "City attorney statements"]'),
  (v_case_id, 'evidence_based', 'The ZSA''s Recitals M and N acknowledged SITLA''s position regarding its zoning exemption and the potential for legal dispute if the issues were not resolved through settlement.', false, '["ZSA Recitals M and N"]'),
  (v_case_id, 'evidence_based', 'One City Council member attempted to change their vote from yes to no immediately after the 3-2 vote approving the ZSA, indicating the controversial and close nature of the decision.', false, '["City Council minutes (Feb 28, 2017)"]'),
  (v_case_id, 'evidence_based', 'The developer had reasonable reliance on 2013-2014 City staff communications approving the lockout concept, which was later reversed by a new City Manager in 2015-2016.', false, '["Staff emails (2013-2014)", "City attorney reversal (2016)"]');

  -- Legal Arguments
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'expert_opinion', 'Plaintiffs argue the ZSA constitutes contract zoning — a municipality cannot contract around mandatory public hearing requirements in its own ordinances. The ZSA effectively modified MMC §§ 17.65.080 and 17.65.130 for one developer''s benefit.', false, '["Contract zoning doctrine", "MMC § 17.65.130"]'),
  (v_case_id, 'expert_opinion', 'Defendants argue SITLA''s zoning exemption under LUDMA § 10-9a-304 creates a genuine "grey area" — the City was negotiating to maintain jurisdiction it might otherwise lose, which is a legitimate basis for settlement.', false, '["LUDMA § 10-9a-304", "Settlement doctrine"]'),
  (v_case_id, 'expert_opinion', 'Defendants cite Bradley v. Payson City Corp. (2003 UT 16) and Springville Citizens v. City of Springville (1979 UT 25) for the proposition that legislative land use decisions are reviewed under a highly deferential "reasonably debatable" standard.', false, '["Bradley v. Payson City Corp., 2003 UT 16", "Springville Citizens, 1979 UT 25"]'),
  (v_case_id, 'expert_opinion', 'Plaintiffs argue the trial court invented an improper "collusion or bad faith" standard never used in Utah land use cases, and that the proper standard under LUDMA is whether the decision was "arbitrary, capricious, or illegal."', false, '["LUDMA review standards", "Clayton v. Salt Lake City"]');

  RAISE NOTICE 'Successfully seeded Wallingford v. Moab City blind test case (ID: %)', v_case_id;

END $$;
