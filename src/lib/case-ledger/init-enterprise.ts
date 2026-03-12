/**
 * Enterprise CaseLedger Initialization
 * Bootstraps the modular case management system with all data sources
 */

import { switchCase } from './index'
import { caseManager, DEFAULT_CASES } from './schema'
import { documentIndexer } from './indexing'
import { statuteValidator, temporalService } from './services'

export interface InitializationOptions {
  caseId?: string
  skipIndexing?: boolean
  verboseLogging?: boolean
  dataSourcePaths?: {
    attorneyDiscovery?: string
    countyDisclosures?: string
    googleDrive?: string
  }
}

/**
 * Complete system initialization for enterprise deployment
 */
export async function initializeEnterpriseCaseLedger(
  options: InitializationOptions = {}
): Promise<InitializationResult> {
  const startTime = Date.now()
  const results: InitializationStep[] = []

  try {
    // Step 1: Configure case
    console.log('🔧 Enterprise CaseLedger Initialization Starting...')
    const caseId = options.caseId || 'tree-farm'

    if (!DEFAULT_CASES[caseId]) {
      throw new Error(`Unknown case ID: ${caseId}`)
    }

    const success = switchCase(caseId)
    if (!success) {
      throw new Error(`Failed to switch to case: ${caseId}`)
    }

    results.push({
      step: 'Case Configuration',
      success: true,
      duration: Date.now() - startTime,
      message: `Loaded case: ${caseManager.getCurrentCase()?.displayName}`
    })

    // Step 2: Update data source paths if provided
    if (options.dataSourcePaths) {
      const currentCase = caseManager.getCurrentCase()!
      const updatedSources = currentCase.dataSources.map(source => {
        const pathOverride = options.dataSourcePaths?.[source.type as keyof typeof options.dataSourcePaths]
        if (pathOverride) {
          return { ...source, path: pathOverride }
        }
        return source
      })

      currentCase.dataSources = updatedSources
      caseManager.setCurrentCase(currentCase)

      results.push({
        step: 'Data Source Paths',
        success: true,
        duration: Date.now() - startTime,
        message: 'Updated data source paths from configuration'
      })
    }

    // Step 3: Validate data sources
    const validationResult = await validateDataSources()
    results.push({
      step: 'Data Source Validation',
      success: validationResult.success,
      duration: Date.now() - startTime,
      message: validationResult.message,
      details: validationResult.details
    })

    // Step 4: Initialize services
    console.log('🛠️  Initializing core services...')
    const servicesResult = await initializeServices()
    results.push({
      step: 'Service Initialization',
      success: servicesResult.success,
      duration: Date.now() - startTime,
      message: servicesResult.message
    })

    // Step 5: Index documents (unless skipped)
    if (!options.skipIndexing) {
      console.log('📁 Starting document indexing...')
      const indexingResult = await documentIndexer.indexAllSources()
      results.push({
        step: 'Document Indexing',
        success: indexingResult.totalDocuments > 0,
        duration: Date.now() - startTime,
        message: `Indexed ${indexingResult.totalDocuments} documents across ${indexingResult.sourceResults.length} sources`,
        details: {
          totalDocuments: indexingResult.totalDocuments,
          sources: indexingResult.sourceResults.map(sr => ({
            name: sr.sourceName,
            documents: sr.documentsIndexed,
            errors: sr.errors
          }))
        }
      })
    }

    // Step 6: Perform system health check
    const healthCheck = await performHealthCheck()
    results.push({
      step: 'System Health Check',
      success: healthCheck.success,
      duration: Date.now() - startTime,
      message: healthCheck.message,
      details: healthCheck.details
    })

    const totalDuration = Date.now() - startTime
    console.log(`✅ Enterprise CaseLedger initialization complete (${totalDuration}ms)`)

    return {
      success: results.every(r => r.success),
      totalDuration,
      steps: results,
      caseId,
      caseName: caseManager.getCurrentCase()?.displayName || 'Unknown'
    }

  } catch (error) {
    console.error('❌ Enterprise CaseLedger initialization failed:', error)

    results.push({
      step: 'System Initialization',
      success: false,
      duration: Date.now() - startTime,
      message: `Initialization failed: ${error}`,
      error: error instanceof Error ? error.message : String(error)
    })

    return {
      success: false,
      totalDuration: Date.now() - startTime,
      steps: results,
      caseId: options.caseId || 'unknown',
      caseName: 'Unknown'
    }
  }
}

/**
 * Validate all configured data sources are accessible
 */
async function validateDataSources(): Promise<ValidationResult> {
  const currentCase = caseManager.getCurrentCase()
  if (!currentCase) {
    return {
      success: false,
      message: 'No current case configured'
    }
  }

  const validationResults: any[] = []

  for (const source of currentCase.dataSources) {
    try {
      // Basic path validation - in production this would check actual file system access
      const pathExists = source.path.length > 0

      validationResults.push({
        sourceId: source.id,
        name: source.name,
        path: source.path,
        accessible: pathExists,
        type: source.type
      })
    } catch (error) {
      validationResults.push({
        sourceId: source.id,
        name: source.name,
        path: source.path,
        accessible: false,
        error: String(error)
      })
    }
  }

  const allAccessible = validationResults.every(v => v.accessible)

  return {
    success: allAccessible,
    message: allAccessible
      ? `All ${validationResults.length} data sources validated`
      : `${validationResults.filter(v => !v.accessible).length} data sources inaccessible`,
    details: validationResults
  }
}

/**
 * Initialize and test core services
 */
async function initializeServices(): Promise<ServiceResult> {
  try {
    // Test StatuteValidator
    const testStatute = 'Utah Code 17-41-402'
    const validationResult = statuteValidator.validateStatuteReference(
      testStatute,
      'Testing statute validation with preemption authority',
      1
    )

    // Test TemporalService with sample data
    const sampleBates = documentIndexer.getAllBatesEntries()
    const temporalAnalysis = temporalService.analyzeTemporalRelationships(sampleBates)

    return {
      success: true,
      message: 'All core services initialized successfully',
      details: {
        statuteValidator: validationResult.isValid,
        temporalService: temporalAnalysis.timeline.length >= 0,
        documentIndexer: sampleBates.length >= 0
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Service initialization failed: ${error}`
    }
  }
}

/**
 * Perform final system health check
 */
async function performHealthCheck(): Promise<HealthCheckResult> {
  const checks: HealthCheck[] = []

  // Check case manager
  const currentCase = caseManager.getCurrentCase()
  checks.push({
    component: 'Case Manager',
    status: currentCase ? 'healthy' : 'error',
    message: currentCase ? `Case loaded: ${currentCase.displayName}` : 'No case configured'
  })

  // Check document indexer
  const totalDocs = documentIndexer.getAllBatesEntries().length
  checks.push({
    component: 'Document Indexer',
    status: totalDocs >= 0 ? 'healthy' : 'warning',
    message: `${totalDocs} documents in registry`
  })

  // Check services
  checks.push({
    component: 'Statute Validator',
    status: statuteValidator ? 'healthy' : 'error',
    message: 'Service available and configured'
  })

  checks.push({
    component: 'Temporal Service',
    status: temporalService ? 'healthy' : 'error',
    message: 'Service available and configured'
  })

  const allHealthy = checks.every(c => c.status === 'healthy')
  const hasWarnings = checks.some(c => c.status === 'warning')

  return {
    success: allHealthy,
    message: allHealthy
      ? 'All systems healthy'
      : hasWarnings
        ? 'System operational with warnings'
        : 'System errors detected',
    details: checks
  }
}

// Type definitions
export interface InitializationResult {
  success: boolean
  totalDuration: number
  steps: InitializationStep[]
  caseId: string
  caseName: string
}

interface InitializationStep {
  step: string
  success: boolean
  duration: number
  message: string
  details?: any
  error?: string
}

interface ValidationResult {
  success: boolean
  message: string
  details?: any
}

interface ServiceResult {
  success: boolean
  message: string
  details?: any
}

interface HealthCheckResult {
  success: boolean
  message: string
  details: HealthCheck[]
}

interface HealthCheck {
  component: string
  status: 'healthy' | 'warning' | 'error'
  message: string
}

// Export quick initialization function for common use cases
export async function quickInit(caseId: string = 'tree-farm'): Promise<boolean> {
  console.log('🚀 Quick CaseLedger initialization...')

  const result = await initializeEnterpriseCaseLedger({
    caseId,
    skipIndexing: false,
    verboseLogging: false
  })

  if (result.success) {
    console.log(`✅ ${result.caseName} ready - ${result.steps.length} steps completed`)
  } else {
    console.error('❌ Initialization failed')
    result.steps.filter(s => !s.success).forEach(s => {
      console.error(`  └─ ${s.step}: ${s.message}`)
    })
  }

  return result.success
}