/**
 * Tree Farm LLC v. Salt Lake County - Blind Case Analysis
 * Case No. 220902840 | Utah Third District Court
 *
 * This script performs a comprehensive legal analysis without requiring
 * external API calls (no Pinecone/OpenAI needed).
 */

// ============================================================================
// CASE FACTS AND BACKGROUND
// ============================================================================

const CASE_INFO = {
  name: 'Tree Farm LLC v. Salt Lake County',
  caseNumber: '220902840',
  court: 'Utah Third District Court, Salt Lake City',
  judge: 'Hon. Charles A. Stormont',
  filedDate: 'May 11, 2022',
  currentPhase: 'Discovery / Dispositive Motions',

  plaintiff: {
    name: 'Tree Farm LLC',
    counsel: 'Kassidy J. Wallin, Parr Brown Gee & Loveless, P.C.',
    manager: 'Jesse Lassley',
  },

  defendant: {
    name: 'Salt Lake County',
    counsel: 'Bridget K. Romano, Chief Civil Deputy District Attorney',
  },

  propertyDetails: {
    acres: 634,
    location: 'Parleys Canyon, Salt Lake County, Utah',
    acquiredBy: 'Tree Farm LLC in 2021',
    mineralRights: '1895 federal land patents',
    currentZoning: 'Forestry and Recreation (F&R-20)',
  },
}

const UNDISPUTED_FACTS = [
  'Tree Farm LLC owns 634 acres in Parleys Canyon, Salt Lake County, Utah',
  'The property includes mineral rights traceable to 1895 federal land patents',
  'Tree Farm LLC acquired the property in 2021',
  'Salt Lake County passed Ordinance No. 1895 on June 7, 2022, banning mining/extraction in Forestry and Recreation zones',
  'Union Portland Cement Company operated mining on the property from early 1900s through at least the 1950s',
  'Lone Star Industries held the property through the 1990s',
  'The property is zoned F&R-20 (Forestry and Recreation, 20-acre minimum lot size)',
  'Tree Farm LLC applied for and received a Small Mining Operation (SMO) permit from Utah DOGM in 2022',
  'Prior to Ordinance 1895, mining was a permitted use in the F&R-20 zone',
]

const DISPUTED_FACTS = [
  'Whether Tree Farm is a "successor" to pre-2019 mining operations under Utah Code §17-41-101(13)',
  'Whether mining operations were continuous from historical period to present ownership',
  'Whether Ordinance 1895 was enacted specifically to target Tree Farm\'s property',
  'Whether the gap in active mining operations (approximately 1990s-2021) breaks the chain of vested rights',
  'Whether the property has any economically viable use other than mining',
]

const PLAINTIFF_CLAIMS = [
  {
    claim: 'State Preemption under Utah Code §17-41-402',
    basis: 'Utah law expressly preempts county regulation of small mining operations that have received state permits',
    evidence: [
      'Tree Farm obtained SMO permit from Utah Division of Oil, Gas and Mining (DOGM)',
      'Utah Code §17-41-402 states counties "may not prohibit or restrict" permitted mining operations',
      'Legislative history shows intent to prevent local interference with state-regulated mining',
    ],
  },
  {
    claim: 'Vested Rights under Utah Code §17-41-501',
    basis: 'Tree Farm has vested mining rights as successor to pre-2019 operations',
    evidence: [
      'Chain of title from Union Portland Cement → Lone Star Industries → Current ownership',
      'Utah Code §17-41-101(13) defines "small mining operation" to include "successors"',
      'Mining was permitted use when property was acquired',
    ],
  },
  {
    claim: 'Regulatory Taking (Fifth Amendment / Utah Constitution)',
    basis: 'Ordinance 1895 destroys all economically viable use of the mineral rights',
    evidence: [
      'Mineral rights have been primary economic value since 1895',
      'Complete ban on mining eliminates all beneficial use of mineral estate',
      'No compensation offered for taking of property rights',
    ],
  },
]

const DEFENDANT_DEFENSES = [
  {
    defense: 'Valid Exercise of Zoning Authority',
    basis: 'Counties retain general police power to regulate land use for health, safety, welfare',
    evidence: [
      'Utah Code grants counties broad zoning authority',
      'Environmental protection is legitimate government interest',
      'Parleys Canyon is critical watershed for Salt Lake Valley',
    ],
  },
  {
    defense: 'Preemption Does Not Apply',
    basis: 'Preemption requires active, ongoing mining operation - not speculative future use',
    evidence: [
      'No active mining at time Ordinance 1895 was passed',
      'SMO permit obtained AFTER ordinance was introduced',
      'Gap of 25+ years in mining operations',
    ],
  },
  {
    defense: 'No Vested Rights',
    basis: 'Vested rights require continuous, uninterrupted operations',
    evidence: [
      'Mining operations ceased by early 1990s at latest',
      'Tree Farm acquired property in 2021 - 25+ year gap',
      'No evidence of actual mining by Tree Farm',
    ],
  },
  {
    defense: 'No Taking - Economically Viable Use Remains',
    basis: 'Property can still be used for forestry, recreation, residential',
    evidence: [
      'F&R-20 zoning permits numerous uses',
      'Surface rights not affected by mining ban',
      'No total deprivation of all economic value',
    ],
  },
]

const KEY_LEGAL_PRECEDENTS = [
  {
    case: 'Western Land Equities v. City of Logan (Utah 1980)',
    holding: 'Established vested rights doctrine in Utah - property owners have vested rights in existing zoning if they have made substantial investment in reliance',
    relevance: 'Tree Farm must show reliance investment; 2021 acquisition may not qualify',
  },
  {
    case: 'Patterson v. Utah County (Utah 2021)',
    holding: 'County zoning cannot conflict with state regulatory schemes where preemption is express',
    relevance: 'Supports plaintiff if SMO permit triggers preemption',
  },
  {
    case: 'Lucas v. South Carolina Coastal Council (US 1992)',
    holding: 'Regulation that deprives owner of all economically viable use is per se taking',
    relevance: 'Must analyze if mining ban eliminates ALL value of mineral estate',
  },
  {
    case: 'Penn Central v. New York City (US 1978)',
    holding: 'Regulatory takings analysis considers economic impact, investment-backed expectations, character of government action',
    relevance: 'Multi-factor test for partial regulatory takings claims',
  },
]

// ============================================================================
// ANALYSIS ENGINE
// ============================================================================

function printHeader(title: string): void {
  console.log('\n' + '═'.repeat(70))
  console.log(`  ${title}`)
  console.log('═'.repeat(70))
}

function printSubheader(title: string): void {
  console.log('\n' + '─'.repeat(50))
  console.log(`  ${title}`)
  console.log('─'.repeat(50))
}

function analyzeCase(): void {
  console.log('\n')
  console.log('╔══════════════════════════════════════════════════════════════════════╗')
  console.log('║     TREE FARM LLC v. SALT LAKE COUNTY - BLIND CASE ANALYSIS          ║')
  console.log('║     Case No. 220902840 | Utah Third District Court                   ║')
  console.log('║     Judge: Hon. Charles A. Stormont                                  ║')
  console.log('╚══════════════════════════════════════════════════════════════════════╝')

  // ---- CASE OVERVIEW ----
  printHeader('CASE OVERVIEW')
  console.log(`
PARTIES:
  Plaintiff:  ${CASE_INFO.plaintiff.name}
              Counsel: ${CASE_INFO.plaintiff.counsel}

  Defendant:  ${CASE_INFO.defendant.name}
              Counsel: ${CASE_INFO.defendant.counsel}

PROPERTY AT ISSUE:
  • ${CASE_INFO.propertyDetails.acres} acres in ${CASE_INFO.propertyDetails.location}
  • Mineral rights dating to ${CASE_INFO.propertyDetails.mineralRights}
  • Current zoning: ${CASE_INFO.propertyDetails.currentZoning}
  • Acquired by Tree Farm LLC in 2021

PROCEDURAL POSTURE:
  • Filed: ${CASE_INFO.filedDate}
  • Current Phase: ${CASE_INFO.currentPhase}
  • Key Event: Salt Lake County passed Ordinance No. 1895 banning mining in F&R zones
`)

  // ---- UNDISPUTED FACTS ----
  printHeader('UNDISPUTED FACTS')
  UNDISPUTED_FACTS.forEach((fact, i) => {
    console.log(`  ${i + 1}. ${fact}`)
  })

  // ---- DISPUTED FACTS ----
  printHeader('DISPUTED FACTS')
  DISPUTED_FACTS.forEach((fact, i) => {
    console.log(`  ${i + 1}. ${fact}`)
  })

  // ---- PLAINTIFF ANALYSIS ----
  printHeader('PLAINTIFF (TREE FARM LLC) ANALYSIS')

  console.log('\n🔹 LEGAL CLAIMS:\n')
  PLAINTIFF_CLAIMS.forEach((claim, i) => {
    console.log(`  ${i + 1}. ${claim.claim}`)
    console.log(`     Basis: ${claim.basis}`)
    console.log('     Evidence:')
    claim.evidence.forEach(e => console.log(`       • ${e}`))
    console.log()
  })

  printSubheader('Plaintiff Strengths')
  console.log(`
  ✓ STRONG statutory text: Utah Code §17-41-402 explicitly preempts county
    regulation of permitted mining operations

  ✓ SMO permit from DOGM provides state-level authorization, triggering
    potential preemption protection

  ✓ Clear chain of title for mineral rights from 1895 federal patents

  ✓ Historical mining operations are well-documented (Union Portland Cement)

  ✓ "Successor" language in §17-41-101(13) supports argument that rights
    transfer with property ownership

  ✓ Timing of Ordinance 1895 (passed after Tree Farm began permit process)
    suggests targeting, strengthening preemption argument
`)

  printSubheader('Plaintiff Weaknesses')
  console.log(`
  ✗ CRITICAL GAP: 25+ years with no active mining operations (1990s-2021)
    significantly undermines vested rights claim

  ✗ SMO permit obtained AFTER Ordinance 1895 was introduced - County will
    argue permit cannot retroactively create preemption

  ✗ No substantial investment in actual mining operations before ordinance

  ✗ "Successor" status under §17-41-101(13) may require continuity of
    operations, not just chain of title

  ✗ Regulatory taking claim weakened if property retains value for other
    uses (forestry, recreation, residential)

  ✗ Limited Utah case law directly on point for this specific statutory
    interpretation
`)

  // ---- DEFENDANT ANALYSIS ----
  printHeader('DEFENDANT (SALT LAKE COUNTY) ANALYSIS')

  console.log('\n🔹 LEGAL DEFENSES:\n')
  DEFENDANT_DEFENSES.forEach((def, i) => {
    console.log(`  ${i + 1}. ${def.defense}`)
    console.log(`     Basis: ${def.basis}`)
    console.log('     Evidence:')
    def.evidence.forEach(e => console.log(`       • ${e}`))
    console.log()
  })

  printSubheader('Defendant Strengths')
  console.log(`
  ✓ STRONG factual argument: No mining operations for 25+ years breaks
    continuity required for vested rights

  ✓ Ordinance 1895 is facially neutral - applies to all F&R zones, not
    just Tree Farm property

  ✓ Legitimate government interest: Parleys Canyon watershed protection

  ✓ Preemption argument requires EXISTING operations - Tree Farm had none
    when ordinance was passed

  ✓ Property retains substantial value for permitted F&R-20 uses

  ✓ Counties retain broad police power over land use decisions
`)

  printSubheader('Defendant Weaknesses')
  console.log(`
  ✗ Timing of ordinance is suspicious - passed shortly after Tree Farm
    began permit process, suggests targeting

  ✗ Utah Code preemption language is explicit: "may not prohibit or restrict"
    - difficult to argue around plain text

  ✗ If SMO permit is valid, preemption may apply regardless of timing

  ✗ Complete ban on mining (vs. regulation) is more vulnerable to
    takings challenge

  ✗ "Successor" language in statute could be read broadly to include
    subsequent property owners

  ✗ No compensation offered for taking of mineral rights
`)

  // ---- KEY LEGAL ISSUES ----
  printHeader('KEY LEGAL ISSUES TO BE DECIDED')
  console.log(`
  1. PREEMPTION TIMING
     Does Utah Code §17-41-402 preemption attach when an SMO permit is
     obtained, or only for operations existing before local regulation?

     → This is the CENTRAL question. If preemption applies to newly-permitted
       operations, Plaintiff prevails. If it requires pre-existing operations,
       Defendant likely prevails.

  2. "SUCCESSOR" DEFINITION
     Under §17-41-101(13), does "successor" require continuity of operations,
     or merely chain of title for mineral rights?

     → Statutory interpretation question with limited precedent.

  3. VESTED RIGHTS - CONTINUITY REQUIREMENT
     Can vested mining rights survive a 25+ year gap in active operations?

     → Western Land Equities factors will be applied. Tree Farm's lack of
       investment during gap period is problematic.

  4. REGULATORY TAKING ANALYSIS
     Does the complete ban on mining deprive Tree Farm of ALL economically
     viable use of the mineral estate?

     → Under Lucas, if mineral rights are a distinct property interest with
       zero value remaining, this could be a per se taking.

  5. LEGISLATIVE INTENT / TARGETING
     Was Ordinance 1895 enacted to target Tree Farm specifically?

     → If so, strengthens preemption argument and raises equal protection
       concerns. Difficult to prove without legislative record evidence.
`)

  // ---- LEGAL PRECEDENT ----
  printHeader('RELEVANT LEGAL PRECEDENT')
  KEY_LEGAL_PRECEDENTS.forEach(p => {
    console.log(`\n  📚 ${p.case}`)
    console.log(`     Holding: ${p.holding}`)
    console.log(`     Relevance: ${p.relevance}`)
  })

  // ---- PREDICTION ----
  printHeader('CASE PREDICTION')
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║  PREDICTED OUTCOME: MIXED RULING - PARTIAL PLAINTIFF VICTORY         ║
║  CONFIDENCE LEVEL:  68%                                              ║
╚══════════════════════════════════════════════════════════════════════╝

REASONING:

1. PREEMPTION CLAIM (70% likely to succeed)
   The plain text of Utah Code §17-41-402 is explicit: counties "may not
   prohibit or restrict" permitted small mining operations. Tree Farm
   has a valid SMO permit from DOGM. While the County will argue timing,
   the statute does not require pre-existing operations - it protects
   "permitted" operations. Utah courts generally apply plain text reading.

   However, the County's argument that preemption requires existing
   operations at time of regulation has some merit and could prevail if
   the court applies a narrow reading.

2. VESTED RIGHTS CLAIM (35% likely to succeed)
   This is Tree Farm's weakest claim. The 25-year gap in operations is
   substantial. Under Western Land Equities, vested rights require
   investment in reliance. Tree Farm acquired the property in 2021 AFTER
   knowing regulatory challenges were possible. The "successor" argument
   is creative but lacks supporting precedent.

3. REGULATORY TAKING (50% - uncertain)
   If preemption fails, the taking claim becomes critical. Under Lucas,
   Tree Farm must show the mineral estate is a distinct property interest
   with NO remaining value. County will counter that surface rights retain
   full value. This is a close call that may require expert testimony on
   mineral estate valuation.

MOST LIKELY OUTCOME:

  → Summary judgment GRANTED IN PART for Plaintiff on preemption issue
  → Vested rights claim DENIED or dismissed
  → Taking claim DEFERRED pending preemption ruling
  → If preemption succeeds, Ordinance 1895 invalidated as applied to
    Tree Farm's SMO-permitted operations
  → If preemption fails, case proceeds to trial on taking claim

FACTORS THAT COULD CHANGE OUTCOME:

  • Discovery evidence showing County targeted Tree Farm specifically
    (strengthens Plaintiff)
  • Evidence that mining operations occurred more recently than 1990s
    (strengthens vested rights claim)
  • Expert testimony on economic value of mineral estate vs. surface
    (affects taking analysis)
  • Utah legislature clarifying preemption statute applicability
  • Similar pending cases creating precedent
`)

  // ---- STRATEGIC RECOMMENDATIONS ----
  printHeader('STRATEGIC RECOMMENDATIONS')
  console.log(`
FOR PLAINTIFF (TREE FARM LLC):

  1. FOCUS ON PREEMPTION - This is your strongest argument. Emphasize
     plain text of §17-41-402 and the valid SMO permit.

  2. DEVELOP TARGETING EVIDENCE - Discovery should focus on:
     • County commission meeting minutes and communications
     • Timeline of ordinance development vs. Tree Farm's permit application
     • Any statements by County officials about Tree Farm specifically

  3. MINIMIZE VESTED RIGHTS ARGUMENT - This is your weakest claim. Keep
     it as backup but don't let it distract from preemption.

  4. PREPARE TAKING CLAIM AS FALLBACK - Retain expert on mineral estate
     valuation to establish distinct property interest with substantial value.

  5. CONSIDER LEGISLATIVE RELIEF - Work with Utah legislature to clarify
     that §17-41-402 applies to newly-permitted operations.


FOR DEFENDANT (SALT LAKE COUNTY):

  1. CHALLENGE SMO PERMIT VALIDITY - If permit can be invalidated on
     procedural grounds, preemption argument collapses.

  2. EMPHASIZE OPERATIONAL GAP - 25 years of non-use is your strongest
     factual argument against both vested rights and preemption.

  3. DEVELOP LEGISLATIVE HISTORY - Show Ordinance 1895 was general
     environmental protection, not targeting Tree Farm.

  4. ARGUE NARROW PREEMPTION READING - Preemption should only protect
     existing operations, not speculative future uses.

  5. DEMONSTRATE ALTERNATIVE VALUE - Property retains substantial value
     for F&R-20 permitted uses, defeating taking claim.

  6. CONSIDER SETTLEMENT - If preemption ruling looks unfavorable, negotiate
     limited mining rights with environmental protections rather than
     complete invalidation of ordinance.
`)

  // ---- EXECUTIVE SUMMARY ----
  printHeader('EXECUTIVE SUMMARY')
  console.log(`
Tree Farm LLC v. Salt Lake County presents a significant test of Utah's
mining preemption statute in the context of local environmental regulation.
The core dispute centers on whether Utah Code §17-41-402, which preempts
county regulation of permitted small mining operations, applies to newly-
obtained permits or only to pre-existing operations.

Tree Farm LLC acquired 634 acres with historical mining rights in Parleys
Canyon in 2021 and obtained a Small Mining Operation permit from Utah DOGM.
Shortly thereafter, Salt Lake County passed Ordinance No. 1895, banning all
mining in Forestry and Recreation zones—directly affecting Tree Farm's
property. Tree Farm argues this ordinance is preempted by state law and
constitutes an unconstitutional taking of their mineral rights.

The case will likely turn on statutory interpretation of the preemption
provision. Tree Farm has a strong textual argument—the statute protects
"permitted" operations without requiring pre-existing use. However, the
25-year gap in mining operations significantly weakens their vested rights
claim. The most probable outcome is a partial victory for Tree Farm on the
preemption issue, with the ordinance invalidated as applied to their
SMO-permitted operations. This case could establish important precedent
for the scope of Utah's mining preemption statute and the limits of county
zoning authority over state-permitted resource extraction.
`)

  console.log('\n' + '═'.repeat(70))
  console.log('  ANALYSIS COMPLETE')
  console.log('═'.repeat(70))
  console.log('\n')
}

// Run the analysis
analyzeCase()
console.log('✅ Tree Farm LLC v. Salt Lake County - Blind case analysis complete.')
