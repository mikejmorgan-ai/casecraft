/**
 * Enterprise Case Management Services
 * StatuteValidator and TemporalService with configurable case support
 */

import {
  CaseConfig,
  BatesEntry,
  DocumentIndex,
  Citation,
  caseManager
} from './schema'
import { generateEmbedding } from '@/lib/ai/embeddings'

export class StatuteValidator {
  private caseConfig: CaseConfig

  constructor(caseConfig?: CaseConfig) {
    this.caseConfig = caseConfig || caseManager.getCurrentCase()!
  }

  /**
   * Validate statute references against case-specific legal framework
   */
  validateStatuteReference(
    statute: string,
    context: string,
    claimNumber?: number
  ): ValidationResult {
    const jurisdiction = this.caseConfig.jurisdiction.toLowerCase()

    // Utah-specific statute validation (can be extended for other jurisdictions)
    if (jurisdiction.includes('utah')) {
      return this.validateUtahStatute(statute, context, claimNumber)
    }

    // Generic validation fallback
    return this.validateGenericStatute(statute, context)
  }

  private validateUtahStatute(
    statute: string,
    context: string,
    claimNumber?: number
  ): ValidationResult {
    const patterns = {
      title17: /utah\s+code\s+(?:title\s+)?17[^\d]|17[^\w]*(?:chapter|section|\d)/gi,
      title57: /utah\s+code\s+(?:title\s+)?57[^\d]|57[^\w]*(?:chapter|section|\d)/gi,
      title78b: /utah\s+code\s+(?:title\s+)?78b[^\d]|78b[^\w]*(?:chapter|section|\d)/gi,
      mining: /mining|extraction|mineral|subsurface/gi,
      vested: /vested\s+(?:rights?|use|mining)/gi,
      zoning: /zoning|ordinance|land\s+use/gi
    }

    const matches: PatternMatch[] = []
    const significance = this.determineSignificance(statute, context, claimNumber)

    // Check for pattern matches
    Object.entries(patterns).forEach(([key, pattern]) => {
      const found = context.match(pattern)
      if (found) {
        matches.push({
          type: key as PatternType,
          matches: found,
          positions: this.findPatternPositions(context, pattern)
        })
      }
    })

    return {
      isValid: matches.length > 0,
      jurisdiction: 'Utah',
      matches,
      significance,
      recommendedCitations: this.getRecommendedCitations(statute, matches),
      warnings: this.generateWarnings(statute, matches)
    }
  }

  private validateGenericStatute(statute: string, context: string): ValidationResult {
    // Basic validation for non-Utah jurisdictions
    return {
      isValid: statute.trim().length > 0,
      jurisdiction: 'Generic',
      matches: [],
      significance: 'reference',
      recommendedCitations: [],
      warnings: []
    }
  }

  private determineSignificance(
    statute: string,
    context: string,
    claimNumber?: number
  ): 'critical' | 'important' | 'reference' | 'background' {
    const criticalTerms = ['vested rights', 'mining use', 'preemption', 'taking']
    const importantTerms = ['zoning', 'ordinance', 'permit', 'regulation']

    const lowerContext = context.toLowerCase()

    if (criticalTerms.some(term => lowerContext.includes(term))) {
      return 'critical'
    }

    if (importantTerms.some(term => lowerContext.includes(term))) {
      return 'important'
    }

    return 'reference'
  }

  private findPatternPositions(text: string, pattern: RegExp): number[] {
    const positions: number[] = []
    let match: RegExpExecArray | null

    const globalPattern = new RegExp(pattern.source, 'gi')
    while ((match = globalPattern.exec(text)) !== null) {
      positions.push(match.index)
    }

    return positions
  }

  private getRecommendedCitations(statute: string, matches: PatternMatch[]): Citation[] {
    const citations: Citation[] = []

    if (matches.some(m => m.type === 'title17')) {
      citations.push({
        type: 'statute',
        reference: 'Utah Code Title 17 (Counties)',
        context: 'County authority and land use regulation'
      })
    }

    if (matches.some(m => m.type === 'vested')) {
      citations.push({
        type: 'case_law',
        reference: 'Western Land Equities v. Logan, 617 P.2d 388 (Utah 1980)',
        context: 'Vested rights doctrine in Utah'
      })
    }

    return citations
  }

  private generateWarnings(statute: string, matches: PatternMatch[]): string[] {
    const warnings: string[] = []

    if (matches.length === 0) {
      warnings.push('No recognizable statutory patterns found')
    }

    if (matches.some(m => m.type === 'mining') && !matches.some(m => m.type === 'vested')) {
      warnings.push('Mining reference without vested rights context - verify applicability')
    }

    return warnings
  }
}

export class TemporalService {
  private caseConfig: CaseConfig

  constructor(caseConfig?: CaseConfig) {
    this.caseConfig = caseConfig || caseManager.getCurrentCase()!
  }

  /**
   * Analyze temporal relationships between documents
   */
  analyzeTemporalRelationships(batesEntries: BatesEntry[]): TemporalAnalysis {
    const timeline = this.buildTimeline(batesEntries)
    const sequences = this.identifySequences(batesEntries)
    const gaps = this.identifyTemporalGaps(timeline)
    const criticalDates = this.identifyCriticalDates(batesEntries)

    return {
      timeline,
      sequences,
      gaps,
      criticalDates,
      caseId: this.caseConfig.id,
      analysisDate: new Date()
    }
  }

  private buildTimeline(batesEntries: BatesEntry[]): TimelineEntry[] {
    return batesEntries
      .map(entry => ({
        date: entry.dateCreated,
        batesNumber: entry.batesNumber,
        documentType: entry.documentType,
        filedBy: entry.filedBy || 'Unknown',
        significance: this.assessTemporalSignificance(entry)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  private identifySequences(batesEntries: BatesEntry[]): DocumentSequence[] {
    const sequences: DocumentSequence[] = []
    const grouped = this.groupByDocumentType(batesEntries)

    Object.entries(grouped).forEach(([docType, entries]) => {
      if (entries.length > 1) {
        sequences.push({
          type: docType,
          documents: entries.sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime()),
          duration: this.calculateDuration(entries),
          pattern: this.identifyPattern(entries)
        })
      }
    })

    return sequences
  }

  private identifyTemporalGaps(timeline: TimelineEntry[]): TemporalGap[] {
    const gaps: TemporalGap[] = []

    for (let i = 1; i < timeline.length; i++) {
      const prev = timeline[i - 1]
      const curr = timeline[i]
      const daysDiff = Math.floor((curr.date.getTime() - prev.date.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff > 30) { // Gaps longer than 30 days
        gaps.push({
          startDate: prev.date,
          endDate: curr.date,
          duration: daysDiff,
          precedingDocument: prev.batesNumber,
          followingDocument: curr.batesNumber,
          significance: daysDiff > 365 ? 'critical' : daysDiff > 90 ? 'important' : 'notable'
        })
      }
    }

    return gaps
  }

  private identifyCriticalDates(batesEntries: BatesEntry[]): CriticalDate[] {
    const criticalDates: CriticalDate[] = []

    // Case filing date (approximate from earliest document)
    const earliest = batesEntries.reduce((min, entry) =>
      entry.dateCreated < min.dateCreated ? entry : min
    )

    criticalDates.push({
      date: earliest.dateCreated,
      type: 'case_filing',
      description: 'Earliest document in case',
      relatedBates: [earliest.batesNumber]
    })

    // Look for statutory deadlines, motions, orders
    batesEntries.forEach(entry => {
      if (entry.documentType.toLowerCase().includes('motion')) {
        criticalDates.push({
          date: entry.dateCreated,
          type: 'motion_filed',
          description: `Motion filed: ${entry.fileName}`,
          relatedBates: [entry.batesNumber]
        })
      }

      if (entry.documentType.toLowerCase().includes('order')) {
        criticalDates.push({
          date: entry.dateCreated,
          type: 'court_order',
          description: `Court order: ${entry.fileName}`,
          relatedBates: [entry.batesNumber]
        })
      }
    })

    return criticalDates.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  private assessTemporalSignificance(entry: BatesEntry): 'critical' | 'important' | 'reference' {
    const criticalTypes = ['complaint', 'motion', 'order', 'judgment']
    const importantTypes = ['discovery', 'deposition', 'brief']

    if (criticalTypes.some(type => entry.documentType.toLowerCase().includes(type))) {
      return 'critical'
    }

    if (importantTypes.some(type => entry.documentType.toLowerCase().includes(type))) {
      return 'important'
    }

    return 'reference'
  }

  private groupByDocumentType(batesEntries: BatesEntry[]): Record<string, BatesEntry[]> {
    return batesEntries.reduce((groups, entry) => {
      const type = entry.documentType
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(entry)
      return groups
    }, {} as Record<string, BatesEntry[]>)
  }

  private calculateDuration(entries: BatesEntry[]): number {
    if (entries.length < 2) return 0
    const sorted = entries.sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime())
    const start = sorted[0].dateCreated
    const end = sorted[sorted.length - 1].dateCreated
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  private identifyPattern(entries: BatesEntry[]): 'regular' | 'clustered' | 'sporadic' {
    if (entries.length < 3) return 'sporadic'

    const sorted = entries.sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime())
    const intervals: number[] = []

    for (let i = 1; i < sorted.length; i++) {
      const days = Math.floor((sorted[i].dateCreated.getTime() - sorted[i-1].dateCreated.getTime()) / (1000 * 60 * 60 * 24))
      intervals.push(days)
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length

    if (variance < avgInterval * 0.5) return 'regular'
    if (intervals.some(i => i < 7) && intervals.some(i => i > 60)) return 'clustered'
    return 'sporadic'
  }
}

// Type definitions
export interface ValidationResult {
  isValid: boolean
  jurisdiction: string
  matches: PatternMatch[]
  significance: 'critical' | 'important' | 'reference' | 'background'
  recommendedCitations: Citation[]
  warnings: string[]
}

interface PatternMatch {
  type: PatternType
  matches: RegExpMatchArray
  positions: number[]
}

type PatternType = 'title17' | 'title57' | 'title78b' | 'mining' | 'vested' | 'zoning'

export interface TemporalAnalysis {
  timeline: TimelineEntry[]
  sequences: DocumentSequence[]
  gaps: TemporalGap[]
  criticalDates: CriticalDate[]
  caseId: string
  analysisDate: Date
}

interface TimelineEntry {
  date: Date
  batesNumber: string
  documentType: string
  filedBy: string
  significance: 'critical' | 'important' | 'reference'
}

interface DocumentSequence {
  type: string
  documents: BatesEntry[]
  duration: number
  pattern: 'regular' | 'clustered' | 'sporadic'
}

interface TemporalGap {
  startDate: Date
  endDate: Date
  duration: number
  precedingDocument: string
  followingDocument: string
  significance: 'critical' | 'important' | 'notable'
}

interface CriticalDate {
  date: Date
  type: 'case_filing' | 'motion_filed' | 'court_order' | 'deadline' | 'hearing'
  description: string
  relatedBates: string[]
}

// Export service instances that use the current case configuration
export const statuteValidator = new StatuteValidator()
export const temporalService = new TemporalService()