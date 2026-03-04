/**
 * StatuteAgent - Legal Framework Analysis
 *
 * Analyzes statutory authority, case law precedents, and legal frameworks
 * Provides comprehensive legal analysis for judicial review
 */

import { statuteValidator } from '@/lib/case-ledger'
import { searchByRole, validateWithBracketedTerms } from '@/lib/pinecone/search'
import StatuteVault from '@/lib/statutes/statute-vault'
import type { AgentFindings, SourceCitation } from '../controller'

export interface StatutoryAnalysis {
  statute: string
  section?: string
  applicability: 'direct' | 'analogous' | 'distinguishable' | 'inapplicable'
  supportingRationale: string
  contradictingFactors: string[]
  precedentCases: string[]
  confidence: number
  sourceAuthority: SourceCitation
}

export interface LegalFramework {
  primaryStatutes: string[]
  supportingStatutes: string[]
  relevantCaselaw: string[]
  proceduralRules: string[]
  constitutionalIssues: string[]
  preemptionAnalysis: PreemptionAnalysis
}

interface PreemptionAnalysis {
  statePreemptsLocal: boolean
  applicableStatutes: string[]
  rationale: string
  confidence: number
}

/**
 * StatuteAgent - Comprehensive legal framework analysis
 */
export class StatuteAgent {
  constructor() {
    console.log('⚖️  StatuteAgent initialized for legal framework analysis')
  }

  /**
   * Analyze statutory framework for legal inquiry
   */
  async analyzeStatutoryFramework(
    inquiry: string,
    discoveryFindings: any[],
    claimNumber?: number
  ): Promise<AgentFindings> {
    const startTime = Date.now()
    console.log(`📚 StatuteAgent analyzing legal framework for: "${inquiry}"`)

    try {
      // Step 1: Search for relevant statutory authority
      const statutorySearchResults = await searchByRole(
        `statutory authority legal framework ${inquiry}`,
        'law_clerk',
        { topK: 12 }
      )

      // Step 2: Search for case law precedents
      const caseLawResults = await searchByRole(
        `case law precedent ${inquiry}`,
        'judge',
        { topK: 8 }
      )

      // Step 3: Analyze each statute for applicability
      const statutoryAnalyses = await Promise.all(
        statutorySearchResults.map(result => this.analyzeStatute(result, inquiry))
      )

      // Step 4: Build comprehensive legal framework
      const legalFramework = this.buildLegalFramework(
        statutoryAnalyses,
        caseLawResults,
        discoveryFindings
      )

      // Step 5: Perform preemption analysis
      const preemptionAnalysis = this.analyzePreemption(legalFramework, inquiry)

      // Step 6: Generate source citations
      const sourceCitations = [
        ...statutoryAnalyses.map(analysis => analysis.sourceAuthority),
        ...caseLawResults.map(result => this.createCaseLawCitation(result))
      ]

      // Step 7: Validate with bracketed terms if claim number provided
      if (claimNumber) {
        const validatedResults = validateWithBracketedTerms(
          [...statutorySearchResults, ...caseLawResults],
          claimNumber
        )
        console.log(`🎯 Bracketed term validation: ${validatedResults.length} validated authorities`)
      }

      const processingTime = Date.now() - startTime
      console.log(`✅ StatuteAgent analysis complete (${processingTime}ms)`)

      return {
        agentType: 'statute',
        agent: 'StatuteAgent v2.0',
        findings: statutoryAnalyses.map(analysis => ({
          statute: analysis.statute,
          section: analysis.section,
          applicability: analysis.applicability,
          rationale: analysis.supportingRationale,
          contradictingFactors: analysis.contradictingFactors,
          precedents: analysis.precedentCases,
          topic: this.inferStatutoryTopic(analysis.statute),
          significance: analysis.applicability === 'direct' ? 'critical' :
                      analysis.applicability === 'analogous' ? 'important' : 'reference',
          summary: `${analysis.statute}: ${analysis.applicability} - ${analysis.supportingRationale.substring(0, 100)}...`,
          confidence: analysis.confidence,
          preemptionAnalysis: analysis.statute.includes('17-41') ? preemptionAnalysis : undefined
        })),
        confidence: this.calculateStatutoryConfidence(statutoryAnalyses, preemptionAnalysis),
        processingTime,
        sourceCitations,
        warnings: this.generateStatutoryWarnings(statutoryAnalyses, legalFramework)
      }

    } catch (error) {
      console.error(`❌ StatuteAgent failed: ${error}`)

      return {
        agentType: 'statute',
        agent: 'StatuteAgent v2.0',
        findings: [],
        confidence: 0,
        processingTime: Date.now() - startTime,
        sourceCitations: [],
        warnings: [`Statutory analysis failed: ${error}`]
      }
    }
  }

  /**
   * Analyze individual statute for applicability
   */
  private async analyzeStatute(searchResult: any, inquiry: string): Promise<StatutoryAnalysis> {
    const content = searchResult.content || ''
    const statute = this.extractStatutoryReference(content)

    // Use the StatuteValidator from case-ledger
    const validation = statuteValidator.validateStatuteReference(statute, content)

    // Determine applicability based on validation and content analysis
    let applicability: StatutoryAnalysis['applicability'] = 'inapplicable'
    let supportingRationale = 'Statute does not appear directly applicable'
    let confidence = 0.3

    if (validation.isValid && validation.matches.length > 0) {
      if (validation.significance === 'critical') {
        applicability = 'direct'
        supportingRationale = 'Statute directly governs the matter with strong precedential support'
        confidence = 0.9
      } else if (validation.significance === 'important') {
        applicability = 'analogous'
        supportingRationale = 'Statute provides analogous authority applicable by extension'
        confidence = 0.7
      } else {
        applicability = 'distinguishable'
        supportingRationale = 'Statute addresses related but distinguishable circumstances'
        confidence = 0.5
      }
    }

    // Extract contradicting factors
    const contradictingFactors = this.identifyContradictingFactors(content, inquiry)

    // Find precedent cases
    const precedentCases = this.extractPrecedentCases(content)

    return {
      statute,
      section: this.extractSection(content),
      applicability,
      supportingRationale,
      contradictingFactors,
      precedentCases,
      confidence,
      sourceAuthority: {
        batesNumber: searchResult.id || 'STATUTE-REF',
        sourceOrigin: 'Repo',
        documentTitle: `${statute} Legal Authority`,
        relevantSection: this.extractSection(content),
        confidenceScore: confidence
      }
    }
  }

  /**
   * Build comprehensive legal framework
   */
  private buildLegalFramework(
    statutoryAnalyses: StatutoryAnalysis[],
    caseLawResults: any[],
    discoveryFindings: any[]
  ): LegalFramework {
    const primaryStatutes = statutoryAnalyses
      .filter(a => a.applicability === 'direct')
      .map(a => a.statute)

    const supportingStatutes = statutoryAnalyses
      .filter(a => a.applicability === 'analogous')
      .map(a => a.statute)

    const relevantCaselaw = [
      ...statutoryAnalyses.flatMap(a => a.precedentCases),
      ...caseLawResults.map(result => this.extractCaseName(result.content))
    ].filter(Boolean)

    // Identify procedural rules
    const proceduralRules = statutoryAnalyses
      .filter(a => a.statute.includes('URCP') || a.statute.includes('Rule'))
      .map(a => a.statute)

    // Identify constitutional issues
    const constitutionalIssues = this.identifyConstitutionalIssues(
      statutoryAnalyses,
      discoveryFindings
    )

    // Perform preemption analysis
    const preemptionAnalysis = this.analyzePreemption(
      { primaryStatutes, supportingStatutes } as LegalFramework,
      'mining regulation preemption'
    )

    return {
      primaryStatutes,
      supportingStatutes,
      relevantCaselaw: [...new Set(relevantCaselaw)],
      proceduralRules,
      constitutionalIssues,
      preemptionAnalysis
    }
  }

  /**
   * Analyze preemption issues (state vs local authority)
   */
  private analyzePreemption(framework: Partial<LegalFramework>, inquiry: string): PreemptionAnalysis {
    const preemptionStatutes = [
      'Utah Code 17-41-402', // State preemption of mining regulation
      'Utah Code 17-27-1004', // Zoning authority limitations
      'Utah Code 78B-6-501' // Regulatory takings
    ]

    const applicablePreemptionStatutes = preemptionStatutes.filter(statute =>
      framework.primaryStatutes?.includes(statute) ||
      framework.supportingStatutes?.includes(statute)
    )

    let statePreemptsLocal = false
    let rationale = 'No clear preemption authority identified'
    let confidence = 0.3

    if (applicablePreemptionStatutes.includes('Utah Code 17-41-402')) {
      statePreemptsLocal = true
      rationale = 'Utah Code 17-41-402 provides express preemption of local mining regulation for vested operations'
      confidence = 0.85
    } else if (applicablePreemptionStatutes.length > 0) {
      statePreemptsLocal = true
      rationale = 'Implied preemption based on comprehensive state regulatory scheme'
      confidence = 0.6
    }

    return {
      statePreemptsLocal,
      applicableStatutes: applicablePreemptionStatutes,
      rationale,
      confidence
    }
  }

  /**
   * Extract statutory reference from content
   */
  private extractStatutoryReference(content: string): string {
    // Common Utah Code patterns
    const utahCodePattern = /Utah\s+Code\s+(?:Title\s+)?(\d+(?:-\d+)*(?:-\d+)*)/gi
    const match = content.match(utahCodePattern)

    if (match && match[0]) {
      return match[0]
    }

    // Fallback patterns
    const sectionPattern = /§?\s*(\d+(?:-\d+)+)/g
    const sectionMatch = content.match(sectionPattern)
    if (sectionMatch && sectionMatch[0]) {
      return `Utah Code ${sectionMatch[0]}`
    }

    return 'General Legal Authority'
  }

  /**
   * Extract specific section reference
   */
  private extractSection(content: string): string | undefined {
    const sectionPattern = /§?\s*(\d+(?:-\d+)+)/g
    const match = content.match(sectionPattern)
    return match ? match[0] : undefined
  }

  /**
   * Identify contradicting factors
   */
  private identifyContradictingFactors(content: string, inquiry: string): string[] {
    const factors: string[] = []

    if (content.toLowerCase().includes('however') ||
        content.toLowerCase().includes('but') ||
        content.toLowerCase().includes('except')) {
      factors.push('Statutory exceptions or limitations may apply')
    }

    if (content.toLowerCase().includes('not applicable') ||
        content.toLowerCase().includes('does not apply')) {
      factors.push('Express inapplicability to certain circumstances')
    }

    if (content.toLowerCase().includes('superseded') ||
        content.toLowerCase().includes('repealed')) {
      factors.push('Potential statutory supersession or repeal')
    }

    return factors
  }

  /**
   * Extract precedent cases from content
   */
  private extractPrecedentCases(content: string): string[] {
    const casePattern = /([A-Z][a-zA-Z\s&.]+)\s+v\.?\s+([A-Z][a-zA-Z\s&.]+),?\s+(\d+\s+P\.?\d*d?\s+\d+)/g
    const matches = content.match(casePattern)

    return matches ? matches.slice(0, 5) : [] // Limit to 5 cases
  }

  /**
   * Extract case name from search result
   */
  private extractCaseName(content: string): string {
    const casePattern = /([A-Z][a-zA-Z\s&.]+)\s+v\.?\s+([A-Z][a-zA-Z\s&.]+)/
    const match = content.match(casePattern)

    return match ? match[0] : 'Precedential Authority'
  }

  /**
   * Identify constitutional issues
   */
  private identifyConstitutionalIssues(
    statutoryAnalyses: StatutoryAnalysis[],
    discoveryFindings: any[]
  ): string[] {
    const issues: string[] = []

    // Check for takings issues
    if (statutoryAnalyses.some(a => a.statute.includes('78B-6-501') ||
                                   a.supportingRationale.toLowerCase().includes('taking'))) {
      issues.push('Fifth Amendment Regulatory Takings')
    }

    // Check for due process issues
    if (discoveryFindings.some(f => f.documentType?.includes('notice') ||
                                   f.documentType?.includes('hearing'))) {
      issues.push('Fourteenth Amendment Due Process')
    }

    // Check for preemption (constitutional structure)
    if (statutoryAnalyses.some(a => a.statute.includes('17-41-402'))) {
      issues.push('State/Local Government Authority (Tenth Amendment implications)')
    }

    return issues
  }

  /**
   * Create case law source citation
   */
  private createCaseLawCitation(searchResult: any): SourceCitation {
    return {
      batesNumber: searchResult.id || 'CASE-LAW-REF',
      sourceOrigin: 'Repo',
      documentTitle: this.extractCaseName(searchResult.content || ''),
      relevantSection: undefined,
      confidenceScore: searchResult.score || 0.5
    }
  }

  /**
   * Infer statutory topic
   */
  private inferStatutoryTopic(statute: string): string {
    if (statute.includes('17-41')) {
      return 'Mining and Vested Rights'
    }
    if (statute.includes('17-27')) {
      return 'Zoning and Land Use'
    }
    if (statute.includes('78B-6')) {
      return 'Regulatory Takings'
    }
    if (statute.includes('URCP')) {
      return 'Civil Procedure'
    }

    return 'General Legal Authority'
  }

  /**
   * Calculate overall statutory confidence
   */
  private calculateStatutoryConfidence(
    analyses: StatutoryAnalysis[],
    preemptionAnalysis: PreemptionAnalysis
  ): number {
    if (analyses.length === 0) return 0

    const weights = {
      direct: 1.0,
      analogous: 0.7,
      distinguishable: 0.4,
      inapplicable: 0.1
    }

    let totalWeight = 0
    let weightedSum = 0

    analyses.forEach(analysis => {
      const weight = weights[analysis.applicability]
      totalWeight += weight
      weightedSum += analysis.confidence * weight
    })

    const baseConfidence = totalWeight > 0 ? weightedSum / totalWeight : 0
    const preemptionBonus = preemptionAnalysis.confidence * 0.1 // 10% bonus for strong preemption analysis

    return Math.min(baseConfidence + preemptionBonus, 1.0)
  }

  /**
   * Generate statutory warnings
   */
  private generateStatutoryWarnings(
    analyses: StatutoryAnalysis[],
    framework: LegalFramework
  ): string[] {
    const warnings: string[] = []

    if (analyses.length === 0) {
      warnings.push('No statutory authority identified')
    }

    if (framework.primaryStatutes.length === 0) {
      warnings.push('No directly applicable statutes found')
    }

    const contradictions = analyses.filter(a => a.contradictingFactors.length > 0)
    if (contradictions.length > 0) {
      warnings.push(`${contradictions.length} statutes have identified contradicting factors`)
    }

    if (framework.constitutionalIssues.length > 0) {
      warnings.push(`Constitutional issues identified: ${framework.constitutionalIssues.join(', ')}`)
    }

    return warnings
  }

  /**
   * Perform adversarial statutory analysis using vault
   */
  async performAdversarialAnalysis(
    inquiry: string,
    discoveryFindings: any[]
  ): Promise<AdversarialStatutoryAnalysis> {
    console.log('⚔️  StatuteAgent performing adversarial analysis with statute vault')

    // Get applicable statutes from vault
    const applicableStatutes = StatuteVault.getApplicableStatutes(inquiry)
    console.log(`📚 Found ${applicableStatutes.length} applicable statutes in vault`)

    // Analyze statutory conflicts
    const conflictAnalysis = StatuteVault.analyzeConflicts(inquiry)

    // Perform detailed analysis of each statute
    const statuteAnalyses = applicableStatutes.map(statute => {
      return this.analyzeStatuteAgainstFacts(statute, inquiry, discoveryFindings)
    })

    // Determine strongest legal position
    const strongestPosition = this.determineStrongestPosition(statuteAnalyses, conflictAnalysis)

    // Generate adversarial counter-arguments
    const counterArguments = this.generateCounterArguments(statuteAnalyses, conflictAnalysis)

    return {
      inquiry,
      applicableStatutes,
      conflictAnalysis,
      statuteAnalyses,
      strongestPosition,
      counterArguments,
      overallConfidence: this.calculateAdversarialConfidence(statuteAnalyses, conflictAnalysis),
      analysisDate: new Date()
    }
  }

  /**
   * Analyze statute against discovered facts
   */
  private analyzeStatuteAgainstFacts(
    statute: any,
    inquiry: string,
    discoveryFindings: any[]
  ): any {
    // Extract key factual elements from discovery
    const supportingFacts = discoveryFindings.filter(finding =>
      this.factsSupportsStatute(finding, statute)
    )

    const contradictingFacts = discoveryFindings.filter(finding =>
      this.factsContradictsStatute(finding, statute)
    )

    // Determine statutory applicability strength
    let applicabilityStrength = 0.5
    if (statute.id === 'utah-17-41-402' && inquiry.includes('unreasonably restrict')) {
      applicabilityStrength = 0.95 // Direct application
    } else if (statute.id === 'utah-17-41-501' && inquiry.includes('vested')) {
      applicabilityStrength = 0.90 // Direct application
    }

    return {
      statute,
      applicabilityStrength,
      supportingFactCount: supportingFacts.length,
      contradictingFactCount: contradictingFacts.length,
      keyProvisions: statute.keyProvisions,
      factualSupport: supportingFacts.map(f => f.batesNumber || f.documentType),
      factualChallenges: contradictingFacts.map(f => f.batesNumber || f.documentType),
      legalArgument: this.formulateLegalArgument(statute, supportingFacts, inquiry)
    }
  }

  /**
   * Check if facts support statute application
   */
  private factsSupportsStatute(finding: any, statute: any): boolean {
    const content = finding.extractedText || finding.keyFindings?.join(' ') || ''
    const lowerContent = content.toLowerCase()

    if (statute.id === 'utah-17-41-402') {
      return lowerContent.includes('ordinance') ||
             lowerContent.includes('restrict') ||
             lowerContent.includes('mining') ||
             lowerContent.includes('zoning')
    }

    if (statute.id === 'utah-17-41-501') {
      return lowerContent.includes('vested') ||
             lowerContent.includes('continuous') ||
             lowerContent.includes('mining') ||
             lowerContent.includes('operation')
    }

    if (statute.id === 'mining-act-1872-appurtenances') {
      return lowerContent.includes('patent') ||
             lowerContent.includes('1895') ||
             lowerContent.includes('federal') ||
             lowerContent.includes('surface rights')
    }

    return false
  }

  /**
   * Check if facts contradict statute application
   */
  private factsContradictsStatute(finding: any, statute: any): boolean {
    const content = finding.extractedText || finding.keyFindings?.join(' ') || ''
    const lowerContent = content.toLowerCase()

    // Look for facts that might undermine statutory claims
    if (statute.id === 'utah-17-41-501') {
      return lowerContent.includes('discontinued') ||
             lowerContent.includes('abandoned') ||
             lowerContent.includes('ceased operation') ||
             lowerContent.includes('gap in mining')
    }

    return false
  }

  /**
   * Formulate legal argument for statute
   */
  private formulateLegalArgument(statute: any, supportingFacts: any[], inquiry: string): string {
    if (statute.id === 'utah-17-41-402') {
      return `Utah Code § 17-41-402 prohibits political subdivisions from unreasonably restricting mining protection areas. ${supportingFacts.length > 0 ? `Supported by ${supportingFacts.length} evidentiary findings.` : 'Applies by operation of law.'} Salt Lake County's blanket mining ban in FR-20 zones constitutes an unreasonable restriction on vested mining operations.`
    }

    if (statute.id === 'utah-17-41-501') {
      return `Utah Code § 17-41-501 establishes that mining protection areas constitute vested mining uses exempt from local police power. ${supportingFacts.length > 0 ? `Evidence of continuous operations supports vested use status.` : ''} The statute provides absolute protection from zoning restrictions.`
    }

    if (statute.id === 'mining-act-1872-appurtenances') {
      return `Federal Mining Act of 1872 grants exclusive surface rights to mineral patent holders. Federal law preempts conflicting local regulations. ${supportingFacts.length > 0 ? `Historical evidence supports federal patent rights.` : ''}`
    }

    return `${statute.citation} provides applicable legal framework for the inquiry.`
  }

  /**
   * Determine strongest legal position
   */
  private determineStrongestPosition(analyses: any[], conflictAnalysis: any): any {
    // Sort by applicability strength
    const strongest = analyses.sort((a, b) => b.applicabilityStrength - a.applicabilityStrength)[0]

    if (!strongest) {
      return {
        statute: 'No applicable statute',
        strength: 0,
        rationale: 'No statutory support identified'
      }
    }

    return {
      statute: strongest.statute.citation,
      strength: strongest.applicabilityStrength,
      rationale: strongest.legalArgument,
      supportingFactCount: strongest.supportingFactCount,
      primaryAuthority: conflictAnalysis.primaryAuthority
    }
  }

  /**
   * Generate counter-arguments for adversarial analysis
   */
  private generateCounterArguments(analyses: any[], conflictAnalysis: any): string[] {
    const counterArgs: string[] = []

    // Challenge vested rights
    const vestedRightsStatute = analyses.find(a => a.statute.id === 'utah-17-41-501')
    if (vestedRightsStatute && vestedRightsStatute.contradictingFactCount > 0) {
      counterArgs.push('Gaps in mining operations may defeat vested use claims under continuous operation requirement')
    }

    // Challenge reasonableness
    const preemptionStatute = analyses.find(a => a.statute.id === 'utah-17-41-402')
    if (preemptionStatute) {
      counterArgs.push('County police power authority allows reasonable environmental and safety regulations')
    }

    // Challenge federal preemption
    const federalStatute = analyses.find(a => a.statute.citation.includes('U.S.C.'))
    if (federalStatute) {
      counterArgs.push('Federal mining rights subject to valid state and local regulations not in conflict with federal law')
    }

    // General challenges
    if (conflictAnalysis.identifiedConflicts.length === 0) {
      counterArgs.push('No clear statutory conflicts identified - local authority may be valid')
    }

    return counterArgs
  }

  /**
   * Calculate adversarial confidence
   */
  private calculateAdversarialConfidence(analyses: any[], conflictAnalysis: any): number {
    if (analyses.length === 0) return 0

    // Base confidence on strongest statute
    const strongestApplicability = Math.max(...analyses.map(a => a.applicabilityStrength))

    // Boost for clear conflicts favoring our position
    const conflictBoost = conflictAnalysis.identifiedConflicts.length > 0 ? 0.1 : 0

    // Reduce for factual challenges
    const factualChallenges = analyses.reduce((sum, a) => sum + a.contradictingFactCount, 0)
    const challengePenalty = Math.min(factualChallenges * 0.05, 0.2)

    return Math.max(0.1, Math.min(0.95, strongestApplicability + conflictBoost - challengePenalty))
  }

  /**
   * Health status check
   */
  async getHealthStatus(): Promise<{ healthy: boolean; message?: string; lastActivity?: Date }> {
    const vaultValidation = StatuteVault.validateVault()

    return {
      healthy: vaultValidation.isValid,
      message: vaultValidation.isValid ?
        `Statutory analysis operational with ${vaultValidation.statuteCount} statutes in vault` :
        `Statute vault issues: ${vaultValidation.issues.join(', ')}`,
      lastActivity: new Date()
    }
  }
}

// Additional type definitions
interface AdversarialStatutoryAnalysis {
  inquiry: string
  applicableStatutes: any[]
  conflictAnalysis: any
  statuteAnalyses: any[]
  strongestPosition: any
  counterArguments: string[]
  overallConfidence: number
  analysisDate: Date
}