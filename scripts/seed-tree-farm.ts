import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get user ID from demo account
async function getUserId() {
  const { data } = await supabase
    .from('cases')
    .select('user_id')
    .limit(1)
    .single()
  return data?.user_id
}

async function seedTreeFarmCase() {
  console.log('🌲 Seeding Tree Farm LLC v. Salt Lake County...\n')

  const userId = await getUserId()
  if (!userId) {
    console.error('No user found. Please create a case first via the UI.')
    process.exit(1)
  }

  // 1. Create the case
  console.log('Creating case...')
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .insert({
      user_id: userId,
      name: 'Tree Farm LLC v. Salt Lake County',
      case_number: '220902840',
      case_type: 'property',
      jurisdiction: 'Utah Third District Court, Salt Lake City',
      status: 'active',
      plaintiff_name: 'Tree Farm LLC',
      defendant_name: 'Salt Lake County',
      summary: `Real property dispute over 634 acres in Parleys Canyon with mining rights dating to 1895 federal land patents. Salt Lake County passed Ordinance No. 1895 in 2022 banning mining/extraction in Forestry and Recreation zones, directly targeting Tree Farm's property.

Tree Farm claims: (1) State Preemption under Utah Code §17-41-402; (2) Vested Rights under Utah Code §17-41-501; (3) Regulatory Taking destroying all economically viable use of mineral rights.

Salt Lake County claims: (1) Valid exercise of county zoning authority; (2) Environmental protection mandate; (3) Tree Farm never held actual mining permits.

Critical legal question: Under Utah Code §17-41-101(13), does "mine operator" successor status protect Tree Farm's vested rights?`,
    })
    .select()
    .single()

  if (caseError) {
    console.error('Failed to create case:', caseError)
    process.exit(1)
  }

  const caseId = caseData.id
  console.log(`✅ Case created: ${caseId}\n`)

  // 2. Create agents with custom personas
  console.log('Creating agents...')

  const agents = [
    {
      case_id: caseId,
      role: 'judge',
      name: 'Hon. Charles A. Stormont',
      temperature: 0.6,
      is_active: true,
      persona_prompt: `You are Judge Charles A. Stormont of the Utah Third District Court. You were appointed in June 2023 and have extensive background in land use and property rights law.

JUDICIAL PHILOSOPHY:
- Strong respect for property rights and vested rights doctrine
- Strict adherence to procedural requirements
- Careful textual interpretation of Utah statutes
- Preference for early case resolution through clear rulings
- Low tolerance for discovery abuse

CASE KNOWLEDGE:
This is Tree Farm LLC v. Salt Lake County (Case No. 220902840). The central dispute involves whether Salt Lake County's Ordinance No. 1895 violates Utah's preemption statute (§17-41-402) and whether Tree Farm has vested mining rights under §17-41-501 as a successor to pre-2019 mining operations.

DEMEANOR:
- Professional and measured
- Direct questions seeking legal precision
- References Utah Code sections by number
- Cites Utah appellate decisions when relevant
- Moves proceedings efficiently

You are presiding over discovery disputes and dispositive motions. Apply Utah Rules of Civil Procedure strictly.`,
    },
    {
      case_id: caseId,
      role: 'plaintiff_attorney',
      name: 'Kassidy J. Wallin',
      temperature: 0.7,
      is_active: true,
      persona_prompt: `You are Kassidy J. Wallin ("Kass"), lead counsel for Tree Farm LLC at Parr Brown Gee & Loveless, P.C. Your partners Justin Matkin and Rachel Wertheimer support you on this case.

CLIENT:
Tree Farm LLC (Manager: Jesse Lassley) owns 634 acres in Parleys Canyon with mining rights traceable to 1895 federal land patents. The property has documented mining operations dating from Union Portland Cement Company (1906) through Lone Star Industries (1990s).

LEGAL STRATEGY:
1. STATE PREEMPTION (Primary): Utah Code §17-41-402 expressly preempts county regulation of mining. Ordinance 1895 is void.
2. VESTED RIGHTS: Under §17-41-501, Tree Farm is a "successor" to pre-2019 mining operations under §17-41-101(13), entitled to continue mining as a matter of right.
3. REGULATORY TAKING: If zoning applies, it destroys all economically viable use of mineral rights - a compensable taking under Utah Constitution Art. I §22.

KEY EVIDENCE:
- 1895 federal land patents with mineral reservations
- Union Portland Cement Company records (1906)
- Lone Star Industries 10-K filings documenting property transfers (1987-1993)
- Chip Hilberg affidavit on mining history
- I. Sachs declaration on property chain of title

ADVOCACY STYLE:
- Assertive but professional
- Heavy reliance on statutory text
- Builds argument through documentary evidence
- Anticipates opposing arguments
- Cites Utah Supreme Court precedent`,
    },
    {
      case_id: caseId,
      role: 'defense_attorney',
      name: 'Bridget K. Romano',
      temperature: 0.7,
      is_active: true,
      persona_prompt: `You are Bridget K. Romano, Chief Civil Deputy District Attorney for Salt Lake County. Your co-counsel includes Timothy Bywater, David Ashby, and Zach Shaw.

CLIENT:
Salt Lake County enacted Ordinance No. 1895 in 2022 to protect Parleys Canyon from mining and extraction activities in Forestry and Recreation zones. The County has a duty to protect water quality and environmental resources.

DEFENSE STRATEGY:
1. ZONING AUTHORITY: Counties retain authority to regulate land use for health, safety, and welfare. Ordinance 1895 is valid zoning, not mining regulation.
2. NO PREEMPTION: The preemption statute applies to active mining permits, not speculative mineral rights. Tree Farm has no current mining permits.
3. SUCCESSOR STATUS: Tree Farm may not qualify as a "successor" under the statutory definition.
4. NO TAKING: Tree Farm can use property for forestry, recreation, and other permitted uses. Mineral extraction is not the only economic use.

KEY ARGUMENTS:
- Tree Farm acquired property in 2021 with full knowledge of zoning restrictions
- Questions about whether large mine permit requirements were met
- Environmental protection is compelling government interest

NOTE: The "gap in operations" argument is legally weak. Utah Code §17-41-101(13) uses "on or before January 1, 2019" language - if commercial quantities were produced at ANY point before that date, the statute is satisfied. Continuous operations are NOT required by the plain text.

ADVOCACY STYLE:
- Calm, methodical presentation
- Challenges plaintiff's documentary evidence
- Emphasizes procedural requirements
- Defends County's regulatory discretion
- Questions standing and ripeness`,
    },
    {
      case_id: caseId,
      role: 'expert_witness',
      name: 'Chip Hilberg (Mining History Expert)',
      temperature: 0.5,
      is_active: true,
      persona_prompt: `You are Chip Hilberg, an expert in Utah mining history and property research retained by Tree Farm LLC.

EXPERTISE:
- 30+ years researching Utah mining operations
- Extensive knowledge of Parleys Canyon mining history
- Familiarity with Portland Cement Company operations
- Access to historical records, surveys, and property documents

KEY FINDINGS:
- Union Portland Cement Company operated in Parleys Canyon from early 1900s
- Mining operations documented through 1960s
- Portland Cement of Utah surveys confirm mineral extraction activities
- Lone Star Industries (cement) held property through 1990s merger
- Chain of title shows continuous ownership of mineral rights

TESTIMONY APPROACH:
- Cite specific documents and dates
- Reference survey records and property maps
- Explain historical mining practices
- Connect documentary evidence to current ownership
- Acknowledge limitations of historical record where appropriate

You provide factual testimony about mining history - not legal conclusions.`,
    },
    {
      case_id: caseId,
      role: 'witness',
      name: 'Jesse Lassley (Tree Farm Manager)',
      temperature: 0.8,
      is_active: true,
      persona_prompt: `You are Jesse Lassley, Manager of Tree Farm LLC.

BACKGROUND:
- Manages 634-acre property in Parleys Canyon
- Involved in property acquisition in 2021
- Familiar with property's mining potential
- Works with ownership on development plans

KNOWLEDGE:
- Property boundaries and access
- Current condition of mining sites
- Interactions with Salt Lake County
- Timeline of ordinance and legal dispute
- Property management activities

TESTIMONY APPROACH:
- Speak from personal knowledge only
- Be direct and factual
- Explain business purpose of mineral rights
- Describe impact of ordinance on operations
- Acknowledge what you don't personally know

You are a fact witness, not an expert. Stay within bounds of what you personally observed or participated in.`,
    },
    {
      case_id: caseId,
      role: 'court_clerk',
      name: 'Third District Court Clerk',
      temperature: 0.4,
      is_active: true,
      persona_prompt: `You are the Court Clerk for Utah Third District Court handling Tree Farm LLC v. Salt Lake County (Case No. 220902840).

CASE STATUS:
- Filed: May 11, 2022
- Current Phase: Discovery
- Scheduling Order: December 6, 2024 (2nd Amended)
- Judge: Hon. Charles A. Stormont

KEY DEADLINES (from 2nd Amended Scheduling Order):
- Discovery cutoff dates per order
- Expert witness disclosure deadlines
- Dispositive motion deadline
- Trial scheduling pending

PROCEDURAL KNOWLEDGE:
- Utah Rules of Civil Procedure
- Third District Local Rules
- E-filing requirements
- Service requirements
- Motion practice procedures

ROLE:
- Track deadlines and filings
- Confirm procedural requirements
- Maintain case record
- Do NOT provide legal advice
- Direct legal questions to attorneys`,
    },
  ]

  for (const agent of agents) {
    const { error } = await supabase.from('agents').insert(agent)
    if (error) {
      console.error(`Failed to create ${agent.name}:`, error)
    } else {
      console.log(`  ✅ ${agent.name} (${agent.role})`)
    }
  }

  // 3. Add case facts
  console.log('\nAdding case facts...')

  const facts = [
    // Property Facts
    { category: 'property', fact_text: 'Tree Farm LLC owns 634 acres in Parleys Canyon, Salt Lake County, Utah', is_disputed: false },
    { category: 'property', fact_text: 'Property includes mineral rights traceable to 1895 federal land patents', is_disputed: false },
    { category: 'property', fact_text: 'Tree Farm LLC acquired the property in 2021', is_disputed: false },
    { category: 'property', fact_text: '126 years of ownership history documented across 62 transactions', is_disputed: false },

    // Historical Mining Facts
    { category: 'historical', fact_text: 'Union Portland Cement Company operated mining on the property from early 1900s', is_disputed: false },
    { category: 'historical', fact_text: 'Mining operations documented through the 1960s', is_disputed: false },
    { category: 'historical', fact_text: 'Portland Cement of Utah surveys confirm mineral extraction activities', is_disputed: false },
    { category: 'historical', fact_text: 'Lone Star Industries held property through 1987 merger with cement operations', is_disputed: false },
    { category: 'historical', fact_text: 'Property transfers documented in Lone Star 10-K filings (1993)', is_disputed: false },

    // Legal/Regulatory Facts
    { category: 'legal', fact_text: 'Salt Lake County passed Ordinance No. 1895 in 2022 banning mining in Forestry and Recreation zones', is_disputed: false },
    { category: 'legal', fact_text: 'Case filed May 11, 2022 as Case No. 220902840', is_disputed: false },
    { category: 'legal', fact_text: 'Current scheduling order dated December 6, 2024 (2nd Amended)', is_disputed: false },
    { category: 'legal', fact_text: 'Case is in active discovery phase', is_disputed: false },

    // Disputed Facts
    { category: 'disputed', fact_text: 'Tree Farm is a "successor" to pre-2019 mining operations under Utah Code §17-41-101(13)', is_disputed: true },
    { category: 'disputed', fact_text: 'Ordinance 1895 was enacted specifically to target Tree Farm property', is_disputed: true },
    { category: 'disputed', fact_text: 'Tree Farm has applied for or is entitled to mining permits', is_disputed: true },
    // NOTE: "Continuous operations" is NOT a valid legal dispute - statute says "on or before January 1, 2019"

    // Key Legal Issues
    { category: 'legal_issue', fact_text: 'Utah Code §17-41-402 preempts county mining regulation', is_disputed: true },
    { category: 'legal_issue', fact_text: 'Utah Code §17-41-501 protects mining operations existing before county ordinances', is_disputed: false },
    { category: 'legal_issue', fact_text: '"Mine operator" under §17-41-101(13) includes successors to pre-2019 operations', is_disputed: true },

    // ── Discovery Exhibits: Targeting & Predetermined Outcome ──────────────
    //
    // SLCo003856 — Councilman Snelgrove email (Dec 13, 2021)
    // Proves Council voted unanimously to "block the proposal" BEFORE ordinance drafted
    {
      category: 'evidence_based',
      fact_text: 'Councilman Richard Snelgrove emailed constituent on Dec 13, 2021: "This was an easy one. I cannot imagine any scenario where this would be a good thing. The air quality issues alone make this a no go which is why the Council voted unanimously on Friday to block the proposal." Council decided to block Tree Farm on Dec 10, 2021 — months before Ordinance 1895 was drafted.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo003856', type: 'email', from: 'Richard Snelgrove', to: 'S.D. Williams', date: '2021-12-13', subject: 'RE: Please stop the proposed Parleys limestone quarry' }
      ]),
    },
    // SLCo004169 — Councilman Snelgrove email (Mar 30, 2022)
    // Links quarry opposition directly to ordinance vote — targeting in his own words
    {
      category: 'evidence_based',
      fact_text: 'Councilman Richard Snelgrove emailed constituent on Mar 30, 2022 (8 days before vote): "I oppose the quarry and will be a yes vote on the ordinance when it comes up next week." This directly links opposition to Tree Farm\'s quarry with his vote on Ordinance 1895.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo004169', type: 'email', from: 'Richard Snelgrove', to: 'Marian Furst', date: '2022-03-30', subject: 'Re: NO mines in Parley\'s Canyon' }
      ]),
    },
    // SLCo004021 — LUCC Board Meeting transcript (Dec 28, 2021)
    // County policy advisor confirms predetermined outcome and "bipartisan effort" to fast-track
    {
      category: 'evidence_based',
      fact_text: 'At the League of Unincorporated Community Councils meeting on Dec 28, 2021, a County senior policy advisor ("Danielle") stated: "I don\'t think there\'s a single council member who would be in favor of approving any type of land use ordinance, allowing them to expand. And I know that there\'s a bipartisan effort to make sure that these public hearings go back to back and go off without a hitch." This confirms the outcome was predetermined before public hearings occurred.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo004021', type: 'meeting_transcript', body: 'League of Unincorporated Community Councils', date: '2021-12-28', speaker: 'Danielle (senior policy advisor to County Council)' }
      ]),
    },
    // SLCo003588 — Bateman letter + Property Rights Ombudsman mediation request
    // County was warned ordinance violates §17-41-402(6) BEFORE passing it
    {
      category: 'evidence_based',
      fact_text: 'On Feb 11, 2022, Tree Farm attorney Brent Bateman (Dentons) sent formal letter to County Deputy DA Zachary Shaw warning that the proposed ordinance would violate Utah Code §17-41-402(6), which bars counties from even "initiating proceedings" to restrict critical infrastructure materials operations. The Utah Office of the Property Rights Ombudsman received Tree Farm\'s mediation request (regulatory taking claim) and on Mar 23, 2022 wrote to the County stating the matter was appropriate for mediation/arbitration. The County passed Ordinance 1895 anyway in April 2022.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo003588', type: 'letter_and_mediation_request', from: 'Brent Bateman (Dentons)', to: 'Zachary Shaw (SLCo Deputy DA)', date: '2022-02-11', subject: 'Warning re: Utah Code §17-41-402(6) preemption' },
        { bates: 'SLCo003588', type: 'state_office_letter', from: 'Jordan Cullimore (Property Rights Ombudsman)', to: 'Rashelle Hobbs (SLCo Recorder)', date: '2022-03-23', subject: 'RE: Mediation/Arbitration Request: Tree Farm, LLC — Regulatory Taking' }
      ]),
    },
    // SLCo002907 — Carl Fisher (Save Our Canyons) / County coordination
    // Shows advocacy group getting insider timeline info on ordinance
    {
      category: 'evidence_based',
      fact_text: 'On Jan 18, 2022, Carl Fisher (Save Our Canyons) emailed County planner Catherine Kanter asking about the FCOZ and FR ordinance revision timeline. Kanter forwarded it to Dina Blaes (Director, Office of Regional Development) and Helen Peters asking them to answer Fisher\'s question. This documents coordination between the advocacy group and County staff on the ordinance timeline.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo002907', type: 'email_chain', from: 'Carl Fisher (Save Our Canyons)', to: 'Catherine Kanter (SLCo)', forwarded_to: ['Dina Blaes (Director, Regional Development)', 'Lisa Hartman', 'Helen Peters'], date: '2022-01-18', subject: 'Fwd: Documents Updated for Planning Commission' }
      ]),
    },

    // ── Discovery Exhibits: Council Coordination with Advocacy Groups ──────────
    //
    // SLCo004061 — Snelgrove to Hemming (Feb 16, 2022)
    // "Mayor and Council unanimously oppose" + "set in motion a new ordinance" + "put an end to the proposal"
    {
      category: 'evidence_based',
      fact_text: 'Councilman Snelgrove emailed Yalecrest Neighborhood Council Chair on Feb 16, 2022: "The Salt Lake County Mayor and Council unanimously oppose the proposed quarry. To this end, we have set in motion a new ordinance that would ban such projects. Hopefully, the final adoption of the ordinance in a few weeks will put an end to the proposal." Written BEFORE ordinance adoption, proves unanimous predetermined opposition.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo004061', type: 'email', from: 'Richard Snelgrove', to: 'Jan Hemming', date: '2022-02-16', subject: 'RE: opposition to quarry' }
      ]),
    },
    // SLCo004042 — DeBry admits calling special meeting for advocacy group
    {
      category: 'evidence_based',
      fact_text: 'Council Chair Steven DeBry emailed saveparleys.org organizer Andrew Smith on Jan 31, 2022: "When I was Chair of the Salt Lake County Council last year, I called a special meeting to change our ordinances to address the concerns you have expressed." Smith then asked DeBry to share "the best and most compelling data...to support the opposition efforts." Council Chair admits legislative action was taken specifically to address advocacy group demands.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo004042', type: 'email', from: 'Steven DeBry / Andrew Smith', to: 'Steven DeBry (SLCo Council)', date: '2022-01-31', subject: 'RE: Proposed Gravel Pit in Parleys Canyon' }
      ]),
    },
    // SLCo004044 — Snelgrove admits ordinance would "deny zoning authority"
    {
      category: 'evidence_based',
      fact_text: 'Councilman Snelgrove emailed saveparleys.org organizer Andrew Smith on Jan 31, 2022: "There are a dozen good reasons why this quarry should not be allowed. This is why I voted in favor of a new County ordinance that would deny zoning authority for any such quarry. Hopefully, that will put an end to the matter." Directly admits ordinance purpose was to deny zoning for Tree Farm.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo004044', type: 'email', from: 'Richard Snelgrove', to: 'Andrew Smith (saveparleys.org)', date: '2022-01-31', subject: 'RE: Proposed Gravel Pit in Parleys Canyon' }
      ]),
    },
    // SLCo004116 — Snelgrove shares internal legal strategy with advocacy group
    {
      category: 'evidence_based',
      fact_text: 'Councilman Snelgrove emailed saveparleys.org member S.D. Williams on Mar 15, 2022, sharing internal County legal strategy: "the Mayor\'s office is working with our legal counsel to properly craft a response." He admitted: "I along with my fellow Council members, voted for the ordinance as proposed by the Mayor that would stop activity on the site." BCC\'d his personal email, indicating awareness of sensitivity. Williams proposed a surveillance/rapid-response coordination arrangement with the County.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo004116', type: 'email', from: 'Richard Snelgrove', to: 'S.D. Williams', bcc: 'rhsnelgrove@gmail.com', date: '2022-03-15', subject: 'RE: Proposed Gravel Pit' }
      ]),
    },
    // SLCo004011 — Organizing email connecting SOC + 4 Council members
    {
      category: 'evidence_based',
      fact_text: 'On Dec 21, 2021, saveparleys.org organizer Andrew Smith sent an organizing email CC\'d to Save Our Canyons (alex@saveourcanyons.org), SL Tribune reporter Brian Maffly, state legislator Brian King, and four County Council members (Granato, Stringham, Snelgrove, Bradley). The email coordinated attendance at a Millcreek Town Hall: "Let\'s make it standing room only tonight. Let\'s be united in our questions and comments." This proves advocacy groups and County legislators operated within the same organized communication network.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo004011', type: 'email', from: 'Andrew Smith (saveparleys.org)', to: 'mtaire@saveparleys.org', cc: 'alex@saveourcanyons.org, bmaffly@sltrib.com, briansking@le.utah.gov, AGranato@slco.org, LLStringham@slco.org, RSnelgrove@slco.org, JBradley@slco.org', date: '2021-12-21', subject: 'Millcreek Town Hall Tonight' }
      ]),
    },

    // ── Discovery Exhibits: Ordinance Timeline — 16-Day Rush ──────────────
    //
    // SLCo002565 — DA Shaw signs draft ordinance Dec 8 (16 days after first hearing of quarry)
    {
      category: 'evidence_based',
      fact_text: 'The draft ordinance banning mineral extraction in FR zones was digitally signed by DA Zachary Shaw on December 8, 2021 at 17:13:15 — just 16 days after the County first learned of Tree Farm\'s quarry from a newspaper reporter on November 22. The special meeting was called for December 10. This 16-day turnaround from first awareness to fully drafted ordinance demonstrates reactive targeting, not deliberative land use policy.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo002565', type: 'draft_ordinance', signed_by: 'Zachary D. Shaw', date: '2021-12-08', digital_signature_time: '17:13:15' },
        { bates: 'SLCo002489', type: 'email', from: 'Jordan Carroll (SLCo)', to: 'Dina Blaes (ORD)', date: '2021-11-22', note: 'County first learns of quarry' }
      ]),
    },

    // ── Discovery Exhibits: County Ignored Legal Warnings ──────────────
    //
    // SLCo003585-003587 — County met with outside counsel same day as Ombudsman filing, then proceeded anyway
    {
      category: 'evidence_based',
      fact_text: 'On March 23, 2022 — the same day the Property Rights Ombudsman transmitted Tree Farm\'s mediation request — the County scheduled a "Tree Farm meetings" WebEx with outside counsel Michael Zody at Parsons Behle & Latimer. The County engaged a major law firm to assess the legal risk, yet proceeded to pass the ordinance 13 days later on April 5, demonstrating willful disregard of known legal risks.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo003585', type: 'calendar_entry', participants: ['Tim Bywater (SLCo DA)', 'Michael Zody (Parsons Behle)'], date: '2022-03-23', time: '14:00-14:30' },
        { bates: 'SLCo003588', type: 'ombudsman_filing', from: 'Jordan Cullimore', to: 'Rashelle Hobbs (SLCo)', date: '2022-03-23' }
      ]),
    },
    // SLCo003162 — County ignored Bateman warnings
    {
      category: 'evidence_based',
      fact_text: 'The day after the April 5, 2022 ordinance vote, SL Tribune reporter Brian Maffly contacted the County about Bateman\'s correspondence. Tree Farm publicist Matt Lusty stated: "The attorney for Tree Farm LLC, Brent Bateman, has sought numerous times to engage with Salt Lake County. With the exception of dismissive emails from one county attorney, he was largely ignored." This was forwarded internally within County leadership.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo003162', type: 'email_chain', from: 'Brian Maffly (SL Tribune)', forwarded_internally: ['Jordan Carroll (SLCo Comms)', 'Lisa Hartman', 'Dina Blaes'], date: '2022-04-06' }
      ]),
    },

    // ── Discovery Exhibits: County Knew of Preemption Risk ──────────────
    //
    // SLCo003697 — DA Bywater's "labeling workaround" response to Ombudsman
    {
      category: 'evidence_based',
      fact_text: 'On April 7, 2022, County Deputy DA Tim Bywater responded to the Property Rights Ombudsman, acknowledging that Tree Farm cited Utah Code 17-41-402(6) as grounds to prohibit the ordinance. Bywater\'s defense was a labeling workaround: "the proposed amendments do not include any reference to critical infrastructure materials operations, as defined by those statutes." This concedes the County was fully aware of the preemption risk but adopted a form-over-substance distinction to proceed anyway.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo003697', type: 'letter', from: 'Tim Bywater (SLCo Deputy DA)', to: 'Jordan Cullimore (Ombudsman)', date: '2022-04-07' }
      ]),
    },
    // SLCo003120 — County staff admits existing mines would become "legal nonconforming uses"
    {
      category: 'evidence_based',
      fact_text: 'At the April 5, 2022 public hearing, the County\'s own planning staff presentation stated: "Existing approved, permitted, and operational mineral extraction/processing and similar uses would be legal nonconforming uses." This is an internal County admission that the ordinance affected existing mining operations with recognized legal status.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo003120', type: 'presentation', from: 'SLCo Planning Staff', to: 'SLCo Council', date: '2022-04-05' }
      ]),
    },
    // SLCo003827/003828 — Winder Newton confirms entire Council "on same page" BEFORE vote
    {
      category: 'evidence_based',
      fact_text: 'At 12:11 AM on December 10, 2021 — hours before the special meeting — Councilmember Aimee Winder Newton emailed constituent Justin Wilde: "I think we are all on the same page as you about this mine proposal. I\'ll make sure to circulate this." She then forwarded the opposition letter to ALL Council members. This confirms every Council member was aligned in opposition before any public hearing occurred.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo003827', type: 'email', from: 'Aimee Winder Newton', to: 'Justin Wilde', date: '2021-12-10T00:11:00' },
        { bates: 'SLCo003830', type: 'email', from: 'Aimee Winder Newton', to: 'All Council Members', date: '2021-12-10', note: 'Forwarded opposition letter' }
      ]),
    },
    // SLCo004070 — Snelgrove internally calls it "the ordinance banning the quarry"
    {
      category: 'evidence_based',
      fact_text: 'In an internal email to Council staff on February 18, 2022, Councilman Snelgrove asked: "Has the ordinance banning the quarry up Parley\'s Canyon been scheduled for Council consideration yet?" This is how the Council internally conceptualized the ordinance — as "banning the quarry," not as a neutral zoning amendment. This language was used in internal government communications, not public-facing statements.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo004070', type: 'email', from: 'Richard Snelgrove', to: 'Abby Evans (Council Staff)', date: '2022-02-18', subject: 'quarry ordinance scheduling' }
      ]),
    },
    // SLCo003699 — Tree Farm's recorded vested mining rights declaration
    {
      category: 'evidence_based',
      fact_text: 'Tree Farm LLC recorded a Supplemental Declaration and Notice of Vested Mining Use with the Salt Lake County Recorder on November 12, 2021 (Entry No. 13822822). The declaration claims mine operator status under Utah Code 17-41-101(13), establishes successor chain from Portland Cement Co. (1890s) through all prior owners, and documents production of 90,000+ tons (1994), 725,000+ tons (2009), and 386,485+ tons (2019). This was recorded in the County Recorder\'s office BEFORE the County began its ordinance process, giving the County constructive notice of vested rights claims.',
      is_disputed: false,
      supporting_evidence: JSON.stringify([
        { bates: 'SLCo003699', type: 'recorded_declaration', from: 'Tree Farm LLC', recorded_entry: '13822822', date: '2021-11-12' }
      ]),
    },
  ]

  for (const fact of facts) {
    const { error } = await supabase.from('case_facts').insert({
      case_id: caseId,
      ...fact,
    })
    if (error) {
      console.error(`Failed to add fact:`, error)
    }
  }
  console.log(`✅ Added ${facts.length} case facts\n`)

  // 4. Create initial conversation
  console.log('Creating conversation...')
  const { error: convError } = await supabase.from('conversations').insert({
    case_id: caseId,
    name: 'Case Strategy Session',
    conversation_type: 'strategy',
    participants: agents.map(a => a.role),
  })

  if (convError) {
    console.error('Failed to create conversation:', convError)
  } else {
    console.log('✅ Created strategy conversation\n')
  }

  console.log('🎉 Tree Farm case setup complete!')
  console.log(`\nAccess at: /case/${caseId}`)
}

seedTreeFarmCase().catch(console.error)
