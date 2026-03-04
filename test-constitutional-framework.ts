/**
 * Constitutional Framework Validation Test
 *
 * Tests the Judge Stone Textualist/Originalist logic specifically
 * focusing on Federal Patents vs Local Ordinances preemption
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import OpenAI from 'openai'

const openai = new OpenAI()

const CONSTITUTIONAL_PREEMPTION_TESTS = [
  {
    id: 'FEDERAL_PATENT_SUPREMACY',
    scenario: `
    CONSTITUTIONAL QUESTION: Federal Patent Rights vs. Local Ordinances

    FACTS:
    - 1895 Federal Land Patent grants mineral rights under Mining Act of 1872
    - 2021 Local ordinance prohibits all mining in residential zones
    - Property owner seeks to exercise federal patent rights

    QUESTION: Does the Supremacy Clause invalidate local ordinances that conflict with federal patent rights?

    Apply Textualist and Originalist analysis.`,
    expectedElements: [
      'Supremacy Clause',
      'federal preemption',
      'Mining Act of 1872',
      'original understanding',
      'constitutional text',
      'federal superior authority'
    ]
  },
  {
    id: 'STATE_CIM_PREEMPTION',
    scenario: `
    STATE PREEMPTION QUESTION: Utah Code § 17-41-402 vs. Local Mining Restrictions

    FACTS:
    - Utah Code § 17-41-402: "A political subdivision may not adopt an ordinance that unreasonably restricts a vested mining use"
    - Salt Lake County Ordinance No. 1895 prohibits mining operations in FR-20 zones
    - Tree Farm LLC has documented vested mining use since 1895

    QUESTION: Does the plain text of Utah Code § 17-41-402 preempt the County ordinance?

    Apply strict Textualist interpretation - what does the statute actually say?`,
    expectedElements: [
      'plain text',
      'may not',
      'unreasonably restricts',
      'vested mining use',
      'state preemption',
      'legislative intent'
    ]
  },
  {
    id: 'COMMERCE_CLAUSE_ORIGINALISM',
    scenario: `
    ORIGINALIST CONSTITUTIONAL ANALYSIS: Commerce Clause and Mining Rights

    FACTS:
    - Federal government granted mining patents under 1872 Mining Act
    - Constitutional authority based on Commerce Clause and Property Clause
    - Local government claims police power authority over land use

    QUESTION: Under the original understanding of the Commerce Clause (1787-1791), does federal authority over mineral extraction preempt local land use regulations?

    Apply Originalist methodology - what would the Founders have understood?`,
    expectedElements: [
      'original understanding',
      'Founders',
      'Commerce Clause',
      'Property Clause',
      '1787',
      'federal enumerated powers',
      'police power'
    ]
  }
]

const JUDGE_STONE_CONSTITUTIONAL_PROMPT = `You are Hon. Andrew H. Stone, Utah District Court Judge, with expertise in constitutional law and mining jurisprudence.

JUDICIAL PHILOSOPHY:
- TEXTUALIST: Apply the plain meaning of statutory and constitutional text as written
- ORIGINALIST: Interpret constitutional provisions based on original understanding at time of ratification
- STRICT CONSTRUCTION: Federal preemption principles rigorously enforced

CONSTITUTIONAL HIERARCHY (Supremacy Clause):
1. U.S. Constitution and Federal Law
2. State Constitutions and Statutes
3. Local Ordinances and Regulations

TEXTUALIST METHODOLOGY:
- Focus on plain text meaning
- Avoid legislative history speculation
- Apply ordinary meaning of words at time of enactment
- Statutory language controls over policy preferences

ORIGINALIST METHODOLOGY:
- Original understanding of constitutional text (1787-1791)
- Historical context of constitutional provisions
- Founding-era legal concepts and precedents
- Framers' documented intentions in ratification debates

Apply this constitutional framework to analyze legal questions with citations to specific constitutional provisions and founding-era precedents.`

async function testConstitutionalFramework(): Promise<void> {
  console.log('📜 CONSTITUTIONAL FRAMEWORK VALIDATION TEST')
  console.log('═'.repeat(80))
  console.log('🏛️  Testing Judge Stone Textualist/Originalist Logic')
  console.log('⚖️  Federal Patents vs Local Ordinances Preemption Analysis\n')

  let totalScore = 0
  const testResults: any[] = []

  for (const test of CONSTITUTIONAL_PREEMPTION_TESTS) {
    console.log(`🧪 TEST: ${test.id}`)
    console.log('─'.repeat(50))

    try {
      const startTime = Date.now()

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: JUDGE_STONE_CONSTITUTIONAL_PROMPT },
          { role: 'user', content: test.scenario }
        ],
        temperature: 0.1, // Very low for consistent constitutional analysis
        max_tokens: 1500
      })

      const processingTime = Date.now() - startTime
      const ruling = response.choices[0]?.message?.content || ''

      // Analyze constitutional elements
      const foundElements = test.expectedElements.filter(element =>
        ruling.toLowerCase().includes(element.toLowerCase())
      )

      const missingElements = test.expectedElements.filter(element =>
        !ruling.toLowerCase().includes(element.toLowerCase())
      )

      const testScore = (foundElements.length / test.expectedElements.length) * 100

      testResults.push({
        testId: test.id,
        score: testScore,
        foundElements,
        missingElements,
        ruling: ruling.substring(0, 300) + '...',
        processingTime
      })

      console.log(`📊 Constitutional Elements: ${foundElements.length}/${test.expectedElements.length} found`)
      console.log(`⚖️  Test Score: ${testScore.toFixed(1)}%`)
      console.log(`⏱️  Processing Time: ${processingTime}ms`)

      console.log('\n✅ Found Elements:')
      foundElements.forEach(element => console.log(`   • ${element}`))

      if (missingElements.length > 0) {
        console.log('\n❌ Missing Elements:')
        missingElements.forEach(element => console.log(`   • ${element}`))
      }

      console.log('\n📋 Judicial Analysis (excerpt):')
      console.log(`${ruling.substring(0, 400)}${ruling.length > 400 ? '...' : ''}`)
      console.log('\n')

      totalScore += testScore

      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`❌ Test ${test.id} failed: ${error}`)
      testResults.push({
        testId: test.id,
        score: 0,
        error: error
      })
    }
  }

  // Generate final constitutional framework report
  const avgScore = totalScore / CONSTITUTIONAL_PREEMPTION_TESTS.length

  console.log('🏛️  CONSTITUTIONAL FRAMEWORK ANALYSIS COMPLETE')
  console.log('═'.repeat(80))

  testResults.forEach(result => {
    const status = result.score >= 80 ? '🎉 EXCELLENT' :
                   result.score >= 60 ? '✅ GOOD' :
                   result.score >= 40 ? '⚠️  FAIR' : '❌ POOR'

    console.log(`${result.testId}: ${status} (${result.score.toFixed(1)}%)`)
  })

  console.log('\n📊 OVERALL CONSTITUTIONAL LOGIC ASSESSMENT')
  console.log('─'.repeat(50))
  console.log(`Average Score: ${avgScore.toFixed(1)}%`)

  let constitutionalGrade = 'CRITICAL'
  if (avgScore >= 90) constitutionalGrade = 'EXCELLENT - CONSTITUTIONAL EXPERT'
  else if (avgScore >= 75) constitutionalGrade = 'STRONG - SOLID CONSTITUTIONAL KNOWLEDGE'
  else if (avgScore >= 60) constitutionalGrade = 'ADEQUATE - BASIC CONSTITUTIONAL FRAMEWORK'
  else if (avgScore >= 40) constitutionalGrade = 'WEAK - NEEDS CONSTITUTIONAL TRAINING'

  console.log(`🏛️  Judge Stone Constitutional Logic: ${constitutionalGrade}`)

  // Specific preemption logic validation
  const preemptionTests = testResults.filter(r =>
    r.foundElements?.includes('Supremacy Clause') ||
    r.foundElements?.includes('federal preemption') ||
    r.foundElements?.includes('state preemption')
  )

  console.log(`⚖️  Preemption Logic Tests Passed: ${preemptionTests.length}/${CONSTITUTIONAL_PREEMPTION_TESTS.length}`)

  // Textualist/Originalist methodology validation
  const methodologyIndicators = [
    'plain text', 'original understanding', 'Founders', 'statutory language',
    'constitutional text', 'ordinary meaning', 'plain meaning'
  ]

  const methodologyScore = testResults.reduce((total, result) => {
    if (!result.foundElements) return total
    const methodologyFound = methodologyIndicators.filter(indicator =>
      result.ruling?.toLowerCase().includes(indicator.toLowerCase())
    ).length
    return total + (methodologyFound / methodologyIndicators.length)
  }, 0) / testResults.length * 100

  console.log(`📜 Textualist/Originalist Methodology Score: ${methodologyScore.toFixed(1)}%`)

  console.log('\n🎯 TREE FARM CASE CONSTITUTIONAL READINESS')
  console.log('─'.repeat(50))

  if (avgScore >= 75 && preemptionTests.length >= 2) {
    console.log('🎉 READY FOR ADVERSARIAL LITIGATION')
    console.log('   • Constitutional preemption logic operational')
    console.log('   • Federal/State/Local hierarchy understood')
    console.log('   • Textualist/Originalist framework applied')
  } else if (avgScore >= 60) {
    console.log('✅ MOSTLY READY - Minor Constitutional Issues')
    console.log('   • Good foundation but needs preemption refinement')
  } else {
    console.log('❌ NOT READY - Significant Constitutional Training Needed')
    console.log('   • Fundamental preemption concepts missing')
    console.log('   • Textualist/Originalist methodology weak')
  }

  console.log('\n✅ CONSTITUTIONAL FRAMEWORK VALIDATION COMPLETE')
}

// Execute constitutional framework test
if (import.meta.url === `file://${process.argv[1]}`) {
  testConstitutionalFramework()
    .then(() => {
      console.log('\n🏛️  Constitutional framework validation complete')
      process.exit(0)
    })
    .catch(error => {
      console.error(`❌ Constitutional framework test failed: ${error}`)
      process.exit(1)
    })
}

export default testConstitutionalFramework