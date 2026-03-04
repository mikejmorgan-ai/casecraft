/**
 * CaseLedger Schema - Enterprise Modular Case Management
 * Tracks Bates numbers and documents across all data sources
 */

export interface CaseConfig {
  id: string
  name: string
  displayName: string
  plaintiffEntity: string
  defendantEntity: string
  jurisdiction: string
  caseNumber: string
  status: 'active' | 'settled' | 'archived'
  createdAt: Date
  dataSources: DataSourceConfig[]
}

export interface DataSourceConfig {
  id: string
  name: string
  type: 'attorney_discovery' | 'county_disclosures' | 'google_drive'
  path: string
  batesPrefix: string
  totalDocuments: number
  lastScanDate?: Date
  metadata: Record<string, any>
}

export interface BatesEntry {
  batesNumber: string
  caseId: string
  sourceId: string
  filePath: string
  fileName: string
  documentType: string
  filedBy?: string
  dateCreated: Date
  dateIndexed: Date
  checksum: string
  pageCount?: number
  extractedText?: string
  metadata: Record<string, any>
}

export interface DocumentIndex {
  id: string
  batesNumber: string
  caseId: string
  title: string
  documentType: string
  source: string
  filedBy?: string
  dateCreated: Date
  tags: string[]
  searchVector?: number[]
  content: string
  citations: Citation[]
  relatedBates: string[]
  significance: 'critical' | 'important' | 'reference' | 'background'
}

export interface Citation {
  type: 'statute' | 'case_law' | 'regulation' | 'cross_reference'
  reference: string
  section?: string
  context: string
}

// Case routing logic based on configuration
export class CaseManager {
  private currentCase: CaseConfig | null = null

  setCurrentCase(caseConfig: CaseConfig): void {
    this.currentCase = caseConfig
  }

  getCurrentCase(): CaseConfig | null {
    return this.currentCase
  }

  getPlaintiffEntity(): string {
    return this.currentCase?.plaintiffEntity || 'Plaintiff'
  }

  getDefendantEntity(): string {
    return this.currentCase?.defendantEntity || 'Defendant'
  }

  getCaseDisplayName(): string {
    return this.currentCase?.displayName || 'Current Case'
  }

  // Route document based on filing party and case configuration
  routeDocument(filedBy: string): 'plaintiff' | 'defendant' | 'court' | 'third_party' {
    if (!this.currentCase) return 'third_party'

    if (filedBy === this.currentCase.plaintiffEntity) {
      return 'plaintiff'
    }

    if (filedBy === this.currentCase.defendantEntity) {
      return 'defendant'
    }

    if (filedBy.toLowerCase().includes('court') ||
        filedBy.toLowerCase().includes('judge')) {
      return 'court'
    }

    return 'third_party'
  }

  // Get data source configuration
  getDataSource(sourceId: string): DataSourceConfig | null {
    return this.currentCase?.dataSources.find(source => source.id === sourceId) || null
  }

  // Generate next Bates number for a source
  generateBatesNumber(sourceId: string, sequenceNumber: number): string {
    const source = this.getDataSource(sourceId)
    if (!source) {
      throw new Error(`Data source not found: ${sourceId}`)
    }

    return `${source.batesPrefix}${String(sequenceNumber).padStart(6, '0')}`
  }
}

// Global case manager instance
export const caseManager = new CaseManager()

// Default case configurations for common case types
export const DEFAULT_CASES: Record<string, CaseConfig> = {
  'tree-farm': {
    id: 'tree-farm',
    name: 'tree_farm_vs_salt_lake_county',
    displayName: 'Tree Farm LLC vs. Salt Lake County',
    plaintiffEntity: 'Tree Farm LLC',
    defendantEntity: 'Salt Lake County',
    jurisdiction: 'Third District Court, Salt Lake County',
    caseNumber: '200901074',
    status: 'active',
    createdAt: new Date('2009-01-01'),
    dataSources: [
      {
        id: 'attorney-discovery',
        name: 'Attorney Discovery',
        type: 'attorney_discovery',
        path: '/attorney-provided-discovery',
        batesPrefix: 'TF',
        totalDocuments: 0,
        metadata: { description: 'Attorney-provided discovery documents' }
      },
      {
        id: 'county-disclosures',
        name: 'SLCo Disclosures',
        type: 'county_disclosures',
        path: '/Transfer',
        batesPrefix: 'SLC',
        totalDocuments: 0,
        metadata: { description: 'Salt Lake County disclosure documents' }
      },
      {
        id: 'google-drive',
        name: 'Google Drive Tree Farm',
        type: 'google_drive',
        path: '/Google Drive/Tree Farm',
        batesPrefix: 'GD',
        totalDocuments: 0,
        metadata: { description: 'Plaintiff evidence and case law' }
      }
    ]
  }
}

// Initialize with Tree Farm case for backward compatibility
caseManager.setCurrentCase(DEFAULT_CASES['tree-farm'])