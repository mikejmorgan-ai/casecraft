/**
 * Document Indexing Service - Multi-Source Bates Tracking
 * Bridges attorney discovery, county disclosures, and Google Drive
 */

import { readdir, stat, readFile } from 'fs/promises'
import { join, extname, basename } from 'path'
import { createHash } from 'crypto'
import {
  CaseConfig,
  DataSourceConfig,
  BatesEntry,
  DocumentIndex,
  caseManager
} from './schema'

export class DocumentIndexer {
  private caseConfig: CaseConfig
  private batesRegistry: Map<string, BatesEntry> = new Map()

  constructor(caseConfig?: CaseConfig) {
    this.caseConfig = caseConfig || caseManager.getCurrentCase()!
  }

  /**
   * Index all documents across all configured data sources
   */
  async indexAllSources(): Promise<IndexingResult> {
    const results: SourceIndexResult[] = []
    let totalDocuments = 0

    for (const source of this.caseConfig.dataSources) {
      try {
        const result = await this.indexSource(source)
        results.push(result)
        totalDocuments += result.documentsIndexed
      } catch (error) {
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          documentsIndexed: 0,
          errors: [`Failed to index source: ${error}`],
          duration: 0
        })
      }
    }

    return {
      caseId: this.caseConfig.id,
      totalDocuments,
      sourceResults: results,
      completedAt: new Date()
    }
  }

  /**
   * Index documents from a specific data source
   */
  async indexSource(source: DataSourceConfig): Promise<SourceIndexResult> {
    const startTime = Date.now()
    const errors: string[] = []
    let documentsIndexed = 0

    try {
      switch (source.type) {
        case 'attorney_discovery':
          documentsIndexed = await this.indexAttorneyDiscovery(source)
          break
        case 'county_disclosures':
          documentsIndexed = await this.indexCountyDisclosures(source)
          break
        case 'google_drive':
          documentsIndexed = await this.indexGoogleDrive(source)
          break
        default:
          errors.push(`Unknown source type: ${source.type}`)
      }
    } catch (error) {
      errors.push(`Indexing error: ${error}`)
    }

    return {
      sourceId: source.id,
      sourceName: source.name,
      documentsIndexed,
      errors,
      duration: Date.now() - startTime
    }
  }

  private async indexAttorneyDiscovery(source: DataSourceConfig): Promise<number> {
    const basePath = this.resolveSourcePath(source.path)
    const files = await this.scanDirectory(basePath, ['.pdf', '.docx', '.doc', '.txt'])
    let indexed = 0

    for (const filePath of files) {
      try {
        const batesEntry = await this.createBatesEntry(filePath, source, 'attorney_discovery')
        this.batesRegistry.set(batesEntry.batesNumber, batesEntry)
        indexed++
      } catch (error) {
        console.warn(`Failed to index ${filePath}: ${error}`)
      }
    }

    return indexed
  }

  private async indexCountyDisclosures(source: DataSourceConfig): Promise<number> {
    const basePath = this.resolveSourcePath(source.path)
    const files = await this.scanDirectory(basePath, ['.pdf', '.docx', '.doc', '.txt'])
    let indexed = 0

    for (const filePath of files) {
      try {
        const batesEntry = await this.createBatesEntry(filePath, source, 'county_disclosure')
        this.batesRegistry.set(batesEntry.batesNumber, batesEntry)
        indexed++
      } catch (error) {
        console.warn(`Failed to index ${filePath}: ${error}`)
      }
    }

    return indexed
  }

  private async indexGoogleDrive(source: DataSourceConfig): Promise<number> {
    const basePath = this.resolveSourcePath(source.path)
    const files = await this.scanDirectory(basePath, ['.pdf', '.docx', '.doc', '.txt'])
    let indexed = 0

    for (const filePath of files) {
      try {
        const batesEntry = await this.createBatesEntry(filePath, source, 'plaintiff_evidence')
        this.batesRegistry.set(batesEntry.batesNumber, batesEntry)
        indexed++
      } catch (error) {
        console.warn(`Failed to index ${filePath}: ${error}`)
      }
    }

    return indexed
  }

  private async createBatesEntry(
    filePath: string,
    source: DataSourceConfig,
    category: string
  ): Promise<BatesEntry> {
    const fileName = basename(filePath)
    const fileStats = await stat(filePath)
    const fileContent = await this.extractContent(filePath)
    const checksum = this.calculateChecksum(fileContent)

    // Generate sequential Bates number
    const sequenceNumber = this.getNextSequenceNumber(source.id)
    const batesNumber = caseManager.generateBatesNumber(source.id, sequenceNumber)

    // Determine document type and filing party
    const documentType = this.inferDocumentType(fileName, fileContent)
    const filedBy = this.inferFilingParty(fileName, fileContent, category)

    return {
      batesNumber,
      caseId: this.caseConfig.id,
      sourceId: source.id,
      filePath,
      fileName,
      documentType,
      filedBy,
      dateCreated: fileStats.birthtime || fileStats.mtime,
      dateIndexed: new Date(),
      checksum,
      pageCount: this.estimatePageCount(fileContent),
      extractedText: fileContent,
      metadata: {
        category,
        fileSize: fileStats.size,
        extension: extname(fileName),
        lastModified: fileStats.mtime
      }
    }
  }

  private async scanDirectory(dirPath: string, extensions: string[]): Promise<string[]> {
    const files: string[] = []

    try {
      const entries = await readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name)

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subFiles = await this.scanDirectory(fullPath, extensions)
          files.push(...subFiles)
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase()
          if (extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to scan directory ${dirPath}: ${error}`)
    }

    return files
  }

  private async extractContent(filePath: string): Promise<string> {
    const ext = extname(filePath).toLowerCase()

    try {
      if (ext === '.txt') {
        return await readFile(filePath, 'utf-8')
      }

      if (ext === '.pdf') {
        // TODO: Implement PDF text extraction
        return '[PDF content extraction not implemented]'
      }

      if (ext === '.docx' || ext === '.doc') {
        // TODO: Implement Word document extraction
        return '[Word document extraction not implemented]'
      }

      return '[Unsupported file type]'
    } catch (error) {
      return `[Error extracting content: ${error}]`
    }
  }

  private calculateChecksum(content: string): string {
    return createHash('sha256').update(content).digest('hex')
  }

  private getNextSequenceNumber(sourceId: string): number {
    const existingBates = Array.from(this.batesRegistry.values())
      .filter(entry => entry.sourceId === sourceId)

    return existingBates.length + 1
  }

  private inferDocumentType(fileName: string, content: string): string {
    const lowerFileName = fileName.toLowerCase()
    const lowerContent = content.toLowerCase()

    // Common document types
    const documentTypes = [
      { patterns: ['complaint', 'petition'], type: 'complaint' },
      { patterns: ['motion', 'mtd'], type: 'motion' },
      { patterns: ['brief', 'memorandum'], type: 'brief' },
      { patterns: ['order', 'ruling'], type: 'court_order' },
      { patterns: ['discovery', 'interrogator', 'rfp', 'rfa'], type: 'discovery' },
      { patterns: ['deposition', 'depo'], type: 'deposition' },
      { patterns: ['affidavit', 'declaration'], type: 'affidavit' },
      { patterns: ['deed', 'grant'], type: 'deed' },
      { patterns: ['patent', 'land_patent'], type: 'land_patent' },
      { patterns: ['ordinance'], type: 'ordinance' },
      { patterns: ['permit', 'license'], type: 'permit' },
      { patterns: ['statute', 'code'], type: 'statute' },
      { patterns: ['case', 'opinion'], type: 'case_law' }
    ]

    for (const { patterns, type } of documentTypes) {
      if (patterns.some(pattern =>
        lowerFileName.includes(pattern) || lowerContent.includes(pattern)
      )) {
        return type
      }
    }

    return 'document'
  }

  private inferFilingParty(fileName: string, content: string, category: string): string | undefined {
    const lowerFileName = fileName.toLowerCase()
    const lowerContent = content.toLowerCase()

    // Use case configuration for party identification
    const plaintiff = this.caseConfig.plaintiffEntity.toLowerCase()
    const defendant = this.caseConfig.defendantEntity.toLowerCase()

    if (lowerFileName.includes(plaintiff) || lowerContent.includes(plaintiff)) {
      return this.caseConfig.plaintiffEntity
    }

    if (lowerFileName.includes(defendant) || lowerContent.includes(defendant)) {
      return this.caseConfig.defendantEntity
    }

    // Infer from category
    switch (category) {
      case 'attorney_discovery':
        return 'Attorney Work Product'
      case 'county_disclosure':
        return this.caseConfig.defendantEntity
      case 'plaintiff_evidence':
        return this.caseConfig.plaintiffEntity
      default:
        return undefined
    }
  }

  private estimatePageCount(content: string): number {
    // Rough estimate: 500 characters per page
    return Math.ceil(content.length / 500)
  }

  private resolveSourcePath(configPath: string): string {
    // Convert relative paths to absolute paths
    if (configPath.startsWith('/')) {
      return configPath
    }

    // Resolve relative to project root or home directory
    const baseDir = process.cwd()
    return join(baseDir, configPath)
  }

  // Public methods for accessing indexed data
  getBatesEntry(batesNumber: string): BatesEntry | undefined {
    return this.batesRegistry.get(batesNumber)
  }

  getAllBatesEntries(): BatesEntry[] {
    return Array.from(this.batesRegistry.values())
  }

  getBatesEntriesBySource(sourceId: string): BatesEntry[] {
    return Array.from(this.batesRegistry.values())
      .filter(entry => entry.sourceId === sourceId)
  }

  searchBatesEntries(query: string): BatesEntry[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.batesRegistry.values())
      .filter(entry =>
        entry.fileName.toLowerCase().includes(lowerQuery) ||
        entry.documentType.toLowerCase().includes(lowerQuery) ||
        (entry.extractedText?.toLowerCase().includes(lowerQuery) ?? false)
      )
  }
}

// Type definitions
export interface IndexingResult {
  caseId: string
  totalDocuments: number
  sourceResults: SourceIndexResult[]
  completedAt: Date
}

export interface SourceIndexResult {
  sourceId: string
  sourceName: string
  documentsIndexed: number
  errors: string[]
  duration: number
}

// Export default indexer instance
export const documentIndexer = new DocumentIndexer()