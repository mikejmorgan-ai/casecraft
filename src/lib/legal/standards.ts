/**
 * LEGAL STANDARDS LIBRARY - CaseBreak.ai Legal Analysis Platform
 *
 * Common legal standards, tests, and frameworks used in case analysis.
 * Each standard includes the elements to prove, burden of proof,
 * key cases establishing the standard, and practical application notes.
 *
 * LAST VERIFIED: February 2026
 */

// =============================================================================
// TYPES
// =============================================================================

export interface LegalStandard {
  id: string
  name: string
  description: string
  elements: string[]
  standard: string
  burden: string
  keyCases: {
    name: string
    citation: string
    holding: string
    relevance: string
  }[]
  practicalApplication: string
  jurisdiction: string
  category: string
}

// =============================================================================
// INJUNCTION STANDARDS
// =============================================================================

export const LEGAL_STANDARDS: Record<string, LegalStandard> = {
  // ===========================================================================
  // PRELIMINARY INJUNCTION
  // ===========================================================================
  injunction: {
    id: 'injunction',
    name: 'Preliminary Injunction',
    description:
      'An extraordinary remedy requiring the movant to demonstrate all four factors. Courts will not issue a preliminary injunction unless the movant carries its burden on each element.',
    elements: [
      'Likelihood of success on the merits: substantial likelihood that the movant will prevail on the underlying claim, or the case presents serious issues on the merits warranting further litigation',
      'Irreparable harm: the movant will suffer irreparable harm unless the injunction issues -- harm that cannot be adequately compensated by money damages',
      'Balance of equities: the threatened injury to the movant outweighs whatever damage the proposed injunction may cause to the restrained party',
      'Public interest: the injunction, if issued, would not be adverse to the public interest',
    ],
    standard: 'Clear showing on all four factors; injunction is an extraordinary remedy',
    burden:
      'Movant bears the burden of demonstrating all four factors. Failure on any single factor is generally fatal to the motion.',
    keyCases: [
      {
        name: 'System Concepts, Inc. v. Dixon',
        citation: '669 P.2d 421 (Utah 1983)',
        holding:
          'A preliminary injunction is an extraordinary remedy that should be granted only when the applicant clearly establishes all four factors.',
        relevance: 'Utah foundational case on preliminary injunction standard',
      },
      {
        name: 'IHC Health Services, Inc. v. D&K Management, Inc.',
        citation: '2008 UT 73',
        holding:
          'The standard requires the movant to show a substantial likelihood of success on the merits. All four factors must be evaluated.',
        relevance: 'Modern articulation of the Utah standard',
      },
      {
        name: 'Winter v. Natural Resources Defense Council',
        citation: '555 U.S. 7 (2008)',
        holding:
          'A plaintiff seeking a preliminary injunction must establish that he is likely to succeed on the merits, that he is likely to suffer irreparable harm, that the balance of equities tips in his favor, and that an injunction is in the public interest.',
        relevance: 'Federal standard frequently cited as persuasive authority in Utah courts',
      },
    ],
    practicalApplication: `STEP-BY-STEP ANALYSIS:

1. LIKELIHOOD OF SUCCESS: Does the movant have a viable legal theory?
   - Identify the cause of action and its elements
   - Evaluate the strength of evidence on each element
   - Consider any defenses that may defeat the claim
   - "Substantial likelihood" = more than possible, less than certain

2. IRREPARABLE HARM: Will the harm be uncompensable?
   - Money damages adequate? If so, no irreparable harm
   - Loss of unique property (minerals, vested rights) = often irreparable
   - Constitutional violations = often presumed irreparable
   - Speculative or hypothetical harm is insufficient

3. BALANCE OF EQUITIES: Weigh the competing harms
   - What happens to movant WITHOUT the injunction?
   - What happens to restrained party WITH the injunction?
   - Consider the relative hardship to each party
   - Status quo preservation is favored

4. PUBLIC INTEREST: Broader societal considerations
   - Enforcement of duly enacted statutes serves public interest
   - Compliance with constitutional requirements serves public interest
   - Consider community impacts, safety, and policy`,
    jurisdiction: 'Utah / Federal (persuasive)',
    category: 'equitable_relief',
  },

  // ===========================================================================
  // SUMMARY JUDGMENT
  // ===========================================================================
  summary_judgment: {
    id: 'summary_judgment',
    name: 'Summary Judgment',
    description:
      'A procedural mechanism for resolving claims or defenses without trial when there is no genuine dispute of material fact and the movant is entitled to judgment as a matter of law.',
    elements: [
      'No genuine dispute: there must be no genuine dispute as to any material fact',
      'Material fact: a fact that could affect the outcome under the applicable substantive law',
      'Entitled to judgment as a matter of law: even viewing facts in the light most favorable to the nonmoving party, the movant wins as a matter of law',
    ],
    standard: 'No genuine dispute of material fact; movant entitled to judgment as a matter of law',
    burden:
      'Moving party bears the initial burden of showing no genuine dispute. If met, the nonmoving party must then set forth specific facts showing a genuine issue for trial. Conclusory allegations are insufficient.',
    keyCases: [
      {
        name: 'Orvis v. Johnson',
        citation: '2008 UT 2',
        holding:
          'Summary judgment is appropriate only when the pleadings, depositions, and admissions on file, together with affidavits, show there is no genuine issue of material fact.',
        relevance: 'Definitive Utah summary judgment standard',
      },
      {
        name: 'Celotex Corp. v. Catrett',
        citation: '477 U.S. 317 (1986)',
        holding:
          'Moving party need not produce evidence negating the nonmoving party\'s claim; sufficient to point out the absence of evidence supporting the nonmoving party\'s case.',
        relevance: 'Persuasive federal authority on moving party burden',
      },
      {
        name: 'Anderson v. Liberty Lobby, Inc.',
        citation: '477 U.S. 242 (1986)',
        holding:
          'A material fact is one that might affect the outcome of the suit under the governing law. A dispute is genuine if the evidence is such that a reasonable jury could return a verdict for the nonmoving party.',
        relevance: 'Definition of "material fact" and "genuine dispute"',
      },
    ],
    practicalApplication: `STEP-BY-STEP ANALYSIS:

1. IDENTIFY THE LEGAL ELEMENTS: What must be proven to prevail on each claim/defense?

2. EVALUATE EACH ELEMENT FOR DISPUTED FACTS:
   - For each element, is there evidence in the record supporting both sides?
   - A "dispute" must be "genuine" -- not merely theoretical or based on speculation
   - A fact is "material" only if it could affect the outcome under applicable law

3. VIEW FACTS IN THE LIGHT MOST FAVORABLE TO NONMOVING PARTY:
   - All reasonable inferences drawn in favor of the nonmoving party
   - Do NOT weigh evidence or assess credibility
   - If reasonable minds could differ, summary judgment is inappropriate

4. APPLY THE LAW:
   - Even viewing all facts favorably to nonmoving party, does the law compel judgment?
   - Statutory interpretation = question of law suitable for summary judgment
   - Conclusive presumptions establish facts as a matter of law (e.g., vested mining use)

5. PARTIAL SUMMARY JUDGMENT: Consider whether some claims/defenses can be resolved even if others cannot`,
    jurisdiction: 'Utah',
    category: 'procedure',
  },

  // ===========================================================================
  // REGULATORY TAKING
  // ===========================================================================
  regulatory_taking: {
    id: 'regulatory_taking',
    name: 'Regulatory Taking',
    description:
      'Government regulation of private property that goes "too far" in diminishing the value or use of the property, requiring just compensation under the Fifth Amendment (applied to states via the Fourteenth Amendment) and Utah Constitution Article I, Section 22.',
    elements: [
      'Penn Central balancing test: (1) economic impact on the claimant, (2) extent of interference with distinct investment-backed expectations, (3) character of the governmental action',
      'Lucas total taking: regulation that denies ALL economically beneficial use of land is a per se taking (unless background principles of nuisance/property law already prohibited the use)',
      'Nollan/Dolan nexus and proportionality: for exactions -- (1) essential nexus between condition and legitimate state interest, (2) rough proportionality between condition and projected impact',
    ],
    standard:
      'Penn Central: ad hoc factual balancing of three factors. Lucas: per se taking when all economic value destroyed. Nollan/Dolan: heightened scrutiny for exactions.',
    burden:
      'Property owner bears the burden of proving a regulatory taking has occurred. For Penn Central, must show the regulation has gone "too far." For Lucas, must show ALL economically beneficial use has been denied. For Nollan/Dolan, government bears the burden of showing essential nexus and rough proportionality.',
    keyCases: [
      {
        name: 'Penn Central Transportation Co. v. New York City',
        citation: '438 U.S. 104 (1978)',
        holding:
          'Three-factor balancing test: (1) economic impact on claimant, (2) interference with investment-backed expectations, (3) character of governmental action. No single factor is dispositive.',
        relevance: 'Primary regulatory takings framework',
      },
      {
        name: 'Lucas v. South Carolina Coastal Council',
        citation: '505 U.S. 1003 (1992)',
        holding:
          'When regulation denies ALL economically beneficial use of land, it is a per se taking unless the proscribed use was not part of the owner\'s title to begin with.',
        relevance: 'Per se taking when total economic value destroyed',
      },
      {
        name: 'Nollan v. California Coastal Commission',
        citation: '483 U.S. 825 (1987)',
        holding:
          'Government conditions on development must have an "essential nexus" to a legitimate state interest.',
        relevance: 'First prong of exactions test',
      },
      {
        name: 'Dolan v. City of Tigard',
        citation: '512 U.S. 374 (1994)',
        holding:
          'Government conditions must bear "rough proportionality" to the projected impact of the proposed development.',
        relevance: 'Second prong of exactions test',
      },
      {
        name: 'Lingle v. Chevron U.S.A. Inc.',
        citation: '544 U.S. 528 (2005)',
        holding:
          'The "substantially advances" test from Agins is NOT a valid takings test. Penn Central and Lucas are the proper frameworks.',
        relevance: 'Clarification of valid takings tests',
      },
      {
        name: 'Bountiful City v. DeLuca',
        citation: '826 P.2d 170 (Utah 1992)',
        holding:
          'Regulation becomes a compensable taking if it deprives owner of a significant amount of economic value.',
        relevance: 'Utah-specific regulatory takings threshold',
      },
      {
        name: 'B.A.M. Development v. Salt Lake County',
        citation: '2006 UT 2',
        holding:
          'Utah adopted the Nollan/Dolan rough proportionality test for exactions. Requires essential nexus and individualized determination of proportionality.',
        relevance: 'Utah adoption of federal exactions framework',
      },
    ],
    practicalApplication: `THREE DISTINCT TESTS -- CHOOSE THE RIGHT ONE:

1. PENN CENTRAL BALANCING (most common):
   Factor 1 - ECONOMIC IMPACT: How much value has been lost?
   - Compare property value before and after regulation
   - Consider remaining economically viable use
   - Diminution in value alone is not dispositive

   Factor 2 - INVESTMENT-BACKED EXPECTATIONS: Did the owner reasonably rely?
   - Did the owner acquire the property knowing of the regulatory framework?
   - Were the expectations reasonable in light of existing regulation?
   - Distinct = separate, recognized property interest

   Factor 3 - CHARACTER OF GOVERNMENT ACTION: How did the government act?
   - Physical invasion = more likely a taking
   - Broadly applied regulation = less likely a taking
   - Targeted, selective enforcement = more concerning
   - Did government act in good faith?

2. LUCAS PER SE TAKING:
   - Was ALL economically beneficial use eliminated?
   - This is a very high bar -- almost never met if any use remains
   - Exception: background principles of nuisance/property law

3. NOLLAN/DOLAN (exactions only):
   - Is the government conditioning a permit on the owner giving something up?
   - Essential nexus: logical connection between condition and government interest
   - Rough proportionality: condition is proportional to project's actual impact
   - Government bears the burden

UTAH NOTE: Article I, Section 22 adds "or damaged" -- broader than federal Fifth Amendment.`,
    jurisdiction: 'Federal / Utah',
    category: 'constitutional',
  },

  // ===========================================================================
  // VESTED RIGHTS
  // ===========================================================================
  vested_rights: {
    id: 'vested_rights',
    name: 'Vested Rights (Utah Mining)',
    description:
      'Under Utah Code 17-41-501, a mining use is conclusively presumed to be a vested mining use if the mining use existed before a political subdivision prohibited, restricted, or otherwise limited the mining use. The statute creates the strongest form of legal protection -- a conclusive presumption that cannot be rebutted.',
    elements: [
      'Qualified mine operator: entity that on or before January 1, 2019 (a) owned/controlled/managed mining use under large mine permit AND (b) produced commercial quantities (or is successor/assign/affiliate/subsidiary/related parent company of such entity)',
      'Mining use existed before restriction: the mining use must have existed or been conducted BEFORE the political subdivision prohibited, restricted, or otherwise limited the mining use',
      'Conclusive presumption: if elements met, vesting is automatic and cannot be rebutted',
      'Runs with the land: vested mining use transfers automatically with property ownership',
      'Permit boundaries not limiting: present or future permit boundaries do not limit scope of vested rights',
    ],
    standard:
      'Conclusive presumption of vesting if mining use pre-dates restriction. Burden on challenger to prove by clear and convincing evidence that vesting has NOT been established.',
    burden:
      'Burden is on the CHALLENGER (typically the county), NOT the mine operator. The challenger must meet the "clear and convincing evidence" standard -- higher than preponderance of the evidence but lower than beyond a reasonable doubt. Given the conclusive presumption, this is an extremely difficult burden to meet.',
    keyCases: [
      {
        name: 'Gibbons & Reed Co. v. North Salt Lake City',
        citation: '431 P.2d 559 (Utah 1967)',
        holding:
          'Doctrine of diminishing assets: extractive businesses can expand beyond original boundaries because the resource itself diminishes. Utah\'s "solitary exception" to the general rule against expansion of nonconforming uses.',
        relevance: 'Common-law foundation for vested mining expansion rights',
      },
      {
        name: 'Western Land Equities, Inc. v. City of Logan',
        citation: '617 P.2d 388 (Utah 1980)',
        holding:
          'An applicant is entitled to favorable action if the application conforms to the zoning ordinance in effect at the time of the application.',
        relevance: 'Foundation of vested rights doctrine in Utah',
      },
      {
        name: 'Patterson v. American Fork City',
        citation: '2003 UT 7',
        holding:
          'The Vested Rights Rule is NOT based on constitutional or property rights, but estoppel -- detrimental reliance on a local zoning ordinance.',
        relevance:
          'Distinguishes common-law vested rights (estoppel-based) from statutory vested mining use (conclusive presumption)',
      },
      {
        name: 'Snake Creek Mining & Tunnel Co. v. Midway Irrigation Co.',
        citation: '260 U.S. 596 (1923)',
        holding:
          'Rights vested under existing law are not affected by subsequent legal changes.',
        relevance: 'Federal precedent supporting vested rights against retroactive legislation',
      },
    ],
    practicalApplication: `VESTED MINING USE ANALYSIS FRAMEWORK:

STEP 1: IS THERE A QUALIFIED MINE OPERATOR?
- Did the entity (or predecessor) hold a large mine permit on or before January 1, 2019?
- Did the entity (or predecessor) produce commercial quantities on or before January 1, 2019?
- If the current entity is a successor, assign, affiliate, subsidiary, or related parent company of a qualifying entity, it qualifies
- CRITICAL: "on or before January 1, 2019" is a ONE-TIME threshold, not an ongoing requirement

STEP 2: DID THE MINING USE PRE-DATE THE RESTRICTION?
- When did the mining use first exist or was conducted?
- When did the political subdivision first prohibit, restrict, or limit the mining use?
- Temporal sequence matters: mining use FIRST, then restriction

STEP 3: IF BOTH MET, VESTING IS CONCLUSIVE
- "Conclusively presumed" = strongest legal protection, cannot be rebutted
- Burden shifts to challenger to prove by clear and convincing evidence
- Runs with the land = automatic transfer to successors
- Permit boundaries do NOT limit scope of vested rights

STEP 4: CHECK FOR ABANDONMENT (17-41-503)
- Voluntary cessation of ALL mining use?
- Continuous inactivity for period set by ordinance (minimum 1 year)?
- Both conditions must be met -- gaps alone do not terminate vesting
- Existence of separate abandonment provision implies vesting is DURABLE`,
    jurisdiction: 'Utah',
    category: 'property_rights',
  },

  // ===========================================================================
  // PREEMPTION
  // ===========================================================================
  preemption: {
    id: 'preemption',
    name: 'State Preemption of Local Regulation',
    description:
      'The doctrine under which state law supersedes and invalidates conflicting local ordinances. Utah recognizes three types of preemption: express, field, and conflict. In the mining context, Utah Code 17-41-402 contains express preemption of local regulation of mining protection areas and critical infrastructure materials operations.',
    elements: [
      'Express preemption: the legislature explicitly states that local regulation is prohibited (e.g., "a political subdivision may not...")',
      'Field preemption: the legislature has comprehensively covered a field of regulation, leaving no room for local action',
      'Conflict preemption: the local ordinance directly conflicts with state law in a way that the two cannot coexist',
    ],
    standard:
      'For express preemption: the statute itself settles the issue. For field preemption: whether the legislature intended to blanket the field. For conflict preemption: whether the local and state provisions are "contradictory in the sense they cannot coexist."',
    burden:
      'The party asserting preemption bears the burden of demonstrating that state law preempts local regulation. However, where express preemption language exists ("may not"), the analysis is straightforward.',
    keyCases: [
      {
        name: 'State v. Hutchinson',
        citation: '624 P.2d 1116 (Utah 1980)',
        holding:
          'Utah rejected Dillon\'s Rule as "archaic." Preemption occurs when ordinance and statute "relate to a matter fully, exclusively covered by statute" and provisions are "contradictory in the sense they cannot coexist."',
        relevance: 'Establishes two-part preemption test for Utah',
      },
      {
        name: 'Price Development Co. v. Orem City',
        citation: '2000 UT 26',
        holding:
          'An ordinance is INVALID if it intrudes into an area which the Legislature has preempted by comprehensive legislation intended to blanket a particular field.',
        relevance: 'Field preemption framework',
      },
      {
        name: 'Provo City v. Ivie',
        citation: '2004 UT 30',
        holding:
          'Cities may ONLY exercise authority GRANTED by the Legislature. When state law says "may not," counties LACK AUTHORITY to act.',
        relevance: 'Express preemption through "may not" language',
      },
    ],
    practicalApplication: `PREEMPTION ANALYSIS FRAMEWORK:

1. CHECK FOR EXPRESS PREEMPTION FIRST:
   - Does the statute explicitly prohibit local regulation?
   - "May not" = mandatory prohibition
   - "Shall not" = mandatory prohibition
   - Example: 17-41-402(6): "A political subdivision may not adopt, enact, or amend an existing land use regulation... that would prohibit, restrict, regulate, or otherwise limit critical infrastructure materials operations"
   - If express preemption exists, local ordinance is VOID

2. IF NO EXPRESS PREEMPTION, CHECK FIELD PREEMPTION:
   - Has the legislature enacted a comprehensive scheme?
   - Does the scheme cover the entire field?
   - Would local regulation frustrate the legislative purpose?
   - Example: Utah mining law comprehensively covers vested mining rights, expansion, and protection

3. IF NO FIELD PREEMPTION, CHECK CONFLICT PREEMPTION:
   - Does the local ordinance directly conflict with the state statute?
   - Are the provisions "contradictory in the sense they cannot coexist"?
   - Can a person comply with both the state law and local ordinance simultaneously?

4. REMEDIES FOR PREEMPTED ORDINANCES:
   - Preempted ordinances are VOID -- they have no legal effect
   - Declaratory judgment is the appropriate remedy
   - Injunctive relief may be available to prevent enforcement
   - Government officials acting under void ordinance are acting ultra vires`,
    jurisdiction: 'Utah',
    category: 'constitutional',
  },

  // ===========================================================================
  // DECLARATORY JUDGMENT
  // ===========================================================================
  declaratory_judgment: {
    id: 'declaratory_judgment',
    name: 'Declaratory Judgment',
    description:
      'A court determination of the rights, status, or other legal relations of the parties. Authorized by Utah Code 78B-6-401 et seq. The declaration has the force of a final judgment but does not require that any wrong has already been committed.',
    elements: [
      'Justiciable controversy: an actual, present controversy between parties with adverse interests (not hypothetical or moot)',
      'Standing: the plaintiff must have a concrete and particularized interest in the outcome',
      'Ripeness: the issue must be sufficiently developed for judicial resolution',
      'Not moot: the controversy must still be alive and capable of resolution',
    ],
    standard:
      'The court has discretion to grant or deny declaratory relief. The court may refuse if the declaration would not terminate the uncertainty or controversy giving rise to the proceeding.',
    burden:
      'The party seeking declaratory judgment must establish that an actual controversy exists and that the declaration would resolve it.',
    keyCases: [
      {
        name: 'Salt Lake County v. Holliday Water Co.',
        citation: '2010 UT 45',
        holding:
          'Declaratory judgment is appropriate where there is an actual controversy over rights and legal relations.',
        relevance: 'Justiciability requirement for declaratory judgment',
      },
      {
        name: 'Jenkins v. Swan',
        citation: '675 P.2d 1145 (Utah 1983)',
        holding:
          'Declaratory judgment is appropriate when parties need authoritative resolution of a dispute about their legal rights.',
        relevance: 'Broad availability for property and zoning disputes',
      },
    ],
    practicalApplication: `WHEN TO SEEK DECLARATORY JUDGMENT:

1. PROPERTY RIGHTS DISPUTES:
   - Whether a vested mining use exists
   - Whether an ordinance is preempted by state law
   - Whether a property owner has a nonconforming use
   - The scope and extent of an easement or property right

2. STATUTORY INTERPRETATION:
   - The meaning and application of a statute to specific facts
   - Whether a statute applies retroactively
   - Which version of a recodified statute applies

3. CONSTITUTIONAL QUESTIONS:
   - Whether a regulation constitutes a taking
   - Whether due process was afforded
   - Whether local action exceeds constitutional authority

4. ADVANTAGES OVER OTHER REMEDIES:
   - Does not require that harm has already occurred
   - Resolves uncertainty prospectively
   - May be combined with injunctive relief
   - Has force of final judgment (res judicata, collateral estoppel)`,
    jurisdiction: 'Utah',
    category: 'procedure',
  },

  // ===========================================================================
  // DUE PROCESS IN LAND USE
  // ===========================================================================
  due_process_land_use: {
    id: 'due_process_land_use',
    name: 'Due Process in Land Use Decisions',
    description:
      'Procedural and substantive due process requirements for government action affecting property rights. Requires notice, hearing, neutral decision-maker, and articulated findings supported by evidence. Landmark case: Springville Citizens v. City of Springville (1999 UT 25).',
    elements: [
      'Adequate notice: property owner must receive sufficient notice of proposed government action',
      'Meaningful hearing: opportunity to be heard before a neutral, impartial decision-maker',
      'Articulated findings: decision must be based on written findings of fact',
      'Evidentiary support: findings must be supported by substantial evidence in the record',
      'Predetermined standards: decision must apply existing, predetermined criteria (not ad hoc)',
      'Absence of bias: decision-maker must be free from bias or predetermined outcome',
      'Compliance with own rules: government must follow its own ordinances and procedures',
    ],
    standard:
      'Government action affecting property rights must comport with due process. A decision is ILLEGAL if the government violated its own ordinances (Springville Citizens). A decision without written findings is ARBITRARY AND CAPRICIOUS (McElhaney v. City of Moab).',
    burden:
      'The party challenging the government action bears the initial burden of showing a due process violation. However, the government bears the burden of showing its decision was based on articulated findings supported by substantial evidence.',
    keyCases: [
      {
        name: 'Springville Citizens for a Better Community v. City of Springville',
        citation: '1999 UT 25',
        holding:
          'A land use decision is ILLEGAL if the city violated its own ordinances. "Shall" and "must" are ALWAYS mandatory. Cities are bound by terms of applicable zoning ordinances. Illegal decisions are NOT protected by the presumption of validity.',
        relevance:
          'Landmark case: government must follow its own rules or the decision is illegal',
      },
      {
        name: 'McElhaney v. City of Moab',
        citation: '2017 UT 65',
        holding:
          'Adjudicative land use decisions MUST include findings of fact. Without them, the decision is an "amorphous target" that is arbitrary and capricious.',
        relevance: 'Written findings are mandatory -- failure is a "fatal flaw"',
      },
      {
        name: 'Northern Monticello Alliance v. San Juan County',
        citation: '2022 UT App',
        holding:
          'Failure to make adequate written findings is a "fatal flaw." Ultra vires actions are VOID. Government cannot "arrogate to itself" authority not granted.',
        relevance: 'Reinforces finding requirement and limits on government authority',
      },
      {
        name: 'Mathews v. Eldridge',
        citation: '424 U.S. 319 (1976)',
        holding:
          'Due process requires weighing: (1) the private interest affected, (2) the risk of erroneous deprivation and value of additional safeguards, and (3) the government\'s interest.',
        relevance: 'Federal three-factor test for procedural due process',
      },
    ],
    practicalApplication: `DUE PROCESS CHECKLIST FOR LAND USE DECISIONS:

1. NOTICE: Was the property owner given adequate notice?
   [ ] Written notice of proposed action
   [ ] Notice described the nature of the proposed action
   [ ] Notice provided sufficient time to prepare a response
   [ ] Published notice (if required by ordinance)

2. HEARING: Was there a meaningful opportunity to be heard?
   [ ] Public hearing conducted
   [ ] Property owner allowed to present evidence
   [ ] Property owner allowed to cross-examine opposing witnesses
   [ ] Hearing conducted before the decision was made (not after)

3. DECISION-MAKER: Was the decision-maker neutral?
   [ ] No bias or predetermined outcome
   [ ] No ex parte communications about the case
   [ ] No financial interest in the outcome
   [ ] Decision-maker had authority to decide

4. FINDINGS: Were adequate findings made?
   [ ] Written findings of fact
   [ ] Findings address each element of the applicable standard
   [ ] Findings supported by substantial evidence in the record
   [ ] Findings explain the connection between evidence and conclusion

5. STANDARDS: Were predetermined standards applied?
   [ ] Decision based on existing ordinance criteria
   [ ] Not ad hoc or standardless
   [ ] Consistent with treatment of similar applications

6. COMPLIANCE: Did the government follow its own rules?
   [ ] All mandatory procedural steps completed
   [ ] "Shall" and "must" requirements satisfied
   [ ] No ultra vires action (acting beyond authority)

FAILURE ON ANY ELEMENT:
- Decision is ILLEGAL (Springville Citizens) if government violated own ordinances
- Decision is ARBITRARY AND CAPRICIOUS (McElhaney) if no written findings
- Decision is VOID (Northern Monticello) if ultra vires`,
    jurisdiction: 'Utah / Federal',
    category: 'constitutional',
  },

  // ===========================================================================
  // ARBITRARY AND CAPRICIOUS REVIEW
  // ===========================================================================
  arbitrary_and_capricious: {
    id: 'arbitrary_and_capricious',
    name: 'Arbitrary and Capricious Standard of Review',
    description:
      'The standard applied to administrative land use decisions under Utah Code 17-27a-801. A decision is arbitrary and capricious if it is not supported by substantial evidence in the record or if the decision-maker failed to make adequate findings of fact.',
    elements: [
      'Substantial evidence: evidence adequate to convince a reasonable mind -- more than a scintilla but less than preponderance',
      'Written findings: the decision must include articulated findings of fact',
      'Rational connection: findings must rationally connect the evidence to the conclusion',
      'Not arbitrary: decision must not be made on a whim, without reason, or based on impermissible factors',
      'Not capricious: decision must not be contrary to the evidence or an unreasonable exercise of judgment',
    ],
    standard:
      'A decision is arbitrary and capricious if it is not supported by substantial evidence in the record. Substantial evidence is a "quantum adequate to convince a reasonable mind" (Fox v. Park City).',
    burden:
      'The party challenging the decision bears the initial burden. However, the decision-maker must have made findings supported by substantial evidence. Absence of findings shifts the burden effectively to the government.',
    keyCases: [
      {
        name: 'Fox v. Park City',
        citation: '2008 UT 85',
        holding:
          'Review limited to "arbitrary, capricious, or illegal." Substantial evidence = quantum adequate to convince a reasonable mind.',
        relevance: 'Definitive articulation of review standard',
      },
      {
        name: 'McElhaney v. City of Moab',
        citation: '2017 UT 65',
        holding:
          'Without findings of fact, a decision is an "amorphous target" -- arbitrary and capricious as a matter of law.',
        relevance: 'No findings = arbitrary and capricious per se',
      },
      {
        name: 'Kilgore Companies v. Utah County Board of Adjustment',
        citation: '2019 UT App 20',
        holding:
          'Denial was arbitrary where findings did not address the specific request and its incremental impact.',
        relevance: 'Findings must address the actual application, not generic concerns',
      },
      {
        name: 'Staker v. Town of Springdale',
        citation: '2020 UT App 174',
        holding:
          'Public clamor alone cannot justify denial, but may be part of substantial evidence.',
        relevance: 'Neighborhood opposition alone is insufficient',
      },
    ],
    practicalApplication: `EVALUATING WHETHER A DECISION IS ARBITRARY AND CAPRICIOUS:

1. WERE FINDINGS OF FACT MADE?
   - If NO: decision is arbitrary and capricious as a matter of law (McElhaney)
   - If YES: proceed to evaluate the findings

2. DO THE FINDINGS ADDRESS THE RELEVANT CRITERIA?
   - Do findings address each element of the applicable standard?
   - Do findings address the specific request (not generic objections)?
   - Were impermissible factors excluded (e.g., neighborhood opposition alone)?

3. ARE THE FINDINGS SUPPORTED BY SUBSTANTIAL EVIDENCE?
   - Is there evidence in the record supporting each finding?
   - Would a reasonable mind find the evidence adequate?
   - Were all reasonable inferences drawn in favor of the decision?

4. IS THERE A RATIONAL CONNECTION?
   - Do the findings logically lead to the conclusion?
   - Is the reasoning explained (not conclusory)?
   - Are gaps in reasoning identified?`,
    jurisdiction: 'Utah',
    category: 'review_standards',
  },
}

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

/**
 * Get a legal standard by its ID.
 */
export function getLegalStandard(id: string): LegalStandard | undefined {
  return LEGAL_STANDARDS[id]
}

/**
 * Get all legal standards.
 */
export function getAllLegalStandards(): LegalStandard[] {
  return Object.values(LEGAL_STANDARDS)
}

/**
 * Get all legal standards in a category.
 */
export function getLegalStandardsByCategory(category: string): LegalStandard[] {
  return Object.values(LEGAL_STANDARDS).filter((s) => s.category === category)
}

/**
 * Search legal standards by keyword.
 */
export function searchLegalStandards(query: string): LegalStandard[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  return Object.values(LEGAL_STANDARDS).filter((standard) => {
    const searchText = [
      standard.name,
      standard.description,
      ...standard.elements,
      standard.standard,
      standard.practicalApplication,
      ...standard.keyCases.map((c) => `${c.name} ${c.citation} ${c.holding}`),
    ]
      .join(' ')
      .toLowerCase()

    return terms.every((term) => searchText.includes(term))
  })
}

/**
 * Get a context string for LLM prompts containing all standards.
 */
export function getLegalStandardsContext(): string {
  return Object.values(LEGAL_STANDARDS)
    .map(
      (s) => `### ${s.name}

${s.description}

ELEMENTS:
${s.elements.map((e, i) => `${i + 1}. ${e}`).join('\n')}

STANDARD: ${s.standard}

BURDEN: ${s.burden}

KEY CASES:
${s.keyCases.map((c) => `- ${c.name}, ${c.citation}: ${c.holding}`).join('\n')}
`
    )
    .join('\n---\n\n')
}
