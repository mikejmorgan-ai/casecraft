/**
 * CaseCraft Agent Factory
 *
 * Creates and configures agents for a case by injecting case-specific context
 * into persona templates. Provides default agent configurations based on case type.
 */

import type { AgentRole, CaseType } from '@/lib/types'
import { AGENT_PERSONAS, getPersona, type AgentPersona } from './persona-library'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CaseContext {
  /** Case name / title */
  name: string
  /** Case type (civil, property, criminal, etc.) */
  caseType: CaseType
  /** Case number (if assigned) */
  caseNumber?: string | null
  /** Jurisdiction */
  jurisdiction?: string | null
  /** Case summary */
  summary?: string | null
  /** Plaintiff name(s) */
  plaintiffName?: string | null
  /** Defendant name(s) */
  defendantName?: string | null
  /** Key established facts */
  facts?: string[]
  /** Active claims for relief */
  claims?: Array<{ title: string; description: string; reliefType: string }>
  /** Key document names for reference */
  documentNames?: string[]
  /** Filed date */
  filedDate?: string | null
}

export interface AgentConfig {
  /** Agent role */
  role: AgentRole
  /** Display name */
  name: string
  /** Full system prompt (persona + case context injected) */
  personaPrompt: string
  /** Recommended temperature */
  temperature: number
  /** Whether the agent should be active by default */
  isActive: boolean
  /** Avatar path */
  avatarUrl: string
  /** Suggested model */
  model: string
}

export interface DefaultAgentSet {
  /** Description of this agent configuration */
  description: string
  /** The agents to create for this case type */
  agents: AgentConfig[]
}

// ---------------------------------------------------------------------------
// Case Context Injection
// ---------------------------------------------------------------------------

/**
 * Builds the case context block that is appended to every agent's system prompt.
 * This gives the agent awareness of the specific case they are working on.
 */
function buildCaseContextBlock(caseContext: CaseContext): string {
  const sections: string[] = []

  // Header
  sections.push('CASE CONTEXT:')
  sections.push(`Case: ${caseContext.name}`)
  sections.push(`Type: ${caseContext.caseType}`)

  if (caseContext.caseNumber) {
    sections.push(`Case Number: ${caseContext.caseNumber}`)
  }

  if (caseContext.jurisdiction) {
    sections.push(`Jurisdiction: ${caseContext.jurisdiction}`)
  }

  if (caseContext.filedDate) {
    sections.push(`Filed: ${caseContext.filedDate}`)
  }

  // Parties
  if (caseContext.plaintiffName || caseContext.defendantName) {
    const parties: string[] = []
    if (caseContext.plaintiffName) parties.push(`Plaintiff: ${caseContext.plaintiffName}`)
    if (caseContext.defendantName) parties.push(`Defendant: ${caseContext.defendantName}`)
    sections.push(parties.join(' | '))
  }

  // Summary
  if (caseContext.summary) {
    sections.push(`\nCASE SUMMARY:\n${caseContext.summary}`)
  }

  // Established facts
  if (caseContext.facts && caseContext.facts.length > 0) {
    sections.push('\nESTABLISHED FACTS:')
    caseContext.facts.forEach((fact, i) => {
      sections.push(`${i + 1}. ${fact}`)
    })
  }

  // Claims for relief
  if (caseContext.claims && caseContext.claims.length > 0) {
    sections.push('\nCLAIMS FOR RELIEF:')
    caseContext.claims.forEach((claim, i) => {
      sections.push(`${i + 1}. ${claim.title} (${claim.reliefType}): ${claim.description}`)
    })
  }

  // Available documents
  if (caseContext.documentNames && caseContext.documentNames.length > 0) {
    sections.push('\nCASE DOCUMENTS ON FILE:')
    caseContext.documentNames.forEach((name) => {
      sections.push(`- ${name}`)
    })
  }

  return sections.join('\n')
}

/**
 * Builds role-specific context instructions based on the agent's role
 * relative to the parties in the case.
 */
function buildRoleContextInstructions(role: AgentRole, caseContext: CaseContext): string {
  const plaintiff = caseContext.plaintiffName || 'the plaintiff'
  const defendant = caseContext.defendantName || 'the defendant'

  switch (role) {
    case 'judge':
      return `\nYou are presiding over ${caseContext.name}. The parties are ${plaintiff} (plaintiff) and ${defendant} (defendant). Maintain strict impartiality between these parties. Address them by their legal designations or proper names.`

    case 'plaintiff_attorney':
      return `\nYou represent ${plaintiff} in this matter. Your client's interests are your paramount concern. When referring to the opposing party, use "${defendant}" or "the defendant." Build every argument to advance ${plaintiff}'s position.`

    case 'defense_attorney':
      return `\nYou represent ${defendant} in this matter. Your client's interests are your paramount concern. When referring to the opposing party, use "${plaintiff}" or "the plaintiff." Challenge every element of ${plaintiff}'s case.`

    case 'expert_witness':
      return `\nYou have been retained to provide expert analysis in ${caseContext.name}. Your testimony must be objective regardless of which party retained you. Base all opinions on your professional methodology and the available data.`

    case 'mediator':
      return `\nYou are mediating the dispute between ${plaintiff} and ${defendant} in ${caseContext.name}. Both parties deserve equal attention and respect. Your goal is to help them find a mutually acceptable resolution.`

    case 'law_clerk':
      return `\nYou are conducting legal research and analysis for the judge presiding over ${caseContext.name}. Your analysis must be objective, presenting the strongest arguments for both ${plaintiff} and ${defendant} before reaching a recommendation.`

    case 'court_clerk':
      return `\nYou are managing the administrative and procedural aspects of ${caseContext.name}. Track all filings, deadlines, and proceedings. Treat all parties -- ${plaintiff} and ${defendant} -- with equal courtesy and assistance.`

    case 'witness':
      return `\nYou have been called to testify in ${caseContext.name}. Provide truthful testimony based only on your personal knowledge of events. You may be examined by counsel for both ${plaintiff} and ${defendant}.`

    case 'county_recorder':
      return `\nYou are providing records relevant to ${caseContext.name}. Report only what appears in the official recorded records. Do not interpret the legal significance of any instrument.`

    case 'dogm_agent':
      return `\nYou are providing DOGM regulatory records relevant to ${caseContext.name}. Report only what appears in the official DOGM permit and production records. Do not make legal determinations.`

    default:
      return ''
  }
}

// ---------------------------------------------------------------------------
// Agent Prompt Creation
// ---------------------------------------------------------------------------

/**
 * Creates a fully configured system prompt for an agent by combining the
 * persona template with case-specific context.
 *
 * @param role - The agent's legal role
 * @param caseContext - The case-specific context to inject
 * @param customSystemPrompt - Optional custom system prompt to use instead of the library default
 * @returns The complete system prompt ready for use with the LLM
 */
export function createAgentPrompt(
  role: AgentRole,
  caseContext: CaseContext,
  customSystemPrompt?: string
): string {
  const persona = getPersona(role)
  const basePrompt = customSystemPrompt || persona.systemPrompt

  const caseContextBlock = buildCaseContextBlock(caseContext)
  const roleInstructions = buildRoleContextInstructions(role, caseContext)

  return `${basePrompt}
${roleInstructions}

${caseContextBlock}

Stay in character throughout the conversation. When citing case documents, reference them specifically by name. Provide thoughtful, legally sound responses appropriate to your role as ${persona.roleLabel}.`
}

/**
 * Creates an AgentConfig from a persona with case context injected.
 */
export function createAgentConfig(
  role: AgentRole,
  caseContext: CaseContext,
  overrides?: Partial<Pick<AgentConfig, 'name' | 'temperature' | 'isActive' | 'model'>>
): AgentConfig {
  const persona = getPersona(role)
  const name = overrides?.name || generateDefaultName(role, caseContext)

  return {
    role,
    name,
    personaPrompt: createAgentPrompt(role, caseContext),
    temperature: overrides?.temperature ?? persona.temperature,
    isActive: overrides?.isActive ?? true,
    avatarUrl: persona.avatar,
    model: overrides?.model || persona.suggestedModel,
  }
}

// ---------------------------------------------------------------------------
// Default Agent Sets by Case Type
// ---------------------------------------------------------------------------

/**
 * Generates a contextual default name for an agent based on role and case context.
 */
function generateDefaultName(role: AgentRole, caseContext: CaseContext): string {
  const persona = getPersona(role)

  switch (role) {
    case 'judge':
      return 'Hon. Presiding Judge'
    case 'plaintiff_attorney':
      return caseContext.plaintiffName
        ? `Counsel for ${caseContext.plaintiffName}`
        : "Plaintiff's Counsel"
    case 'defense_attorney':
      return caseContext.defendantName
        ? `Counsel for ${caseContext.defendantName}`
        : 'Defense Counsel'
    case 'mediator':
      return 'Mediator'
    case 'law_clerk':
      return "Judge's Law Clerk"
    case 'court_clerk':
      return 'Clerk of Court'
    case 'witness':
      return 'Fact Witness'
    case 'expert_witness':
      return 'Expert Witness'
    case 'county_recorder':
      return 'County Recorder'
    case 'dogm_agent':
      return 'DOGM Regulatory Agent'
    default:
      return persona.name
  }
}

/**
 * Returns the recommended set of default agents for a given case type.
 * Each case type has a tailored agent configuration suited to that type of litigation.
 *
 * @param caseType - The type of case
 * @param caseContext - Case-specific context for prompt injection
 * @returns A DefaultAgentSet with description and configured agents
 */
export function getDefaultAgents(
  caseType: CaseType,
  caseContext: CaseContext
): DefaultAgentSet {
  switch (caseType) {
    // ----------------------------------------------------------------
    // Property Disputes
    // ----------------------------------------------------------------
    case 'property':
      return {
        description:
          'Property dispute configuration with judge, both counsel, property appraiser expert, and mediator for settlement exploration.',
        agents: [
          createAgentConfig('judge', caseContext),
          createAgentConfig('plaintiff_attorney', caseContext),
          createAgentConfig('defense_attorney', caseContext),
          createAgentConfig('expert_witness', caseContext, {
            name: 'Property Appraiser / Land Use Expert',
          }),
          createAgentConfig('mediator', caseContext),
          createAgentConfig('law_clerk', caseContext),
          createAgentConfig('county_recorder', caseContext),
        ],
      }

    // ----------------------------------------------------------------
    // Civil Litigation (General)
    // ----------------------------------------------------------------
    case 'civil':
      return {
        description:
          'Standard civil litigation configuration with judge, both counsel, law clerk for research, and optional mediator.',
        agents: [
          createAgentConfig('judge', caseContext),
          createAgentConfig('plaintiff_attorney', caseContext),
          createAgentConfig('defense_attorney', caseContext),
          createAgentConfig('law_clerk', caseContext),
          createAgentConfig('court_clerk', caseContext),
          createAgentConfig('mediator', caseContext, { isActive: false }),
        ],
      }

    // ----------------------------------------------------------------
    // Criminal Cases
    // ----------------------------------------------------------------
    case 'criminal':
      return {
        description:
          'Criminal case configuration with judge, prosecutor (as plaintiff attorney), defense counsel, fact witness, and court clerk.',
        agents: [
          createAgentConfig('judge', caseContext),
          createAgentConfig('plaintiff_attorney', caseContext, {
            name: 'Prosecuting Attorney',
          }),
          createAgentConfig('defense_attorney', caseContext),
          createAgentConfig('witness', caseContext),
          createAgentConfig('court_clerk', caseContext),
          createAgentConfig('expert_witness', caseContext, {
            name: 'Forensic Expert',
            isActive: false,
          }),
        ],
      }

    // ----------------------------------------------------------------
    // Contract Disputes
    // ----------------------------------------------------------------
    case 'contract':
      return {
        description:
          'Contract dispute configuration with judge, both counsel, law clerk, and mediator for potential settlement.',
        agents: [
          createAgentConfig('judge', caseContext),
          createAgentConfig('plaintiff_attorney', caseContext),
          createAgentConfig('defense_attorney', caseContext),
          createAgentConfig('law_clerk', caseContext),
          createAgentConfig('mediator', caseContext),
        ],
      }

    // ----------------------------------------------------------------
    // Tort / Personal Injury
    // ----------------------------------------------------------------
    case 'tort':
      return {
        description:
          'Tort case configuration with judge, both counsel, medical/technical expert, fact witnesses, and mediator.',
        agents: [
          createAgentConfig('judge', caseContext),
          createAgentConfig('plaintiff_attorney', caseContext),
          createAgentConfig('defense_attorney', caseContext),
          createAgentConfig('expert_witness', caseContext, {
            name: 'Medical / Technical Expert',
          }),
          createAgentConfig('witness', caseContext),
          createAgentConfig('mediator', caseContext),
        ],
      }

    // ----------------------------------------------------------------
    // Family Law
    // ----------------------------------------------------------------
    case 'family':
      return {
        description:
          'Family law configuration with judge, both counsel, mediator (often court-ordered), and court clerk for compliance tracking.',
        agents: [
          createAgentConfig('judge', caseContext),
          createAgentConfig('plaintiff_attorney', caseContext, {
            name: 'Petitioner\'s Counsel',
          }),
          createAgentConfig('defense_attorney', caseContext, {
            name: 'Respondent\'s Counsel',
          }),
          createAgentConfig('mediator', caseContext),
          createAgentConfig('court_clerk', caseContext),
          createAgentConfig('expert_witness', caseContext, {
            name: 'Custody Evaluator / Financial Expert',
            isActive: false,
          }),
        ],
      }

    // ----------------------------------------------------------------
    // Constitutional Law
    // ----------------------------------------------------------------
    case 'constitutional':
      return {
        description:
          'Constitutional law configuration with judge, both counsel, law clerk for in-depth constitutional research, and amicus perspective.',
        agents: [
          createAgentConfig('judge', caseContext),
          createAgentConfig('plaintiff_attorney', caseContext),
          createAgentConfig('defense_attorney', caseContext),
          createAgentConfig('law_clerk', caseContext),
          createAgentConfig('expert_witness', caseContext, {
            name: 'Constitutional Law Scholar',
            isActive: false,
          }),
        ],
      }

    // ----------------------------------------------------------------
    // Administrative Law
    // ----------------------------------------------------------------
    case 'administrative':
      return {
        description:
          'Administrative law configuration with judge, both counsel, regulatory expert, law clerk, and agency representative.',
        agents: [
          createAgentConfig('judge', caseContext),
          createAgentConfig('plaintiff_attorney', caseContext),
          createAgentConfig('defense_attorney', caseContext, {
            name: 'Government Counsel',
          }),
          createAgentConfig('law_clerk', caseContext),
          createAgentConfig('expert_witness', caseContext, {
            name: 'Regulatory Expert',
          }),
          createAgentConfig('dogm_agent', caseContext),
        ],
      }

    // ----------------------------------------------------------------
    // Default fallback
    // ----------------------------------------------------------------
    default:
      return {
        description:
          'Standard litigation configuration with judge, both counsel, and law clerk.',
        agents: [
          createAgentConfig('judge', caseContext),
          createAgentConfig('plaintiff_attorney', caseContext),
          createAgentConfig('defense_attorney', caseContext),
          createAgentConfig('law_clerk', caseContext),
        ],
      }
  }
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

/**
 * Returns the list of available agent roles with their labels and descriptions.
 * Useful for populating role selection dropdowns in the UI.
 */
export function getAvailableRoles(): Array<{
  role: AgentRole
  label: string
  description: string
  tags: string[]
}> {
  return (Object.entries(AGENT_PERSONAS) as Array<[AgentRole, AgentPersona]>).map(
    ([role, persona]) => ({
      role,
      label: persona.roleLabel,
      description: persona.description,
      tags: persona.tags,
    })
  )
}

/**
 * Validates that an agent configuration has all required fields
 * and that the system prompt is substantive enough for the role.
 */
export function validateAgentConfig(config: Partial<AgentConfig>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!config.role) {
    errors.push('Agent role is required')
  }

  if (!config.name || config.name.trim().length === 0) {
    errors.push('Agent name is required')
  }

  if (!config.personaPrompt || config.personaPrompt.trim().length < 50) {
    errors.push('Agent persona prompt must be at least 50 characters for meaningful role-playing')
  }

  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2')
  }

  // Warn if temperature seems inappropriate for the role
  if (config.role && config.temperature !== undefined) {
    const persona = getPersona(config.role)
    const diff = Math.abs(config.temperature - persona.temperature)
    if (diff > 0.5) {
      errors.push(
        `Warning: temperature ${config.temperature} is significantly different from the recommended ${persona.temperature} for ${persona.roleLabel}. High temperatures may produce less reliable outputs for judicial and analytical roles.`
      )
    }
  }

  return {
    valid: errors.filter((e) => !e.startsWith('Warning:')).length === 0,
    errors,
  }
}

/**
 * Extracts a CaseContext from a raw case database record and its relations.
 * Useful for converting Supabase query results into the CaseContext shape.
 */
export function extractCaseContext(caseData: {
  name: string
  case_type: string
  case_number?: string | null
  jurisdiction?: string | null
  summary?: string | null
  plaintiff_name?: string | null
  defendant_name?: string | null
  filed_date?: string | null
  case_facts?: Array<{ fact_text: string; is_disputed: boolean }>
  claims_for_relief?: Array<{ title: string; description: string; relief_type: string }>
  documents?: Array<{ name: string }>
}): CaseContext {
  return {
    name: caseData.name,
    caseType: caseData.case_type as CaseType,
    caseNumber: caseData.case_number,
    jurisdiction: caseData.jurisdiction,
    summary: caseData.summary,
    plaintiffName: caseData.plaintiff_name,
    defendantName: caseData.defendant_name,
    filedDate: caseData.filed_date,
    facts: caseData.case_facts
      ?.filter((f) => !f.is_disputed)
      .map((f) => f.fact_text),
    claims: caseData.claims_for_relief?.map((c) => ({
      title: c.title,
      description: c.description,
      reliefType: c.relief_type,
    })),
    documentNames: caseData.documents?.map((d) => d.name),
  }
}
