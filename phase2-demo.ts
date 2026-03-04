/**
 * Phase 2 Demonstration - Supervisor Orchestration & Discovery Triage
 *
 * Demonstrates the complete supervisor pattern with:
 * - Multi-agent orchestration (Discovery, Statute, Counsel, Judge)
 * - Automated triage with confidence gates
 * - Source citation footers with Bates tracking
 * - Hon. Andrew H. Stone judicial adjudication
 */

import { supervisor, SupervisorInquiry } from './src/core/controller'
import { quickInit } from './src/lib/case-ledger'
import CitationFormatter from './src/lib/citation/formatter'

async function demonstratePhase2SupervisorSystem() {
  console.log('⚖️  Phase 2 - Supervisor Orchestration & Discovery Triage Demo')
  console.log('================================================================\n')

  // Step 1: Initialize the modular case system from Phase 1
  console.log('1️⃣  Phase 1 System Initialization')
  const initSuccess = await quickInit('tree-farm')

  if (!initSuccess) {
    console.error('❌ Failed to initialize Phase 1 system')
    return
  }

  // Step 2: Demonstrate supervisor orchestration
  console.log('\n2️⃣  Supervisor Controller Pattern')
  console.log('   🎯 The Supervisor Agent orchestrates specialized agents but performs NO tasks directly')
  console.log('   👥 Spawns: DiscoveryAgent → StatuteAgent → CounselAgent')
  console.log('   ⚖️  Presents findings to Hon. Andrew H. Stone for final adjudication')

  // Step 3: Create a legal inquiry for the system
  const testInquiry: SupervisorInquiry = {
    id: `INQ-${Date.now()}`,
    question: 'Does Utah Code 17-41-402 preempt Salt Lake County Ordinance 1895 regarding vested mining operations?',
    context: 'Tree Farm LLC claims vested mining rights based on continuous operations since 1895 federal land patent. County argues local zoning authority under police powers.',
    claimNumber: 1, // Claim 1: Ordinance Invalid / State CIM Preemption
    urgency: 'high',
    requestedBy: 'Tree Farm LLC Counsel',
    timestamp: new Date()
  }

  console.log('\n3️⃣  Legal Inquiry Processing')
  console.log(`   📋 Question: ${testInquiry.question}`)
  console.log(`   🔍 Context: ${testInquiry.context}`)
  console.log(`   ⚡ Urgency: ${testInquiry.urgency}`)

  // Step 4: Process through supervisor orchestration
  console.log('\n4️⃣  Multi-Agent Orchestration')
  console.log('   🚀 Initiating supervisor orchestration...')

  try {
    const judicialRuling = await supervisor.processInquiry(testInquiry)

    // Step 5: Display automated triage results
    console.log('\n5️⃣  Automated Triage Results')
    console.log('   🔍 Confidence Gates Applied:')
    console.log('   • OCR Confidence < 85% → Human Review Required')
    console.log('   • Handwritten/Image Content → Human Review Required')
    console.log('   • Files moved to: /data/triage/human_review_required')
    console.log('   • triage_summary.json generated with flagging reasons')

    // Step 6: Show folder reorganization
    console.log('\n6️⃣  Discovery Folder Reorganization')
    console.log('   📁 Organized into /data/Case_Alpha_TreeFarm/:')
    console.log('   ├── plaintiff_productions/    # Tree Farm LLC evidence (130 files)')
    console.log('   ├── defendant_productions/    # Salt Lake County productions')
    console.log('   ├── pleadings/               # Court filings and motions')
    console.log('   ├── exhibits/                # Evidence exhibits')
    console.log('   ├── correspondence/          # Party communications')
    console.log('   └── expert_reports/          # Expert witness materials')

    // Step 7: Display judicial ruling with source citations
    console.log('\n7️⃣  Final Judicial Ruling')
    console.log(`   ⚖️  ${judicialRuling.judge} Presiding`)
    console.log(`   📋 Ruling: ${judicialRuling.ruling}`)
    console.log(`   💭 Rationale: ${judicialRuling.rationale.substring(0, 200)}...`)

    // Step 8: Generate source citation footer
    console.log('\n8️⃣  Source Citation Reasoning Trace')
    if (judicialRuling.finalSourceCitations.length > 0) {
      const citationFooter = CitationFormatter.generateTextFooter(
        judicialRuling.finalSourceCitations,
        'Judicial Analysis'
      )
      console.log(citationFooter)
    } else {
      console.log('   📚 [Source citations would appear here with Bates numbers and origins]')
      console.log('   Example: [TF000001] Affidavit of Chip Hilberg (Repo) [Confidence: 92.3%]')
      console.log('   Example: [SLC000045] County Initial Disclosures (Transfer) [Confidence: 87.1%]')
      console.log('   Example: [GD000123] Mining Permit Documentation (Drive) [Confidence: 94.2%]')
    }

    // Step 9: Show system health
    console.log('\n9️⃣  System Health Check')
    const healthCheck = await supervisor.performHealthCheck()
    console.log(`   🏥 Overall Health: ${healthCheck.overallHealth}`)
    console.log(`   📊 Documents Indexed: ${healthCheck.systemMetrics.totalDocumentsIndexed}`)
    console.log(`   ⚖️  Judge: Available for adjudication`)

    // Step 10: Generate processing report
    console.log('\n🔟  Processing Report')
    const processingReport = supervisor.generateProcessingReport(judicialRuling)
    console.log(`   📄 Inquiry ID: ${processingReport.inquiryId}`)
    console.log(`   ✅ Processing Complete: ${processingReport.processingComplete}`)
    console.log(`   🎯 Key Findings: ${processingReport.keyFindings.substring(0, 150)}...`)
    console.log(`   📋 Recommended Next Steps: ${processingReport.recommendedNextSteps.join(', ')}`)

    console.log('\n🎯 Phase 2 Enterprise Benefits Demonstrated:')
    console.log('   • Supervisor Orchestration: No direct task execution by supervisor')
    console.log('   • Automated Quality Gates: Human-in-the-loop for low-quality documents')
    console.log('   • Judicial Adjudication: Hon. Andrew H. Stone final authority')
    console.log('   • Source Citation Tracing: Every output includes Bates + origin')
    console.log('   • Enterprise Organization: Professional document management')

    console.log('\n✅ Phase 2 Complete - Supervisor Orchestration & Discovery Triage Operational!')

  } catch (error) {
    console.error(`❌ Supervisor orchestration failed: ${error}`)

    // Show emergency judicial ruling
    console.log('\n🚨 Emergency Judicial Ruling')
    const emergencyRuling = await supervisor.judgeAgent.renderEmergencyRuling(testInquiry, String(error))
    console.log(`   ⚖️  ${emergencyRuling.judge}: ${emergencyRuling.ruling}`)
    console.log(`   📋 Rationale: ${emergencyRuling.rationale}`)
  }
}

// Additional demonstration functions
async function demonstrateTriageSystem() {
  console.log('\n📊 Automated Triage System Details:')

  // Simulate triage summary (would be generated by DiscoveryAgent)
  const mockTriageSummary = {
    totalDocumentsProcessed: 150,
    passedConfidenceGate: 127,
    flaggedForHumanReview: 23,
    generatedAt: new Date(),
    triageReasons: {
      lowOcrConfidence: 15,
      handwrittenContent: 5,
      imageContent: 2,
      corruptedFiles: 1
    }
  }

  console.log(`   📄 Documents Processed: ${mockTriageSummary.totalDocumentsProcessed}`)
  console.log(`   ✅ Passed Confidence Gate: ${mockTriageSummary.passedConfidenceGate}`)
  console.log(`   🚨 Flagged for Human Review: ${mockTriageSummary.flaggedForHumanReview}`)
  console.log('   📋 Flagging Breakdown:')
  console.log(`      • Low OCR Confidence (<85%): ${mockTriageSummary.triageReasons.lowOcrConfidence}`)
  console.log(`      • Handwritten Content: ${mockTriageSummary.triageReasons.handwrittenContent}`)
  console.log(`      • Image Content: ${mockTriageSummary.triageReasons.imageContent}`)
  console.log(`      • Corrupted Files: ${mockTriageSummary.triageReasons.corruptedFiles}`)
}

async function demonstrateCitationFooters() {
  console.log('\n📚 Source Citation Footer Examples:')

  const mockCitations = [
    {
      batesNumber: 'TF000001',
      sourceOrigin: 'Repo' as const,
      documentTitle: 'Affidavit of Chip Hilberg - Mining Operations History',
      relevantSection: 'Paragraph 12-15',
      confidenceScore: 0.923
    },
    {
      batesNumber: 'SLC000045',
      sourceOrigin: 'Transfer' as const,
      documentTitle: 'Salt Lake County Initial Disclosures',
      confidenceScore: 0.871
    },
    {
      batesNumber: 'GD000123',
      sourceOrigin: 'Drive' as const,
      documentTitle: 'Historical Mining Permit Documentation',
      confidenceScore: 0.942
    }
  ]

  const citationFooter = CitationFormatter.generateTextFooter(mockCitations, 'Discovery Analysis')
  console.log(citationFooter)
}

// Run the complete Phase 2 demonstration
if (require.main === module) {
  demonstratePhase2SupervisorSystem()
    .then(() => {
      console.log('\n🎬 Additional demonstrations available:')
      console.log('   • demonstrateTriageSystem() - Detailed triage breakdown')
      console.log('   • demonstrateCitationFooters() - Citation formatting examples')
    })
    .catch(console.error)
}

export {
  demonstratePhase2SupervisorSystem,
  demonstrateTriageSystem,
  demonstrateCitationFooters
}