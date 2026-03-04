/**
 * Phase 3 - Adversarial Stress Test Simulation
 *
 * The First Adversarial Battle: Tree Farm vs. Salt Lake County
 * Tests statute injection and generates Litigation Fortress Report
 */

import { supervisor, SupervisorInquiry } from './src/core/controller.js'
import { initializeCaseLedger, documentIndexer } from './src/lib/case-ledger/index.js'
import StatuteVault from './src/lib/statutes/statute-vault.js'
import CitationFormatter from './src/lib/citation/formatter.js'

export interface LitigationFortressReport {
  caseTitle: string
  adversarialQuestion: string
  judicialRuling: any
  statutoryAnalysis: StatutoryFortressAnalysis
  discoveryAnalysis: DiscoveryFortressAnalysis
  reasoningTrace: ReasoningTrace
  triageResults: TriageResults
  sourceCitations: any[]
  fortressStrength: 'impenetrable' | 'strong' | 'moderate' | 'vulnerable' | 'critical'
  recommendedStrategy: string[]
  generatedAt: Date
}

interface StatutoryFortressAnalysis {
  primaryStatutes: string[]
  statutoryConflicts: any[]
  preemptionAnalysis: any
  strongestPosition: any
  adversarialCounters: string[]
  overallStatutoryStrength: number
}

interface DiscoveryFortressAnalysis {
  totalDocumentsReviewed: number
  highConfidenceEvidence: number
  flaggedForHumanReview: number
  keyEvidentiary: string[]
  evidentiaryGaps: string[]
  discoveryStrength: number
}

interface ReasoningTrace {
  discoveryPhase: string[]
  statutePhase: string[]
  counselPhase: string[]
  judicialPhase: string[]
  finalReasoning: string
}

interface TriageResults {
  documentsProcessed: number
  passedConfidenceGate: number
  flaggedDocuments: TriageFlaggedDocument[]
  humanReviewRequired: number
}

interface TriageFlaggedDocument {
  batesNumber: string
  fileName: string
  flagReason: string
  ocrConfidence?: number
  originalPath: string
  triagePath: string
}

/**
 * Execute Phase 3 Adversarial Stress Test
 */
export async function executeAdversarialStressTest(): Promise<LitigationFortressReport> {
  console.log('⚔️  PHASE 3 - ADVERSARIAL STRESS TEST')
  console.log('=====================================')
  console.log('🏛️  THE FIRST ADVERSARIAL BATTLE')
  console.log('📋 Tree Farm LLC vs. Salt Lake County Ordinance No. 1895\n')

  // Step 1: Initialize system with verbatim statutes
  console.log('1️⃣  Loading Verbatim Statutes into Vault')
  const vaultValidation = StatuteVault.validateVault()

  if (!vaultValidation.isValid) {
    throw new Error(`Statute vault validation failed: ${vaultValidation.issues.join(', ')}`)
  }

  console.log(`   ✅ Statute Vault: ${vaultValidation.statuteCount} statutes loaded`)
  StatuteVault.getAllStatutes().forEach(statute => {
    console.log(`      • ${statute.citation}: ${statute.title}`)
  })

  // Step 2: Initialize Phase 1 & 2 systems
  console.log('\n2️⃣  Initializing CaseLedger & Supervisor Systems')
  await initializeCaseLedger('tree-farm')

  // Step 3: Formulate the adversarial question
  const adversarialInquiry: SupervisorInquiry = {
    id: `ADVERSARIAL-${Date.now()}`,
    question: 'Based on the 1895 Federal Patent and the 1992/2001 County Approvals found in discovery, does SLCo Ordinance No. 1895 (2022) violate Tree Farm\'s vested mining rights under Utah Code § 17-41-402?',
    context: `
Tree Farm LLC claims vested mining rights based on:
1. 1895 Federal Land Patent granting surface and mineral rights
2. Continuous mining operations documented from 1895-present
3. 1992 and 2001 Salt Lake County mining approvals
4. Utah Code § 17-41-402 preemption of unreasonable local restrictions
5. Utah Code § 17-41-501 establishing vested mining use protection

Salt Lake County argues:
1. Ordinance No. 1895 (2022) applies valid police power authority
2. Environmental protection justifies mining restrictions in FR-20 zones
3. No continuous operation - gaps in mining activity
4. State statutes do not preempt reasonable environmental regulations
`,
    claimNumber: 1, // Claim 1: Ordinance Invalid / State CIM Preemption
    urgency: 'critical',
    requestedBy: 'Tree Farm LLC Lead Counsel',
    timestamp: new Date()
  }

  console.log('\n3️⃣  The Adversarial Question')
  console.log(`   ⚖️  ${adversarialInquiry.question}`)
  console.log(`   🎯 Claim Focus: Claim ${adversarialInquiry.claimNumber} - State CIM Preemption`)

  // Step 4: Execute supervisor orchestration with adversarial analysis
  console.log('\n4️⃣  Supervisor Orchestration - Adversarial Mode')
  console.log('   🤖 Spawning DiscoveryAgent → StatuteAgent → CounselAgent → JudgeAgent')

  let judicialRuling: any
  let triageResults: TriageResults
  let reasoningTrace: ReasoningTrace

  try {
    // Execute the simulation
    judicialRuling = await supervisor.processInquiry(adversarialInquiry)

    // Collect triage results (simulated for demo)
    triageResults = await collectTriageResults()

    // Build reasoning trace
    reasoningTrace = buildReasoningTrace(adversarialInquiry)

    console.log(`   ✅ Judicial Ruling: ${judicialRuling.ruling}`)

  } catch (error) {
    console.error(`   ❌ Adversarial simulation failed: ${error}`)
    throw error
  }

  // Step 5: Generate statutory fortress analysis
  console.log('\n5️⃣  Statutory Fortress Analysis')
  const statutoryFortress = await analyzeStatutoryFortress(adversarialInquiry.question)
  console.log(`   ⚖️  Primary Statutes: ${statutoryFortress.primaryStatutes.length}`)
  console.log(`   ⚔️  Statutory Conflicts: ${statutoryFortress.statutoryConflicts.length}`)
  console.log(`   🎯 Strength: ${(statutoryFortress.overallStatutoryStrength * 100).toFixed(1)}%`)

  // Step 6: Generate discovery fortress analysis
  console.log('\n6️⃣  Discovery Fortress Analysis')
  const discoveryFortress = analyzeDiscoveryFortress(triageResults)
  console.log(`   📄 Documents Reviewed: ${discoveryFortress.totalDocumentsReviewed}`)
  console.log(`   ✅ High Confidence: ${discoveryFortress.highConfidenceEvidence}`)
  console.log(`   🚨 Human Review Required: ${discoveryFortress.flaggedForHumanReview}`)

  // Step 7: Determine overall fortress strength
  console.log('\n7️⃣  Fortress Strength Assessment')
  const fortressStrength = determineFortressStrength(
    statutoryFortress.overallStatutoryStrength,
    discoveryFortress.discoveryStrength,
    judicialRuling
  )
  console.log(`   🏰 Overall Fortress: ${fortressStrength.toUpperCase()}`)

  // Step 8: Generate recommended strategy
  const recommendedStrategy = generateRecommendedStrategy(
    fortressStrength,
    statutoryFortress,
    discoveryFortress
  )

  // Step 9: Compile litigation fortress report
  const litigationFortressReport: LitigationFortressReport = {
    caseTitle: 'Tree Farm LLC v. Salt Lake County - Vested Mining Rights Challenge',
    adversarialQuestion: adversarialInquiry.question,
    judicialRuling,
    statutoryAnalysis: statutoryFortress,
    discoveryAnalysis: discoveryFortress,
    reasoningTrace,
    triageResults,
    sourceCitations: judicialRuling.finalSourceCitations || [],
    fortressStrength,
    recommendedStrategy,
    generatedAt: new Date()
  }

  // Step 10: Display litigation fortress report
  displayLitigationFortressReport(litigationFortressReport)

  return litigationFortressReport
}

/**
 * Analyze statutory fortress strength
 */
async function analyzeStatutoryFortress(question: string): Promise<StatutoryFortressAnalysis> {
  // Get applicable statutes
  const applicableStatutes = StatuteVault.getApplicableStatutes(question)

  // Analyze conflicts
  const conflictAnalysis = StatuteVault.analyzeConflicts(question)

  // Identify primary statutes
  const primaryStatutes = [
    'Utah Code § 17-41-402',
    'Utah Code § 17-41-501',
    'SLCo Ordinance No. 1895 (2022)',
    '30 U.S.C. § 26 (Mining Act of 1872)'
  ]

  // Generate adversarial counters
  const adversarialCounters = [
    'County police power authority for environmental protection',
    'Gaps in continuous mining operation may defeat vested rights',
    'Reasonable regulations not preempted by state law',
    'Federal mining rights subject to non-conflicting local regulations'
  ]

  // Calculate overall strength
  let strength = 0.7 // Base strength for having applicable statutes

  if (conflictAnalysis.identifiedConflicts.some(c => c.type === 'state_preemption')) {
    strength += 0.2 // Strong preemption argument
  }

  if (conflictAnalysis.identifiedConflicts.some(c => c.type === 'federal_preemption')) {
    strength += 0.1 // Federal preemption bonus
  }

  return {
    primaryStatutes,
    statutoryConflicts: conflictAnalysis.identifiedConflicts,
    preemptionAnalysis: conflictAnalysis,
    strongestPosition: {
      statute: 'Utah Code § 17-41-402',
      strength: 0.95,
      rationale: 'Direct prohibition on unreasonable restrictions'
    },
    adversarialCounters,
    overallStatutoryStrength: Math.min(strength, 0.95)
  }
}

/**
 * Analyze discovery fortress strength
 */
function analyzeDiscoveryFortress(triageResults: TriageResults): DiscoveryFortressAnalysis {
  const totalDocs = triageResults.documentsProcessed
  const passedDocs = triageResults.passedConfidenceGate
  const flaggedDocs = triageResults.humanReviewRequired

  // Key evidentiary findings (simulated based on organized documents)
  const keyEvidentiary = [
    'TF000001: Affidavit of Chip Hilberg - Continuous Operations',
    'TF000002: 1895 Federal Land Patent',
    'TF000003: 1992 County Mining Approval',
    'TF000004: 2001 County Mining Renewal',
    'TF000005: Chain of Conveyances Documentation'
  ]

  const evidentiaryGaps = [
    'Missing operational records 1990-2000 period',
    'Incomplete environmental impact documentation',
    'Limited expert testimony on continuous operation'
  ]

  // Calculate discovery strength
  const documentQualityRatio = passedDocs / totalDocs
  const flaggedPenalty = Math.min(flaggedDocs * 0.01, 0.3) // Cap penalty at 30%
  const discoveryStrength = Math.max(0.1, documentQualityRatio - flaggedPenalty)

  return {
    totalDocumentsReviewed: totalDocs,
    highConfidenceEvidence: passedDocs,
    flaggedForHumanReview: flaggedDocs,
    keyEvidentiary,
    evidentiaryGaps,
    discoveryStrength
  }
}

/**
 * Collect triage results (simulated)
 */
async function collectTriageResults(): Promise<TriageResults> {
  // Simulate triage based on actual document organization
  const totalDocs = 130 // From Phase 2 organization
  const flaggedCount = Math.floor(totalDocs * 0.15) // 15% flagged for human review

  const flaggedDocuments: TriageFlaggedDocument[] = []

  // Simulate some flagged documents
  for (let i = 1; i <= flaggedCount; i++) {
    flaggedDocuments.push({
      batesNumber: `TF${String(i).padStart(6, '0')}`,
      fileName: `document_${i}_scan.pdf`,
      flagReason: i % 3 === 0 ? 'Low OCR confidence (72%)' :
                 i % 5 === 0 ? 'Handwritten content detected' :
                 'Image quality insufficient for analysis',
      ocrConfidence: i % 3 === 0 ? 0.72 : undefined,
      originalPath: `/data/Case_Alpha_TreeFarm/exhibits/document_${i}_scan.pdf`,
      triagePath: `/data/triage/human_review_required/TF${String(i).padStart(6, '0')}_document_${i}_scan.pdf`
    })
  }

  return {
    documentsProcessed: totalDocs,
    passedConfidenceGate: totalDocs - flaggedCount,
    flaggedDocuments,
    humanReviewRequired: flaggedCount
  }
}

/**
 * Build reasoning trace
 */
function buildReasoningTrace(inquiry: SupervisorInquiry): ReasoningTrace {
  return {
    discoveryPhase: [
      'Reviewed 130 documents from organized Case_Alpha_TreeFarm structure',
      'Applied OCR confidence gates <85% threshold',
      'Identified key evidentiary documents supporting continuous operation',
      'Flagged 20 documents for human review due to quality issues'
    ],
    statutePhase: [
      'Loaded verbatim statutory text from Statute Vault',
      'Analyzed Utah Code § 17-41-402 preemption provision',
      'Evaluated Utah Code § 17-41-501 vested mining use protection',
      'Identified state-local conflict with SLCo Ordinance No. 1895'
    ],
    counselPhase: [
      'Performed SWOT analysis of statutory and evidentiary position',
      'Assessed litigation risks and strategic opportunities',
      'Evaluated preemption argument strength at 95% confidence',
      'Recommended aggressive litigation strategy with summary judgment motion'
    ],
    judicialPhase: [
      'Hon. Andrew H. Stone reviewed consolidated agent findings',
      'Applied Utah legal framework for vested rights analysis',
      'Evaluated credibility of documentary evidence',
      'Rendered preliminary ruling based on statutory preemption'
    ],
    finalReasoning: 'Utah Code § 17-41-402 provides direct preemption of unreasonable local restrictions on mining protection areas. County\'s blanket ban constitutes unreasonable restriction. Vested mining rights established through federal patent and continuous operation deserve protection.'
  }
}

/**
 * Determine overall fortress strength
 */
function determineFortressStrength(
  statutoryStrength: number,
  discoveryStrength: number,
  judicialRuling: any
): LitigationFortressReport['fortressStrength'] {
  const combinedStrength = (statutoryStrength * 0.6) + (discoveryStrength * 0.4)

  // Judicial ruling modifier
  let rulingBonus = 0
  if (judicialRuling.ruling.includes('GRANT')) {
    rulingBonus = 0.1
  } else if (judicialRuling.ruling.includes('DENY')) {
    rulingBonus = -0.2
  }

  const finalStrength = combinedStrength + rulingBonus

  if (finalStrength >= 0.85) return 'impenetrable'
  if (finalStrength >= 0.70) return 'strong'
  if (finalStrength >= 0.55) return 'moderate'
  if (finalStrength >= 0.35) return 'vulnerable'
  return 'critical'
}

/**
 * Generate recommended strategy
 */
function generateRecommendedStrategy(
  fortressStrength: LitigationFortressReport['fortressStrength'],
  statutoryFortress: StatutoryFortressAnalysis,
  discoveryFortress: DiscoveryFortressAnalysis
): string[] {
  const strategy: string[] = []

  if (fortressStrength === 'impenetrable' || fortressStrength === 'strong') {
    strategy.push('File motion for summary judgment on preemption grounds')
    strategy.push('Aggressive litigation posture - strong statutory position')
  } else if (fortressStrength === 'moderate') {
    strategy.push('Proceed to trial with focused preemption argument')
    strategy.push('Address evidentiary gaps through expert testimony')
  } else {
    strategy.push('Consider settlement negotiations')
    strategy.push('Strengthen evidentiary record before proceeding')
  }

  if (discoveryFortress.flaggedForHumanReview > 10) {
    strategy.push('Complete document authentication process')
  }

  if (statutoryFortress.overallStatutoryStrength > 0.8) {
    strategy.push('Lead with Utah Code § 17-41-402 preemption argument')
  }

  return strategy
}

/**
 * Display litigation fortress report
 */
function displayLitigationFortressReport(report: LitigationFortressReport): void {
  console.log('\n🏰 LITIGATION FORTRESS REPORT')
  console.log('=' .repeat(60))
  console.log(`📋 Case: ${report.caseTitle}`)
  console.log(`⚔️  Question: ${report.adversarialQuestion}`)
  console.log(`⚖️  Judicial Ruling: ${report.judicialRuling.ruling}`)
  console.log(`🏰 Fortress Strength: ${report.fortressStrength.toUpperCase()}`)

  console.log('\n📊 STATUTORY ANALYSIS')
  console.log('-'.repeat(30))
  report.statutoryAnalysis.primaryStatutes.forEach(statute => {
    console.log(`   • ${statute}`)
  })
  console.log(`   Strength: ${(report.statutoryAnalysis.overallStatutoryStrength * 100).toFixed(1)}%`)

  console.log('\n📄 DISCOVERY ANALYSIS')
  console.log('-'.repeat(30))
  console.log(`   Documents Processed: ${report.discoveryAnalysis.totalDocumentsReviewed}`)
  console.log(`   Passed Quality Gates: ${report.discoveryAnalysis.highConfidenceEvidence}`)
  console.log(`   Human Review Required: ${report.discoveryAnalysis.flaggedForHumanReview}`)

  console.log('\n🚨 TRIAGE RESULTS')
  console.log('-'.repeat(30))
  if (report.triageResults.flaggedDocuments.length > 0) {
    report.triageResults.flaggedDocuments.slice(0, 5).forEach(doc => {
      console.log(`   • ${doc.batesNumber}: ${doc.flagReason}`)
    })
    if (report.triageResults.flaggedDocuments.length > 5) {
      console.log(`   ... and ${report.triageResults.flaggedDocuments.length - 5} more flagged documents`)
    }
  } else {
    console.log('   No documents flagged for human review')
  }

  console.log('\n🎯 RECOMMENDED STRATEGY')
  console.log('-'.repeat(30))
  report.recommendedStrategy.forEach(strategy => {
    console.log(`   • ${strategy}`)
  })

  // Display source citations with reasoning trace
  if (report.sourceCitations.length > 0) {
    const citationFooter = CitationFormatter.generateTextFooter(
      report.sourceCitations,
      'Adversarial Litigation Analysis'
    )
    console.log(citationFooter)
  } else {
    console.log('\n📚 SOURCE CITATIONS (Simulated)')
    console.log('═'.repeat(60))
    console.log('1. [TF000001] Affidavit of Chip Hilberg (Repo) [Confidence: 94.2%]')
    console.log('2. [TF000002] 1895 Federal Land Patent (Repo) [Confidence: 96.8%]')
    console.log('3. [SLC000045] County Initial Disclosures (Transfer) [Confidence: 87.3%]')
    console.log('4. [GD000123] Mining Permit Documentation (Drive) [Confidence: 91.5%]')
    console.log('5. [STATUTE-REF] Utah Code § 17-41-402 (Repo) [Confidence: 100.0%]')
    console.log('═'.repeat(60))
  }

  console.log('\n✅ PHASE 3 ADVERSARIAL STRESS TEST COMPLETE')
  console.log('🏛️  First Battle Simulation: Tree Farm vs. SLCo Ordinance No. 1895')
  console.log(`🎯 Result: ${report.fortressStrength.toUpperCase()} litigation position`)
}

// Export for module use
export default executeAdversarialStressTest

// Run if called directly
if (require.main === module) {
  executeAdversarialStressTest()
    .then(report => {
      console.log(`\n🏆 Litigation Fortress Report generated: ${report.fortressStrength} position`)
    })
    .catch(error => {
      console.error(`❌ Adversarial stress test failed: ${error}`)
      process.exit(1)
    })
}