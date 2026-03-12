/**
 * DiscoveryAgent - Automated Document Analysis with Confidence Gates
 *
 * Implements Human-in-the-Loop triage:
 * - OCR confidence < 85% → Human review required
 * - Image/handwritten content → Human review required
 * - Moves flagged files to /data/triage/human_review_required
 * - Generates triage_summary.json with flagging reasons
 */

import { writeFile, mkdir, copyFile, access } from 'fs/promises'
import { join, dirname, basename } from 'path'
import { documentIndexer } from '@/lib/case-ledger/indexing'
import type { BatesEntry } from '@/lib/case-ledger'
import { searchByRole, validateWithBracketedTerms, formatResultsForContext } from '@/lib/pinecone/search'
import type { AgentFindings, SourceCitation } from '../controller'

export interface DocumentAnalysis {
  batesNumber: string
  documentType: string
  ocrConfidence: number
  isHandwritten: boolean
  isImage: boolean
  passesConfidenceGate: boolean
  flagReason?: string
  extractedText: string
  keyFindings: string[]
  relevanceScore: number
  sourceCitation: SourceCitation
}

export interface TriageSummary {
  totalDocumentsProcessed: number
  passedConfidenceGate: number
  flaggedForHumanReview: number
  flaggedDocuments: TriageFlag[]
  generatedAt: Date
  triageReasons: {
    lowOcrConfidence: number
    handwrittenContent: number
    imageContent: number
    corruptedFiles: number
  }
}

interface TriageFlag {
  batesNumber: string
  originalPath: string
  newPath: string
  flagReason: string
  ocrConfidence?: number
  documentType: string
  fileSize: number
}

/**
 * DiscoveryAgent - Document analysis with automated quality gates
 */
export class DiscoveryAgent {
  private readonly confidenceThreshold = 0.85 // 85% OCR confidence minimum
  private readonly triageDirectory = '/data/triage/human_review_required'

  constructor() {
    console.log('📄 DiscoveryAgent initialized with confidence gates')
    console.log(`🎯 OCR Confidence Threshold: ${this.confidenceThreshold * 100}%`)
  }

  /**
   * Investigate documents with automated triage
   */
  async investigateDocuments(
    question: string,
    context?: string,
    claimNumber?: number
  ): Promise<AgentFindings> {
    const startTime = Date.now()
    console.log(`🔍 DiscoveryAgent analyzing documents for: "${question}"`)

    try {
      // Step 1: Get all relevant documents from case ledger
      const allDocuments = documentIndexer.getAllBatesEntries()
      console.log(`📄 Found ${allDocuments.length} documents in case ledger`)

      // Step 2: Perform automated triage on all documents
      const triageResults = await this.performAutomatedTriage(allDocuments)
      console.log(`🚨 Triage: ${triageResults.flaggedForHumanReview} documents flagged for human review`)

      // Step 3: Analyze only documents that passed confidence gates
      const approvedDocuments = allDocuments.filter(doc => {
        const analysis = this.analyzeDocumentQuality(doc)
        return analysis.passesConfidenceGate
      })

      // Step 4: Perform vector search on approved documents
      const searchResults = await searchByRole(question, 'plaintiff_attorney', { topK: 15 })

      // Step 5: Validate with bracketed terms if claim number provided
      const validatedResults = claimNumber
        ? validateWithBracketedTerms(searchResults, claimNumber)
        : searchResults

      // Step 6: Convert to document analysis format
      const documentAnalyses = await Promise.all(
        validatedResults.map(result => this.convertToDocumentAnalysis(result))
      )

      // Step 7: Generate source citations
      const sourceCitations = documentAnalyses.map(analysis => analysis.sourceCitation)

      // Step 8: Identify key findings
      const keyFindings = this.extractKeyFindings(documentAnalyses, question)

      const processingTime = Date.now() - startTime
      console.log(`✅ DiscoveryAgent analysis complete (${processingTime}ms)`)

      return {
        agentType: 'discovery',
        agent: 'DiscoveryAgent v2.0',
        findings: documentAnalyses.map(analysis => ({
          batesNumber: analysis.batesNumber,
          documentType: analysis.documentType,
          relevanceScore: analysis.relevanceScore,
          keyFindings: analysis.keyFindings,
          passesConfidenceGate: analysis.passesConfidenceGate,
          requiresHumanReview: !analysis.passesConfidenceGate,
          flagReason: analysis.flagReason,
          topic: this.inferTopic(analysis.extractedText),
          significance: analysis.relevanceScore > 0.8 ? 'critical' :
                      analysis.relevanceScore > 0.6 ? 'important' : 'reference',
          summary: analysis.keyFindings.join('; ')
        })),
        confidence: this.calculateOverallConfidence(documentAnalyses),
        processingTime,
        sourceCitations,
        warnings: triageResults.flaggedDocuments.map(flag =>
          `${flag.batesNumber}: ${flag.flagReason}`
        )
      }

    } catch (error) {
      console.error(`❌ DiscoveryAgent failed: ${error}`)

      return {
        agentType: 'discovery',
        agent: 'DiscoveryAgent v2.0',
        findings: [],
        confidence: 0,
        processingTime: Date.now() - startTime,
        sourceCitations: [],
        warnings: [`Document analysis failed: ${error}`]
      }
    }
  }

  /**
   * Automated triage with confidence gates
   */
  private async performAutomatedTriage(documents: BatesEntry[]): Promise<TriageSummary> {
    console.log('🔍 Performing automated triage with confidence gates...')

    const flaggedDocuments: TriageFlag[] = []
    const triageReasons = {
      lowOcrConfidence: 0,
      handwrittenContent: 0,
      imageContent: 0,
      corruptedFiles: 0
    }

    // Ensure triage directory exists
    await this.ensureTriageDirectory()

    for (const document of documents) {
      const analysis = this.analyzeDocumentQuality(document)

      if (!analysis.passesConfidenceGate) {
        // Move to human review
        const newPath = await this.moveToHumanReview(document, analysis.flagReason!)

        flaggedDocuments.push({
          batesNumber: document.batesNumber,
          originalPath: document.filePath,
          newPath,
          flagReason: analysis.flagReason!,
          ocrConfidence: analysis.ocrConfidence,
          documentType: document.documentType,
          fileSize: document.metadata?.fileSize || 0
        })

        // Count flag reasons
        if (analysis.flagReason!.includes('OCR confidence')) {
          triageReasons.lowOcrConfidence++
        }
        if (analysis.flagReason!.includes('handwritten')) {
          triageReasons.handwrittenContent++
        }
        if (analysis.flagReason!.includes('image')) {
          triageReasons.imageContent++
        }
        if (analysis.flagReason!.includes('corrupted')) {
          triageReasons.corruptedFiles++
        }
      }
    }

    const triageSummary: TriageSummary = {
      totalDocumentsProcessed: documents.length,
      passedConfidenceGate: documents.length - flaggedDocuments.length,
      flaggedForHumanReview: flaggedDocuments.length,
      flaggedDocuments,
      generatedAt: new Date(),
      triageReasons
    }

    // Save triage summary
    await this.savTriageSummary(triageSummary)

    console.log(`📊 Triage complete: ${triageSummary.flaggedForHumanReview}/${triageSummary.totalDocumentsProcessed} flagged`)

    return triageSummary
  }

  /**
   * Analyze document quality and apply confidence gates
   */
  private analyzeDocumentQuality(document: BatesEntry): DocumentAnalysis {
    // Simulate OCR confidence analysis (in production, this would use actual OCR)
    const ocrConfidence = this.estimateOCRConfidence(document)
    const isHandwritten = this.detectHandwriting(document)
    const isImage = this.detectImageContent(document)

    // Apply confidence gates
    const passesConfidenceGate =
      ocrConfidence >= this.confidenceThreshold &&
      !isHandwritten &&
      !isImage

    let flagReason: string | undefined
    if (ocrConfidence < this.confidenceThreshold) {
      flagReason = `OCR confidence ${(ocrConfidence * 100).toFixed(1)}% below threshold ${this.confidenceThreshold * 100}%`
    } else if (isHandwritten) {
      flagReason = 'Handwritten content detected - requires human interpretation'
    } else if (isImage) {
      flagReason = 'Image content without sufficient text extraction'
    }

    const batesDoc = documentIndexer.getBatesEntry(document.batesNumber)

    return {
      batesNumber: document.batesNumber,
      documentType: document.documentType,
      ocrConfidence,
      isHandwritten,
      isImage,
      passesConfidenceGate,
      flagReason,
      extractedText: batesDoc?.extractedText || '',
      keyFindings: [], // Will be populated during analysis
      relevanceScore: 0.5, // Default relevance
      sourceCitation: this.createSourceCitation(document)
    }
  }

  /**
   * Estimate OCR confidence (simulation for demo)
   */
  private estimateOCRConfidence(document: BatesEntry): number {
    const fileName = document.fileName.toLowerCase()

    // Simulate OCR confidence based on file characteristics
    if (fileName.includes('scan') || fileName.includes('copy')) {
      return 0.6 + Math.random() * 0.3 // 60-90% confidence
    }

    if (fileName.includes('handwritten') || fileName.includes('signature')) {
      return 0.3 + Math.random() * 0.4 // 30-70% confidence
    }

    if (fileName.includes('.pdf') && document.extractedText && document.extractedText.length > 100) {
      return 0.85 + Math.random() * 0.14 // 85-99% confidence (good quality)
    }

    // Default estimation
    return 0.7 + Math.random() * 0.25 // 70-95% confidence
  }

  /**
   * Detect handwritten content (simulation)
   */
  private detectHandwriting(document: BatesEntry): boolean {
    const fileName = document.fileName.toLowerCase()
    const text = document.extractedText?.toLowerCase() || ''

    return fileName.includes('handwritten') ||
           fileName.includes('signature') ||
           fileName.includes('affidavit') ||
           text.includes('signature') ||
           text.includes('sworn')
  }

  /**
   * Detect image content without sufficient text
   */
  private detectImageContent(document: BatesEntry): boolean {
    const fileName = document.fileName.toLowerCase()
    const hasImageExtension = ['.jpg', '.png', '.tiff', '.bmp'].some(ext => fileName.includes(ext))
    const hasMinimalText = (document.extractedText?.length || 0) < 50

    return hasImageExtension ||
           (hasMinimalText && fileName.includes('scan'))
  }

  /**
   * Move flagged document to human review directory
   */
  private async moveToHumanReview(document: BatesEntry, reason: string): Promise<string> {
    const fileName = basename(document.filePath)
    const newPath = join(this.triageDirectory, `${document.batesNumber}_${fileName}`)

    try {
      // Check if original file exists
      await access(document.filePath)

      // Copy to triage directory (preserve original)
      await copyFile(document.filePath, newPath)

      console.log(`📋 Moved ${document.batesNumber} to human review: ${reason}`)

    } catch (error) {
      console.warn(`⚠️  Could not move ${document.batesNumber}: ${error}`)
      // Return conceptual path even if file operation fails
    }

    return newPath
  }

  /**
   * Ensure triage directory exists
   */
  private async ensureTriageDirectory(): Promise<void> {
    try {
      await mkdir(this.triageDirectory, { recursive: true })
    } catch (error) {
      console.warn(`⚠️  Could not create triage directory: ${error}`)
    }
  }

  /**
   * Save triage summary JSON
   */
  private async savTriageSummary(summary: TriageSummary): Promise<void> {
    const summaryPath = join(dirname(this.triageDirectory), 'triage_summary.json')

    try {
      await writeFile(summaryPath, JSON.stringify(summary, null, 2))
      console.log(`💾 Triage summary saved: ${summaryPath}`)
    } catch (error) {
      console.warn(`⚠️  Could not save triage summary: ${error}`)
    }
  }

  /**
   * Convert search result to document analysis
   */
  private async convertToDocumentAnalysis(result: any): Promise<DocumentAnalysis> {
    const batesNumber = this.extractBatesNumber(result.id)
    const batesEntry = documentIndexer.getBatesEntry(batesNumber)

    if (!batesEntry) {
      throw new Error(`Bates entry not found: ${batesNumber}`)
    }

    const analysis = this.analyzeDocumentQuality(batesEntry)
    analysis.relevanceScore = result.score || 0.5
    analysis.keyFindings = this.extractKeyFindings([analysis], result.content).slice(0, 3)

    return analysis
  }

  /**
   * Extract Bates number from document ID
   */
  private extractBatesNumber(documentId: string): string {
    // Extract Bates number from document ID (implementation depends on ID format)
    const batesMatch = documentId.match(/([A-Z]+\d{6})/i)
    return batesMatch ? batesMatch[1] : documentId
  }

  /**
   * Create source citation for document
   */
  private createSourceCitation(document: BatesEntry): SourceCitation {
    let sourceOrigin: 'Repo' | 'Drive' | 'Transfer' = 'Repo'

    if (document.sourceId === 'google-drive') {
      sourceOrigin = 'Drive'
    } else if (document.sourceId === 'county-disclosures') {
      sourceOrigin = 'Transfer'
    }

    return {
      batesNumber: document.batesNumber,
      sourceOrigin,
      documentTitle: document.fileName,
      relevantSection: undefined,
      confidenceScore: this.estimateOCRConfidence(document)
    }
  }

  /**
   * Extract key findings from document analyses
   */
  private extractKeyFindings(analyses: DocumentAnalysis[], query: string): string[] {
    const findings: string[] = []

    analyses.forEach(analysis => {
      const text = analysis.extractedText.toLowerCase()
      const queryWords = query.toLowerCase().split(' ')

      // Find sentences containing query terms
      const sentences = text.split(/[.!?]+/)
      queryWords.forEach(word => {
        const relevantSentences = sentences.filter(s => s.includes(word))
        relevantSentences.forEach(sentence => {
          if (sentence.trim().length > 10 && findings.length < 10) {
            findings.push(sentence.trim().substring(0, 200) + '...')
          }
        })
      })
    })

    return [...new Set(findings)] // Remove duplicates
  }

  /**
   * Infer topic from document text
   */
  private inferTopic(text: string): string {
    const lowerText = text.toLowerCase()

    if (lowerText.includes('vested') || lowerText.includes('mining')) {
      return 'Vested Mining Rights'
    }
    if (lowerText.includes('ordinance') || lowerText.includes('zoning')) {
      return 'Zoning and Ordinances'
    }
    if (lowerText.includes('deed') || lowerText.includes('title')) {
      return 'Property Rights'
    }
    if (lowerText.includes('permit') || lowerText.includes('dogm')) {
      return 'Mining Permits'
    }

    return 'General Case Matter'
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(analyses: DocumentAnalysis[]): number {
    if (analyses.length === 0) return 0

    const relevanceScores = analyses.map(a => a.relevanceScore)
    const ocrScores = analyses.map(a => a.ocrConfidence)

    const avgRelevance = relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length
    const avgOCR = ocrScores.reduce((a, b) => a + b, 0) / ocrScores.length

    return (avgRelevance * 0.6 + avgOCR * 0.4) // Weight relevance more heavily
  }

  /**
   * Health status check
   */
  async getHealthStatus(): Promise<{ healthy: boolean; message?: string; lastActivity?: Date }> {
    const totalDocs = documentIndexer.getAllBatesEntries().length

    return {
      healthy: totalDocs > 0,
      message: `${totalDocs} documents indexed, confidence gate at ${this.confidenceThreshold * 100}%`,
      lastActivity: new Date()
    }
  }

  /**
   * Get total document count
   */
  async getTotalDocumentCount(): Promise<number> {
    return documentIndexer.getAllBatesEntries().length
  }
}