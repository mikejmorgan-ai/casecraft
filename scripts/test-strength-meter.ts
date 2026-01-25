import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const CASE_ID = 'aff331d9-2264-41f9-8d9f-0a2877787afd'

async function testStrengthMeter() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )

  const { data: facts } = await supabase
    .from('case_facts')
    .select('*')
    .eq('case_id', CASE_ID)

  if (!facts) {
    console.log('No facts found')
    return
  }

  console.log('\n📊 CASE STRENGTH METER TEST')
  console.log('='.repeat(50))
  console.log('Total facts:', facts.length)

  // Replicate the analysis logic from case-strength-meter.tsx
  const undisputedFacts = facts.filter((f) => f.category === 'undisputed' || f.category === 'stipulated')
  const disputedFacts = facts.filter((f) => f.category === 'disputed' || f.is_disputed)
  const evidenceFacts = facts.filter((f) => f.category === 'evidence_based')

  console.log('\nFact Categories:')
  console.log('  Undisputed/Stipulated:', undisputedFacts.length)
  console.log('  Disputed:', disputedFacts.length)
  console.log('  Evidence-based:', evidenceFacts.length)

  let plaintiffScore = 50
  let defenseScore = 50

  facts.forEach((fact) => {
    const text = fact.fact_text.toLowerCase()

    // Favorable to plaintiff (Tree Farm)
    if (text.includes('preempt') || text.includes('17-41-402')) plaintiffScore += 8
    if (text.includes('vested right') || text.includes('17-41-501')) plaintiffScore += 8
    if (text.includes('successor') || text.includes('17-41-101')) plaintiffScore += 6
    if (text.includes('1895') && text.includes('patent')) plaintiffScore += 5
    if (text.includes('mining') && (text.includes('documented') || text.includes('historical'))) plaintiffScore += 4
    if (text.includes('portland cement') || text.includes('lone star')) plaintiffScore += 5

    // Favorable to defense (County)
    if (text.includes('no permit') || text.includes('never held')) defenseScore += 6
    if (text.includes('zoning authority') || text.includes('valid exercise')) defenseScore += 5
    if (text.includes('environmental') || text.includes('water quality')) defenseScore += 4
    if (text.includes('gap') || text.includes('discontinu')) defenseScore += 5
    if (text.includes('2021') && text.includes('acquired')) defenseScore += 3

    if (fact.is_disputed) {
      plaintiffScore -= 2
      defenseScore -= 2
    }
  })

  plaintiffScore = Math.min(100, Math.max(0, plaintiffScore))
  defenseScore = Math.min(100, Math.max(0, defenseScore))
  const overallScore = Math.min(100, Math.max(0, Math.round(50 + ((plaintiffScore - defenseScore) / 2))))

  console.log('\n📈 STRENGTH SCORES')
  console.log('='.repeat(50))
  console.log(`  Tree Farm LLC (Plaintiff):  ${plaintiffScore}%`)
  console.log(`  Salt Lake County (Defense): ${defenseScore}%`)
  console.log('')
  console.log(`  OVERALL SCORE: ${overallScore}`)

  const label = overallScore >= 75 ? 'Strong' : overallScore >= 60 ? 'Favorable' : overallScore >= 50 ? 'Even' : overallScore >= 40 ? 'Challenging' : 'Weak'
  console.log(`  Position: ${label} for Tree Farm LLC`)

  // Category breakdown
  console.log('\n📋 CATEGORY BREAKDOWN')
  console.log('='.repeat(50))

  const preemptionScore = facts.some((f) => f.fact_text.toLowerCase().includes('17-41-402')) ? 75 : 50
  const vestedScore = facts.some((f) => f.fact_text.toLowerCase().includes('successor')) ? 70 : 45
  const evidenceScore = evidenceFacts.length > 3 ? 80 : evidenceFacts.length > 0 ? 60 : 40
  const riskScore = 100 - (disputedFacts.length * 8)

  console.log(`  State Preemption:     ${preemptionScore}%`)
  console.log(`  Vested Rights:        ${vestedScore}%`)
  console.log(`  Documentary Evidence: ${evidenceScore}%`)
  console.log(`  Legal Risk:           ${Math.max(0, riskScore)}%`)

  console.log('\n🔍 KEYWORD ANALYSIS')
  console.log('='.repeat(50))

  const plaintiffKeywords = ['preempt', '17-41-402', 'vested', '17-41-501', 'successor', '17-41-101', '1895', 'patent', 'portland cement', 'lone star']
  const defenseKeywords = ['no permit', 'never held', 'zoning authority', 'valid exercise', 'environmental', 'water quality', 'gap', 'discontinu', '2021']

  console.log('\n  Plaintiff-favorable keywords:')
  plaintiffKeywords.forEach(kw => {
    const matches = facts.filter(f => f.fact_text.toLowerCase().includes(kw))
    if (matches.length > 0) {
      console.log(`    "${kw}": ${matches.length} match(es)`)
    }
  })

  console.log('\n  Defense-favorable keywords:')
  defenseKeywords.forEach(kw => {
    const matches = facts.filter(f => f.fact_text.toLowerCase().includes(kw))
    if (matches.length > 0) {
      console.log(`    "${kw}": ${matches.length} match(es)`)
    }
  })

  console.log('\n✅ STRENGTHS')
  console.log('='.repeat(50))
  console.log('  • Mining rights trace to 1895 federal land patents')
  console.log('  • Utah Code §17-41-402 provides strong preemption language')
  console.log('  • Historical operations well-documented (Portland Cement, Lone Star)')
  console.log(`  • ${undisputedFacts.length} facts are undisputed or stipulated`)

  console.log('\n⚠️  WEAKNESSES')
  console.log('='.repeat(50))
  console.log('  • Gap in active mining operations between 1990s and 2021')
  console.log('  • No current mining permits held')
  console.log('  • County argues valid zoning authority')
  console.log(`  • ${disputedFacts.length} key facts remain disputed`)

  console.log('\n❓ KEY ISSUES TO RESOLVE')
  console.log('='.repeat(50))
  console.log('  • Does successor status under §17-41-101(13) apply to Tree Farm?')
  console.log('  • Was mining activity continuous enough to establish vesting?')
  console.log('  • Does Ordinance 1895 constitute a regulatory taking?')

  console.log('\n' + '='.repeat(50))
  console.log('TEST COMPLETE')
  console.log('='.repeat(50) + '\n')
}

testStrengthMeter().catch(console.error)
