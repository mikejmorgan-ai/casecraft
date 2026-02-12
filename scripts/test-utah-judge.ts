/**
 * TEST SCRIPT: Utah Judge Training Verification
 *
 * This script tests the judge's knowledge of Utah mining statutes by asking
 * specific questions about the legal framework and verifying the responses.
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import OpenAI from 'openai'
import { getUtahMiningLawContext } from '../src/lib/legal/utah-mining-statutes'

const openai = new OpenAI()

// Test questions to verify Utah law knowledge
const TEST_QUESTIONS = [
  {
    id: 1,
    question: 'What is the definition of "mine operator" under Utah Code § 17-41-101(13)?',
    expectedElements: [
      'successor',
      'on or before January 1, 2019',
      'large mine permit',
      'commercial quantities',
    ],
    category: 'Definition',
  },
  {
    id: 2,
    question: 'Under Utah Code § 17-41-501, what is the standard of proof for challenging a vested mining use?',
    expectedElements: [
      'clear and convincing evidence',
      'burden',
      'challenger',
    ],
    category: 'Burden of Proof',
  },
  {
    id: 3,
    question: 'Does a gap in mining operations automatically terminate vested mining rights under Utah law?',
    expectedElements: [
      'no',
      'on or before',
      'one-time threshold',
      'abandonment',
      'separate provision',
    ],
    category: 'Statutory Interpretation',
  },
  {
    id: 4,
    question: 'What does it mean that a vested mining use "runs with the land" under § 17-41-501(2)(a)?',
    expectedElements: [
      'transfer',
      'automatic',
      'successor',
      'land',
    ],
    category: 'Property Rights',
  },
  {
    id: 5,
    question: 'What restrictions does § 17-41-402 place on political subdivisions regarding mining protection areas?',
    expectedElements: [
      'may not',
      'written approval',
      'mine operator',
      'zoning',
    ],
    category: 'Preemption',
  },
  {
    id: 6,
    question: 'What is the effect of a "conclusive presumption" in Utah Code § 17-41-501(1)(a)?',
    expectedElements: [
      'conclusive',
      'cannot be rebutted',
      'strongest',
      'presumption',
    ],
    category: 'Legal Standard',
  },
  {
    id: 7,
    question: 'What are the new section numbers for § 17-41-501 after the November 6, 2025 recodification?',
    expectedElements: [
      '17-81-401',
      'recodification',
    ],
    category: 'Section Crosswalk',
  },
  {
    id: 8,
    question: 'What rights does § 17-41-502 grant to mine operators with vested mining use?',
    expectedElements: [
      'progress',
      'extend',
      'enlarge',
      'expand',
      'notwithstanding',
    ],
    category: 'Rights of Mine Operator',
  },
]

const JUDGE_SYSTEM_PROMPT = `You are an experienced Utah appellate judge with deep expertise in Utah mining law, property rights, and statutory interpretation. You have thorough knowledge of Utah Code Title 17, Chapter 41 (Agriculture, Industrial, or Critical Infrastructure Materials Protection Areas), including the vested mining use statutes.

${getUtahMiningLawContext()}

Answer questions precisely and cite specific statutory provisions. Quote statute text verbatim when relevant.`

async function testQuestion(test: typeof TEST_QUESTIONS[0]): Promise<{
  passed: boolean
  response: string
  foundElements: string[]
  missingElements: string[]
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: JUDGE_SYSTEM_PROMPT },
      { role: 'user', content: test.question },
    ],
    temperature: 0.2,
    max_tokens: 1000,
  })

  const content = response.choices[0]?.message?.content?.toLowerCase() || ''

  const foundElements = test.expectedElements.filter((el) =>
    content.includes(el.toLowerCase())
  )
  const missingElements = test.expectedElements.filter(
    (el) => !content.includes(el.toLowerCase())
  )

  // Pass if at least 60% of expected elements are found
  const passed = foundElements.length >= test.expectedElements.length * 0.6

  return {
    passed,
    response: response.choices[0]?.message?.content || '',
    foundElements,
    missingElements,
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(80))
  console.log('UTAH JUDGE TRAINING VERIFICATION TEST')
  console.log('='.repeat(80) + '\n')

  let passedCount = 0
  let failedCount = 0

  for (const test of TEST_QUESTIONS) {
    console.log(`\n--- Test ${test.id}: ${test.category} ---`)
    console.log(`Q: ${test.question}\n`)

    try {
      const result = await testQuestion(test)

      if (result.passed) {
        console.log('✅ PASSED')
        passedCount++
      } else {
        console.log('❌ FAILED')
        failedCount++
      }

      console.log(`   Found: ${result.foundElements.join(', ') || 'none'}`)
      if (result.missingElements.length > 0) {
        console.log(`   Missing: ${result.missingElements.join(', ')}`)
      }

      console.log(`\n   Response (excerpt):`)
      console.log(
        `   ${result.response.substring(0, 300)}${result.response.length > 300 ? '...' : ''}`
      )
    } catch (error) {
      console.log(`❌ ERROR: ${error}`)
      failedCount++
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('TEST RESULTS')
  console.log('='.repeat(80))
  console.log(`\nPassed: ${passedCount}/${TEST_QUESTIONS.length}`)
  console.log(`Failed: ${failedCount}/${TEST_QUESTIONS.length}`)
  console.log(
    `Score: ${Math.round((passedCount / TEST_QUESTIONS.length) * 100)}%`
  )

  if (passedCount === TEST_QUESTIONS.length) {
    console.log('\n🎉 ALL TESTS PASSED - Judge is trained on Utah mining law!')
  } else if (passedCount >= TEST_QUESTIONS.length * 0.8) {
    console.log('\n✅ GOOD - Judge has solid Utah mining law knowledge')
  } else if (passedCount >= TEST_QUESTIONS.length * 0.6) {
    console.log('\n⚠️  FAIR - Judge needs more training on Utah mining law')
  } else {
    console.log('\n❌ POOR - Judge needs significant training on Utah mining law')
  }

  console.log('\n')
}

// Run scenario-based test
async function runScenarioTest() {
  console.log('\n' + '='.repeat(80))
  console.log('SCENARIO TEST: Tree Farm LLC v. Salt Lake County')
  console.log('='.repeat(80) + '\n')

  const scenario = `
CASE: Tree Farm LLC v. Salt Lake County

FACTS:
- Tree Farm LLC owns 634 acres in Parleys Canyon with mineral rights dating to 1895 federal land patents
- Union Portland Cement Company operated mining on the property from early 1900s through 1960s
- Lone Star Industries held property through 1987 merger with cement operations
- Large Mine Permit M/035/0012 was issued in 1996 to Rock and Roll Land Co. (Rulon Harper as operator)
- Commercial quantities produced: 90,000+ tons (1994), 725,000+ tons (2009), 386,485+ tons (2019)
- Property sold to Tree Farm LLC in 2020
- Vested mining use declarations recorded: Entry No. 13131633 (Nov 2019), Entry No. 13822822 (Nov 2021)
- Salt Lake County passed Ordinance No. 1895 in December 2021 banning mining in Forestry and Recreation zones
- Tree Farm filed NOI for small mine permit 28 days before ordinance was adopted

LEGAL QUESTIONS:
1. Is Tree Farm LLC a "mine operator" under § 17-41-101(13)?
2. Does Tree Farm have a vested mining use under § 17-41-501?
3. Does Ordinance 1895 violate § 17-41-402 preemption?
4. Does the gap in operations between historical mining and Tree Farm's 2020 acquisition defeat vested rights?

Analyze this case and predict the outcome.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: JUDGE_SYSTEM_PROMPT },
      { role: 'user', content: scenario },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  })

  const content = response.choices[0]?.message?.content || ''

  console.log('JUDGE ANALYSIS:\n')
  console.log(content)

  // Check for key elements in response
  const expectedOutcome = [
    'vested',
    'successor',
    'runs with the land',
    'preemption',
    'plaintiff',
    'on or before January 1, 2019',
  ]

  const foundElements = expectedOutcome.filter((el) =>
    content.toLowerCase().includes(el.toLowerCase())
  )

  console.log('\n' + '-'.repeat(40))
  console.log('KEY ELEMENTS CHECK:')
  expectedOutcome.forEach((el) => {
    const found = content.toLowerCase().includes(el.toLowerCase())
    console.log(`  ${found ? '✅' : '❌'} ${el}`)
  })

  console.log(
    `\nElements found: ${foundElements.length}/${expectedOutcome.length}`
  )
}

async function main() {
  console.log('🏛️  Starting Utah Judge Training Tests...\n')

  await runTests()
  await runScenarioTest()

  console.log('\n✅ Testing complete!')
}

main().catch(console.error)
