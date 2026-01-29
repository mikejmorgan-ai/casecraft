import { describe, it, expect } from 'vitest'
import { AGENT_ROLE_TEMPLATES, buildAgentSystemPrompt, AGENT_ROLE_LABELS } from '../prompts'
import type { AgentRole } from '@/lib/types'

describe('AGENT_ROLE_TEMPLATES', () => {
  const roles: AgentRole[] = [
    'judge',
    'plaintiff_attorney',
    'defense_attorney',
    'court_clerk',
    'witness',
    'expert_witness',
    'mediator',
    'law_clerk',
    'county_recorder',
    'dogm_agent',
  ]

  it('should have templates for all 10 agent roles', () => {
    expect(Object.keys(AGENT_ROLE_TEMPLATES)).toHaveLength(10)
    roles.forEach(role => {
      expect(AGENT_ROLE_TEMPLATES[role]).toBeDefined()
    })
  })

  it('should have required properties for each template', () => {
    roles.forEach(role => {
      const template = AGENT_ROLE_TEMPLATES[role]
      expect(template.defaultName).toBeTruthy()
      expect(template.defaultPrompt).toBeTruthy()
      expect(typeof template.defaultTemperature).toBe('number')
      expect(template.defaultTemperature).toBeGreaterThanOrEqual(0)
      expect(template.defaultTemperature).toBeLessThanOrEqual(1)
      expect(template.icon).toBeTruthy()
    })
  })

  it('should have appropriate temperatures for different roles', () => {
    // Research-focused roles should have lower temperature
    expect(AGENT_ROLE_TEMPLATES.law_clerk.defaultTemperature).toBeLessThanOrEqual(0.4)
    expect(AGENT_ROLE_TEMPLATES.county_recorder.defaultTemperature).toBeLessThanOrEqual(0.4)
    expect(AGENT_ROLE_TEMPLATES.court_clerk.defaultTemperature).toBeLessThanOrEqual(0.5)

    // Advocacy roles should have higher temperature
    expect(AGENT_ROLE_TEMPLATES.plaintiff_attorney.defaultTemperature).toBeGreaterThanOrEqual(0.6)
    expect(AGENT_ROLE_TEMPLATES.defense_attorney.defaultTemperature).toBeGreaterThanOrEqual(0.6)
  })
})

describe('buildAgentSystemPrompt', () => {
  const mockAgent = {
    role: 'judge' as AgentRole,
    name: 'Judge Smith',
    persona_prompt: 'You are a fair and impartial judge.',
  }

  const mockCaseContext = {
    name: 'Test Case v. Example',
    case_type: 'civil',
    summary: 'A test case for unit testing.',
    plaintiff_name: 'Test Plaintiff',
    defendant_name: 'Test Defendant',
  }

  it('should include the agent persona prompt', () => {
    const result = buildAgentSystemPrompt(mockAgent, mockCaseContext, [])
    expect(result).toContain('You are a fair and impartial judge.')
  })

  it('should include case context', () => {
    const result = buildAgentSystemPrompt(mockAgent, mockCaseContext, [])
    expect(result).toContain('Test Case v. Example')
    expect(result).toContain('civil')
  })

  it('should include party names when provided', () => {
    const result = buildAgentSystemPrompt(mockAgent, mockCaseContext, [])
    expect(result).toContain('Test Plaintiff v. Test Defendant')
  })

  it('should handle missing party names', () => {
    const contextWithoutParties = {
      ...mockCaseContext,
      name: 'Test Case',
      plaintiff_name: null,
      defendant_name: null,
    }
    const result = buildAgentSystemPrompt(mockAgent, contextWithoutParties, [])
    // Should not have the "Parties:" line
    expect(result).not.toContain('Parties:')
  })

  it('should include established facts when provided', () => {
    const facts = ['Fact one is true', 'Fact two is also true']
    const result = buildAgentSystemPrompt(mockAgent, mockCaseContext, facts)
    expect(result).toContain('ESTABLISHED FACTS')
    expect(result).toContain('1. Fact one is true')
    expect(result).toContain('2. Fact two is also true')
  })

  it('should indicate when no facts are established', () => {
    const result = buildAgentSystemPrompt(mockAgent, mockCaseContext, [])
    expect(result).toContain('No facts have been established yet')
  })

  it('should include document context when provided', () => {
    const documentContext = 'Document excerpt: This is relevant evidence...'
    const result = buildAgentSystemPrompt(mockAgent, mockCaseContext, [], documentContext)
    expect(result).toContain('RELEVANT DOCUMENT EXCERPTS')
    expect(result).toContain('This is relevant evidence')
  })

  it('should not include document section when no documents provided', () => {
    const result = buildAgentSystemPrompt(mockAgent, mockCaseContext, [])
    expect(result).not.toContain('RELEVANT DOCUMENT EXCERPTS')
  })

  it('should include agent name in character instruction', () => {
    const result = buildAgentSystemPrompt(mockAgent, mockCaseContext, [])
    expect(result).toContain('You are Judge Smith')
  })

  it('should handle missing summary', () => {
    const contextWithoutSummary = {
      ...mockCaseContext,
      summary: null,
    }
    const result = buildAgentSystemPrompt(mockAgent, contextWithoutSummary, [])
    expect(result).toContain('No summary provided')
  })
})

describe('AGENT_ROLE_LABELS', () => {
  it('should have labels for all 10 agent roles', () => {
    expect(Object.keys(AGENT_ROLE_LABELS)).toHaveLength(10)
  })

  it('should have human-readable labels', () => {
    expect(AGENT_ROLE_LABELS.judge).toBe('Judge')
    expect(AGENT_ROLE_LABELS.plaintiff_attorney).toBe('Plaintiff Attorney')
    expect(AGENT_ROLE_LABELS.defense_attorney).toBe('Defense Attorney')
    expect(AGENT_ROLE_LABELS.expert_witness).toBe('Expert Witness')
  })

  it('should match roles with templates', () => {
    Object.keys(AGENT_ROLE_TEMPLATES).forEach(role => {
      expect(AGENT_ROLE_LABELS[role as AgentRole]).toBeDefined()
    })
  })
})
