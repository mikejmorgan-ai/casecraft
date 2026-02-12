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
