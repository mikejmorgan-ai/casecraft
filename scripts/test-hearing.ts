import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const CASE_ID = 'aff331d9-2264-41f9-8d9f-0a2877787afd'

async function testHearing() {
  console.log('\n🏛️  MOCK MOTION HEARING TEST')
  console.log('='.repeat(60) + '\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const openai = new OpenAI()

  // Get case and agents
  const { data: caseData } = await supabase
    .from('cases')
    .select('*')
    .eq('id', CASE_ID)
    .single()

  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .eq('case_id', CASE_ID)
    .eq('is_active', true)

  const { data: facts } = await supabase
    .from('case_facts')
    .select('fact_text')
    .eq('case_id', CASE_ID)
    .limit(10)

  if (!caseData || !agents) {
    console.error('Case or agents not found')
    return
  }

  const agentsByRole = new Map(agents.map(a => [a.role, a]))

  const caseContext = `
Case: ${caseData.name} (${caseData.case_number})
Type: ${caseData.case_type}
Jurisdiction: ${caseData.jurisdiction}
Plaintiff: ${caseData.plaintiff_name}
Defendant: ${caseData.defendant_name}
Summary: ${caseData.summary}

Key Facts:
${facts?.map(f => `- ${f.fact_text}`).join('\n') || 'None'}
`

  // Motion hearing phases
  const phases = [
    { role: 'judge', phase: 'opening', label: 'JUDGE CALLS TO ORDER' },
    { role: 'plaintiff_attorney', phase: 'plaintiff_opening', label: 'KASS - MAIN ARGUMENT' },
    { role: 'plaintiff_attorney', phase: 'plaintiff_case', label: 'KASS - CONTINUES' },
    { role: 'defense_attorney', phase: 'defense_opening', label: 'ROMANO - OPPOSITION' },
    { role: 'defense_attorney', phase: 'defense_case', label: 'ROMANO - CONTINUES' },
    { role: 'plaintiff_attorney', phase: 'plaintiff_closing', label: 'KASS - REBUTTAL' },
  ]

  const PHASE_PROMPTS: Record<string, string> = {
    opening: 'Call the court to order and announce the case. State the matter before the court.',
    plaintiff_opening: 'Present your main argument. Cite specific statutes supporting your position.',
    plaintiff_case: 'Continue developing your argument. Reference documents and case law.',
    defense_opening: 'Present your opposition. Challenge the movant\'s legal arguments.',
    defense_case: 'Continue opposition. Cite controlling precedent.',
    plaintiff_closing: 'Respond to defense arguments. Reinforce your strongest points.',
  }

  const transcript: Array<{ role: string; name: string; content: string }> = []

  // Run first 6 phases as test
  for (let i = 0; i < phases.length; i++) {
    const { role, phase, label } = phases[i]
    const agent = agentsByRole.get(role)

    if (!agent) {
      console.log(`⚠️ No agent for role: ${role}\n`)
      continue
    }

    console.log(`\n${'─'.repeat(60)}`)
    console.log(`📢 ${label}`)
    console.log(`   Agent: ${agent.name}`)
    console.log(`${'─'.repeat(60)}\n`)

    const recentTranscript = transcript
      .slice(-5)
      .map(t => `${t.name}: ${t.content.substring(0, 200)}...`)
      .join('\n\n')

    const systemPrompt = `You are ${agent.name}, acting as the ${agent.role.replace('_', ' ')} in this legal proceeding.

${agent.persona_prompt}

CASE CONTEXT:
${caseContext}

CURRENT PHASE: ${phase.replace('_', ' ').toUpperCase()}
YOUR TASK: ${PHASE_PROMPTS[phase]}

RECENT PROCEEDINGS:
${recentTranscript || '[Proceedings have just begun]'}

Respond in character as ${agent.name}. Be thorough and substantive.`

    const start = Date.now()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: agent.temperature,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Proceed with your ${phase.replace('_', ' ')} as ${agent.name}. Be thorough.` },
      ],
    })
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    const response = completion.choices[0].message.content || ''
    transcript.push({ role, name: agent.name, content: response })

    console.log(response)
    console.log(`\n⏱️ Generated in ${elapsed}s | ${response.length} chars`)

    // Estimate TTS duration (roughly 150 words/min = 2.5 words/sec)
    const words = response.split(/\s+/).length
    const estimatedAudioSec = Math.round(words / 2.5)
    console.log(`🔊 Est. audio: ~${estimatedAudioSec}s (${words} words)`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ HEARING TEST COMPLETE')
  console.log('='.repeat(60))
  console.log(`\nTotal turns: ${transcript.length}`)
  console.log(`Total characters: ${transcript.reduce((sum, t) => sum + t.content.length, 0)}`)
}

testHearing().catch(console.error)
