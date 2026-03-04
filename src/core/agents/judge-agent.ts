/**
 * JudgeAgent - Hon. Andrew H. Stone
 *
 * Provides final judicial adjudication based on agent findings
 * Renders judicial rulings with legal rationale and source citations
 */

import { caseManager, getCurrentPlaintiff, getCurrentDefendant } from '@/lib/case-ledger'
import type { SupervisorSummary, JudicialRuling, SourceCitation } from '../controller'

export interface JudicialAnalysis {
  credibilityAssessment: CredibilityAssessment
  legalReasoning: LegalReasoning
  evidentiaryRuling: EvidentiaryRuling
  proceduralNotes: ProceduralNote[]
  dispositionRecommendation: Disposition
}

interface CredibilityAssessment {
  documentReliability: 'high' | 'medium' | 'low'
  statutoryAuthority: 'strong' | 'adequate' | 'weak'
  overallCredibility: 'credible' | 'somewhat_credible' | 'not_credible'
  credibilityFactors: string[]
}

interface LegalReasoning {
  primaryLegalIssue: string
  applicableLaw: string[]
  legalStandard: string
  analysisFramework: string
  conclusion: string
  supportingAuthority: string[]
}

interface EvidentiaryRuling {
  admissibleEvidence: string[]
  excludedEvidence: string[]
  evidentiaryStandard: string
  sufficientEvidence: boolean
  evidenceWeighting: EvidenceWeight[]
}

interface EvidenceWeight {
  evidence: string
  weight: 'substantial' | 'moderate' | 'minimal'
  rationale: string
}

interface ProceduralNote {
  type: 'case_management' | 'discovery' | 'motion_practice' | 'trial_preparation'
  note: string
  deadline?: string
  party?: string
}

interface Disposition {
  ruling: 'grant' | 'deny' | 'grant_in_part' | 'continue' | 'dismiss'
  basis: string
  conditions?: string[]
  nextSteps: string[]
}

/**
 * JudgeAgent - Hon. Andrew H. Stone presiding
 */
export class JudgeAgent {
  private readonly judgeName = 'Hon. Andrew H. Stone'
  private readonly jurisdiction = 'Third District Court, Salt Lake County'

  // CONSTITUTIONAL JURISPRUDENCE - TEXTUALIST & ORIGINALIST PRIORITY
  private readonly judicialPhilosophy = {
    textualism: true,
    originalism: true,
    federalPreemptionStrict: true
  }

  constructor() {
    console.log(`⚖️  ${this.judgeName} initialized for judicial review`)
    console.log(`🏛️  Presiding in: ${this.jurisdiction}`)
    console.log(`🗳️  Judicial Philosophy: Textualist & Originalist`)
    console.log(`📜 Federal/State Preemption: Strict Constitutional Analysis`)
  }

  /**
   * Render judicial ruling based on supervisor summary
   */
  async renderRuling(supervisorSummary: SupervisorSummary): Promise<JudicialRuling> {
    console.log(`⚖️  ${this.judgeName} reviewing case materials...`)
    console.log(`📋 Case: ${getCurrentPlaintiff()} v. ${getCurrentDefendant()}`)

    const startTime = Date.now()

    try {
      // Step 1: Assess credibility of presented materials
      const credibilityAssessment = this.assessCredibility(supervisorSummary)

      // Step 2: Apply legal reasoning framework
      const legalReasoning = this.applyLegalReasoning(supervisorSummary, credibilityAssessment)

      // Step 3: Make evidentiary rulings
      const evidentiaryRuling = this.makeEvidentiaryRulings(supervisorSummary)

      // Step 4: Generate procedural notes
      const proceduralNotes = this.generateProceduralNotes(supervisorSummary)

      // Step 5: Determine case disposition
      const disposition = this.determineCaseDisposition(
        supervisorSummary,
        legalReasoning,
        evidentiaryRuling
      )

      // Step 6: Compile final judicial ruling
      const judicialRuling = this.compileJudicialRuling(
        supervisorSummary,
        {
          credibilityAssessment,
          legalReasoning,
          evidentiaryRuling,
          proceduralNotes,
          dispositionRecommendation: disposition
        }
      )

      console.log(`✅ ${this.judgeName} ruling rendered: ${judicialRuling.ruling}`)
      console.log(`⏱️  Judicial review completed in ${Date.now() - startTime}ms`)

      return judicialRuling

    } catch (error) {
      console.error(`❌ Judicial review failed: ${error}`)
      return this.renderEmergencyRuling(
        { id: supervisorSummary.inquiryId, question: supervisorSummary.question } as any,
        `Judicial review system error: ${error}`
      )
    }
  }

  /**
   * Render emergency ruling for system failures
   */
  async renderEmergencyRuling(inquiry: any, errorMessage: string): Promise<JudicialRuling> {
    console.log(`🚨 ${this.judgeName} rendering emergency ruling for system failure`)

    return {
      inquiryId: inquiry.id,
      judge: this.judgeName,
      ruling: 'CONTINUE - System Error Requires Resolution',
      rationale: `The Court's case management system has encountered a technical failure preventing proper review of the presented materials. ${errorMessage} The matter is continued pending resolution of technical issues to ensure all parties receive proper judicial consideration.`,
      citedAuthorities: [
        'Utah R. Civ. P. 16 (Case Management)',
        'Due Process Clause, U.S. Const. Amend. XIV'
      ],
      proceduralNotes: [
        'Technical support to resolve case management system failure',
        'Re-submit materials once system is operational',
        'Parties to maintain current deadlines unless otherwise ordered'
      ],
      finalSourceCitations: [],
      timestamp: new Date()
    }
  }

  /**
   * Assess credibility of agent findings
   */
  private assessCredibility(summary: SupervisorSummary): CredibilityAssessment {
    let documentReliability: CredibilityAssessment['documentReliability'] = 'medium'
    let statutoryAuthority: CredibilityAssessment['statutoryAuthority'] = 'adequate'

    // Assess document reliability from discovery agent
    const discoveryFindings = summary.agentFindings.find(f => f.agentType === 'discovery')
    if (discoveryFindings) {
      const triageFlags = discoveryFindings.warnings.length
      const totalFindings = discoveryFindings.findings.length

      if (totalFindings > 0 && triageFlags / totalFindings < 0.1) {
        documentReliability = 'high'
      } else if (triageFlags / totalFindings > 0.3) {
        documentReliability = 'low'
      }
    }

    // Assess statutory authority from statute agent
    const statuteFindings = summary.agentFindings.find(f => f.agentType === 'statute')
    if (statuteFindings) {
      const directStatutes = statuteFindings.findings.filter(f => f.applicability === 'direct').length
      const totalStatutes = statuteFindings.findings.length

      if (directStatutes > totalStatutes * 0.6) {
        statutoryAuthority = 'strong'
      } else if (directStatutes < totalStatutes * 0.2) {
        statutoryAuthority = 'weak'
      }
    }

    // Determine overall credibility
    let overallCredibility: CredibilityAssessment['overallCredibility'] = 'somewhat_credible'
    if (documentReliability === 'high' && statutoryAuthority === 'strong') {
      overallCredibility = 'credible'
    } else if (documentReliability === 'low' || statutoryAuthority === 'weak') {
      overallCredibility = 'not_credible'
    }

    const credibilityFactors: string[] = []
    credibilityFactors.push(`Document reliability assessed as ${documentReliability}`)
    credibilityFactors.push(`Statutory authority assessed as ${statutoryAuthority}`)
    if (summary.processingMetrics.humanReviewRequired > 10) {
      credibilityFactors.push(`${summary.processingMetrics.humanReviewRequired} documents flagged for human review`)
    }

    return {
      documentReliability,
      statutoryAuthority,
      overallCredibility,
      credibilityFactors
    }
  }

  /**
   * Apply legal reasoning framework
   */
  private applyLegalReasoning(
    summary: SupervisorSummary,
    credibility: CredibilityAssessment
  ): LegalReasoning {
    // Identify primary legal issue
    let primaryLegalIssue = 'Legal dispute requiring judicial resolution'
    if (summary.question.toLowerCase().includes('vested')) {
      primaryLegalIssue = 'Vested rights in mining operations under Utah law'
    } else if (summary.question.toLowerCase().includes('ordinance')) {
      primaryLegalIssue = 'Validity of local ordinance regulating land use'
    } else if (summary.question.toLowerCase().includes('preemption')) {
      primaryLegalIssue = 'State preemption of local regulatory authority'
    }

    // Extract applicable law from statutory findings
    const statuteFindings = summary.agentFindings.find(f => f.agentType === 'statute')
    const applicableLaw = statuteFindings?.findings
      .filter(f => f.applicability === 'direct' || f.applicability === 'analogous')
      .map(f => f.statute || 'Unspecified statute')
      .slice(0, 5) || []

    // Determine legal standard
    let legalStandard = 'Preponderance of the evidence standard'
    if (primaryLegalIssue.includes('Constitutional') ||
        summary.question.toLowerCase().includes('taking')) {
      legalStandard = 'Clear and convincing evidence standard'
    }

    // Framework for analysis
    const analysisFramework = this.determineAnalysisFramework(primaryLegalIssue, applicableLaw)

    // Preliminary conclusion based on credibility and evidence
    let conclusion = 'Matter requires additional briefing and evidence'
    if (credibility.overallCredibility === 'credible' && summary.confidenceLevel > 0.7) {
      conclusion = 'Sufficient basis for judicial determination on the merits'
    } else if (credibility.overallCredibility === 'not_credible') {
      conclusion = 'Insufficient reliable evidence for substantive ruling'
    }

    // Supporting authority from consolidated findings
    const supportingAuthority = summary.consolidatedFindings
      .filter(f => f.confidence > 0.6)
      .map(f => f.topic)
      .slice(0, 4)

    return {
      primaryLegalIssue,
      applicableLaw,
      legalStandard,
      analysisFramework,
      conclusion,
      supportingAuthority
    }
  }

  /**
   * Make evidentiary rulings
   */
  private makeEvidentiaryRulings(summary: SupervisorSummary): EvidentiaryRuling {
    const admissibleEvidence: string[] = []
    const excludedEvidence: string[] = []
    const evidenceWeighting: EvidenceWeight[] = []

    // Process discovery findings for admissibility
    const discoveryFindings = summary.agentFindings.find(f => f.agentType === 'discovery')
    if (discoveryFindings) {
      discoveryFindings.findings.forEach(finding => {
        if (finding.passesConfidenceGate && finding.relevanceScore > 0.6) {
          admissibleEvidence.push(finding.batesNumber || 'Unknown document')

          evidenceWeighting.push({
            evidence: finding.batesNumber || 'Unknown document',
            weight: finding.relevanceScore > 0.8 ? 'substantial' :
                   finding.relevanceScore > 0.7 ? 'moderate' : 'minimal',
            rationale: `Relevance score: ${finding.relevanceScore}, document quality verified`
          })
        } else {
          excludedEvidence.push(finding.batesNumber || 'Unknown document')
        }
      })
    }

    const evidentiaryStandard = 'Utah R. Evid. 901 (Authentication) and 902 (Self-Authentication)'
    const sufficientEvidence = admissibleEvidence.length > 0 &&
                              evidenceWeighting.some(w => w.weight === 'substantial')

    return {
      admissibleEvidence,
      excludedEvidence,
      evidentiaryStandard,
      sufficientEvidence,
      evidenceWeighting
    }
  }

  /**
   * Generate procedural notes
   */
  private generateProceduralNotes(summary: SupervisorSummary): ProceduralNote[] {
    const notes: ProceduralNote[] = []

    // Case management notes
    if (summary.processingMetrics.humanReviewRequired > 0) {
      notes.push({
        type: 'discovery',
        note: `${summary.processingMetrics.humanReviewRequired} documents require authentication before trial`,
        party: getCurrentPlaintiff()
      })
    }

    // Motion practice notes
    const counselFindings = summary.agentFindings.find(f => f.agentType === 'counsel')
    if (counselFindings?.findings[0]?.primaryArguments?.some(arg =>
        arg.toLowerCase().includes('summary judgment'))) {
      notes.push({
        type: 'motion_practice',
        note: 'Consider motion for summary judgment on statutory preemption',
        deadline: '30 days from completion of discovery'
      })
    }

    // Trial preparation notes
    if (summary.confidenceLevel < 0.5) {
      notes.push({
        type: 'trial_preparation',
        note: 'Additional expert witness testimony may be required for complex statutory interpretation'
      })
    }

    return notes
  }

  /**
   * Determine case disposition
   */
  private determineCaseDisposition(
    summary: SupervisorSummary,
    legalReasoning: LegalReasoning,
    evidentiary: EvidentiaryRuling
  ): Disposition {
    let ruling: Disposition['ruling'] = 'continue'
    let basis = 'Matter requires further proceedings'
    const conditions: string[] = []
    const nextSteps: string[] = []

    // Analyze confidence level and evidence quality
    if (summary.confidenceLevel > 0.8 && evidentiary.sufficientEvidence) {
      if (legalReasoning.conclusion.includes('Sufficient basis')) {
        ruling = 'grant_in_part'
        basis = 'Partial relief warranted based on available evidence and applicable law'
        nextSteps.push('Parties to submit proposed orders')
      }
    } else if (summary.confidenceLevel < 0.3 || !evidentiary.sufficientEvidence) {
      ruling = 'deny'
      basis = 'Insufficient evidence and legal authority for requested relief'
      nextSteps.push('Plaintiff may refile with additional evidence')
    }

    // Check for fatal procedural issues
    if (summary.processingMetrics.humanReviewRequired > summary.processingMetrics.documentsReviewed * 0.5) {
      ruling = 'continue'
      basis = 'Substantial document authentication issues require resolution'
      conditions.push('Complete document authentication process')
      nextSteps.push('Schedule evidentiary hearing on document authenticity')
    }

    return {
      ruling,
      basis,
      conditions: conditions.length > 0 ? conditions : undefined,
      nextSteps
    }
  }

  /**
   * Compile final judicial ruling
   */
  private compileJudicialRuling(
    summary: SupervisorSummary,
    analysis: JudicialAnalysis
  ): JudicialRuling {
    // Generate judicial ruling text
    const ruling = this.generateRulingText(analysis)

    // Compile rationale
    const rationale = this.compileRationale(analysis)

    // Extract cited authorities
    const citedAuthorities = [
      ...analysis.legalReasoning.applicableLaw,
      analysis.evidentiaryRuling.evidentiaryStandard,
      'Utah R. Civ. P. 56 (Summary Judgment)',
      'Utah R. Civ. P. 16 (Case Management)'
    ].filter(Boolean)

    // Convert procedural notes to strings
    const proceduralNotes = analysis.proceduralNotes.map(note => note.note)

    // Compile all source citations
    const finalSourceCitations = this.compileSourceCitations(summary)

    return {
      inquiryId: summary.inquiryId,
      judge: this.judgeName,
      ruling,
      rationale,
      citedAuthorities: [...new Set(citedAuthorities)], // Remove duplicates
      proceduralNotes,
      finalSourceCitations,
      timestamp: new Date()
    }
  }

  /**
   * Determine analysis framework - TEXTUALIST & ORIGINALIST PRIORITY
   */
  private determineAnalysisFramework(primaryIssue: string, applicableLaw: string[]): string {
    // FEDERAL PATENT PREEMPTION PRIORITY (Textualist/Originalist)
    const hasFederalPatentIssue = applicableLaw.some(law =>
      law.includes('Patent') || law.includes('35 U.S.C') || law.includes('Federal'))

    if (hasFederalPatentIssue && primaryIssue.includes('ordinance')) {
      return 'CONSTITUTIONAL PREEMPTION ANALYSIS - Supremacy Clause Priority: (1) Federal Patents supersede local ordinances per U.S. Const. Art. VI, (2) Textualist interpretation of federal authority, (3) Original understanding of Commerce Clause scope'
    }

    if (primaryIssue.includes('Vested rights')) {
      return 'Textualist vested rights analysis: (1) Plain meaning of statutory text at enactment, (2) Original understanding of property rights, (3) Historical precedent from founding era'
    }

    if (primaryIssue.includes('preemption')) {
      return 'Originalist preemption analysis: (1) Constitutional text supremacy, (2) Founding-era understanding of federal-state authority, (3) Anti-Commandeering doctrine stricture'
    }

    if (primaryIssue.includes('ordinance')) {
      return 'Local authority constitutional limits: (1) Tenth Amendment reserved powers, (2) Originalist police power scope, (3) Textualist statutory construction'
    }

    return 'Textualist statutory interpretation with originalist constitutional framework'
  }

  /**
   * Generate ruling text
   */
  private generateRulingText(analysis: JudicialAnalysis): string {
    const disposition = analysis.dispositionRecommendation

    switch (disposition.ruling) {
      case 'grant':
        return 'GRANTED - Relief awarded as requested'
      case 'grant_in_part':
        return 'GRANTED IN PART - Partial relief awarded with conditions'
      case 'deny':
        return 'DENIED - Relief not warranted on current record'
      case 'dismiss':
        return 'DISMISSED - Case dismissed with prejudice'
      case 'continue':
        return 'CONTINUED - Matter continued for further proceedings'
      default:
        return 'ORDER RESERVED - Decision pending additional briefing'
    }
  }

  /**
   * Compile legal rationale
   */
  private compileRationale(analysis: JudicialAnalysis): string {
    let rationale = `The Court has reviewed the presented evidence and applicable law concerning ${analysis.legalReasoning.primaryLegalIssue.toLowerCase()}. `

    rationale += `${analysis.legalReasoning.analysisFramework} `

    rationale += `Based on the ${analysis.legalReasoning.legalStandard.toLowerCase()}, the Court finds that the evidence presented is ${analysis.credibilityAssessment.overallCredibility.replace('_', ' ')}. `

    if (analysis.evidentiaryRuling.sufficientEvidence) {
      rationale += 'The admissible evidence provides sufficient basis for judicial determination. '
    } else {
      rationale += 'The admissible evidence is insufficient for substantive ruling on the merits. '
    }

    rationale += `${analysis.dispositionRecommendation.basis}`

    return rationale
  }

  /**
   * Compile source citations
   */
  private compileSourceCitations(summary: SupervisorSummary): SourceCitation[] {
    const citations: SourceCitation[] = []

    // Collect all source citations from agent findings
    summary.agentFindings.forEach(finding => {
      citations.push(...finding.sourceCitations)
    })

    // Remove duplicates and sort by confidence
    const uniqueCitations = citations
      .filter((citation, index, self) =>
        index === self.findIndex(c => c.batesNumber === citation.batesNumber)
      )
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 10) // Limit to top 10

    return uniqueCitations
  }

  /**
   * Health status check
   */
  async getHealthStatus(): Promise<{ healthy: boolean; message?: string; lastActivity?: Date }> {
    return {
      healthy: true,
      message: `${this.judgeName} available for judicial review in ${this.jurisdiction}`,
      lastActivity: new Date()
    }
  }
}