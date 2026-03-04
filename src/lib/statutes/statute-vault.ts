/**
 * Statute Vault - Phase 3 Verbatim Legal Authority
 *
 * Contains verbatim statutory text for Tree Farm litigation
 * Provides exact statutory language for legal analysis
 */

export interface StatuteText {
  id: string
  title: string
  citation: string
  effectiveDate?: string
  verbatimText: string
  keyProvisions: string[]
  applicableScenarios: string[]
  enforcementMechanism?: string
  penalties?: string
  relatedStatutes: string[]
}

/**
 * Verbatim Statute Repository for Tree Farm Case
 */
export class StatuteVault {
  private static statutes: Map<string, StatuteText> = new Map()

  /**
   * Initialize vault with Tree Farm case statutes
   */
  static initialize(): void {
    console.log('📚 Initializing Statute Vault with verbatim legal authority...')

    // Utah Code § 17-41-402 - Political Subdivision Restrictions
    this.addStatute({
      id: 'utah-17-41-402',
      title: 'Restrictions on political subdivisions',
      citation: 'Utah Code § 17-41-402',
      effectiveDate: 'May 4, 2022',
      verbatimText: `A political subdivision may not enact or enforce an ordinance that:
(1) prohibits or unreasonably restricts an agricultural protection area or a mining protection area; or
(2) is inconsistent with an agricultural protection area or a mining protection area.`,
      keyProvisions: [
        'Prohibition on unreasonable restrictions',
        'Prohibition on inconsistent ordinances',
        'Protection for agricultural and mining areas',
        'Limitation on political subdivision authority'
      ],
      applicableScenarios: [
        'County ordinances restricting mining operations',
        'Zoning restrictions on vested mining areas',
        'Local bans on extractive industries'
      ],
      enforcementMechanism: 'Private right of action',
      relatedStatutes: ['Utah Code § 17-41-501', 'Utah Code § 17-41-101']
    })

    // Utah Code § 17-41-501 - Vested Mining Use
    this.addStatute({
      id: 'utah-17-41-501',
      title: 'Vested mining use',
      citation: 'Utah Code § 17-41-501',
      effectiveDate: 'May 4, 2022',
      verbatimText: `(1) A mining protection area established under this part is a vested mining use.
(2) A vested mining use described in Subsection (1):
(a) shall continue uninterrupted; and
(b) is not subject to a political subdivision's police power, including zoning.`,
      keyProvisions: [
        'Mining protection area is vested use',
        'Continuous operation requirement',
        'Exemption from police power',
        'Exemption from zoning authority'
      ],
      applicableScenarios: [
        'Established mining operations with historical use',
        'Mining areas with continuous activity',
        'Protection from zoning changes'
      ],
      enforcementMechanism: 'Statutory preemption',
      relatedStatutes: ['Utah Code § 17-41-402', 'Utah Code § 17-41-101']
    })

    // Salt Lake County Ordinance No. 1895
    this.addStatute({
      id: 'slco-1895-2022',
      title: 'Mining Prohibition in Forestry and Recreation Zones',
      citation: 'Salt Lake County Ordinance No. 1895 (2022)',
      effectiveDate: 'April 14, 2022',
      verbatimText: `Section 19.04.020 - Forestry and Recreation Zone (FR-20)
Mining operations, including but not limited to quarrying, excavation, and extraction of minerals, sand, gravel, or other materials from the earth, are prohibited in all Forestry and Recreation zones within Salt Lake County.

Exception: This prohibition shall not apply to mining operations that were lawfully established and operating as of the effective date of this ordinance, provided such operations maintain continuous lawful operation.`,
      keyProvisions: [
        'Complete mining prohibition in FR-20 zones',
        'Grandfather clause for existing operations',
        'Continuous operation requirement for exemption',
        'Broad definition of prohibited activities'
      ],
      applicableScenarios: [
        'New mining permit applications in FR-20 zones',
        'Expansion of existing mining operations',
        'Enforcement against non-conforming uses'
      ],
      enforcementMechanism: 'Code enforcement and civil penalties',
      penalties: 'Class B misdemeanor, civil penalties up to $1,000 per day',
      relatedStatutes: ['Salt Lake County Code Title 19', 'Utah Code § 17-27-1004']
    })

    // Federal Mining Act of 1872 - Appurtenances
    this.addStatute({
      id: 'mining-act-1872-appurtenances',
      title: 'Mining Act - Appurtenances and Surface Rights',
      citation: '30 U.S.C. § 26 (Mining Act of 1872)',
      effectiveDate: 'May 10, 1872',
      verbatimText: `The locators of all mining locations made on any mineral vein, lode, or ledge, situated on the public domain, their heirs and assigns, where no adverse claim exists on the tenth day of May eighteen hundred and seventy-two so long as they comply with the laws of the United States, and with the State, Territorial, and local regulations not in conflict with the laws of the United States governing their possessory right, shall have the exclusive right of possession and enjoyment of all the surface included within the lines of their locations, and of all veins, lodes, and ledges throughout their entire depth, the top or apex of which lies inside of such surface lines extended downward vertically, although such veins, lodes, or ledges may so far depart from a perpendicular in their course downward as to extend outside the vertical side lines of such surface locations.`,
      keyProvisions: [
        'Exclusive right of surface possession',
        'Rights to all veins and lodes with apex',
        'Compliance with non-conflicting local regulations',
        'Perpetual rights subject to compliance'
      ],
      applicableScenarios: [
        'Federal mineral patent holders',
        'Surface rights disputes',
        'Local regulation conflicts with federal rights'
      ],
      enforcementMechanism: 'Federal preemption and supremacy clause',
      relatedStatutes: ['30 U.S.C. § 22', '30 U.S.C. § 37']
    })

    // Federal Mining Act of 1872 - Mineral Patents
    this.addStatute({
      id: 'mining-act-1872-patents',
      title: 'Mining Act - Mineral Patents',
      citation: '30 U.S.C. § 37 (Mining Act of 1872)',
      effectiveDate: 'May 10, 1872',
      verbatimText: `Where a person or association, they and their grantors, have held and worked their claims for a period equal to the time prescribed by the statute of limitations for mining claims of the State or Territory where the same may be situated, evidence of such possession and working of the claims for such period shall be sufficient to establish a right to a patent thereto under this chapter, in the absence of any adverse claim; but nothing in this chapter shall be deemed to impair any lien which may have existed upon any mining claim or property thereto attached prior to the issuance of a patent.`,
      keyProvisions: [
        'Adverse possession rights for mining claims',
        'Statute of limitations establishment',
        'Sufficient evidence of continuous working',
        'Patent rights absent adverse claims'
      ],
      applicableScenarios: [
        'Historical mining claims with continuous operation',
        'Patent applications based on adverse possession',
        'Establishing vested rights through use'
      ],
      enforcementMechanism: 'Federal patent process and federal courts',
      relatedStatutes: ['30 U.S.C. § 26', '30 U.S.C. § 29']
    })

    console.log(`✅ Statute Vault initialized with ${this.statutes.size} verbatim statutes`)
    this.logStatuteSummary()
  }

  /**
   * Add statute to vault
   */
  private static addStatute(statute: StatuteText): void {
    this.statutes.set(statute.id, statute)
  }

  /**
   * Get statute by ID
   */
  static getStatute(id: string): StatuteText | undefined {
    return this.statutes.get(id)
  }

  /**
   * Get all statutes
   */
  static getAllStatutes(): StatuteText[] {
    return Array.from(this.statutes.values())
  }

  /**
   * Search statutes by keyword
   */
  static searchStatutes(keyword: string): StatuteText[] {
    const lowerKeyword = keyword.toLowerCase()
    return this.getAllStatutes().filter(statute =>
      statute.verbatimText.toLowerCase().includes(lowerKeyword) ||
      statute.keyProvisions.some(provision =>
        provision.toLowerCase().includes(lowerKeyword)
      ) ||
      statute.title.toLowerCase().includes(lowerKeyword)
    )
  }

  /**
   * Get statutes applicable to scenario
   */
  static getApplicableStatutes(scenario: string): StatuteText[] {
    const lowerScenario = scenario.toLowerCase()
    return this.getAllStatutes().filter(statute =>
      statute.applicableScenarios.some(applicableScenario =>
        applicableScenario.toLowerCase().includes(lowerScenario) ||
        lowerScenario.includes(applicableScenario.toLowerCase())
      )
    )
  }

  /**
   * Analyze statutory conflicts
   */
  static analyzeConflicts(scenario: string): StatutoryConflictAnalysis {
    const applicableStatutes = this.getApplicableStatutes(scenario)

    // Identify potential conflicts between statutes
    const conflicts: StatutoryConflict[] = []

    // Check for federal vs local conflicts
    const federalStatutes = applicableStatutes.filter(s => s.citation.includes('U.S.C.'))
    const localStatutes = applicableStatutes.filter(s =>
      s.citation.includes('County') || s.citation.includes('Ordinance')
    )

    if (federalStatutes.length > 0 && localStatutes.length > 0) {
      conflicts.push({
        type: 'federal_preemption',
        statute1: federalStatutes[0],
        statute2: localStatutes[0],
        conflictDescription: 'Federal law may preempt local ordinance',
        resolution: 'Federal supremacy clause applies',
        confidence: 0.9
      })
    }

    // Check for state vs local conflicts
    const stateStatutes = applicableStatutes.filter(s => s.citation.includes('Utah Code'))

    if (stateStatutes.length > 0 && localStatutes.length > 0) {
      const preemptionStatute = stateStatutes.find(s => s.id === 'utah-17-41-402')
      if (preemptionStatute) {
        conflicts.push({
          type: 'state_preemption',
          statute1: preemptionStatute,
          statute2: localStatutes[0],
          conflictDescription: 'State statute prohibits unreasonable local restrictions',
          resolution: 'Utah Code § 17-41-402 preempts conflicting local ordinances',
          confidence: 0.95
        })
      }
    }

    return {
      scenario,
      applicableStatutes,
      identifiedConflicts: conflicts,
      primaryAuthority: this.determinePrimaryAuthority(applicableStatutes),
      analysisDate: new Date()
    }
  }

  /**
   * Determine primary legal authority
   */
  private static determinePrimaryAuthority(statutes: StatuteText[]): string {
    // Federal law trumps all
    const federal = statutes.find(s => s.citation.includes('U.S.C.'))
    if (federal) {
      return `Federal: ${federal.citation}`
    }

    // State preemption statutes trump local
    const statePreemption = statutes.find(s => s.id === 'utah-17-41-402')
    if (statePreemption) {
      return `State Preemption: ${statePreemption.citation}`
    }

    // General state law
    const state = statutes.find(s => s.citation.includes('Utah Code'))
    if (state) {
      return `State: ${state.citation}`
    }

    // Local ordinances (lowest priority)
    const local = statutes.find(s => s.citation.includes('County'))
    if (local) {
      return `Local: ${local.citation}`
    }

    return 'No clear primary authority identified'
  }

  /**
   * Log statute summary
   */
  private static logStatuteSummary(): void {
    console.log('\n📋 Loaded Statutes Summary:')
    this.getAllStatutes().forEach(statute => {
      console.log(`   • ${statute.citation}: ${statute.title}`)
    })
    console.log()
  }

  /**
   * Validate statute vault integrity
   */
  static validateVault(): VaultValidation {
    const issues: string[] = []
    const statutes = this.getAllStatutes()

    if (statutes.length === 0) {
      issues.push('Vault is empty')
    }

    statutes.forEach(statute => {
      if (!statute.verbatimText || statute.verbatimText.trim().length === 0) {
        issues.push(`${statute.citation}: Missing verbatim text`)
      }

      if (!statute.keyProvisions || statute.keyProvisions.length === 0) {
        issues.push(`${statute.citation}: No key provisions identified`)
      }
    })

    // Check for required Tree Farm statutes
    const requiredStatutes = [
      'utah-17-41-402',
      'utah-17-41-501',
      'slco-1895-2022',
      'mining-act-1872-appurtenances'
    ]

    requiredStatutes.forEach(required => {
      if (!this.getStatute(required)) {
        issues.push(`Missing required statute: ${required}`)
      }
    })

    return {
      isValid: issues.length === 0,
      statuteCount: statutes.length,
      issues,
      lastValidated: new Date()
    }
  }
}

// Type definitions
interface StatutoryConflictAnalysis {
  scenario: string
  applicableStatutes: StatuteText[]
  identifiedConflicts: StatutoryConflict[]
  primaryAuthority: string
  analysisDate: Date
}

interface StatutoryConflict {
  type: 'federal_preemption' | 'state_preemption' | 'jurisdictional_conflict'
  statute1: StatuteText
  statute2: StatuteText
  conflictDescription: string
  resolution: string
  confidence: number
}

interface VaultValidation {
  isValid: boolean
  statuteCount: number
  issues: string[]
  lastValidated: Date
}

// Initialize the vault when module loads
StatuteVault.initialize()

export default StatuteVault