-- LD III LLC v. Mapleton City
-- Blind Test Case Seed Data
-- Case No. 170401683 | Judge James R. Taylor | Fourth District Court, Utah County, Utah
--
-- IMPORTANT: This case has been fully adjudicated through the Utah Court of Appeals.
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
    'LD III LLC v. Mapleton City',
    '170401683',
    'property',
    'Fourth Judicial District Court, Provo Department, Utah County, Utah',
    'active',
    'LD III, LLC',
    'Mapleton City',
    'LD III, LLC acquired property in Mapleton City through a trustee''s sale (foreclosure) and claims the property retains its TDR-R (Transferable Development Rights Receiving) overlay zone status with a vested right to develop 136 residential lots. The TDR-R overlay was originally established through a 2003 Development Agreement between the prior owner (M-53 Associates) and Mapleton City. In 2006, the property was rezoned to PRC-4 (Planned Residential Community) through a citizen initiative, and a subsequent 2007 referendum to remove the TDR-R overlay passed the City Council but failed at the ballot. LD III argues the failed referendum preserved TDR-R status and that the Development Agreement created irrevocable vested rights. Mapleton City argues the 2006 PRC rezoning superseded the TDR-R overlay, the Development Agreement was replaced by subsequent legislative acts, and LD III''s claims are barred by the statute of limitations.',
    '{"court": "Fourth Judicial District Court", "judge": "James R. Taylor", "filed_year": 2017, "case_type_detail": "Land Use - Transferable Development Rights / Vested Rights", "appeal_court": "Utah Court of Appeals", "appeal_number": "20190090-CA"}',
    true,
    'defendant',
    'The District Court DENIED LD III''s Motion for Summary Judgment and GRANTED Mapleton City''s Cross-Motion for Summary Judgment (Dec 2018). The court found: (1) LD III''s claims were barred by the one-year statute of limitations under Utah Code § 78B-2-303 because the TDR-R overlay was effectively removed by the 2006 PRC-4 rezoning and the failed 2007 referendum, yet LD III did not file until 2017; (2) the 2003 Development Agreement''s TDR-R provisions were superseded by the subsequent 2006 PRC-4 rezoning, which LD III''s predecessor (M-53 Associates) voluntarily participated in; (3) the failed referendum did not preserve the TDR-R overlay because the referendum was on a separate ordinance to remove TDR-R, and the PRC rezoning had already replaced it; (4) LD III had no vested rights because vested rights require good-faith reliance on existing approvals, and LD III acquired the property through foreclosure years after the zoning changes. The Utah Court of Appeals (2020 UT App 41, 462 P.3d 816) AFFIRMED, holding that the Development Agreement did not create irrevocable vested rights in TDR-R status, the PRC rezoning was a valid legislative act that superseded the TDR-R overlay, and the statute of limitations barred the claims. Final outcome: Mapleton City prevailed at all levels.',
    false
  );

  -- ============================================================
  -- 2. INSERT AGENTS
  -- ============================================================

  -- Judge
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_judge_id, v_case_id, 'judge', 'Judge James R. Taylor',
   'You are Judge James R. Taylor of the Fourth Judicial District Court in Utah County, Utah. You are reviewing cross-motions for summary judgment in a land use dispute involving transferable development rights (TDR) and vested rights claims. You must evaluate whether a 2003 Development Agreement created irrevocable vested rights in a TDR-R overlay zone, whether subsequent legislative rezoning superseded those rights, and whether the petitioner''s claims are timely under the statute of limitations. You apply Utah land use law including LUDMA (Land Use Development and Management Act), vested rights doctrine, and statutory interpretation principles. You are methodical and focused on the procedural and jurisdictional threshold questions before reaching the merits.',
   0.6, true);

  -- Petitioner Attorney
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_plaintiff_id, v_case_id, 'plaintiff_attorney', 'Denver C. Snuffer, Jr. - Nelson, Snuffer, Dahle & Poulsen, P.C.',
   'You are Denver C. Snuffer, Jr., lead attorney for LD III, LLC. Your client purchased property at a trustee''s sale and claims the property retains TDR-R (Transferable Development Rights Receiving) overlay status with a vested right to develop 136 residential lots. You argue: (1) the 2003 Development Agreement between M-53 Associates and Mapleton City created binding contractual rights to TDR-R status that run with the land; (2) the 2007 referendum that would have removed TDR-R failed at the ballot box, demonstrating the citizens'' intent to preserve TDR-R; (3) the PRC-4 rezoning did not eliminate TDR-R because TDR-R is an overlay zone that exists independently of the base zoning district; (4) your client has vested rights under Utah Code § 10-9a-509 because the Development Agreement constitutes a government approval upon which investment-backed expectations were reasonably made; (5) Mapleton City is estopped from denying TDR-R status after accepting benefits under the Development Agreement for years.',
   0.7, true);

  -- Respondent Attorney
  INSERT INTO agents (id, case_id, role, name, persona_prompt, temperature, is_active) VALUES
  (v_agent_defense_id, v_case_id, 'defense_attorney', 'Eric Todd Johnson - Blaisdell, Church & Johnson, LLC',
   'You are Eric Todd Johnson, lead attorney for Mapleton City. You argue: (1) LD III''s petition is barred by the one-year statute of limitations under Utah Code § 78B-2-303 because the last possible triggering event was the failed November 2007 referendum, and LD III did not file until June 2017; (2) the 2003 Development Agreement was superseded by subsequent legislative actions, specifically the 2006 citizen-initiated PRC-4 rezoning that M-53 Associates voluntarily participated in and supported; (3) the TDR-R overlay was effectively replaced when the entire zoning scheme changed from A-2 with TDR-R overlay to PRC-4; (4) the failed referendum does not preserve TDR-R because the referendum addressed a separate ordinance, and the PRC rezoning had already changed the zoning framework; (5) LD III cannot claim vested rights because it acquired the property through foreclosure years after all zoning changes occurred and made no investment in reliance on TDR-R status; (6) the court lacks subject matter jurisdiction under Utah Code § 10-9a-801 because LD III failed to exhaust administrative remedies.',
   0.7, true);

  -- ============================================================
  -- 3. INSERT CASE FACTS (from pleadings - NO ruling information)
  -- ============================================================

  -- Undisputed Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'undisputed', 'In 2003, M-53 Associates and Mapleton City entered into a Development Agreement that established TDR-R (Transferable Development Rights Receiving) overlay zone status on approximately 152 acres of property in Mapleton City.', false, '["Development Agreement (2003)", "Mapleton City Code"]'),
  (v_case_id, 'undisputed', 'The TDR-R overlay zone allowed the property to receive transferred development rights and be developed with up to 136 residential lots at higher density than the underlying A-2 (Agricultural) zoning would permit.', false, '["Development Agreement", "Mapleton City Code § 17.32"]'),
  (v_case_id, 'undisputed', 'In 2006, a citizen initiative rezoned a large area of Mapleton City, including the subject property, from A-2 to PRC-4 (Planned Residential Community). M-53 Associates participated in and supported the PRC rezoning process.', false, '["Ordinance records", "PRC-4 rezoning documents"]'),
  (v_case_id, 'undisputed', 'In 2007, the Mapleton City Council passed an ordinance to remove the TDR-R overlay from the subject property. A referendum petition was filed, and the removal ordinance was placed on the November 2007 ballot. The referendum failed (citizens voted against removing TDR-R).', false, '["Referendum results", "City Council minutes"]'),
  (v_case_id, 'undisputed', 'LD III, LLC acquired the property through a trustee''s sale (foreclosure) in approximately 2013, years after both the 2006 PRC rezoning and the 2007 failed referendum.', false, '["Trustee''s Deed", "Foreclosure records"]'),
  (v_case_id, 'undisputed', 'LD III filed its Petition for Review of Land Use Decision in June 2017, approximately 10 years after the failed 2007 referendum and 11 years after the 2006 PRC rezoning.', false, '["Petition filing date"]'),
  (v_case_id, 'undisputed', 'Mapleton City has treated the property as PRC-4 zoned (not TDR-R) since the 2006 rezoning and has not approved any development applications under TDR-R for this property.', false, '["City zoning records"]'),
  (v_case_id, 'undisputed', 'The Mapleton City Code defines TDR-R as an overlay zone that operates in conjunction with an underlying base zone designation.', false, '["Mapleton City Code § 17.32"]');

  -- Disputed Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'disputed', 'LD III contends the TDR-R overlay survived the 2006 PRC rezoning because an overlay zone exists independently of the base zone. Mapleton City contends the PRC rezoning completely replaced the prior A-2 + TDR-R zoning framework.', true, '["Mapleton City Code § 17.32", "PRC-4 Ordinance"]'),
  (v_case_id, 'disputed', 'LD III argues the failed 2007 referendum is dispositive proof that TDR-R was preserved by the will of the voters. Mapleton City argues the referendum addressed only the separate removal ordinance, not whether TDR-R survived the PRC rezoning.', true, '["Referendum ballot language", "City Council Ordinance"]'),
  (v_case_id, 'disputed', 'LD III claims the 2003 Development Agreement created contractual vested rights in TDR-R status that run with the land and bind successor owners. Mapleton City argues the Development Agreement was superseded by subsequent legislative acts and does not create irrevocable rights.', true, '["Development Agreement (2003)", "Utah Code § 10-9a-509"]'),
  (v_case_id, 'disputed', 'Whether LD III''s claims are timely under the one-year statute of limitations in Utah Code § 78B-2-303, with LD III arguing the statute does not apply or was tolled, and Mapleton City arguing the last triggering event was the 2007 referendum failure.', true, '["Utah Code § 78B-2-303", "Utah Code § 10-9a-801"]');

  -- Evidence-based Facts
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'evidence_based', 'M-53 Associates, the original party to the Development Agreement, voluntarily participated in and supported the 2006 PRC rezoning of the property, suggesting acquiescence to replacement of the prior zoning framework.', false, '["PRC rezoning proceedings"]'),
  (v_case_id, 'evidence_based', 'The Mapleton City zoning map has shown the property as PRC-4 (without TDR-R overlay) since 2006, and no development applications under TDR-R have been filed or processed for this property.', false, '["City zoning maps", "Development application records"]'),
  (v_case_id, 'evidence_based', 'LD III acquired the property through foreclosure approximately 7 years after the TDR-R overlay was allegedly removed, and made no investment in reliance on TDR-R status prior to acquisition.', false, '["Trustee''s Deed", "Foreclosure timeline"]'),
  (v_case_id, 'evidence_based', 'The 2003 Development Agreement contained provisions specific to the A-2 zoning context and TDR receiving, but did not expressly address what would happen if the base zone were changed by legislative action.', false, '["Development Agreement text"]');

  -- Legal Arguments
  INSERT INTO case_facts (case_id, category, fact_text, is_disputed, supporting_evidence) VALUES
  (v_case_id, 'expert_opinion', 'LD III argues vested rights under Western Land Equities v. City of Logan (1980) and Utah Code § 10-9a-509, claiming the Development Agreement constitutes a government approval creating investment-backed expectations.', false, '["Western Land Equities v. City of Logan, 617 P.2d 388", "Utah Code § 10-9a-509"]'),
  (v_case_id, 'expert_opinion', 'Mapleton City argues the statute of limitations under § 78B-2-303 is jurisdictional, barring any claims filed more than one year after the land use decision, citing Krejci v. City of Saratoga Springs (2013 UT 74).', false, '["Utah Code § 78B-2-303", "Krejci v. City of Saratoga Springs, 2013 UT 74"]'),
  (v_case_id, 'expert_opinion', 'LD III cites the covenant doctrine under Utah Code § 25-5-1, arguing the Development Agreement is a recorded covenant running with the land that cannot be unilaterally extinguished by subsequent zoning.', false, '["Utah Code § 25-5-1", "Development Agreement recording"]'),
  (v_case_id, 'expert_opinion', 'Mapleton City argues that a municipality retains police power to rezone property through legislative action, and that a Development Agreement does not permanently divest a city of its zoning authority, citing Carter v. Lehi City (2012 UT 2).', false, '["Carter v. Lehi City, 2012 UT 2", "Municipal zoning police power"]');

  RAISE NOTICE 'Successfully seeded LD III LLC v. Mapleton City blind test case (ID: %)', v_case_id;

END $$;
