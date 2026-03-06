/**
 * CaseLedger - Enterprise Modular Case Management System
 * Unified entry point for all case management functionality
 */

// Core schema and types
export type {
  CaseConfig,
  DataSourceConfig,
  BatesEntry,
  DocumentIndex,
  Citation
} from './schema'

export {
  CaseManager,
  caseManager,
  DEFAULT_CASES
} from './schema'

// Services
export type {
  ValidationResult,
  TemporalAnalysis
} from './services'

export {
  StatuteValidator,
  TemporalService,
  statuteValidator,
  temporalService
} from './services'

// Document indexing — server-only, import directly from './indexing' in API routes
// Removed from barrel export to avoid pulling fs/promises into client bundles

// Utility functions for case management
export function getCurrentCaseName(): string {
  return caseManager.getCurrentCase()?.name || 'unknown_case'
}

export function getCurrentPlaintiff(): string {
  return caseManager.getPlaintiffEntity()
}

export function getCurrentDefendant(): string {
  return caseManager.getDefendantEntity()
}

export function switchCase(caseId: string): boolean {
  const caseConfig = DEFAULT_CASES[caseId]
  if (caseConfig) {
    caseManager.setCurrentCase(caseConfig)
    return true
  }
  return false
}

// Migration helpers for refactoring hardcoded references
export function getPartyRouting(filedBy: string): 'plaintiff' | 'defendant' | 'court' | 'third_party' {
  return caseManager.routeDocument(filedBy)
}

export function isPlaintiffDocument(filedBy: string): boolean {
  return getPartyRouting(filedBy) === 'plaintiff'
}

export function isDefendantDocument(filedBy: string): boolean {
  return getPartyRouting(filedBy) === 'defendant'
}

// Initialize the case ledger system
export async function initializeCaseLedger(caseId?: string): Promise<void> {
  console.log('🏛️  Initializing CaseLedger System')

  // Set the current case
  if (caseId && DEFAULT_CASES[caseId]) {
    switchCase(caseId)
    console.log(`📁 Switched to case: ${DEFAULT_CASES[caseId].displayName}`)
  } else {
    console.log(`📁 Using default case: ${caseManager.getCurrentCase()?.displayName}`)
  }

  // Index all data sources
  try {
    const indexingResult = await documentIndexer.indexAllSources()
    console.log(`📊 Indexed ${indexingResult.totalDocuments} documents across ${indexingResult.sourceResults.length} sources`)

    for (const result of indexingResult.sourceResults) {
      console.log(`  └─ ${result.sourceName}: ${result.documentsIndexed} documents`)
      if (result.errors.length > 0) {
        console.warn(`     Errors: ${result.errors.join(', ')}`)
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize document indexing:', error)
  }

  console.log('✅ CaseLedger initialization complete')
}

// Legacy compatibility layer
export const LEGACY_MAPPINGS = {
  'Tree Farm LLC': () => getCurrentPlaintiff(),
  'Salt Lake County': () => getCurrentDefendant(),
  'tree_farm': () => getCurrentCaseName(),
  'treefarm': () => getCurrentCaseName()
}

export function mapLegacyReference(legacyRef: string): string {
  const mapper = LEGACY_MAPPINGS[legacyRef as keyof typeof LEGACY_MAPPINGS]
  return mapper ? mapper() : legacyRef
}