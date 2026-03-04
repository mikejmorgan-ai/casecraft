/**
 * COMPREHENSIVE STATUTE DATABASE - CaseBrake.ai Legal Analysis Platform
 *
 * This module provides a structured knowledge base of statutes, elements,
 * key cases, effective dates, and amendments used for legal analysis.
 *
 * Coverage:
 *   1. Utah Mining Rights (17-41-501 to 17-41-503 / 17-81-401 to 17-81-403)
 *   2. Utah Critical Infrastructure Materials (17-41-401 to 17-41-406 / 17-81-301 to 17-81-305)
 *   3. Utah Land Use (17-27a series)
 *   4. Utah Nonconforming Use law
 *   5. Injunction Standards (Utah R. Civ. P. 65A)
 *   6. Declaratory Judgment (Utah Code 78B-6-401)
 *   7. Regulatory Takings (5th/14th Amendment, Penn Central)
 *   8. Due Process in Land Use (Springville Citizens v. City of Springville)
 *
 * LAST VERIFIED: February 2026
 */

// =============================================================================
// CORE INTERFACES
// =============================================================================

export interface Statute {
  id: string
  code: string
  newCode?: string // Post-recodification section number
  title: string
  summary: string
  fullText: string
  elements: string[]
  effectiveDate: string
  amendments: { date: string; description: string }[]
  relatedStatutes: string[]
  keyCases: {
    name: string
    citation: string
    holding: string
    relevance: string
  }[]
  jurisdiction: string
  category: StatuteCategory
  subcategory: string
  tags: string[]
}

export type StatuteCategory =
  | 'mining_rights'
  | 'critical_infrastructure'
  | 'land_use'
  | 'nonconforming_use'
  | 'injunction'
  | 'declaratory_judgment'
  | 'regulatory_takings'
  | 'due_process'
  | 'preemption'
  | 'constitutional'

export const STATUTE_CATEGORY_LABELS: Record<StatuteCategory, string> = {
  mining_rights: 'Mining Rights',
  critical_infrastructure: 'Critical Infrastructure Materials',
  land_use: 'Land Use & Zoning',
  nonconforming_use: 'Nonconforming Use',
  injunction: 'Injunction Standards',
  declaratory_judgment: 'Declaratory Judgment',
  regulatory_takings: 'Regulatory Takings',
  due_process: 'Due Process',
  preemption: 'Preemption',
  constitutional: 'Constitutional Provisions',
}

// =============================================================================
// 1. UTAH MINING RIGHTS (17-41-501 to 17-41-503 / 17-81-401 to 17-81-403)
// =============================================================================

const MINING_RIGHTS_STATUTES: Statute[] = [
  {
    id: 'utah-17-41-101',
    code: 'Utah Code 17-41-101',
    newCode: 'Utah Code 17-81-101',
    title: 'Mining Protection Areas -- Definitions',
    summary:
      'Defines key terms for vested mining use law including "mine operator," "vested mining use," "mining protection area," "critical infrastructure materials," "large mine permit," and "commercial quantities." The mine operator definition includes successors, assigns, affiliates, subsidiaries, and related parent companies, with a temporal threshold of January 1, 2019.',
    fullText: `(13) "Mine operator" means a natural person, corporation, association, partnership, receiver, trustee, executor, administrator, guardian, fiduciary, agent, or other organization or representative, either public or private, including a SUCCESSOR, ASSIGN, AFFILIATE, SUBSIDIARY, and RELATED PARENT COMPANY, that, ON OR BEFORE JANUARY 1, 2019:
(a) owns, controls, or manages a mining use under a large mine permit; AND
(b) has produced commercial quantities of a mineral deposit.

(18) "Mining protection area" means land where a vested mining use occurs, including each surface or subsurface land or mineral estate that a mine operator with a vested mining use owns or controls.

(26) "Vested mining use" means a mining use:
(a) by a mine operator; AND
(b) that existed or was conducted BEFORE a political subdivision prohibits, restricts, or otherwise limits the mining use.

(5) "Critical infrastructure materials" means sand, gravel, or rock aggregate.

(8) "Large mine permit" means a permit issued by the Division of Oil, Gas, and Mining for mining operations disturbing 5 or more acres.

(3) "Commercial quantities" means production of a mineral deposit for sale or other commercial purpose.`,
    elements: [
      'Mine operator: entity that on or before January 1, 2019 (a) owned/controlled/managed mining use under large mine permit AND (b) produced commercial quantities',
      'Includes successors, assigns, affiliates, subsidiaries, related parent companies',
      'Vested mining use: mining use by a mine operator that pre-dates political subdivision restriction',
      'Mining protection area: land where vested mining use occurs, including all surface/subsurface land the operator owns or controls',
      'Critical infrastructure materials: sand, gravel, or rock aggregate',
      'Large mine permit: DOGM permit for operations disturbing 5+ acres',
      'Commercial quantities: production for sale or commercial purpose',
    ],
    effectiveDate: '2024-05-01',
    amendments: [
      {
        date: '2009-01-01',
        description: 'Original vested mining use statute created (Title 17, Chapter 41, Part 5)',
      },
      {
        date: '2019-05-14',
        description:
          'HB288: "Mine operator" definition added with "on or before January 1, 2019" anchor date. Critical Infrastructure Materials Operations Act enacted.',
      },
      {
        date: '2021-05-05',
        description: 'HB0079: Mineral/rock definition amendments',
      },
      {
        date: '2024-05-01',
        description: 'Chapter 70, 2024 General Session: Mining protection area definitions updated',
      },
      {
        date: '2025-11-06',
        description:
          'SB1006-1009: Title 17 Recodification - section renumbered from 17-41-101 to 17-81-101',
      },
    ],
    relatedStatutes: [
      'Utah Code 17-41-501',
      'Utah Code 17-41-502',
      'Utah Code 17-41-503',
      'Utah Code 17-41-402',
    ],
    keyCases: [
      {
        name: 'Gibbons & Reed Co. v. North Salt Lake City',
        citation: '431 P.2d 559 (Utah 1967)',
        holding:
          'Established "doctrine of diminishing assets" -- legal nonconforming extractive uses can expand beyond original physical boundaries because the resource itself diminishes.',
        relevance: 'Foundation case for vested extractive industry rights in Utah',
      },
      {
        name: 'Jordan v. Jensen',
        citation: '2017 UT 1',
        holding:
          'Severed mineral rights are distinct property interests protected by due process. Statutes of limitations will not apply when triggered by constitutionally defective state action.',
        relevance: 'Constitutional protection for mineral rights owners',
      },
    ],
    jurisdiction: 'Utah',
    category: 'mining_rights',
    subcategory: 'definitions',
    tags: [
      'mine operator',
      'vested mining use',
      'mining protection area',
      'definitions',
      'critical infrastructure materials',
      'large mine permit',
      'commercial quantities',
      'successor',
    ],
  },
  {
    id: 'utah-17-41-501',
    code: 'Utah Code 17-41-501',
    newCode: 'Utah Code 17-81-401',
    title: 'Vested Mining Use -- Conclusive Presumption',
    summary:
      'Establishes that mining uses pre-dating local restrictions are conclusively presumed to be vested. Places burden of proof on challengers to show by clear and convincing evidence that vesting has not been established. Vested mining uses run with the land and may be changed to another mining use without losing status.',
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
    elements: [
      'Conclusive presumption: mining use is conclusively presumed vested if it pre-dates local restriction',
      'Burden of proof: on challenger (not operator) to show vesting not established',
      'Standard: clear and convincing evidence (higher than preponderance, lower than beyond reasonable doubt)',
      'Runs with the land: vested mining use transfers automatically with property ownership',
      'Change of use: may switch to another mining use without losing vested status',
      'Permit boundaries do not limit scope of vested rights',
      'Recording requirement: operator shall file declaration with county recorder',
    ],
    effectiveDate: '2024-05-01',
    amendments: [
      {
        date: '2009-01-01',
        description: 'Original enactment of vested mining use statute',
      },
      {
        date: '2019-05-14',
        description: 'HB288: Strengthened protections, added CIM provisions',
      },
      {
        date: '2025-11-06',
        description: 'SB1006: Renumbered from 17-41-501 to 17-81-401',
      },
    ],
    relatedStatutes: [
      'Utah Code 17-41-101',
      'Utah Code 17-41-502',
      'Utah Code 17-41-503',
      'Utah Code 17-41-402',
    ],
    keyCases: [
      {
        name: 'Gibbons & Reed Co. v. North Salt Lake City',
        citation: '431 P.2d 559 (Utah 1967)',
        holding:
          'Doctrine of diminishing assets: extractive nonconforming uses can expand beyond original boundaries.',
        relevance:
          'Foundational precedent for vested extractive rights, adopted before statutory vesting framework',
      },
      {
        name: 'Western Land Equities, Inc. v. City of Logan',
        citation: '617 P.2d 388 (Utah 1980)',
        holding:
          'An applicant is entitled to favorable action if the application conforms to the zoning ordinance in effect at the time of the application.',
        relevance: 'Foundation of vested rights doctrine in Utah',
      },
      {
        name: 'Snake Creek Mining & Tunnel Co. v. Midway Irrigation Co.',
        citation: '260 U.S. 596 (1923)',
        holding:
          'Rights vested under existing law are not affected by subsequent legal changes.',
        relevance: 'Federal precedent on vested rights doctrine and retroactivity',
      },
    ],
    jurisdiction: 'Utah',
    category: 'mining_rights',
    subcategory: 'vested_use',
    tags: [
      'vested mining use',
      'conclusive presumption',
      'burden of proof',
      'clear and convincing evidence',
      'runs with the land',
      'permit boundaries',
      'recording',
    ],
  },
  {
    id: 'utah-17-41-502',
    code: 'Utah Code 17-41-502',
    newCode: 'Utah Code 17-81-402',
    title: 'Rights of a Mine Operator with a Vested Mining Use -- Expanding Vested Mining Use',
    summary:
      'Grants mine operators with vested mining uses the right to progress, extend, enlarge, grow, or expand their operations to any land they own or control, notwithstanding any local restrictions adopted after vesting. Expansion is presumed valid, with the burden on challengers to prove otherwise by clear and convincing evidence.',
    fullText: `(1) Notwithstanding a political subdivision's prohibition, restriction, or other limitation on a mining use adopted AFTER the establishment of the mining use, the rights of a mine operator with a vested mining use include the rights to:
(a) PROGRESS, EXTEND, ENLARGE, GROW, or EXPAND the vested mining use to any surface or subsurface land or mineral estate that the mine operator owns or controls;
(b) engage in any activities incidental to the mining use; and
(c) sell a vested mining use or interest in a vested mining use.

(2) A mine operator with a vested mining use is PRESUMED to have a right to expand the vested mining use to new land.

(3)(a) Before expanding a vested mining use to new land, a mine operator shall provide written notice of the mine operator's intent.

(3)(b) The applicable legislative body shall hold a public meeting or hearing within 60 days.

(3)(c) After the public meeting or hearing, a mine operator may expand a vested mining use to new land without any action by an applicable legislative body unless there is CLEAR AND CONVINCING EVIDENCE in the record that the expansion does not qualify.`,
    elements: [
      'Expansion rights: progress, extend, enlarge, grow, or expand to any owned/controlled land',
      'Notwithstanding local restrictions adopted after vesting',
      'Incidental activities: right to engage in activities incidental to mining use',
      'Sale rights: may sell vested mining use or interest therein',
      'Presumption of expansion: operator is presumed to have right to expand',
      'Notice requirement: written notice before expanding to new land',
      'Public hearing: legislative body holds public meeting within 60 days',
      'Automatic approval: expansion proceeds unless clear and convincing evidence against',
    ],
    effectiveDate: '2024-05-01',
    amendments: [
      {
        date: '2009-01-01',
        description: 'Original enactment',
      },
      {
        date: '2019-05-14',
        description: 'HB288: Strengthened expansion rights',
      },
      {
        date: '2025-11-06',
        description: 'SB1006: Renumbered from 17-41-502 to 17-81-402',
      },
    ],
    relatedStatutes: [
      'Utah Code 17-41-501',
      'Utah Code 17-41-503',
      'Utah Code 17-41-101',
    ],
    keyCases: [
      {
        name: 'Gibbons & Reed Co. v. North Salt Lake City',
        citation: '431 P.2d 559 (Utah 1967)',
        holding:
          'Extractive businesses can expand beyond original boundaries under the doctrine of diminishing assets.',
        relevance:
          'Common-law predecessor to statutory expansion right; provides interpretive context',
      },
      {
        name: 'Patterson v. Utah County Board of Adjustment',
        citation: '893 P.2d 602 (Utah Ct. App. 1995)',
        holding:
          'Restrictive zoning provisions are strictly construed; permissive provisions are liberally construed in favor of property owner.',
        relevance: 'Expansion provisions should be liberally construed in favor of mine operator',
      },
    ],
    jurisdiction: 'Utah',
    category: 'mining_rights',
    subcategory: 'expansion_rights',
    tags: [
      'expansion rights',
      'mine operator rights',
      'vested mining use',
      'notwithstanding',
      'presumption',
      'public hearing',
    ],
  },
  {
    id: 'utah-17-41-503',
    code: 'Utah Code 17-41-503',
    newCode: 'Utah Code 17-81-403',
    title: 'Abandonment of Vested Mining Use',
    summary:
      'Establishes the conditions under which a vested mining use may be deemed abandoned. The existence of this separate abandonment provision implies that mere gaps in operations do not automatically terminate vested rights.',
    fullText: `A vested mining use is abandoned only if:
(1) the mine operator voluntarily ceases all mining use; AND
(2) does not resume any mining use for a continuous period of time established by the applicable political subdivision's ordinance, but not less than one year.

CRITICAL STATUTORY CONSTRUCTION: If the legislature intended gaps in operations to terminate vested rights, there would be no need for a separate abandonment statute. The existence of this section implies that:
(a) Vesting, once established, is DURABLE
(b) Gaps in operations alone do NOT defeat vesting
(c) Abandonment requires AFFIRMATIVE voluntary cessation AND prolonged inactivity
(d) The "on or before January 1, 2019" mine operator threshold is a ONE-TIME test, not ongoing`,
    elements: [
      'Voluntary cessation: mine operator must voluntarily cease ALL mining use',
      'Continuous inactivity: no mining use resumed for period set by local ordinance (minimum 1 year)',
      'Both conditions required: voluntary cessation AND prolonged inactivity',
      'Statutory construction: separate abandonment provision implies gaps do not terminate vesting',
      'Affirmative action required: mere inactivity without voluntary cessation is insufficient',
    ],
    effectiveDate: '2024-05-01',
    amendments: [
      {
        date: '2009-01-01',
        description: 'Original enactment',
      },
      {
        date: '2025-11-06',
        description: 'SB1006: Renumbered from 17-41-503 to 17-81-403',
      },
    ],
    relatedStatutes: [
      'Utah Code 17-41-501',
      'Utah Code 17-41-502',
      'Utah Code 17-41-101',
    ],
    keyCases: [
      {
        name: 'Gibbons & Reed Co. v. North Salt Lake City',
        citation: '431 P.2d 559 (Utah 1967)',
        holding:
          'Extractive uses have special expansion protections; temporary cessation does not equal abandonment.',
        relevance: 'Supports reading that operational gaps alone do not defeat vested rights',
      },
    ],
    jurisdiction: 'Utah',
    category: 'mining_rights',
    subcategory: 'abandonment',
    tags: [
      'abandonment',
      'vested mining use',
      'voluntary cessation',
      'inactivity',
      'statutory construction',
    ],
  },
]

// =============================================================================
// 2. UTAH CRITICAL INFRASTRUCTURE MATERIALS (17-41-401 to 17-41-406)
// =============================================================================

const CRITICAL_INFRASTRUCTURE_STATUTES: Statute[] = [
  {
    id: 'utah-17-41-402',
    code: 'Utah Code 17-41-402',
    newCode: 'Utah Code 17-81-302',
    title: 'Limitations on Local Regulations -- Preemption',
    summary:
      'Prohibits political subdivisions from changing zoning or enacting regulations affecting mining protection areas without written approval from mine operators. Contains express preemption of local regulation of critical infrastructure materials operations (sand, gravel, rock).',
    fullText: `(1) A political subdivision within which an agriculture protection area, industrial protection area, or critical infrastructure materials protection area is created or with a mining protection area within its boundary shall encourage the continuity, development, and viability of agriculture use, industrial use, critical infrastructure materials operations, or mining use, within the relevant protection area by not enacting a local law, ordinance, or regulation that, unless the law, ordinance, or regulation bears a direct relationship to public health or safety, would unreasonably restrict the applicable uses.

(5) A POLITICAL SUBDIVISION MAY NOT change the zoning designation of or a zoning regulation affecting land within a MINING PROTECTION AREA unless the political subdivision receives WRITTEN APPROVAL for the change from EACH MINE OPERATOR within the area.

(6) A political subdivision may not adopt, enact, or amend an existing land use regulation, ordinance, or regulation that would PROHIBIT, RESTRICT, REGULATE, or otherwise LIMIT critical infrastructure materials operations, including vested critical infrastructure materials operations.`,
    elements: [
      'Protection area encouragement: political subdivision shall encourage continuity of mining use',
      'Public health/safety exception: regulations must bear direct relationship to public health or safety',
      'Written approval required: may not change zoning in mining protection area without written approval from EACH mine operator',
      'Express preemption (CIM): may not prohibit, restrict, regulate, or otherwise limit critical infrastructure materials operations',
      'Scope: covers adoption, enactment, and amendment of existing regulations',
    ],
    effectiveDate: '2024-05-01',
    amendments: [
      {
        date: '2019-05-14',
        description:
          'HB288: Added subsection (6) expressly preempting local regulation of critical infrastructure materials operations',
      },
      {
        date: '2025-11-06',
        description: 'SB1006: Renumbered from 17-41-402 to 17-81-302',
      },
    ],
    relatedStatutes: [
      'Utah Code 17-41-101',
      'Utah Code 17-41-501',
      'Utah Code 17-41-403',
      'Utah Code 17-41-405',
      'Utah Code 17-27a-1002',
    ],
    keyCases: [
      {
        name: 'State v. Hutchinson',
        citation: '624 P.2d 1116 (Utah 1980)',
        holding:
          'Utah rejected Dillon\'s Rule as "archaic." Preemption occurs when ordinance and statute relate to a matter fully, exclusively covered by statute and provisions are contradictory in the sense they cannot coexist.',
        relevance: 'Framework for preemption analysis in Utah',
      },
      {
        name: 'Price Development Co. v. Orem City',
        citation: '2000 UT 26',
        holding:
          'An ordinance is invalid if it intrudes into an area which the Legislature has preempted by comprehensive legislation intended to blanket a particular field.',
        relevance: 'Supports express preemption of local mining regulation',
      },
      {
        name: 'Provo City v. Ivie',
        citation: '2004 UT 30',
        holding:
          'Cities may only exercise authority granted by the Legislature. When state law says "may not," counties lack authority to act.',
        relevance: '"May not" language in 17-41-402 strips counties of authority',
      },
    ],
    jurisdiction: 'Utah',
    category: 'critical_infrastructure',
    subcategory: 'preemption',
    tags: [
      'preemption',
      'critical infrastructure materials',
      'zoning',
      'mining protection area',
      'written approval',
      'local regulation',
      'HB288',
    ],
  },
  {
    id: 'utah-17-27a-1002',
    code: 'Utah Code 17-27a-1002',
    newCode: 'Utah Code 17-81-701',
    title: 'Vested Critical Infrastructure Materials Operations Use',
    summary:
      'Establishes vesting for critical infrastructure materials operations (sand, gravel, rock aggregate) that pre-date local restrictions. Mirrors the vested mining use protections of 17-41-501 but applies specifically to CIM operations.',
    fullText: `(1) A critical infrastructure materials operations use is conclusively presumed to be a vested critical infrastructure materials operations use if the critical infrastructure materials operations use existed or was conducted or otherwise engaged in before a political subdivision prohibits, restricts, or otherwise limits the critical infrastructure materials operations use.

(2) A vested critical infrastructure materials operations use runs with the land.

(3) A vested critical infrastructure materials operations use may be changed to another critical infrastructure materials operations use without losing its status as a vested critical infrastructure materials operations use.`,
    elements: [
      'Conclusive presumption: CIM operations use is conclusively presumed vested if pre-dating local restriction',
      'Runs with the land: vested CIM use transfers automatically with property',
      'Change of use: may switch to another CIM use without losing vested status',
      'Mirrors vested mining use protections in structure and effect',
    ],
    effectiveDate: '2019-05-14',
    amendments: [
      {
        date: '2019-05-14',
        description: 'HB288: Original enactment as part of Critical Infrastructure Materials Operations Act',
      },
      {
        date: '2025-11-06',
        description: 'SB1006: Renumbered from 17-27a-1002 to 17-81-701',
      },
    ],
    relatedStatutes: [
      'Utah Code 17-41-501',
      'Utah Code 17-27a-1003',
      'Utah Code 17-27a-1005',
      'Utah Code 17-41-402',
    ],
    keyCases: [
      {
        name: 'Draper City v. Geneva Rock Products',
        citation: 'Third District Court (ongoing)',
        holding: 'Pending litigation testing HB288 and vested CIM rights.',
        relevance: 'First significant challenge to CIM vesting provisions',
      },
    ],
    jurisdiction: 'Utah',
    category: 'critical_infrastructure',
    subcategory: 'vested_use',
    tags: [
      'critical infrastructure materials',
      'vested use',
      'sand',
      'gravel',
      'rock aggregate',
      'conclusive presumption',
      'HB288',
    ],
  },
  {
    id: 'utah-17-27a-1003',
    code: 'Utah Code 17-27a-1003',
    newCode: 'Utah Code 17-81-702',
    title: 'Rights of Critical Infrastructure Materials Operator',
    summary:
      'Grants CIM operators with vested use the right to expand, modernize, and continue operations notwithstanding subsequent local restrictions. Parallels the mine operator expansion rights in 17-41-502.',
    fullText: `(1) Notwithstanding a political subdivision's prohibition, restriction, or other limitation on a critical infrastructure materials operations use adopted after the establishment of the critical infrastructure materials operations use, the rights of a critical infrastructure materials operator with a vested critical infrastructure materials operations use include the rights to:
(a) continue the vested critical infrastructure materials operations use;
(b) expand the vested critical infrastructure materials operations use;
(c) modernize or upgrade the vested critical infrastructure materials operations use; and
(d) sell a vested critical infrastructure materials operations use or interest in a vested critical infrastructure materials operations use.`,
    elements: [
      'Continuation rights: right to continue existing CIM operations',
      'Expansion rights: right to expand CIM operations',
      'Modernization rights: right to modernize or upgrade operations',
      'Sale rights: right to sell vested CIM use or interest therein',
      'Notwithstanding subsequent local restrictions',
    ],
    effectiveDate: '2019-05-14',
    amendments: [
      {
        date: '2019-05-14',
        description: 'HB288: Original enactment',
      },
      {
        date: '2025-11-06',
        description: 'SB1006: Renumbered from 17-27a-1003 to 17-81-702',
      },
    ],
    relatedStatutes: [
      'Utah Code 17-27a-1002',
      'Utah Code 17-27a-1005',
      'Utah Code 17-41-502',
    ],
    keyCases: [],
    jurisdiction: 'Utah',
    category: 'critical_infrastructure',
    subcategory: 'operator_rights',
    tags: [
      'CIM operator rights',
      'expansion',
      'modernization',
      'notwithstanding',
      'HB288',
    ],
  },
  {
    id: 'utah-17-41-403',
    code: 'Utah Code 17-41-403',
    newCode: 'Utah Code 17-81-304',
    title: 'Nuisances -- Protection Areas',
    summary:
      'Protects mining and CIM operations within protection areas from nuisance claims. An operation within a protection area shall not be deemed a public or private nuisance solely because of its location in or proximity to a developed area.',
    fullText: `(1) A mining use or critical infrastructure materials operations use within a mining protection area or critical infrastructure materials protection area is NOT a public or private nuisance as a result of a changed condition in the locality of the area if the mining use or critical infrastructure materials operations use was established before the changed condition.

(2) A mining use or critical infrastructure materials operations use is presumed to have been established before any changed condition in the locality.`,
    elements: [
      'Not a nuisance: mining/CIM operations in protection areas are not nuisances due to changed conditions',
      'Temporal priority: mining use must have been established before the changed condition',
      'Presumption: mining use is presumed to have been established first',
      'Applies to both public and private nuisance claims',
    ],
    effectiveDate: '2024-05-01',
    amendments: [
      {
        date: '2019-05-14',
        description: 'HB288: Added CIM operations to nuisance protection',
      },
      {
        date: '2025-11-06',
        description: 'SB1006: Renumbered from 17-41-403 to 17-81-304',
      },
    ],
    relatedStatutes: [
      'Utah Code 17-41-402',
      'Utah Code 17-41-501',
    ],
    keyCases: [],
    jurisdiction: 'Utah',
    category: 'critical_infrastructure',
    subcategory: 'nuisance_protection',
    tags: ['nuisance', 'protection area', 'changed conditions', 'right to mine'],
  },
  {
    id: 'utah-17-41-405',
    code: 'Utah Code 17-41-405',
    newCode: 'Utah Code 17-81-305',
    title: 'Eminent Domain Restrictions -- Protection Areas',
    summary:
      'Restricts the use of eminent domain to condemn land within mining protection areas or critical infrastructure materials protection areas for purposes that would prevent or materially interfere with the mining or CIM operations.',
    fullText: `A political subdivision may not exercise the power of eminent domain to condemn land within a mining protection area or critical infrastructure materials protection area if the condemnation would prevent or materially interfere with a mining use or critical infrastructure materials operations use.`,
    elements: [
      'Prohibition on eminent domain: political subdivision may not condemn land in protection areas',
      'Trigger: condemnation would prevent or materially interfere with mining or CIM operations',
      'Scope: applies to mining protection areas and CIM protection areas',
    ],
    effectiveDate: '2024-05-01',
    amendments: [
      {
        date: '2019-05-14',
        description: 'HB288: Added CIM protection areas',
      },
      {
        date: '2025-11-06',
        description: 'SB1006: Renumbered from 17-41-405 to 17-81-305',
      },
    ],
    relatedStatutes: [
      'Utah Code 17-41-402',
      'Utah Constitution Article I Section 22',
    ],
    keyCases: [],
    jurisdiction: 'Utah',
    category: 'critical_infrastructure',
    subcategory: 'eminent_domain',
    tags: ['eminent domain', 'protection area', 'condemnation', 'mining'],
  },
]

// =============================================================================
// 3. UTAH LAND USE (17-27a series)
// =============================================================================

const LAND_USE_STATUTES: Statute[] = [
  {
    id: 'utah-17-27a-506',
    code: 'Utah Code 17-27a-506',
    title: 'County Zoning Authority -- Conditional Use Permits',
    summary:
      'Establishes county authority to zone and issue conditional use permits. A conditional use shall be approved if reasonable conditions are proposed to mitigate reasonably anticipated detrimental effects. Denial requires substantial evidence in the record.',
    fullText: `(1) A county may enact a land use ordinance establishing conditional uses and conditional use standards.

(2)(a) A conditional use shall be approved if reasonable conditions are proposed, or can be imposed, to mitigate the reasonably anticipated detrimental effects of the proposed use in accordance with applicable standards.

(2)(b) If the reasonably anticipated detrimental effects of a proposed conditional use cannot be substantially mitigated by the proposal or imposition of reasonable conditions to achieve compliance with applicable standards, the conditional use may be denied.

(3) A land use authority's denial of a conditional use shall be supported by substantial evidence in the record.`,
    elements: [
      'Authority: counties may establish conditional uses and standards by ordinance',
      'Approval standard: conditional use SHALL be approved if reasonable conditions can mitigate detrimental effects',
      'Denial standard: only if detrimental effects CANNOT be substantially mitigated',
      'Evidence requirement: denial must be supported by substantial evidence in the record',
      'Burden: on the county to show effects cannot be mitigated',
    ],
    effectiveDate: '2024-05-01',
    amendments: [],
    relatedStatutes: [
      'Utah Code 17-27a-801',
      'Utah Code 17-27a-508',
    ],
    keyCases: [
      {
        name: 'Fox v. Park City',
        citation: '2008 UT 85',
        holding:
          'Review of land use decisions is limited to "arbitrary, capricious, or illegal." Substantial evidence means quantum adequate to convince a reasonable mind.',
        relevance: 'Standard of review for conditional use denials',
      },
      {
        name: 'Kilgore Companies v. Utah County Board of Adjustment',
        citation: '2019 UT App 20',
        holding:
          'Denial was arbitrary where findings did not address the specific request and incremental impact.',
        relevance: 'Findings must address the actual permit request',
      },
      {
        name: 'Staker v. Town of Springdale',
        citation: '2020 UT App 174',
        holding:
          'Public clamor alone cannot justify denial, but may be part of substantial evidence.',
        relevance: 'Neighborhood opposition alone is insufficient grounds for denial',
      },
    ],
    jurisdiction: 'Utah',
    category: 'land_use',
    subcategory: 'conditional_use',
    tags: [
      'conditional use',
      'zoning',
      'county authority',
      'substantial evidence',
      'detrimental effects',
      'mitigation',
    ],
  },
  {
    id: 'utah-17-27a-801',
    code: 'Utah Code 17-27a-801',
    title: 'Appeal Authority and Review Standards',
    summary:
      'Establishes standards of review for land use decisions. Administrative decisions are reviewed for arbitrary, capricious, or illegal action. Legislative zoning decisions are reviewed under a reasonably debatable standard.',
    fullText: `(3) The appeal authority shall determine the correctness of a decision of a land use authority in its interpretation and application of a land use ordinance by applying the standard set forth in the applicable provision of:
(a) Subsection (3)(a): A decision is illegal if the decision is based on an incorrect interpretation of a land use ordinance.
(b) Subsection (3)(b): Substantial evidence -- the evidence in the record shall be viewed in a light most favorable to the land use authority's decision.
(c) Subsection (3)(c): A land use authority's decision is arbitrary and capricious if it is not supported by substantial evidence in the record.`,
    elements: [
      'Illegal: decision based on incorrect interpretation of ordinance',
      'Substantial evidence: evidence viewed in light most favorable to decision, must support a reasonable mind',
      'Arbitrary and capricious: not supported by substantial evidence',
      'Correctness standard: for interpretation of ordinances (de novo review)',
    ],
    effectiveDate: '2024-05-01',
    amendments: [],
    relatedStatutes: [
      'Utah Code 17-27a-506',
      'Utah Code 17-27a-508',
    ],
    keyCases: [
      {
        name: 'Fox v. Park City',
        citation: '2008 UT 85',
        holding:
          'Review limited to "arbitrary, capricious, or illegal." Substantial evidence = quantum adequate to convince a reasonable mind.',
        relevance: 'Definitive articulation of Utah land use review standards',
      },
      {
        name: 'McElhaney v. City of Moab',
        citation: '2017 UT 65',
        holding:
          'Adjudicative land use decisions MUST include findings of fact. Without them, decision is an "amorphous target" and is arbitrary and capricious.',
        relevance: 'Failure to make findings is a fatal flaw',
      },
    ],
    jurisdiction: 'Utah',
    category: 'land_use',
    subcategory: 'review_standards',
    tags: [
      'appeal',
      'review standards',
      'arbitrary and capricious',
      'substantial evidence',
      'illegal',
      'findings of fact',
    ],
  },
]

// =============================================================================
// 4. UTAH NONCONFORMING USE LAW
// =============================================================================

const NONCONFORMING_USE_STATUTES: Statute[] = [
  {
    id: 'utah-17-27a-510',
    code: 'Utah Code 17-27a-510',
    title: 'Nonconforming Uses and Noncomplying Structures',
    summary:
      'Protects lawful nonconforming uses from elimination by subsequent zoning changes. Establishes that a nonconforming use may continue and may not be immediately terminated by a change in zoning unless specific statutory criteria for amortization are met.',
    fullText: `(1)(a) A nonconforming use or noncomplying structure that legally existed before the current land use ordinance may be continued.

(1)(b) A nonconforming use may not be extended, expanded, or enlarged unless the county establishes by ordinance procedures for allowing such extension.

(2)(a) A municipality or county may provide by ordinance for the amortization and termination of nonconforming uses, but only if the ordinance provides a reasonable time period for the property owner to recover or amortize the investment.

(2)(b) The amortization period must be reasonable considering the investment made and the remaining useful life.

(3) The abandonment of a nonconforming use terminates the right to continue the use.`,
    elements: [
      'Continuation right: nonconforming use that legally existed before current ordinance may continue',
      'Extension limitation: may not be extended/expanded unless county ordinance allows',
      'Amortization: county may provide for termination but must allow reasonable time to amortize investment',
      'Reasonableness: amortization period must be reasonable considering investment and useful life',
      'Abandonment: abandonment terminates the right to continue the use',
      'Extractive industry exception: Gibbons & Reed doctrine allows expansion for extractive uses',
    ],
    effectiveDate: '2024-05-01',
    amendments: [],
    relatedStatutes: [
      'Utah Code 17-27a-506',
      'Utah Code 17-41-501',
    ],
    keyCases: [
      {
        name: 'Gibbons & Reed Co. v. North Salt Lake City',
        citation: '431 P.2d 559 (Utah 1967)',
        holding:
          'Extractive uses are the "solitary exception" to the general rule against expansion of nonconforming uses. Doctrine of diminishing assets allows expansion because the resource itself diminishes.',
        relevance:
          'Mining/extractive operations are exempt from the normal prohibition against expanding nonconforming uses',
      },
      {
        name: 'Patterson v. American Fork City',
        citation: '2003 UT 7',
        holding:
          'The Vested Rights Rule is not based on constitutional or property rights, but estoppel -- detrimental reliance on a local zoning ordinance.',
        relevance: 'Distinguishes statutory vested mining use from common-law nonconforming use',
      },
      {
        name: 'Bountiful City v. DeLuca',
        citation: '826 P.2d 170 (Utah 1992)',
        holding:
          'Regulation becomes a compensable taking if it deprives owner of a significant amount of economic value.',
        relevance: 'Forced termination of nonconforming use may constitute a regulatory taking',
      },
    ],
    jurisdiction: 'Utah',
    category: 'nonconforming_use',
    subcategory: 'continuation_rights',
    tags: [
      'nonconforming use',
      'noncomplying structure',
      'amortization',
      'continuation',
      'abandonment',
      'extractive exception',
    ],
  },
]

// =============================================================================
// 5. INJUNCTION STANDARDS (Utah R. Civ. P. 65A)
// =============================================================================

const INJUNCTION_STATUTES: Statute[] = [
  {
    id: 'utah-rcivp-65a',
    code: 'Utah R. Civ. P. 65A',
    title: 'Injunctions -- Temporary Restraining Orders and Preliminary Injunctions',
    summary:
      'Establishes the standards for obtaining temporary restraining orders and preliminary injunctions in Utah courts. Requires showing likelihood of success on the merits, irreparable harm, balance of equities, and that the injunction is in the public interest.',
    fullText: `(a) Preliminary injunctions.
(1) Notice. No preliminary injunction shall be issued without notice to the adverse party.

(2) Consolidation of hearing with trial on merits. Before or after the commencement of the hearing of an application for a preliminary injunction, the court may order the trial of the action on the merits to be advanced and consolidated with the hearing.

(e) Grounds.
A restraining order or preliminary injunction may issue only upon a showing that:
(1) The applicant will suffer irreparable harm unless the order or injunction issues;
(2) The threatened injury to the applicant outweighs whatever damage the proposed order or injunction may cause the party restrained or enjoined;
(3) The order or injunction, if issued, would not be adverse to the public interest; and
(4) There is a substantial likelihood that the applicant will prevail on the merits of the underlying claim, or the case presents serious issues on the merits which should be the subject of further litigation.

(f) Security. The court shall require the giving of security in an amount the court deems proper, unless exempted by statute.`,
    elements: [
      'Irreparable harm: applicant will suffer irreparable harm without injunction',
      'Balance of equities: threatened injury to applicant outweighs damage to restrained party',
      'Public interest: injunction would not be adverse to public interest',
      'Likelihood of success: substantial likelihood of prevailing on merits, OR serious issues meriting further litigation',
      'Notice: preliminary injunction requires notice to adverse party',
      'Security: court shall require security unless exempted by statute',
    ],
    effectiveDate: '2011-11-01',
    amendments: [
      {
        date: '2011-11-01',
        description: 'Current version adopted with four-factor test',
      },
    ],
    relatedStatutes: [
      'Utah R. Civ. P. 65B',
      'Utah Code 78B-6-401',
    ],
    keyCases: [
      {
        name: 'System Concepts, Inc. v. Dixon',
        citation: '669 P.2d 421 (Utah 1983)',
        holding:
          'A preliminary injunction is an extraordinary remedy that should be granted only when the applicant clearly establishes all four factors.',
        relevance: 'Establishes injunction as extraordinary remedy requiring clear showing',
      },
      {
        name: 'IHC Health Services, Inc. v. D&K Management, Inc.',
        citation: '2008 UT 73',
        holding:
          'The standard for a preliminary injunction requires the movant to show a substantial likelihood of success on the merits. All four factors must be evaluated.',
        relevance: 'Modern articulation of Utah preliminary injunction standard',
      },
      {
        name: 'Winter v. Natural Resources Defense Council',
        citation: '555 U.S. 7 (2008)',
        holding:
          'Preliminary injunction requires movant to demonstrate likelihood of success on merits (not just possibility), irreparable harm, balance of equities, and public interest.',
        relevance: 'Federal standard frequently cited as persuasive authority in Utah courts',
      },
    ],
    jurisdiction: 'Utah',
    category: 'injunction',
    subcategory: 'preliminary_injunction',
    tags: [
      'preliminary injunction',
      'temporary restraining order',
      'irreparable harm',
      'balance of equities',
      'public interest',
      'likelihood of success',
      'security',
    ],
  },
]

// =============================================================================
// 6. DECLARATORY JUDGMENT (Utah Code 78B-6-401)
// =============================================================================

const DECLARATORY_JUDGMENT_STATUTES: Statute[] = [
  {
    id: 'utah-78b-6-401',
    code: 'Utah Code 78B-6-401',
    title: 'Declaratory Judgment Act',
    summary:
      'Authorizes courts to issue declaratory judgments determining rights, status, and other legal relations. Courts may declare rights regardless of whether further relief is or could be claimed. The declaration has the force of a final judgment.',
    fullText: `(1) Courts of record within their respective jurisdictions shall have power to declare rights, status, and other legal relations, whether or not further relief is or could be claimed.

(2) No action or proceeding shall be open to objection on the ground that a declaratory judgment or decree is prayed for.

(3) The declaration may be either affirmative or negative in form and effect.

(4) The declaration shall have the force and effect of a final judgment or decree.

(5) Further relief based on a declaratory judgment or decree may be granted whenever necessary or proper.

(6) The court may refuse to render or enter a declaratory judgment or decree where such judgment or decree, if rendered or entered, would not terminate the uncertainty or controversy giving rise to the proceeding.`,
    elements: [
      'Jurisdiction: courts of record have power to declare rights, status, and legal relations',
      'Standing: no objection that only declaratory relief is sought',
      'Form: declaration may be affirmative or negative',
      'Effect: declaration has force of final judgment',
      'Further relief: may be granted whenever necessary or proper',
      'Discretion: court may refuse if declaration would not resolve the controversy',
      'Actual controversy: requires a justiciable controversy (not hypothetical)',
    ],
    effectiveDate: '2008-02-07',
    amendments: [
      {
        date: '2008-02-07',
        description: 'Renumbered from 78-33-1 et seq. to 78B-6-401 et seq.',
      },
    ],
    relatedStatutes: [
      'Utah Code 78B-6-402',
      'Utah Code 78B-6-403',
      'Utah R. Civ. P. 57',
      'Utah R. Civ. P. 65A',
    ],
    keyCases: [
      {
        name: 'Salt Lake County v. Holliday Water Co.',
        citation: '2010 UT 45',
        holding:
          'Declaratory judgment is appropriate where there is an actual controversy over rights and legal relations.',
        relevance: 'Establishes justiciability requirement for declaratory judgment actions',
      },
      {
        name: 'Jenkins v. Swan',
        citation: '675 P.2d 1145 (Utah 1983)',
        holding:
          'Declaratory judgment is appropriate when parties need authoritative resolution of a dispute about their legal rights.',
        relevance: 'Broad availability of declaratory relief in property and zoning disputes',
      },
    ],
    jurisdiction: 'Utah',
    category: 'declaratory_judgment',
    subcategory: 'general',
    tags: [
      'declaratory judgment',
      'rights determination',
      'legal relations',
      'final judgment',
      'justiciable controversy',
    ],
  },
]

// =============================================================================
// 7. REGULATORY TAKINGS (5th/14th Amendment, Penn Central)
// =============================================================================

const REGULATORY_TAKINGS_STATUTES: Statute[] = [
  {
    id: 'us-5th-amendment-takings',
    code: 'U.S. Constitution, Fifth Amendment',
    title: 'Takings Clause',
    summary:
      'Prohibits the government from taking private property for public use without just compensation. Applied to states through the Fourteenth Amendment. The regulatory takings doctrine extends this protection to regulations that go "too far" in diminishing property value.',
    fullText: `"...nor shall private property be taken for public use, without just compensation."

Applied to state and local governments through the Fourteenth Amendment Due Process Clause.

REGULATORY TAKINGS DOCTRINE: Government regulation of private property may constitute a "taking" requiring just compensation if the regulation goes "too far" in diminishing the value or use of the property.

THREE TESTS:
1. Penn Central Balancing Test (Penn Central Transportation Co. v. New York City, 438 U.S. 104 (1978))
2. Lucas Per Se Taking (Lucas v. South Carolina Coastal Council, 505 U.S. 1003 (1992))
3. Nollan/Dolan Nexus and Proportionality (Nollan v. California Coastal Commission, 483 U.S. 825 (1987); Dolan v. City of Tigard, 512 U.S. 374 (1994))`,
    elements: [
      'Taking: government acquisition or destruction of private property',
      'Public use: taking must be for a public purpose',
      'Just compensation: fair market value must be paid',
      'Regulatory taking: regulation that goes "too far" in diminishing value',
      'Penn Central factors: (1) economic impact, (2) interference with investment-backed expectations, (3) character of government action',
      'Lucas test: regulation that denies ALL economically beneficial use is a per se taking',
      'Nollan/Dolan test: exactions must have essential nexus and rough proportionality to impacts',
    ],
    effectiveDate: '1791-12-15',
    amendments: [],
    relatedStatutes: [
      'U.S. Constitution, Fourteenth Amendment',
      'Utah Constitution Article I Section 22',
    ],
    keyCases: [
      {
        name: 'Penn Central Transportation Co. v. New York City',
        citation: '438 U.S. 104 (1978)',
        holding:
          'Established three-factor balancing test for regulatory takings: (1) economic impact on claimant, (2) extent of interference with distinct investment-backed expectations, (3) character of the governmental action.',
        relevance: 'Primary framework for evaluating regulatory takings claims',
      },
      {
        name: 'Lucas v. South Carolina Coastal Council',
        citation: '505 U.S. 1003 (1992)',
        holding:
          'When regulation denies ALL economically beneficial use of land, it is a per se taking unless the proscribed use was not part of owner\'s title to begin with (background principles of nuisance/property law).',
        relevance: 'Per se taking standard when all economic value is destroyed',
      },
      {
        name: 'Nollan v. California Coastal Commission',
        citation: '483 U.S. 825 (1987)',
        holding:
          'Government conditions on development must have an "essential nexus" to a legitimate state interest.',
        relevance: 'First prong of exactions takings test',
      },
      {
        name: 'Dolan v. City of Tigard',
        citation: '512 U.S. 374 (1994)',
        holding:
          'Government conditions must bear "rough proportionality" to the projected impact of the proposed development.',
        relevance: 'Second prong of exactions takings test',
      },
      {
        name: 'Lingle v. Chevron U.S.A. Inc.',
        citation: '544 U.S. 528 (2005)',
        holding:
          'Clarified that the "substantially advances" test from Agins is NOT a valid takings test. Penn Central and Lucas are the proper regulatory takings frameworks.',
        relevance: 'Clarification of available takings tests',
      },
      {
        name: 'Bountiful City v. DeLuca',
        citation: '826 P.2d 170 (Utah 1992)',
        holding:
          'Regulation becomes a compensable taking if it deprives owner of a significant amount of economic value.',
        relevance: 'Utah-specific articulation of regulatory takings threshold',
      },
    ],
    jurisdiction: 'Federal / Utah',
    category: 'regulatory_takings',
    subcategory: 'takings_clause',
    tags: [
      'takings',
      'fifth amendment',
      'fourteenth amendment',
      'just compensation',
      'Penn Central',
      'Lucas',
      'Nollan',
      'Dolan',
      'regulatory taking',
      'exactions',
    ],
  },
  {
    id: 'utah-art1-sec22',
    code: 'Utah Constitution Article I, Section 22',
    title: 'Private Property -- Takings and Damagings',
    summary:
      'Utah\'s takings clause is BROADER than the federal Fifth Amendment. It protects private property from being "taken OR DAMAGED" for public use without just compensation. The "or damaged" language extends protection beyond physical takings to regulatory damagings that diminish property value.',
    fullText: `"Private property shall not be taken OR DAMAGED for public use without just compensation."

NOTE: The word "DAMAGED" makes Utah's provision BROADER than the federal Fifth Amendment, which only prohibits "taking." This means Utah property owners have an additional cause of action for government regulation that DAMAGES property value even if it does not rise to the level of a full "taking."`,
    elements: [
      'Taking: government acquisition of private property for public use',
      'Damaging: government action that damages property value (broader than federal taking)',
      'Just compensation: required for both takings and damagings',
      'Public use: taking or damaging must be for a public purpose',
      'Broader than federal: "or damaged" language extends beyond Fifth Amendment protection',
    ],
    effectiveDate: '1896-01-04',
    amendments: [],
    relatedStatutes: [
      'U.S. Constitution, Fifth Amendment',
      'U.S. Constitution, Fourteenth Amendment',
    ],
    keyCases: [
      {
        name: 'Bountiful City v. DeLuca',
        citation: '826 P.2d 170 (Utah 1992)',
        holding:
          'Regulation becomes a compensable taking if it deprives owner of a significant amount of economic value.',
        relevance: 'Applies Utah\'s broader "takings or damagings" protection',
      },
      {
        name: 'B.A.M. Development v. Salt Lake County',
        citation: '2006 UT 2',
        holding:
          'Utah adopted Nollan/Dolan rough proportionality test for exactions: essential nexus and individualized determination of proportionality required.',
        relevance: 'Utah adoption of federal exactions framework under state constitution',
      },
    ],
    jurisdiction: 'Utah',
    category: 'regulatory_takings',
    subcategory: 'state_constitution',
    tags: [
      'takings',
      'damagings',
      'Utah constitution',
      'just compensation',
      'property rights',
      'broader than federal',
    ],
  },
]

// =============================================================================
// 8. DUE PROCESS IN LAND USE
// =============================================================================

const DUE_PROCESS_STATUTES: Statute[] = [
  {
    id: 'utah-due-process-land-use',
    code: 'Utah Constitution Article I, Section 7',
    title: 'Due Process of Law',
    summary:
      'Guarantees due process of law before deprivation of life, liberty, or property. In the land use context, requires that property owners receive notice and a meaningful opportunity to be heard before government action restricts their property rights.',
    fullText: `"No person shall be deprived of life, liberty or property, without due process of law."

DUE PROCESS IN LAND USE REQUIRES:
(1) NOTICE: Adequate notice of proposed government action affecting property rights
(2) HEARING: Meaningful opportunity to be heard before a neutral decision-maker
(3) FINDINGS: Decision based on articulated findings supported by evidence
(4) STANDARDS: Application of predetermined standards (not ad hoc decision-making)
(5) IMPARTIALITY: Absence of bias or predetermined outcome`,
    elements: [
      'Adequate notice of proposed government action',
      'Meaningful opportunity to be heard',
      'Neutral and impartial decision-maker',
      'Decision based on articulated findings',
      'Findings supported by evidence in the record',
      'Application of predetermined standards',
      'Absence of bias or predetermined outcome',
      'Right to present evidence and argument',
    ],
    effectiveDate: '1896-01-04',
    amendments: [],
    relatedStatutes: [
      'U.S. Constitution, Fourteenth Amendment',
      'Utah Code 17-27a-801',
      'Utah Code 17-27a-506',
    ],
    keyCases: [
      {
        name: 'Springville Citizens for a Better Community v. City of Springville',
        citation: '1999 UT 25',
        holding:
          'A land use decision is ILLEGAL if the city violated its own ordinances. "Shall" and "must" are ALWAYS mandatory. Cities are bound by terms of applicable zoning ordinances. Illegal decisions are NOT protected by the presumption of validity.',
        relevance:
          'Landmark case for due process in land use: government must follow its own rules',
      },
      {
        name: 'McElhaney v. City of Moab',
        citation: '2017 UT 65',
        holding:
          'Adjudicative land use decisions MUST include findings of fact. Without them, the decision is an "amorphous target" that is arbitrary and capricious.',
        relevance: 'Failure to make written findings violates due process',
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
          'Due process requires consideration of: (1) the private interest affected, (2) the risk of erroneous deprivation and value of additional safeguards, and (3) the government\'s interest.',
        relevance: 'Federal three-factor test for procedural due process',
      },
    ],
    jurisdiction: 'Utah',
    category: 'due_process',
    subcategory: 'land_use',
    tags: [
      'due process',
      'notice',
      'hearing',
      'findings of fact',
      'impartiality',
      'property rights',
      'land use',
    ],
  },
]

// =============================================================================
// PREEMPTION STATUTES
// =============================================================================

const PREEMPTION_STATUTES: Statute[] = [
  {
    id: 'utah-preemption-framework',
    code: 'Utah Constitution Article XI, Section 5',
    title: 'Municipal Home Rule -- State Preemption',
    summary:
      'Grants municipalities home rule authority but limits it to actions "not in conflict with the general law." State statutes preempt conflicting local ordinances. Utah applies a two-part test: (1) direct conflict (provisions cannot coexist) or (2) field occupation (legislature comprehensively covers the field).',
    fullText: `Utah Constitution Article XI, Section 5:
Municipal corporations shall have the right and power to enact by-laws, ordinances and regulations which are "not in conflict with the general law."

PREEMPTION FRAMEWORK (from case law):
Three types of preemption:
1. EXPRESS PREEMPTION: Legislature explicitly states that local regulation is prohibited (e.g., "a political subdivision may not...")
2. FIELD PREEMPTION: Legislature comprehensively covers a field, leaving no room for local regulation
3. CONFLICT PREEMPTION: Local ordinance directly conflicts with state law in a way that the two cannot coexist`,
    elements: [
      'Express preemption: legislature explicitly prohibits local regulation',
      'Field preemption: legislature comprehensively blankets a field of regulation',
      'Conflict preemption: local ordinance directly conflicts with state law',
      'Home rule: municipalities have authority "not in conflict with general law"',
      'Conflict test: provisions are contradictory in the sense they cannot coexist',
      '"May not" language: mandatory prohibition stripping local authority',
    ],
    effectiveDate: '1896-01-04',
    amendments: [],
    relatedStatutes: [
      'Utah Code 17-41-402',
      'Utah Code 17-27a-1002',
    ],
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
        relevance: 'Field preemption analysis framework',
      },
      {
        name: 'Provo City v. Ivie',
        citation: '2004 UT 30',
        holding:
          'Cities may ONLY exercise authority GRANTED by the Legislature. When state law says "may not," counties LACK AUTHORITY to act.',
        relevance: 'Express preemption through prohibitory language',
      },
    ],
    jurisdiction: 'Utah',
    category: 'preemption',
    subcategory: 'framework',
    tags: [
      'preemption',
      'express preemption',
      'field preemption',
      'conflict preemption',
      'home rule',
      'municipal authority',
      'state law supremacy',
    ],
  },
]

// =============================================================================
// SUMMARY JUDGMENT STANDARD (included as supplemental)
// =============================================================================

const PROCEDURAL_STATUTES: Statute[] = [
  {
    id: 'utah-rcivp-56',
    code: 'Utah R. Civ. P. 56',
    title: 'Summary Judgment',
    summary:
      'Permits a party to obtain judgment without trial when there is no genuine dispute as to any material fact and the movant is entitled to judgment as a matter of law. The moving party bears the initial burden; if met, the nonmoving party must show a genuine dispute.',
    fullText: `(a) A party may move for summary judgment, identifying each claim or defense -- or the part of each claim or defense -- on which summary judgment is sought.

(a) The court shall grant summary judgment if the moving party shows that there is no genuine dispute as to any material fact and the moving party is entitled to judgment as a matter of law.

(b) A party opposing a motion for summary judgment must set forth specific facts showing a genuine issue for trial.

(c) The court should state on the record the reasons for granting or denying the motion.`,
    elements: [
      'No genuine dispute: no genuine dispute as to any material fact',
      'Entitled to judgment as a matter of law: legal question can be resolved without trial',
      'Moving party burden: initial burden to show no genuine dispute',
      'Nonmoving party burden: must set forth specific facts showing genuine issue for trial',
      'Reasonable inferences: all facts and inferences viewed in light most favorable to nonmoving party',
      'Statement of reasons: court should state reasons for grant or denial',
    ],
    effectiveDate: '2024-05-01',
    amendments: [],
    relatedStatutes: [
      'Utah R. Civ. P. 65A',
      'Utah R. Civ. P. 12',
    ],
    keyCases: [
      {
        name: 'Orvis v. Johnson',
        citation: '2008 UT 2',
        holding:
          'Summary judgment is appropriate only when the pleadings, depositions, and admissions on file, together with affidavits, show there is no genuine issue of material fact.',
        relevance: 'Utah summary judgment standard',
      },
      {
        name: 'Celotex Corp. v. Catrett',
        citation: '477 U.S. 317 (1986)',
        holding:
          'Moving party need not produce evidence negating nonmoving party\'s claim; sufficient to point out absence of evidence supporting nonmoving party\'s case.',
        relevance: 'Persuasive federal authority on moving party burden',
      },
    ],
    jurisdiction: 'Utah',
    category: 'injunction',
    subcategory: 'summary_judgment',
    tags: [
      'summary judgment',
      'no genuine dispute',
      'material fact',
      'judgment as a matter of law',
      'burden',
    ],
  },
]

// =============================================================================
// COMPLETE STATUTE DATABASE
// =============================================================================

export const STATUTE_DATABASE: Statute[] = [
  ...MINING_RIGHTS_STATUTES,
  ...CRITICAL_INFRASTRUCTURE_STATUTES,
  ...LAND_USE_STATUTES,
  ...NONCONFORMING_USE_STATUTES,
  ...INJUNCTION_STATUTES,
  ...DECLARATORY_JUDGMENT_STATUTES,
  ...REGULATORY_TAKINGS_STATUTES,
  ...DUE_PROCESS_STATUTES,
  ...PREEMPTION_STATUTES,
  ...PROCEDURAL_STATUTES,
]

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

/**
 * Find a statute by its code (old or new section number).
 */
export function findStatuteByCode(code: string): Statute | undefined {
  const normalized = code.toLowerCase().replace(/\s+/g, ' ').trim()
  return STATUTE_DATABASE.find(
    (s) =>
      s.code.toLowerCase().includes(normalized) ||
      (s.newCode && s.newCode.toLowerCase().includes(normalized)) ||
      s.id === normalized
  )
}

/**
 * Find all statutes in a category.
 */
export function findStatutesByCategory(category: StatuteCategory): Statute[] {
  return STATUTE_DATABASE.filter((s) => s.category === category)
}

/**
 * Search statutes by keyword with relevance scoring.
 * Returns statutes sorted by relevance score (descending).
 */
export function searchStatutes(
  query: string,
  options?: {
    jurisdiction?: string
    category?: StatuteCategory
    limit?: number
  }
): { statute: Statute; score: number }[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  let results = STATUTE_DATABASE

  // Filter by jurisdiction
  if (options?.jurisdiction) {
    const jurisdictionLower = options.jurisdiction.toLowerCase()
    results = results.filter((s) => s.jurisdiction.toLowerCase().includes(jurisdictionLower))
  }

  // Filter by category
  if (options?.category) {
    results = results.filter((s) => s.category === options.category)
  }

  // Score each statute
  const scored = results.map((statute) => {
    let score = 0

    for (const term of terms) {
      // Code match (highest weight)
      if (statute.code.toLowerCase().includes(term)) score += 10
      if (statute.newCode?.toLowerCase().includes(term)) score += 10

      // Title match (high weight)
      if (statute.title.toLowerCase().includes(term)) score += 8

      // Tag match (high weight)
      if (statute.tags.some((t) => t.toLowerCase().includes(term))) score += 6

      // Summary match (medium weight)
      if (statute.summary.toLowerCase().includes(term)) score += 4

      // Elements match (medium weight)
      if (statute.elements.some((e) => e.toLowerCase().includes(term))) score += 3

      // Full text match (lower weight)
      if (statute.fullText.toLowerCase().includes(term)) score += 2

      // Case law match (lower weight)
      if (
        statute.keyCases.some(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            c.holding.toLowerCase().includes(term)
        )
      )
        score += 2

      // Subcategory match
      if (statute.subcategory.toLowerCase().includes(term)) score += 3
    }

    return { statute, score }
  })

  // Filter out zero-score results and sort by score
  const filtered = scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  // Apply limit
  if (options?.limit) {
    return filtered.slice(0, options.limit)
  }

  return filtered
}

/**
 * Get all unique categories present in the database.
 */
export function getCategories(): { category: StatuteCategory; label: string; count: number }[] {
  const counts = new Map<StatuteCategory, number>()
  for (const statute of STATUTE_DATABASE) {
    counts.set(statute.category, (counts.get(statute.category) || 0) + 1)
  }

  return Array.from(counts.entries()).map(([category, count]) => ({
    category,
    label: STATUTE_CATEGORY_LABELS[category],
    count,
  }))
}

/**
 * Get related statutes for a given statute.
 */
export function getRelatedStatutes(statuteId: string): Statute[] {
  const statute = STATUTE_DATABASE.find((s) => s.id === statuteId)
  if (!statute) return []

  return statute.relatedStatutes
    .map((code) => findStatuteByCode(code))
    .filter((s): s is Statute => s !== undefined)
}

/**
 * Get a context string suitable for LLM prompts containing all statutes
 * in a given category.
 */
export function getStatuteCategoryContext(category: StatuteCategory): string {
  const statutes = findStatutesByCategory(category)
  if (statutes.length === 0) return ''

  return statutes
    .map(
      (s) => `### ${s.code}${s.newCode ? ` (now ${s.newCode})` : ''} -- ${s.title}

${s.summary}

KEY PROVISIONS:
${s.fullText}

ELEMENTS TO PROVE:
${s.elements.map((e, i) => `${i + 1}. ${e}`).join('\n')}

KEY CASES:
${s.keyCases.map((c) => `- ${c.name}, ${c.citation}: ${c.holding}`).join('\n') || 'None listed'}
`
    )
    .join('\n---\n\n')
}
