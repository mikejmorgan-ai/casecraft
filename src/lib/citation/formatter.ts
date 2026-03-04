/**
 * Source Citation Formatter - Phase 2 Reasoning Trace
 *
 * Provides standardized source citation footers for all agent outputs
 * Lists specific Bates numbers and source origins as required
 */

import type { SourceCitation } from '@/core/controller'

export interface CitationFooter {
  title: string
  citations: FormattedCitation[]
  totalSources: number
  confidenceRange: string
  generatedAt: Date
}

export interface FormattedCitation {
  batesNumber: string
  sourceOrigin: 'Repo' | 'Drive' | 'Transfer'
  documentTitle: string
  relevantSection?: string
  confidenceScore: number
  formattedReference: string
}

/**
 * Format source citations for judicial reasoning trace
 */
export class CitationFormatter {
  /**
   * Generate complete source citation footer
   */
  static generateFooter(
    citations: SourceCitation[],
    analysisType: string = 'Legal Analysis'
  ): CitationFooter {
    const formattedCitations = citations.map(citation =>
      this.formatCitation(citation)
    ).sort((a, b) => b.confidenceScore - a.confidenceScore)

    const confidenceScores = citations.map(c => c.confidenceScore)
    const minConfidence = Math.min(...confidenceScores)
    const maxConfidence = Math.max(...confidenceScores)

    return {
      title: `Source Citations - ${analysisType}`,
      citations: formattedCitations,
      totalSources: citations.length,
      confidenceRange: `${(minConfidence * 100).toFixed(1)}% - ${(maxConfidence * 100).toFixed(1)}%`,
      generatedAt: new Date()
    }
  }

  /**
   * Format individual source citation
   */
  private static formatCitation(citation: SourceCitation): FormattedCitation {
    const formattedReference = this.buildCitationReference(citation)

    return {
      batesNumber: citation.batesNumber,
      sourceOrigin: citation.sourceOrigin,
      documentTitle: citation.documentTitle,
      relevantSection: citation.relevantSection,
      confidenceScore: citation.confidenceScore,
      formattedReference
    }
  }

  /**
   * Build formatted citation reference
   */
  private static buildCitationReference(citation: SourceCitation): string {
    let reference = `[${citation.batesNumber}]`
    reference += ` ${citation.documentTitle}`

    if (citation.relevantSection) {
      reference += ` § ${citation.relevantSection}`
    }

    reference += ` (${citation.sourceOrigin})`
    reference += ` [Confidence: ${(citation.confidenceScore * 100).toFixed(1)}%]`

    return reference
  }

  /**
   * Generate text-based citation footer for console/text output
   */
  static generateTextFooter(
    citations: SourceCitation[],
    analysisType: string = 'Analysis'
  ): string {
    const footer = this.generateFooter(citations, analysisType)

    let text = '\n' + '═'.repeat(80) + '\n'
    text += `📚 SOURCE CITATIONS - ${footer.title.toUpperCase()}\n`
    text += '═'.repeat(80) + '\n'

    if (footer.citations.length === 0) {
      text += '⚠️  No source citations available\n'
    } else {
      footer.citations.forEach((citation, index) => {
        text += `${index + 1}. ${citation.formattedReference}\n`
      })

      text += '─'.repeat(80) + '\n'
      text += `📊 Total Sources: ${footer.totalSources}\n`
      text += `🎯 Confidence Range: ${footer.confidenceRange}\n`
    }

    text += `⏰ Generated: ${footer.generatedAt.toLocaleString()}\n`
    text += '═'.repeat(80)

    return text
  }

  /**
   * Generate HTML citation footer for web display
   */
  static generateHTMLFooter(
    citations: SourceCitation[],
    analysisType: string = 'Analysis'
  ): string {
    const footer = this.generateFooter(citations, analysisType)

    let html = `
    <div class="source-citations">
      <h3>📚 Source Citations - ${footer.title}</h3>
      <div class="citation-metadata">
        <span class="total-sources">Sources: ${footer.totalSources}</span>
        <span class="confidence-range">Confidence: ${footer.confidenceRange}</span>
        <span class="generated-time">Generated: ${footer.generatedAt.toLocaleString()}</span>
      </div>
      <ol class="citation-list">
    `

    footer.citations.forEach(citation => {
      const confidenceClass = citation.confidenceScore > 0.8 ? 'high-confidence' :
                             citation.confidenceScore > 0.6 ? 'medium-confidence' : 'low-confidence'

      html += `
        <li class="citation ${confidenceClass}">
          <div class="citation-header">
            <span class="bates-number">${citation.batesNumber}</span>
            <span class="source-origin ${citation.sourceOrigin.toLowerCase()}">${citation.sourceOrigin}</span>
            <span class="confidence-score">${(citation.confidenceScore * 100).toFixed(1)}%</span>
          </div>
          <div class="citation-body">
            <strong>${citation.documentTitle}</strong>
            ${citation.relevantSection ? `<span class="section">§ ${citation.relevantSection}</span>` : ''}
          </div>
        </li>
      `
    })

    html += `
      </ol>
    </div>
    `

    return html
  }

  /**
   * Generate JSON citation data for API responses
   */
  static generateJSONCitations(
    citations: SourceCitation[],
    analysisType: string = 'Analysis'
  ): object {
    const footer = this.generateFooter(citations, analysisType)

    return {
      sourceCitations: {
        analysisType: footer.title,
        totalSources: footer.totalSources,
        confidenceRange: footer.confidenceRange,
        generatedAt: footer.generatedAt.toISOString(),
        citations: footer.citations.map(citation => ({
          batesNumber: citation.batesNumber,
          sourceOrigin: citation.sourceOrigin,
          documentTitle: citation.documentTitle,
          relevantSection: citation.relevantSection,
          confidenceScore: citation.confidenceScore,
          formattedReference: citation.formattedReference
        }))
      }
    }
  }

  /**
   * Validate citation completeness
   */
  static validateCitations(citations: SourceCitation[]): ValidationResult {
    const issues: string[] = []

    if (citations.length === 0) {
      issues.push('No source citations provided')
    }

    citations.forEach((citation, index) => {
      if (!citation.batesNumber || citation.batesNumber.trim() === '') {
        issues.push(`Citation ${index + 1}: Missing Bates number`)
      }

      if (!citation.sourceOrigin) {
        issues.push(`Citation ${index + 1}: Missing source origin`)
      }

      if (!citation.documentTitle || citation.documentTitle.trim() === '') {
        issues.push(`Citation ${index + 1}: Missing document title`)
      }

      if (citation.confidenceScore < 0 || citation.confidenceScore > 1) {
        issues.push(`Citation ${index + 1}: Invalid confidence score (${citation.confidenceScore})`)
      }
    })

    return {
      isValid: issues.length === 0,
      issues,
      citationCount: citations.length
    }
  }

  /**
   * Generate summary statistics for citations
   */
  static generateCitationStats(citations: SourceCitation[]): CitationStats {
    if (citations.length === 0) {
      return {
        totalCitations: 0,
        sourceBreakdown: { Repo: 0, Drive: 0, Transfer: 0 },
        averageConfidence: 0,
        highConfidenceCitations: 0,
        uniqueBatesNumbers: 0
      }
    }

    const sourceBreakdown = citations.reduce((acc, citation) => {
      acc[citation.sourceOrigin] = (acc[citation.sourceOrigin] || 0) + 1
      return acc
    }, { Repo: 0, Drive: 0, Transfer: 0 } as Record<string, number>)

    const averageConfidence = citations.reduce((sum, c) => sum + c.confidenceScore, 0) / citations.length
    const highConfidenceCitations = citations.filter(c => c.confidenceScore > 0.8).length
    const uniqueBatesNumbers = new Set(citations.map(c => c.batesNumber)).size

    return {
      totalCitations: citations.length,
      sourceBreakdown,
      averageConfidence,
      highConfidenceCitations,
      uniqueBatesNumbers
    }
  }
}

// Type definitions
interface ValidationResult {
  isValid: boolean
  issues: string[]
  citationCount: number
}

interface CitationStats {
  totalCitations: number
  sourceBreakdown: Record<string, number>
  averageConfidence: number
  highConfidenceCitations: number
  uniqueBatesNumbers: number
}

// CSS styles for HTML output
export const CITATION_STYLES = `
<style>
.source-citations {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  background-color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.source-citations h3 {
  margin: 0 0 15px 0;
  color: #2563eb;
  font-size: 1.2em;
}

.citation-metadata {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 0.9em;
  color: #666;
}

.citation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.citation {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  background-color: white;
}

.citation.high-confidence {
  border-left: 4px solid #22c55e;
}

.citation.medium-confidence {
  border-left: 4px solid #f59e0b;
}

.citation.low-confidence {
  border-left: 4px solid #ef4444;
}

.citation-header {
  display: flex;
  gap: 15px;
  margin-bottom: 5px;
  align-items: center;
}

.bates-number {
  font-weight: bold;
  font-family: monospace;
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
}

.source-origin {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  text-transform: uppercase;
}

.source-origin.repo { background-color: #dbeafe; color: #1e40af; }
.source-origin.drive { background-color: #fef3c7; color: #92400e; }
.source-origin.transfer { background-color: #dcfce7; color: #166534; }

.confidence-score {
  font-size: 0.85em;
  font-weight: 600;
  color: #6b7280;
}

.citation-body strong {
  color: #374151;
}

.section {
  font-style: italic;
  color: #6b7280;
}
</style>
`

export default CitationFormatter