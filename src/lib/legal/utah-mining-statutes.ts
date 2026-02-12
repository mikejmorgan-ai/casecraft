/**
 * UTAH MINING LAW - COMPREHENSIVE STATUTE REFERENCE
 *
 * This module contains the complete statutory framework for Utah vested mining rights,
 * preemption, and critical infrastructure materials operations.
 *
 * LAST VERIFIED: February 2026
 * SOURCES: Utah Legislature (le.utah.gov), Justia, FindLaw
 *
 * NOTE: Title 17 was recodified November 6, 2025. This file includes both
 * OLD section numbers (17-41-xxx) and NEW section numbers (17-81-xxx).
 */

// =============================================================================
// SECTION CROSSWALK (November 6, 2025 Recodification)
// =============================================================================

export const SECTION_CROSSWALK = {
  // Old Section -> New Section
  '17-41-101': '17-81-101',  // Definitions
  '17-41-402': '17-81-302',  // Limitations on local regulations
  '17-41-402.5': '17-81-303', // Limits on political subdivisions
  '17-41-501': '17-81-401',  // Vested mining use - Conclusive presumption
  '17-41-502': '17-81-402',  // Rights of mine operator
  '17-41-503': '17-81-403',  // Abandonment
} as const

// =============================================================================
// AMENDMENT TIMELINE
// =============================================================================

export const AMENDMENT_TIMELINE = [
  {
    effectiveDate: '2009-01-01',
    bill: 'Original',
    changes: 'Vested Mining Use statute created (Title 17, Chapter 41, Part 5)',
  },
  {
    effectiveDate: '2019-05-14',
    bill: 'HB288',
    changes: '"Mine operator" definition added with "on or before January 1, 2019" anchor date. Critical Infrastructure Materials Operations Act enacted.',
  },
  {
    effectiveDate: '2021-05-05',
    bill: 'HB0079',
    changes: 'Mineral/rock definition amendments',
  },
  {
    effectiveDate: '2024-05-01',
    bill: 'Chapter 70, 2024 General Session',
    changes: 'Mining protection area definitions updated',
  },
  {
    effectiveDate: '2025-11-06',
    bill: 'SB1006-1009',
    changes: 'Title 17 Recodification - ALL section numbers changed from 17-41-xxx to 17-81-xxx',
  },
] as const

// =============================================================================
// UTAH CODE § 17-41-101 / § 17-81-101 - DEFINITIONS
// =============================================================================

export const STATUTE_17_41_101 = {
  oldSection: '17-41-101',
  newSection: '17-81-101',
  title: 'Definitions',
  effectiveDate: '2024-05-01',

  definitions: {
    // Definition (13) - MINE OPERATOR
    mineOperator: {
      subsection: '(13)',
      text: `"Mine operator" means a natural person, corporation, association, partnership, receiver, trustee, executor, administrator, guardian, fiduciary, agent, or other organization or representative, either public or private, including a SUCCESSOR, ASSIGN, AFFILIATE, SUBSIDIARY, and RELATED PARENT COMPANY, that, ON OR BEFORE JANUARY 1, 2019:
(a) owns, controls, or manages a mining use under a large mine permit; AND
(b) has produced commercial quantities of a mineral deposit.`,
      criticalElements: [
        'Includes successors, assigns, affiliates, subsidiaries, related parent companies',
        'Temporal threshold: "on or before January 1, 2019"',
        'Requires BOTH: (a) large mine permit AND (b) commercial quantities produced',
        'Once threshold met, status is permanent - no continuous operation required',
      ],
      interpretation: `The "on or before January 1, 2019" language operates as a FINISH LINE, not an ongoing requirement. If at ANY point before that date the threshold was met (large mine permit + commercial quantities), the entity qualifies as a mine operator. The statute does NOT require continuous operations thereafter.`,
    },

    // Definition (26) - VESTED MINING USE
    vestedMiningUse: {
      subsection: '(26)',
      text: `"Vested mining use" means a mining use:
(a) by a mine operator; AND
(b) that existed or was conducted BEFORE a political subdivision prohibits, restricts, or otherwise limits the mining use.`,
      criticalElements: [
        'Requires a qualified "mine operator" (see definition 13)',
        'Mining use must PRE-DATE the political subdivision\'s restriction',
        'Temporal sequence is critical: mining use FIRST, then restriction',
      ],
    },

    // Definition - MINING PROTECTION AREA
    miningProtectionArea: {
      subsection: '(18)',
      text: `"Mining protection area" means land where a vested mining use occurs, including each surface or subsurface land or mineral estate that a mine operator with a vested mining use owns or controls.`,
    },

    // Definition - CRITICAL INFRASTRUCTURE MATERIALS
    criticalInfrastructureMaterials: {
      subsection: '(5)',
      text: `"Critical infrastructure materials" means sand, gravel, or rock aggregate.`,
      source: 'HB288 (2019)',
    },

    // Definition - LARGE MINE PERMIT
    largeMinePermit: {
      note: 'Defined by DOGM regulations',
      threshold: 'Mining > 5 acres OR affecting > 1,000 tons/year',
    },

    // Definition - COMMERCIAL QUANTITIES
    commercialQuantities: {
      note: 'Production for sale in the marketplace (not personal use)',
      evidence: 'DOGM production records, annual reports, sales documentation',
    },
  },
}

// =============================================================================
// UTAH CODE § 17-41-402 / § 17-81-302 - LIMITATIONS ON LOCAL REGULATIONS
// =============================================================================

export const STATUTE_17_41_402 = {
  oldSection: '17-41-402',
  newSection: '17-81-302',
  title: 'Limitations on local regulations',
  effectiveDate: '2024-05-01',

  fullText: `(1) A political subdivision within which an agriculture protection area, industrial protection area, or critical infrastructure materials protection area is created or with a mining protection area within its boundary shall encourage the continuity, development, and viability of agriculture use, industrial use, critical infrastructure materials operations, or mining use, within the relevant protection area by not enacting a local law, ordinance, or regulation that, unless the law, ordinance, or regulation bears a direct relationship to public health or safety, would unreasonably restrict the applicable uses.

(2) A political subdivision may not change the zoning designation of or a zoning regulation affecting land within an agriculture protection area unless the political subdivision receives written approval for the change from all the landowners within the agriculture protection area affected by the change.

(3) Except as provided by Section 19-4-113, a political subdivision may not change the zoning designation of or a zoning regulation affecting land within an industrial protection area unless the political subdivision receives written approval for the change from all the landowners within the industrial protection area affected by the change.

(4) A political subdivision may not change the zoning designation of or a zoning regulation affecting land within a critical infrastructure materials protection area unless the political subdivision receives written approval for the change from each critical infrastructure materials operator within the relevant area.

(5) A POLITICAL SUBDIVISION MAY NOT change the zoning designation of or a zoning regulation affecting land within a MINING PROTECTION AREA unless the political subdivision receives WRITTEN APPROVAL for the change from EACH MINE OPERATOR within the area.

(6) A political subdivision may not adopt, enact, or amend an existing land use regulation, ordinance, or regulation that would PROHIBIT, RESTRICT, REGULATE, or otherwise LIMIT critical infrastructure materials operations, including vested critical infrastructure materials operations.`,

  criticalProvisions: {
    subsection5: {
      text: 'A political subdivision may not change the zoning designation of or a zoning regulation affecting land within a mining protection area unless the political subdivision receives written approval for the change from each mine operator within the area.',
      effect: 'Counties CANNOT change zoning affecting mining protection areas without WRITTEN APPROVAL from each mine operator',
    },
    subsection6: {
      text: 'A political subdivision may not adopt, enact, or amend an existing land use regulation, ordinance, or regulation that would prohibit, restrict, regulate, or otherwise limit critical infrastructure materials operations.',
      effect: 'Express PREEMPTION of local regulation of sand/gravel/rock operations',
    },
  },

  preemptionLanguage: '"may not prohibit, restrict, regulate, or otherwise limit"',

  interpretation: `This statute creates EXPRESS PREEMPTION of county/municipal regulation of mining operations within mining protection areas. The language "may not" is mandatory and prohibitory. Any local ordinance that violates this section is VOID.`,
}

// =============================================================================
// UTAH CODE § 17-41-501 / § 17-81-401 - VESTED MINING USE
// =============================================================================

export const STATUTE_17_41_501 = {
  oldSection: '17-41-501',
  newSection: '17-81-401',
  title: 'Vested mining use -- Conclusive presumption',
  effectiveDate: '2024-05-01',

  fullText: `(1)(a) A mining use is CONCLUSIVELY PRESUMED to be a vested mining use if the mining use existed or was conducted or otherwise engaged in BEFORE a political subdivision prohibits, restricts, or otherwise limits the mining use.

(1)(b) Anyone claiming that a vested mining use has NOT been established has the BURDEN OF PROOF to show by CLEAR AND CONVINCING EVIDENCE that the vested mining use has not been established.

(2)(a) A vested mining use RUNS WITH THE LAND.

(2)(b) A vested mining use may be CHANGED TO ANOTHER MINING USE without losing its status as a vested mining use.

(3) The present or future boundary described in the large mine permit of a mine operator with a vested mining use does NOT LIMIT:
(a) the scope of the mine operator's rights under this chapter; or
(b) the protection that this chapter provides for a mining protection area.

(4)(a) A mine operator with a vested mining use shall file a declaration for recording in the office of the recorder of the county in which the vested mining use is located.

(4)(b) The declaration described in Subsection (4)(a) shall:
(i) contain a legal description of the land included within the vested mining use; and
(ii) provide notice of the vested mining use.`,

  criticalProvisions: {
    conclusivePresumption: {
      subsection: '(1)(a)',
      text: 'A mining use is CONCLUSIVELY PRESUMED to be a vested mining use if the mining use existed or was conducted or otherwise engaged in before a political subdivision prohibits, restricts, or otherwise limits the mining use.',
      effect: 'If mining use pre-dates zoning restriction, vesting is AUTOMATIC and CONCLUSIVE',
      legalSignificance: '"Conclusive presumption" = cannot be rebutted. This is the strongest form of legal presumption.',
    },
    burdenOfProof: {
      subsection: '(1)(b)',
      text: 'Anyone claiming that a vested mining use has NOT been established has the burden of proof to show by clear and convincing evidence that the vested mining use has not been established.',
      effect: 'Burden is on the CHALLENGER (usually the county), not the mine operator',
      standard: 'Clear and convincing evidence = higher than preponderance, lower than beyond reasonable doubt',
    },
    runsWithLand: {
      subsection: '(2)(a)',
      text: 'A vested mining use runs with the land.',
      effect: 'Vesting transfers AUTOMATICALLY with property ownership - no separate conveyance needed',
      legalSignificance: 'Like an easement appurtenant, the right attaches to the land itself, not to a particular owner',
    },
    changeOfUse: {
      subsection: '(2)(b)',
      text: 'A vested mining use may be changed to another mining use without losing its status as a vested mining use.',
      effect: 'Can switch from limestone to gravel extraction, etc., without losing vested status',
    },
    boundaryNotLimiting: {
      subsection: '(3)',
      text: 'The present or future boundary described in the large mine permit does not limit the scope of rights or protection.',
      effect: 'Vested rights can extend BEYOND the permitted boundary to all land the operator owns/controls',
    },
    recordingRequirement: {
      subsection: '(4)',
      text: 'Mine operator with a vested mining use shall file a declaration for recording.',
      effect: 'Provides constructive notice to world; strengthens legal position',
    },
  },

  interpretation: `This statute creates a POWERFUL protection for mining operations that pre-date local restrictions:
1. CONCLUSIVE presumption = strongest possible legal protection
2. BURDEN on challenger, not operator
3. RUNS WITH LAND = automatic transfer to successors
4. PERMIT BOUNDARIES don't limit vested rights
5. Recording requirement = constructive notice`,
}

// =============================================================================
// UTAH CODE § 17-41-502 / § 17-81-402 - RIGHTS OF MINE OPERATOR
// =============================================================================

export const STATUTE_17_41_502 = {
  oldSection: '17-41-502',
  newSection: '17-81-402',
  title: 'Rights of a mine operator with a vested mining use -- Expanding vested mining use',
  effectiveDate: '2024-05-01',

  fullText: `(1) Notwithstanding a political subdivision's prohibition, restriction, or other limitation on a mining use adopted AFTER the establishment of the mining use, the rights of a mine operator with a vested mining use include the rights to:
(a) PROGRESS, EXTEND, ENLARGE, GROW, or EXPAND the vested mining use to any surface or subsurface land or mineral estate that the mine operator owns or controls;
(b) engage in any activities incidental to the mining use; and
(c) sell a vested mining use or interest in a vested mining use.

(2) A mine operator with a vested mining use is PRESUMED to have a right to expand the vested mining use to new land.

(3)(a) Before expanding a vested mining use to new land, a mine operator shall provide written notice of the mine operator's intent.

(3)(b) The applicable legislative body shall hold a public meeting or hearing within 60 days.

(3)(c) After the public meeting or hearing, a mine operator may expand a vested mining use to new land without any action by an applicable legislative body unless there is CLEAR AND CONVINCING EVIDENCE in the record that the expansion does not qualify.`,

  criticalProvisions: {
    expansionRights: {
      subsection: '(1)(a)',
      text: 'Rights include the rights to progress, extend, enlarge, grow, or expand the vested mining use to any surface or subsurface land or mineral estate that the mine operator owns or controls.',
      effect: 'Vested operators can EXPAND operations despite local restrictions',
    },
    presumptionOfExpansion: {
      subsection: '(2)',
      text: 'A mine operator with a vested mining use is presumed to have a right to expand.',
      effect: 'Expansion is PRESUMED valid - burden on county to prove otherwise',
    },
    proceduralRequirement: {
      subsection: '(3)',
      text: 'Written notice, public meeting within 60 days, expansion allowed unless clear and convincing evidence against.',
      effect: 'Procedural hurdle only - not substantive approval requirement',
    },
  },
}

// =============================================================================
// UTAH CODE § 17-41-503 / § 17-81-403 - ABANDONMENT (Referenced)
// =============================================================================

export const STATUTE_17_41_503 = {
  oldSection: '17-41-503',
  newSection: '17-81-403',
  title: 'Abandonment',
  note: 'The existence of a SEPARATE abandonment provision implies that mere gaps in operations do NOT automatically terminate vested rights.',

  interpretation: `CRITICAL STATUTORY CONSTRUCTION: If the legislature intended gaps in operations to terminate vested rights, there would be no need for a separate abandonment statute. The existence of § 17-41-503/§ 17-81-403 implies that:
1. Vesting, once established, is DURABLE
2. Gaps in operations alone do NOT defeat vesting
3. Abandonment requires AFFIRMATIVE action or explicit statutory criteria
4. The "on or before January 1, 2019" threshold is a ONE-TIME test, not ongoing`,
}

// =============================================================================
// HB288 - CRITICAL INFRASTRUCTURE MATERIALS OPERATIONS ACT (2019)
// =============================================================================

export const HB288 = {
  bill: 'HB288',
  effectiveDate: '2019-05-14',
  sponsors: ['Rep. Logan Wilde (R-Croydon)', 'Sen. David Hinkins (R-Orangeville)'],
  title: 'Critical Infrastructure Materials Operations Act',

  summary: `HB288 shields existing sand, gravel, and rock operations from local regulation by:
1. Defining "critical infrastructure materials" as sand, gravel, rock aggregate
2. Adding "mine operator" definition with January 1, 2019 anchor date
3. Prohibiting local governments from restricting existing operations
4. Maintaining state DOGM/DEQ oversight`,

  keyProvisions: [
    'Deems sand, gravel, and rock as "critical infrastructure materials"',
    'Local governments may not prohibit, restrict, regulate, or limit critical infrastructure materials operations',
    'State DOGM and DEQ retain permitting authority',
    'Counties may issue conditional-use permits but cannot deny based on existence of operation',
    'Protects "vested critical infrastructure materials operations"',
  ],

  legislativeIntent: `The legislature found that sand, gravel, and rock aggregate are essential to Utah's economic growth and infrastructure development. The Act reflects legislative judgment that state-level regulation is preferable to patchwork local restrictions.`,

  sourceLinks: [
    'https://le.utah.gov/~2019/bills/static/HB0288.html',
    'https://genevarock.com/news/house-bill-288-critical-infrastructure-materials/',
    'https://www.breatheutah.org/legislation/item/167-hb-288-critical-infrastructure-materials',
  ],
}

// =============================================================================
// KEY UTAH CASE LAW - VESTED MINING RIGHTS
// =============================================================================

export const UTAH_MINING_CASE_LAW = {
  gibbonsReed: {
    citation: 'Gibbons & Reed Co. v. North Salt Lake City, 431 P.2d 559 (Utah 1967)',
    holding: 'Established "doctrine of diminishing assets" - legal nonconforming extractive uses can expand beyond original physical boundaries because the resource itself diminishes.',
    relevance: 'Foundation case for vested extractive industry rights in Utah',
    doctrine: 'Nonconforming gravel pits have different expansion rights than typical nonconforming uses',
  },
  jordanJensen: {
    citation: 'Jordan v. Jensen, 2017 UT 1',
    holding: 'Mineral rights owners have vested property rights that cannot be defeated without due process.',
    relevance: 'Constitutional protection for mineral rights',
  },
  snakeCreek: {
    citation: 'Snake Creek Mining & Tunnel Co. v. Midway Irrigation Co., 260 U.S. 596 (1923)',
    holding: 'Rights vested under existing law are not affected by subsequent legal changes.',
    relevance: 'Federal precedent on vested rights doctrine (retroactivity)',
  },
  draperGeneva: {
    citation: 'Draper City v. Geneva Rock Products (ongoing - Third District Court)',
    status: 'Pending litigation testing HB288 and vested rights under § 17-41-501',
    relevance: 'Will likely provide guidance on "successor" status and expansion rights',
  },
}

// =============================================================================
// JUDGE TRAINING: VESTED MINING USE ANALYSIS FRAMEWORK
// =============================================================================

export const VESTED_MINING_ANALYSIS_FRAMEWORK = {
  step1: {
    title: 'DOES A MINING USE EXIST THAT PRE-DATES ZONING?',
    legalStandard: 'Mining use must have existed BEFORE the political subdivision enacted restrictions',
    evidence: [
      'Historical mining records',
      'DOGM permit files',
      'Production reports',
      'Property records showing mining operations',
      'Aerial photographs',
      'Corporate records',
    ],
  },
  step2: {
    title: 'IS THERE A QUALIFIED "MINE OPERATOR"?',
    legalStandard: 'Per § 17-41-101(13): Must have (a) large mine permit AND (b) commercial quantities — ON OR BEFORE JANUARY 1, 2019, or be a SUCCESSOR to such entity',
    elements: [
      'Large mine permit existed (DOGM records)',
      'Commercial quantities produced (production records)',
      'Threshold met at ANY point before January 1, 2019',
      'Current owner is successor to qualifying entity',
    ],
    criticalNote: 'Continuous operations NOT required - "on or before" is a one-time threshold',
  },
  step3: {
    title: 'IS THERE A VESTED MINING USE?',
    legalStandard: 'Vested mining use = mining use by a mine operator that existed BEFORE restriction',
    statutorySupport: [
      '§ 17-41-501(1)(a): "conclusively presumed" if mining use pre-dates restriction',
      '§ 17-41-501(2)(a): Vested mining use "runs with the land"',
      '§ 17-41-501(1)(b): Burden on challenger to prove by clear and convincing evidence',
    ],
  },
  step4: {
    title: 'SUCCESSION AND TRANSFER',
    legalStandard: '"Successor" in definition means successor IS a mine operator. Vested mining use runs with land.',
    analysis: [
      'Chain of title from original mine operator to current owner',
      'Recorded declarations of vested mining use',
      '"Runs with the land" = automatic transfer, no separate conveyance needed',
    ],
  },
}

// =============================================================================
// EXPORT FOR USE IN PROMPTS
// =============================================================================

export function getUtahMiningLawContext(): string {
  return `
## UTAH MINING LAW - STATUTORY FRAMEWORK

### § 17-41-101(13) - "MINE OPERATOR" DEFINITION
${STATUTE_17_41_101.definitions.mineOperator.text}

CRITICAL: The "on or before January 1, 2019" language is a ONE-TIME threshold. Once met, status is permanent. Continuous operations are NOT required.

### § 17-41-402 - PREEMPTION OF LOCAL REGULATION
Key provision: "A political subdivision may not change the zoning designation of or a zoning regulation affecting land within a mining protection area unless the political subdivision receives written approval for the change from each mine operator within the area."

For critical infrastructure materials: Counties "may not adopt, enact, or amend an existing land use regulation, ordinance, or regulation that would prohibit, restrict, regulate, or otherwise limit critical infrastructure materials operations."

### § 17-41-501 - VESTED MINING USE
${STATUTE_17_41_501.fullText}

CRITICAL PROVISIONS:
1. "CONCLUSIVELY PRESUMED" = strongest legal protection, cannot be rebutted
2. Burden on CHALLENGER to prove by clear and convincing evidence
3. "RUNS WITH THE LAND" = automatic transfer to successors
4. Permit boundaries do NOT limit vested rights

### § 17-41-502 - RIGHTS OF MINE OPERATOR
Mine operators with vested mining use have rights to "progress, extend, enlarge, grow, or expand" to any land they own or control, NOTWITHSTANDING local restrictions adopted after vesting.

### STATUTORY CONSTRUCTION
The existence of a SEPARATE abandonment provision (§ 17-41-503) implies that gaps in operations do NOT automatically terminate vested rights. If gaps terminated vesting, no abandonment statute would be needed.

### SECTION CROSSWALK (Nov 6, 2025 Recodification)
- § 17-41-101 → § 17-81-101 (Definitions)
- § 17-41-402 → § 17-81-302 (Preemption)
- § 17-41-501 → § 17-81-401 (Vested mining use)
- § 17-41-502 → § 17-81-402 (Rights of mine operator)
- § 17-41-503 → § 17-81-403 (Abandonment)
`
}
