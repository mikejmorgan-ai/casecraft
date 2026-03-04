/**
 * Supervisor Controller - Phase 2 Enterprise Orchestration
 *
 * The Supervisor Agent orchestrates specialized agents but performs NO tasks directly.
 * All findings are summarized and presented to Hon. Andrew H. Stone for final adjudication.
 */

import { caseManager, getCurrentPlaintiff, getCurrentDefendant } from '@/lib/case-ledger'
import { DiscoveryAgent } from './agents/discovery-agent'
import { StatuteAgent } from './agents/statute-agent'
import { CounselAgent } from './agents/counsel-agent'
import { JudgeAgent } from './agents/judge-agent'

export interface SupervisorInquiry {
  id: string
  question: string
  context?: string
  claimNumber?: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  requestedBy: string
  timestamp: Date
}

export interface AgentFindings {
  agentType: 'discovery' | 'statute' | 'counsel'
  agent: string
  findings: any[]
  confidence: number
  processingTime: number
  sourceCitations: SourceCitation[]
  warnings: string[]
}

export interface SourceCitation {
  batesNumber: string
  sourceOrigin: 'Repo' | 'Drive' | 'Transfer'
  documentTitle: string
  relevantSection?: string
  confidenceScore: number
}

export interface SupervisorSummary {
  inquiryId: string
  question: string
  agentFindings: AgentFindings[]
  consolidatedFindings: ConsolidatedFinding[]
  recommendedAction: string
  confidenceLevel: number
  flagsForHumanReview: string[]
  processingMetrics: ProcessingMetrics
}

export interface JudicialRuling {
  inquiryId: string
  judge: 'Hon. Andrew H. Stone'
  ruling: string
  rationale: string
  citedAuthorities: string[]
  proceduralNotes: string[]
  finalSourceCitations: SourceCitation[]
  timestamp: Date
}

interface ConsolidatedFinding {
  topic: string
  finding: string
  supportingEvidence: string[]
  conflictingEvidence: string[]
  confidence: number
  sources: SourceCitation[]
}

interface ProcessingMetrics {
  totalProcessingTime: number
  documentsReviewed: number
  statutesAnalyzed: number
  triageFlags: number
  humanReviewRequired: number
}

/**
 * Supervisor Controller - Orchestrates but never executes tasks directly
 */
export class SupervisorController {
  private readonly discoveryAgent: DiscoveryAgent
  private readonly statuteAgent: StatuteAgent
  private readonly counselAgent: CounselAgent
  private readonly judgeAgent: JudgeAgent

  constructor() {
    // Initialize specialized agents
    this.discoveryAgent = new DiscoveryAgent()
    this.statuteAgent = new StatuteAgent()
    this.counselAgent = new CounselAgent()
    this.judgeAgent = new JudgeAgent()

    console.log('🏛️  Supervisor Controller initialized with specialized agents')
    console.log(`📋 Current Case: ${caseManager.getCurrentCase()?.displayName}`)
    console.log(`⚖️  Presiding: Hon. Andrew H. Stone`)
  }

  /**
   * Process legal inquiry through agent orchestration
   * CRITICAL: Supervisor performs NO direct work - only orchestration
   */
  async processInquiry(inquiry: SupervisorInquiry): Promise<JudicialRuling> {
    console.log(`🎯 Processing inquiry: ${inquiry.question}`)
    console.log(`🔍 Orchestrating ${inquiry.urgency} priority investigation`)

    const startTime = Date.now()
    const agentFindings: AgentFindings[] = []

    try {
      // Phase 1: Spawn Discovery Agent (document analysis)
      console.log('📄 Spawning DiscoveryAgent for document review...')
      const discoveryFindings = await this.discoveryAgent.investigateDocuments(
        inquiry.question,
        inquiry.context,
        inquiry.claimNumber
      )
      agentFindings.push(discoveryFindings)

      // Phase 2: Spawn Statute Agent (legal analysis)
      console.log('⚖️  Spawning StatuteAgent for legal authority review...')
      const statuteFindings = await this.statuteAgent.analyzeStatutoryFramework(
        inquiry.question,
        discoveryFindings.findings,
        inquiry.claimNumber
      )
      agentFindings.push(statuteFindings)

      // Phase 3: Spawn Counsel Agent (strategic analysis)
      console.log('🎓 Spawning CounselAgent for strategic evaluation...')
      const counselFindings = await this.counselAgent.evaluateStrategicPosition(
        inquiry.question,
        discoveryFindings.findings,
        statuteFindings.findings
      )
      agentFindings.push(counselFindings)

      // Phase 4: Consolidate findings for judicial review
      console.log('📊 Consolidating agent findings...')
      const supervisorSummary = this.consolidateFindings(
        inquiry,
        agentFindings,
        Date.now() - startTime
      )

      // Phase 5: Present to Judge Agent for final adjudication
      console.log('⚖️  Presenting case to Hon. Andrew H. Stone...')
      const judicialRuling = await this.judgeAgent.renderRuling(supervisorSummary)

      console.log(`✅ Inquiry processed - ${judicialRuling.ruling}`)
      return judicialRuling

    } catch (error) {
      console.error(`❌ Supervisor orchestration failed: ${error}`)

      // Emergency judicial ruling for system failures
      return await this.judgeAgent.renderEmergencyRuling(
        inquiry,
        `System failure during agent orchestration: ${error}`
      )
    }
  }

  /**
   * Consolidate findings from all agents (Supervisor's only direct work)
   */
  private consolidateFindings(
    inquiry: SupervisorInquiry,
    agentFindings: AgentFindings[],
    totalTime: number
  ): SupervisorSummary {
    const consolidatedFindings: ConsolidatedFinding[] = []
    const allSourceCitations: SourceCitation[] = []
    const allWarnings: string[] = []
    let totalDocuments = 0
    let totalStatutes = 0
    let triageFlags = 0

    // Process each agent's findings
    agentFindings.forEach(finding => {
      allSourceCitations.push(...finding.sourceCitations)
      allWarnings.push(...finding.warnings)

      if (finding.agentType === 'discovery') {
        totalDocuments += finding.findings.length
        triageFlags += finding.findings.filter(f => f.requiresHumanReview).length
      }

      if (finding.agentType === 'statute') {
        totalStatutes += finding.findings.length
      }

      // Extract key findings by topic
      finding.findings.forEach(f => {
        if (f.topic && f.significance !== 'background') {
          consolidatedFindings.push({
            topic: f.topic,
            finding: f.summary || f.finding,
            supportingEvidence: f.supportingEvidence || [],
            conflictingEvidence: f.conflictingEvidence || [],
            confidence: f.confidence || finding.confidence,
            sources: f.sources || []
          })
        }
      })
    })

    // Determine recommended action based on consolidated analysis
    const avgConfidence = agentFindings.reduce((sum, f) => sum + f.confidence, 0) / agentFindings.length
    const hasHighConfidenceFindings = consolidatedFindings.some(f => f.confidence > 0.8)

    let recommendedAction = 'Proceed with standard legal analysis'
    if (triageFlags > 5) {
      recommendedAction = 'Defer pending human document review'
    } else if (hasHighConfidenceFindings && avgConfidence > 0.75) {
      recommendedAction = 'High confidence - recommend strategic action'
    } else if (avgConfidence < 0.5) {
      recommendedAction = 'Low confidence - require additional discovery'
    }

    return {
      inquiryId: inquiry.id,
      question: inquiry.question,
      agentFindings,
      consolidatedFindings,
      recommendedAction,
      confidenceLevel: avgConfidence,
      flagsForHumanReview: allWarnings,
      processingMetrics: {
        totalProcessingTime: totalTime,
        documentsReviewed: totalDocuments,
        statutesAnalyzed: totalStatutes,
        triageFlags,
        humanReviewRequired: triageFlags
      }
    }
  }

  /**
   * Check system health and agent status
   */
  async performHealthCheck(): Promise<SupervisorHealthCheck> {
    console.log('🔍 Performing supervisor system health check...')

    const agentStatuses = await Promise.all([
      this.discoveryAgent.getHealthStatus(),
      this.statuteAgent.getHealthStatus(),
      this.counselAgent.getHealthStatus(),
      this.judgeAgent.getHealthStatus()
    ])

    const allHealthy = agentStatuses.every(status => status.healthy)
    const totalDocuments = await this.discoveryAgent.getTotalDocumentCount()

    return {
      supervisorStatus: 'operational',
      agentStatuses: {
        discovery: agentStatuses[0],
        statute: agentStatuses[1],
        counsel: agentStatuses[2],
        judge: agentStatuses[3]
      },
      systemMetrics: {
        totalDocumentsIndexed: totalDocuments,
        currentCase: caseManager.getCurrentCase()?.displayName || 'None',
        plaintiff: getCurrentPlaintiff(),
        defendant: getCurrentDefendant(),
        lastHealthCheck: new Date()
      },
      overallHealth: allHealthy ? 'healthy' : 'degraded'
    }
  }

  /**
   * Generate inquiry processing report
   */
  generateProcessingReport(ruling: JudicialRuling): ProcessingReport {
    return {
      inquiryId: ruling.inquiryId,
      processingComplete: true,
      judicialRuling: ruling.ruling,
      keyFindings: ruling.rationale,
      sourceCitations: ruling.finalSourceCitations,
      recommendedNextSteps: ruling.proceduralNotes,
      generatedAt: new Date(),
      supervisorSignature: 'Supervisor Controller v2.0'
    }
  }
}

// Type definitions
interface SupervisorHealthCheck {
  supervisorStatus: string
  agentStatuses: {
    discovery: AgentHealthStatus
    statute: AgentHealthStatus
    counsel: AgentHealthStatus
    judge: AgentHealthStatus
  }
  systemMetrics: {
    totalDocumentsIndexed: number
    currentCase: string
    plaintiff: string
    defendant: string
    lastHealthCheck: Date
  }
  overallHealth: 'healthy' | 'degraded' | 'critical'
}

interface AgentHealthStatus {
  healthy: boolean
  lastActivity?: Date
  errorCount?: number
  message?: string
}

interface ProcessingReport {
  inquiryId: string
  processingComplete: boolean
  judicialRuling: string
  keyFindings: string
  sourceCitations: SourceCitation[]
  recommendedNextSteps: string[]
  generatedAt: Date
  supervisorSignature: string
}

// Export supervisor instance
export const supervisor = new SupervisorController()

console.log('🎯 Supervisor Controller Phase 2 - Ready for orchestration')