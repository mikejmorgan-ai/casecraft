import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function setupTreeFarmCase() {
  console.log('🌲 Setting up Tree Farm LLC v. Salt Lake County...\n')

  // 1. Create or get test user
  console.log('Creating test user...')
  const testEmail = 'mike@mmivip.com'
  const testPassword = 'treefarm2024!'

  // Check if user exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  let userId = existingUsers?.users?.find(u => u.email === testEmail)?.id

  if (!userId) {
    // Create user via admin API
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { role: 'attorney' }
    })

    if (userError) {
      console.error('Failed to create user:', userError)
      process.exit(1)
    }
    userId = newUser.user.id
    console.log(`✅ Created user: ${testEmail}`)
  } else {
    console.log(`✅ User exists: ${testEmail}`)
  }

  // 2. Create user profile if not exists
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      role: 'attorney',
      full_name: 'Mike Morgan',
      terms_accepted_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (profileError) {
    console.warn('Profile upsert warning:', profileError.message)
  }

  // 3. Check if Tree Farm case already exists
  const { data: existingCase } = await supabase
    .from('cases')
    .select('id')
    .eq('case_number', '220902840')
    .single()

  if (existingCase) {
    console.log(`\n✅ Tree Farm case already exists: ${existingCase.id}`)
    console.log(`\nAccess at: /case/${existingCase.id}`)
    return
  }

  // 4. Create the case
  console.log('\nCreating case...')
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
      is_blind_test: true,
      summary: `Real property dispute over 634 acres in Parleys Canyon with mining rights dating to 1895 federal land patents. Salt Lake County passed Ordinance No. 1895 in 2022 banning mining/extraction in Forestry and Recreation zones, directly targeting Tree Farm's property.

Tree Farm claims: (1) State Preemption under Utah Code §17-41-402; (2) Vested Rights under Utah Code §17-41-501; (3) Regulatory Taking destroying all economically viable use of mineral rights.

Salt Lake County claims: (1) Valid exercise of county zoning authority; (2) Environmental protection mandate; (3) Tree Farm never held actual mining permits.

Critical legal question: Under Utah Code §17-41-101(13), does "small mining operation" successor status protect Tree Farm's vested rights?`,
    })
    .select()
    .single()

  if (caseError) {
    console.error('Failed to create case:', caseError)
    process.exit(1)
  }

  const caseId = caseData.id
  console.log(`✅ Case created: ${caseId}`)

  // 5. Create agents
  console.log('\nCreating agents...')
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

CASE: Tree Farm LLC v. Salt Lake County (Case No. 220902840)
Central dispute: Whether Salt Lake County's Ordinance No. 1895 violates Utah's preemption statute (§17-41-402) and whether Tree Farm has vested mining rights under §17-41-501.

DEMEANOR: Professional, measured, references Utah Code sections by number.`,
    },
    {
      case_id: caseId,
      role: 'plaintiff_attorney',
      name: 'Kassidy J. Wallin',
      temperature: 0.7,
      is_active: true,
      persona_prompt: `You are Kassidy J. Wallin ("Kass"), lead counsel for Tree Farm LLC at Parr Brown Gee & Loveless, P.C.

CLIENT: Tree Farm LLC owns 634 acres in Parleys Canyon with mining rights traceable to 1895 federal land patents.

LEGAL STRATEGY:
1. STATE PREEMPTION: Utah Code §17-41-402 expressly preempts county regulation of mining
2. VESTED RIGHTS: Under §17-41-501, Tree Farm is a "successor" to pre-2019 mining operations
3. REGULATORY TAKING: Ordinance destroys all economically viable use of mineral rights

ADVOCACY STYLE: Assertive, heavy reliance on statutory text, builds argument through documentary evidence.`,
    },
    {
      case_id: caseId,
      role: 'defense_attorney',
      name: 'Bridget K. Romano',
      temperature: 0.7,
      is_active: true,
      persona_prompt: `You are Bridget K. Romano, Chief Civil Deputy District Attorney for Salt Lake County.

CLIENT: Salt Lake County enacted Ordinance No. 1895 in 2022 to protect Parleys Canyon.

DEFENSE STRATEGY:
1. ZONING AUTHORITY: Counties retain authority to regulate land use
2. NO PREEMPTION: Preemption applies to active mining permits, not speculative rights
3. SUCCESSOR STATUS: Tree Farm may not qualify as "successor" under statutory definition
4. NO TAKING: Property can be used for forestry, recreation

NOTE: The "continuous operations" argument is legally weak - statute uses "on or before January 1, 2019" language.

ADVOCACY STYLE: Calm, methodical, challenges documentary evidence.`,
    },
    {
      case_id: caseId,
      role: 'expert_witness',
      name: 'Chip Hilberg (Mining History Expert)',
      temperature: 0.5,
      is_active: true,
      persona_prompt: `You are Chip Hilberg, an expert in Utah mining history retained by Tree Farm LLC.

EXPERTISE: 30+ years researching Utah mining operations, extensive knowledge of Parleys Canyon mining history.

KEY FINDINGS:
- Union Portland Cement Company operated from early 1900s
- Mining documented through 1960s
- Lone Star Industries held property through 1990s
- Chain of title shows continuous ownership of mineral rights

TESTIMONY: Cite specific documents and dates, factual only - no legal conclusions.`,
    },
    {
      case_id: caseId,
      role: 'witness',
      name: 'Jesse Lassley (Tree Farm Manager)',
      temperature: 0.8,
      is_active: true,
      persona_prompt: `You are Jesse Lassley, Manager of Tree Farm LLC.

BACKGROUND: Manages 634-acre property in Parleys Canyon, involved in 2021 acquisition.

KNOWLEDGE: Property boundaries, current mining sites condition, interactions with Salt Lake County, timeline of legal dispute.

TESTIMONY: Speak from personal knowledge only, direct and factual.`,
    },
    {
      case_id: caseId,
      role: 'court_clerk',
      name: 'Third District Court Clerk',
      temperature: 0.4,
      is_active: true,
      persona_prompt: `You are the Court Clerk for Utah Third District Court.

CASE: Tree Farm LLC v. Salt Lake County (Case No. 220902840)
- Filed: May 11, 2022
- Current Phase: Discovery
- Judge: Hon. Charles A. Stormont

ROLE: Track deadlines, confirm procedural requirements, maintain case record. Do NOT provide legal advice.`,
    },
  ]

  for (const agent of agents) {
    const { error } = await supabase.from('agents').insert(agent)
    if (error) {
      console.error(`Failed to create ${agent.name}:`, error.message)
    } else {
      console.log(`  ✅ ${agent.name} (${agent.role})`)
    }
  }

  // 6. Add case facts
  console.log('\nAdding case facts...')
  const facts = [
    { category: 'undisputed', fact_text: 'Tree Farm LLC owns 634 acres in Parleys Canyon, Salt Lake County, Utah', is_disputed: false },
    { category: 'undisputed', fact_text: 'Property includes mineral rights traceable to 1895 federal land patents', is_disputed: false },
    { category: 'undisputed', fact_text: 'Tree Farm LLC acquired the property in 2021', is_disputed: false },
    { category: 'undisputed', fact_text: 'Salt Lake County passed Ordinance No. 1895 in 2022 banning mining in Forestry and Recreation zones', is_disputed: false },
    { category: 'undisputed', fact_text: 'Union Portland Cement Company operated mining on the property from early 1900s', is_disputed: false },
    { category: 'disputed', fact_text: 'Tree Farm is a "successor" to pre-2019 mining operations under Utah Code §17-41-101(13)', is_disputed: true },
    { category: 'disputed', fact_text: 'Ordinance 1895 was enacted specifically to target Tree Farm property', is_disputed: true },
    // NOTE: "Continuous operations" removed - not legally required under "on or before January 1, 2019" language
  ]

  for (const fact of facts) {
    await supabase.from('case_facts').insert({ case_id: caseId, ...fact })
  }
  console.log(`✅ Added ${facts.length} case facts`)

  // 7. Create conversation
  console.log('\nCreating conversation...')
  await supabase.from('conversations').insert({
    case_id: caseId,
    name: 'Case Strategy Session',
    conversation_type: 'strategy_session',
  })
  console.log('✅ Created strategy conversation')

  console.log('\n🎉 Tree Farm case setup complete!')
  console.log(`\n📋 Login credentials:`)
  console.log(`   Email: ${testEmail}`)
  console.log(`   Password: ${testPassword}`)
  console.log(`\n🔗 Access case at: /case/${caseId}`)
  console.log(`\n⚖️  This is set up as a BLIND TEST case for prediction validation.`)
}

setupTreeFarmCase().catch(console.error)
