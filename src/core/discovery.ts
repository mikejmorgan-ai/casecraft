/**
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { ValidationError } from '@/lib/errors'

export interface BatesDocument {
  batesNumber: string
  title: string
  content?: string
  sourceOrigin: 'Repo' | 'Drive' | 'Transfer'
  party: 'Plaintiff' | 'Defendant'
}

export interface FortressReport {
  caseId: string
  documents: BatesDocument[]
  citations: CitationEntry[]
  timestamp: Date
}

interface CitationEntry {
  batesNumber: string
  context: string
  relevance: number
}

/**
 * BATES-STRICT VALIDATION ENGINE
 * Enforces TF- (Tree Farm/Plaintiff) and SLC- (Salt Lake County/Defendant) prefixes
 */
export class BatesValidator {
  private readonly PLAINTIFF_PREFIX = 'TF-'
  private readonly DEFENDANT_PREFIX = 'SLC-'

  /**
   * Validate Bates number format - STRICT enforcement
   */
  validateBatesNumber(batesNumber: string): { isValid: boolean; party?: 'Plaintiff' | 'Defendant'; error?: string } {
    if (!batesNumber || typeof batesNumber !== 'string') {
      return {
        isValid: false,
        error: 'Bates number must be a non-empty string'
      }
    }

    // PLAINTIFF validation (Tree Farm LLC)
    if (batesNumber.startsWith(this.PLAINTIFF_PREFIX)) {
      const suffix = batesNumber.substring(this.PLAINTIFF_PREFIX.length)
      if (this.isValidSuffix(suffix)) {
        return {
          isValid: true,
          party: 'Plaintiff'
        }
      }
      return {
        isValid: false,
        error: `Invalid TF- suffix format: ${suffix}. Expected format: TF-XXXXXX`
      }
    }

    // DEFENDANT validation (Salt Lake County)
    if (batesNumber.startsWith(this.DEFENDANT_PREFIX)) {
      const suffix = batesNumber.substring(this.DEFENDANT_PREFIX.length)
      if (this.isValidSuffix(suffix)) {
        return {
          isValid: true,
          party: 'Defendant'
        }
      }
      return {
        isValid: false,
        error: `Invalid SLC- suffix format: ${suffix}. Expected format: SLC-XXXXXX`
      }
    }

    // REJECTION - No valid prefix found
    return {
      isValid: false,
      error: `Bates number must begin with TF- (Plaintiff) or SLC- (Defendant). Found: ${batesNumber}`
    }
  }

  /**
   * Validate suffix format (6-digit numeric)
   */
  private isValidSuffix(suffix: string): boolean {
    return /^\d{6}$/.test(suffix)
  }

  /**
   * Validate entire document for Bates compliance
   */
  validateDocument(document: BatesDocument): void {
    const validation = this.validateBatesNumber(document.batesNumber)

    if (!validation.isValid) {
      throw new ValidationError(`Bates validation failed: ${validation.error}`)
    }

    // Ensure party designation matches prefix
    if (validation.party !== document.party) {
      throw new ValidationError(
        `Party mismatch: Document marked as ${document.party} but Bates number ${document.batesNumber} indicates ${validation.party}`
      )
    }
  }

  /**
   * FORTRESS REPORT validation - ALL citations must pass Bates-strict
   */
  validateFortressReport(report: FortressReport): void {
    console.log(`🔍 Validating Fortress Report for case ${report.caseId}`)
    console.log(`📄 Validating ${report.documents.length} documents`)
    console.log(`📎 Validating ${report.citations.length} citations`)

    const errors: string[] = []

    // Validate all documents
    report.documents.forEach((doc, index) => {
      try {
        this.validateDocument(doc)
        console.log(`✅ Document ${index + 1}: ${doc.batesNumber} - VALID`)
      } catch (error) {
        const errorMsg = `Document ${index + 1} (${doc.batesNumber}): ${error instanceof Error ? error.message : error}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    })

    // Validate all citations reference valid documents
    report.citations.forEach((citation, index) => {
      const validation = this.validateBatesNumber(citation.batesNumber)
      if (!validation.isValid) {
        const errorMsg = `Citation ${index + 1}: ${validation.error}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      } else {
        console.log(`✅ Citation ${index + 1}: ${citation.batesNumber} - VALID`)
      }
    })

    // FAILURE: Throw if any validation errors found
    if (errors.length > 0) {
      const errorReport = `BATES-STRICT VALIDATION FAILED:\n${errors.join('\n')}`
      console.error(`🚨 Fortress Report REJECTED: ${errors.length} validation errors`)
      throw new ValidationError(errorReport)
    }

    console.log(`✅ Fortress Report VALIDATED: All ${report.documents.length} documents and ${report.citations.length} citations pass Bates-strict requirements`)
  }

  /**
   * Generate sample Bates numbers for testing
   */
  generateSampleBatesNumbers(): { plaintiff: string[]; defendant: string[] } {
    return {
      plaintiff: [
        'TF-000001',
        'TF-000002',
        'TF-000003',
        'TF-001234',
        'TF-999999'
      ],
      defendant: [
        'SLC-000001',
        'SLC-000002',
        'SLC-000003',
        'SLC-001234',
        'SLC-999999'
      ]
    }
  }
}

// Export singleton instance
export const batesValidator = new BatesValidator()

console.log('🔐 Bates-Strict Validation Engine initialized')
console.log('📋 Enforcing TF- (Tree Farm) and SLC- (Salt Lake County) prefixes')