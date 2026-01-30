import { z } from 'zod'

// Agent role enum for validation
const agentRoles = [
  'judge', 'plaintiff_attorney', 'defense_attorney',
  'court_clerk', 'witness', 'expert_witness', 'mediator',
  'law_clerk', 'county_recorder', 'dogm_agent'
] as const

export const createAgentSchema = z.object({
  role: z.enum(agentRoles, 'Please select a valid agent role'),

  name: z
    .string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name cannot exceed 100 characters')
    .trim(),

  persona_prompt: z
    .string()
    .min(10, 'Persona instructions must be at least 10 characters')
    .max(5000, 'Persona instructions cannot exceed 5000 characters')
    .trim(),

  temperature: z
    .number()
    .min(0, 'Temperature must be at least 0')
    .max(1, 'Temperature cannot exceed 1')
    .default(0.7),

  is_active: z
    .boolean()
    .default(true),
})

export const updateAgentSchema = z.object({
  name: z
    .string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name cannot exceed 100 characters')
    .trim(),

  persona_prompt: z
    .string()
    .min(10, 'Persona instructions must be at least 10 characters')
    .max(5000, 'Persona instructions cannot exceed 5000 characters')
    .trim(),

  temperature: z
    .number()
    .min(0, 'Temperature must be at least 0')
    .max(1, 'Temperature cannot exceed 1'),

  is_active: z
    .boolean()
    .optional(),
})

// TypeScript types inferred from schemas
export type CreateAgentInput = z.infer<typeof createAgentSchema>
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>

// Field-level validation for real-time feedback
export const agentFieldValidators = {
  name: z
    .string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name cannot exceed 100 characters'),

  persona_prompt: z
    .string()
    .min(10, 'Persona instructions must be at least 10 characters')
    .max(5000, 'Persona instructions cannot exceed 5000 characters'),

  temperature: z
    .number()
    .min(0, 'Temperature must be at least 0')
    .max(1, 'Temperature cannot exceed 1'),
}
