/**
 * CounselAgent - Strategic Legal Analysis
 *
 * Provides strategic evaluation of legal position based on discovery findings
 * and statutory analysis. Offers tactical recommendations for case strategy.
 */

import { getCurrentPlaintiff, getCurrentDefendant, caseManager } from '@/lib/case-ledger'
import type { AgentFindings, SourceCitation } from '../controller'

export interface StrategicAnalysis {
  position: 'strong' | 'moderate' | 'weak' | 'critical'
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  recommendedStrategy: CaseStrategy
  riskAssessment: RiskAssessment
  confidence: number
}

export interface CaseStrategy {
  primaryArguments: string[]
  defensivePositions: string[]
  evidenceNeeds: string[]
  proceduralRecommendations: string[]
  settlementConsiderations?: SettlementAnalysis
}

interface RiskAssessment {
  litigationRisk: 'low' | 'medium' | 'high'
  adverseCostRisk: number // 0-1 scale
  reputationalRisk: 'minimal' | 'moderate' | 'significant'
  timelineRisk: string
  keyVulnerabilities: string[]
}

interface SettlementAnalysis {
  recommendSettlement: boolean
  estimatedRange: string
  settlementStrengths: string[]
  litigationAdvantages: string[]
}

/**
 * CounselAgent - Strategic and tactical legal analysis
 */
export class CounselAgent {
  constructor() {
    console.log('🎓 CounselAgent initialized for strategic analysis')
  }

  /**
   * Evaluate strategic position based on discovery and statutory findings
   */
  async evaluateStrategicPosition(
    inquiry: string,
    discoveryFindings: any[],
    statutoryFindings: any[]
  ): Promise<AgentFindings> {
    const startTime = Date.now()
    console.log(`🎯 CounselAgent evaluating strategic position for: "${inquiry}"`)

    try {
      // Step 1: Analyze case strengths and weaknesses
      const swotAnalysis = this.performSWOTAnalysis(discoveryFindings, statutoryFindings)

      // Step 2: Assess litigation risks
      const riskAssessment = this.assessLitigationRisk(discoveryFindings, statutoryFindings)

      // Step 3: Develop case strategy recommendations
      const caseStrategy = this.developCaseStrategy(
        inquiry,
        swotAnalysis,
        discoveryFindings,
        statutoryFindings
      )

      // Step 4: Evaluate settlement vs litigation
      const settlementAnalysis = this.evaluateSettlementProspects(
        swotAnalysis,
        riskAssessment,
        statutoryFindings
      )

      // Step 5: Generate strategic recommendations
      const strategicRecommendations = this.generateStrategicRecommendations(
        swotAnalysis,
        riskAssessment,
        caseStrategy,
        settlementAnalysis
      )

      // Step 6: Create source citations for strategic analysis
      const sourceCitations = this.createStrategicSourceCitations(
        discoveryFindings,
        statutoryFindings
      )

      const processingTime = Date.now() - startTime
      console.log(`✅ CounselAgent strategic analysis complete (${processingTime}ms)`)

      return {
        agentType: 'counsel',
        agent: 'CounselAgent v2.0',
        findings: strategicRecommendations.map(rec => ({
          strategy: rec.strategy,
          position: rec.position,
          strengths: rec.strengths,
          weaknesses: rec.weaknesses,
          primaryArguments: rec.primaryArguments,
          riskLevel: rec.riskLevel,
          confidence: rec.confidence,
          topic: this.categorizeStrategicTopic(rec.strategy),
          significance: rec.position === 'strong' ? 'critical' :
                      rec.position === 'moderate' ? 'important' : 'reference',
          summary: `Strategic Position: ${rec.position} - ${rec.strategy}`,
          settlementRecommendation: rec.settlementRecommendation,
          proceduralNotes: rec.proceduralNotes
        })),
        confidence: this.calculateStrategicConfidence(swotAnalysis, riskAssessment),
        processingTime,
        sourceCitations,
        warnings: this.generateStrategicWarnings(riskAssessment, swotAnalysis)
      }

    } catch (error) {
      console.error(`❌ CounselAgent failed: ${error}`)

      return {
        agentType: 'counsel',
        agent: 'CounselAgent v2.0',
        findings: [],
        confidence: 0,
        processingTime: Date.now() - startTime,
        sourceCitations: [],
        warnings: [`Strategic analysis failed: ${error}`]
      }
    }
  }

  /**
   * Perform SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
   */
  private performSWOTAnalysis(
    discoveryFindings: any[],
    statutoryFindings: any[]
  ): StrategicAnalysis {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const opportunities: string[] = []
    const threats: string[] = []

    // Analyze discovery strengths
    const strongDiscoveryFindings = discoveryFindings.filter(f => f.relevanceScore > 0.8)
    if (strongDiscoveryFindings.length > 0) {
      strengths.push(`Strong documentary evidence: ${strongDiscoveryFindings.length} high-relevance documents`)
    }

    const flaggedDocuments = discoveryFindings.filter(f => f.requiresHumanReview)
    if (flaggedDocuments.length > 5) {
      weaknesses.push(`Document quality issues: ${flaggedDocuments.length} documents require human review`)
    }

    // Analyze statutory strengths
    const directStatutes = statutoryFindings.filter(f => f.applicability === 'direct')
    if (directStatutes.length > 0) {
      strengths.push(`Direct statutory authority: ${directStatutes.length} directly applicable statutes`)
    }

    const inapplicableStatutes = statutoryFindings.filter(f => f.applicability === 'inapplicable')
    if (inapplicableStatutes.length > directStatutes.length) {
      weaknesses.push('Limited statutory support - more inapplicable than applicable authorities')
    }

    // Identify opportunities
    if (statutoryFindings.some(f => f.preemptionAnalysis?.statePreemptsLocal)) {
      opportunities.push('State preemption argument available')
    }

    if (discoveryFindings.some(f => f.documentType?.includes('affidavit'))) {
      opportunities.push('Witness testimony available through affidavits')
    }

    // Identify threats
    if (statutoryFindings.some(f => f.contradictingFactors?.length > 0)) {
      threats.push('Statutory contradictions identified in legal framework')
    }

    if (discoveryFindings.filter(f => f.passesConfidenceGate === false).length > 10) {
      threats.push('Significant document quality issues may undermine case')
    }

    // Determine overall position
    const strengthScore = strengths.length * 2
    const weaknessScore = weaknesses.length
    const opportunityScore = opportunities.length
    const threatScore = threats.length * 1.5

    const netScore = strengthScore + opportunityScore - weaknessScore - threatScore
    let position: StrategicAnalysis['position'] = 'moderate'

    if (netScore > 4) position = 'strong'
    else if (netScore < -2) position = 'weak'
    else if (netScore < -5) position = 'critical'

    return {
      position,
      strengths,
      weaknesses,
      opportunities,
      threats,
      recommendedStrategy: this.developCaseStrategy(
        'strategic analysis',
        { strengths, weaknesses, opportunities, threats },
        discoveryFindings,
        statutoryFindings
      ),
      riskAssessment: this.assessLitigationRisk(discoveryFindings, statutoryFindings),
      confidence: this.calculatePositionConfidence(netScore, strengthScore)
    }
  }

  /**
   * Assess litigation risks
   */
  private assessLitigationRisk(
    discoveryFindings: any[],
    statutoryFindings: any[]
  ): RiskAssessment {
    let riskScore = 0

    // Document quality risks
    const documentIssues = discoveryFindings.filter(f => !f.passesConfidenceGate).length
    const documentRatio = documentIssues / Math.max(discoveryFindings.length, 1)

    if (documentRatio > 0.3) riskScore += 2 // High document risk
    else if (documentRatio > 0.15) riskScore += 1 // Medium document risk

    // Legal authority risks
    const weakStatutes = statutoryFindings.filter(f =>
      f.applicability === 'inapplicable' || f.contradictingFactors?.length > 0
    ).length

    if (weakStatutes > statutoryFindings.length * 0.5) riskScore += 2
    else if (weakStatutes > 0) riskScore += 1

    // Constitutional risks
    const constitutionalIssues = statutoryFindings.some(f =>
      f.rationale?.toLowerCase().includes('constitutional') ||
      f.rationale?.toLowerCase().includes('taking')
    )
    if (constitutionalIssues) riskScore += 1

    let litigationRisk: RiskAssessment['litigationRisk'] = 'medium'
    if (riskScore >= 4) litigationRisk = 'high'
    else if (riskScore <= 1) litigationRisk = 'low'

    return {
      litigationRisk,
      adverseCostRisk: Math.min(riskScore * 0.15, 0.8),
      reputationalRisk: riskScore >= 3 ? 'significant' :
                       riskScore >= 2 ? 'moderate' : 'minimal',
      timelineRisk: riskScore >= 3 ? 'Extended litigation likely (18+ months)' :
                    'Standard litigation timeline (12-18 months)',
      keyVulnerabilities: this.identifyKeyVulnerabilities(discoveryFindings, statutoryFindings)
    }
  }

  /**
   * Develop case strategy based on analysis
   */
  private developCaseStrategy(
    inquiry: string,
    swotAnalysis: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] },
    discoveryFindings: any[],
    statutoryFindings: any[]
  ): CaseStrategy {
    const primaryArguments: string[] = []
    const defensivePositions: string[] = []
    const evidenceNeeds: string[] = []
    const proceduralRecommendations: string[] = []

    // Build primary arguments from strengths and opportunities
    if (swotAnalysis.strengths.some(s => s.includes('statutory authority'))) {
      primaryArguments.push('Assert direct statutory authority for vested mining rights')
    }

    if (swotAnalysis.opportunities.includes('State preemption argument available')) {
      primaryArguments.push('Challenge local ordinance under state preemption doctrine')
    }

    if (discoveryFindings.some(f => f.documentType?.includes('patent'))) {
      primaryArguments.push('Establish vested rights through historical land patents')
    }

    // Develop defensive positions for weaknesses and threats
    if (swotAnalysis.weaknesses.some(w => w.includes('Document quality'))) {
      defensivePositions.push('Address document authenticity through expert testimony')
      evidenceNeeds.push('Document authentication expert witness')
    }

    if (swotAnalysis.threats.some(t => t.includes('Statutory contradictions'))) {
      defensivePositions.push('Distinguish adverse statutory interpretations')
    }

    // Procedural recommendations
    if (discoveryFindings.filter(f => f.requiresHumanReview).length > 10) {
      proceduralRecommendations.push('Complete document authentication before trial')
    }

    if (statutoryFindings.some(f => f.preemptionAnalysis?.confidence > 0.8)) {
      proceduralRecommendations.push('File motion for summary judgment on preemption grounds')
    }

    return {
      primaryArguments,
      defensivePositions,
      evidenceNeeds,
      proceduralRecommendations
    }
  }

  /**
   * Evaluate settlement prospects
   */
  private evaluateSettlementProspects(
    swotAnalysis: StrategicAnalysis,
    riskAssessment: RiskAssessment,
    statutoryFindings: any[]
  ): SettlementAnalysis {
    let recommendSettlement = false
    let estimatedRange = 'Not recommended'
    const settlementStrengths: string[] = []
    const litigationAdvantages: string[] = []

    // Factors favoring settlement
    if (riskAssessment.litigationRisk === 'high') {
      recommendSettlement = true
      settlementStrengths.push('High litigation risk favors negotiated resolution')
    }

    if (swotAnalysis.position === 'weak' || swotAnalysis.position === 'critical') {
      recommendSettlement = true
      settlementStrengths.push('Weak legal position suggests settlement preferable to trial')
    }

    // Factors favoring litigation
    if (swotAnalysis.position === 'strong') {
      litigationAdvantages.push('Strong legal position supports trial strategy')
    }

    if (statutoryFindings.some(f => f.preemptionAnalysis?.confidence > 0.8)) {
      litigationAdvantages.push('High-confidence preemption argument available')
    }

    // Estimate settlement range
    if (recommendSettlement) {
      if (swotAnalysis.position === 'critical') {
        estimatedRange = 'Minimal recovery - focus on avoiding adverse costs'
      } else if (swotAnalysis.position === 'weak') {
        estimatedRange = 'Limited recovery - 10-30% of claimed damages'
      } else {
        estimatedRange = 'Moderate recovery - 30-60% of claimed damages'
      }
    }

    return {
      recommendSettlement,
      estimatedRange,
      settlementStrengths,
      litigationAdvantages
    }
  }

  /**
   * Generate strategic recommendations
   */
  private generateStrategicRecommendations(
    swotAnalysis: StrategicAnalysis,
    riskAssessment: RiskAssessment,
    caseStrategy: CaseStrategy,
    settlementAnalysis: SettlementAnalysis
  ): any[] {
    return [{
      strategy: 'Primary Case Strategy',
      position: swotAnalysis.position,
      strengths: swotAnalysis.strengths,
      weaknesses: swotAnalysis.weaknesses,
      primaryArguments: caseStrategy.primaryArguments,
      riskLevel: riskAssessment.litigationRisk,
      confidence: swotAnalysis.confidence,
      settlementRecommendation: settlementAnalysis.recommendSettlement,
      proceduralNotes: caseStrategy.proceduralRecommendations
    }]
  }

  /**
   * Identify key vulnerabilities
   */
  private identifyKeyVulnerabilities(
    discoveryFindings: any[],
    statutoryFindings: any[]
  ): string[] {
    const vulnerabilities: string[] = []

    // Document vulnerabilities
    const lowQualityDocs = discoveryFindings.filter(f => !f.passesConfidenceGate).length
    if (lowQualityDocs > 5) {
      vulnerabilities.push(`Document authenticity challenges (${lowQualityDocs} flagged documents)`)
    }

    // Legal vulnerabilities
    const contradictingStatutes = statutoryFindings.filter(f =>
      f.contradictingFactors?.length > 0
    ).length

    if (contradictingStatutes > 0) {
      vulnerabilities.push(`Statutory interpretation challenges (${contradictingStatutes} statutes with contradictions)`)
    }

    // Procedural vulnerabilities
    if (discoveryFindings.length < 10) {
      vulnerabilities.push('Limited discovery may indicate incomplete case development')
    }

    return vulnerabilities
  }

  /**
   * Create strategic source citations
   */
  private createStrategicSourceCitations(
    discoveryFindings: any[],
    statutoryFindings: any[]
  ): SourceCitation[] {
    const citations: SourceCitation[] = []

    // Add top discovery citations
    discoveryFindings
      .filter(f => f.relevanceScore > 0.7)
      .slice(0, 3)
      .forEach(f => {
        citations.push({
          batesNumber: f.batesNumber || 'DISCOVERY-REF',
          sourceOrigin: 'Repo',
          documentTitle: f.documentType || 'Discovery Evidence',
          confidenceScore: f.relevanceScore
        })
      })

    // Add top statutory citations
    statutoryFindings
      .filter(f => f.applicability === 'direct' || f.applicability === 'analogous')
      .slice(0, 2)
      .forEach(f => {
        citations.push({
          batesNumber: 'STATUTE-REF',
          sourceOrigin: 'Repo',
          documentTitle: f.statute || 'Legal Authority',
          confidenceScore: f.confidence
        })
      })

    return citations
  }

  /**
   * Categorize strategic topic
   */
  private categorizeStrategicTopic(strategy: string): string {
    if (strategy.toLowerCase().includes('preemption')) {
      return 'Preemption Strategy'
    }
    if (strategy.toLowerCase().includes('vested')) {
      return 'Vested Rights Strategy'
    }
    if (strategy.toLowerCase().includes('settlement')) {
      return 'Settlement Strategy'
    }
    return 'General Case Strategy'
  }

  /**
   * Calculate strategic confidence
   */
  private calculateStrategicConfidence(
    swotAnalysis: StrategicAnalysis,
    riskAssessment: RiskAssessment
  ): number {
    let confidence = 0.5

    // Position strength factor
    const positionFactor = {
      strong: 0.9,
      moderate: 0.7,
      weak: 0.4,
      critical: 0.2
    }[swotAnalysis.position]

    // Risk factor (inverse)
    const riskFactor = {
      low: 0.9,
      medium: 0.6,
      high: 0.3
    }[riskAssessment.litigationRisk]

    // Strength vs weakness ratio
    const swotRatio = swotAnalysis.strengths.length /
      Math.max(swotAnalysis.weaknesses.length + swotAnalysis.threats.length, 1)

    confidence = (positionFactor * 0.4 + riskFactor * 0.3 + Math.min(swotRatio * 0.1, 0.3))

    return Math.max(Math.min(confidence, 1.0), 0.1)
  }

  /**
   * Calculate position confidence
   */
  private calculatePositionConfidence(netScore: number, strengthScore: number): number {
    const baseConfidence = 0.5
    const scoreBonus = Math.max(-0.3, Math.min(0.4, netScore * 0.05))
    const strengthBonus = Math.min(0.2, strengthScore * 0.02)

    return baseConfidence + scoreBonus + strengthBonus
  }

  /**
   * Generate strategic warnings
   */
  private generateStrategicWarnings(
    riskAssessment: RiskAssessment,
    swotAnalysis: StrategicAnalysis
  ): string[] {
    const warnings: string[] = []

    if (riskAssessment.litigationRisk === 'high') {
      warnings.push('High litigation risk - consider settlement alternatives')
    }

    if (swotAnalysis.position === 'critical') {
      warnings.push('Critical strategic position - immediate case re-evaluation recommended')
    }

    if (riskAssessment.adverseCostRisk > 0.6) {
      warnings.push('Significant adverse cost exposure - fee-shifting provisions may apply')
    }

    if (swotAnalysis.weaknesses.length > swotAnalysis.strengths.length) {
      warnings.push('Weaknesses outnumber strengths - defensive strategy recommended')
    }

    return warnings
  }

  /**
   * Health status check
   */
  async getHealthStatus(): Promise<{ healthy: boolean; message?: string; lastActivity?: Date }> {
    const currentCase = caseManager.getCurrentCase()

    return {
      healthy: !!currentCase,
      message: currentCase ?
        `Strategic analysis ready for ${currentCase.displayName}` :
        'No active case configured',
      lastActivity: new Date()
    }
  }
}