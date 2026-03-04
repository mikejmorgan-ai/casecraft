import { z } from 'zod'

// ============================================================
// Discovery Config Schemas
// ============================================================

export const jurisdictionTypes = ['federal', 'utah', 'other'] as const
export const utahTiers = [1, 2, 3] as const

export const createDiscoveryConfigSchema = z.object({
  jurisdiction_type: z.enum(jurisdictionTypes).default('federal'),
  utah_tier: z.number().int().min(1).max(3).optional().nullable(),
  utah_tier_basis: z.string().max(500).optional().nullable(),
  filed_date: z.string().optional().nullable(),
  rule26f_conference_date: z.string().optional().nullable(),
  scheduling_order_date: z.string().optional().nullable(),
  discovery_cutoff_date: z.string().optional().nullable(),
  expert_disclosure_deadline: z.string().optional().nullable(),
  expert_rebuttal_deadline: z.string().optional().nullable(),
  pretrial_conference_date: z.string().optional().nullable(),
  trial_date: z.string().optional().nullable(),
  max_interrogatories: z.number().int().min(0).optional(),
  max_rfas: z.number().int().min(0).optional(),
  max_rfps: z.number().int().min(0).optional(),
  max_fact_depositions: z.number().int().min(0).optional(),
  max_fact_depo_hours: z.number().int().min(0).optional(),
  max_expert_depositions: z.number().int().min(0).optional().nullable(),
  max_expert_depo_hours: z.number().int().min(0).optional().nullable(),
})

export const updateDiscoveryConfigSchema = createDiscoveryConfigSchema.partial()

export type CreateDiscoveryConfigInput = z.infer<typeof createDiscoveryConfigSchema>
export type UpdateDiscoveryConfigInput = z.infer<typeof updateDiscoveryConfigSchema>

// ============================================================
// Initial Disclosure Schemas
// ============================================================

export const disclosureStatuses = ['draft', 'in_review', 'served', 'supplemented', 'overdue'] as const
export const disclosureTypes = ['initial', 'supplemental'] as const
export const disclosureItemTypes = ['witness', 'document', 'damage_computation', 'insurance'] as const

export const createInitialDisclosureSchema = z.object({
  disclosure_type: z.enum(disclosureTypes).default('initial'),
  served_date: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  served_to: z.string().max(500).optional().nullable(),
  served_by: z.string().max(500).optional().nullable(),
  status: z.enum(disclosureStatuses).default('draft'),
  certified_by: z.string().max(500).optional().nullable(),
  certified_date: z.string().optional().nullable(),
  certification_basis: z.string().max(2000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
})

export const updateInitialDisclosureSchema = createInitialDisclosureSchema.partial()

export type CreateInitialDisclosureInput = z.infer<typeof createInitialDisclosureSchema>
export type UpdateInitialDisclosureInput = z.infer<typeof updateInitialDisclosureSchema>

// ============================================================
// Disclosure Item Schemas
// ============================================================

export const createDisclosureItemSchema = z.object({
  disclosure_id: z.string().uuid(),
  item_type: z.enum(disclosureItemTypes),
  // Witness
  witness_name: z.string().max(500).optional().nullable(),
  witness_address: z.string().max(1000).optional().nullable(),
  witness_phone: z.string().max(50).optional().nullable(),
  witness_email: z.string().email().optional().nullable().or(z.literal('')),
  witness_subject: z.string().max(2000).optional().nullable(),
  // Document
  document_title: z.string().max(500).optional().nullable(),
  document_description: z.string().max(2000).optional().nullable(),
  document_location: z.string().max(1000).optional().nullable(),
  custodian: z.string().max(500).optional().nullable(),
  bates_range: z.string().max(100).optional().nullable(),
  linked_document_id: z.string().uuid().optional().nullable(),
  // Damage computation
  damage_category: z.string().max(500).optional().nullable(),
  damage_amount: z.number().optional().nullable(),
  damage_basis: z.string().max(5000).optional().nullable(),
  supporting_docs: z.string().max(2000).optional().nullable(),
  // Insurance
  insurer_name: z.string().max(500).optional().nullable(),
  policy_number: z.string().max(200).optional().nullable(),
  coverage_type: z.string().max(200).optional().nullable(),
  coverage_amount: z.number().optional().nullable(),
  policy_period: z.string().max(200).optional().nullable(),
  // Common
  description: z.string().max(5000).optional().nullable(),
  sort_order: z.number().int().optional(),
})

export const updateDisclosureItemSchema = createDisclosureItemSchema.partial()

export type CreateDisclosureItemInput = z.infer<typeof createDisclosureItemSchema>
export type UpdateDisclosureItemInput = z.infer<typeof updateDisclosureItemSchema>

// ============================================================
// Expert Disclosure Schemas
// ============================================================

export const expertTypes = ['retained', 'non_retained', 'hybrid'] as const
export const expertReportStatuses = ['pending', 'draft', 'finalized', 'served', 'supplemented'] as const

export const createExpertDisclosureSchema = z.object({
  expert_name: z.string().min(1, 'Expert name is required').max(500).trim(),
  expert_type: z.enum(expertTypes).default('retained'),
  field_of_expertise: z.string().max(500).optional().nullable(),
  report_status: z.enum(expertReportStatuses).default('pending'),
  report_due_date: z.string().optional().nullable(),
  report_served_date: z.string().optional().nullable(),
  opinions_summary: z.string().max(10000).optional().nullable(),
  bases_and_reasons: z.string().max(10000).optional().nullable(),
  data_and_exhibits: z.string().max(10000).optional().nullable(),
  qualifications_cv: z.string().max(10000).optional().nullable(),
  publications_list: z.string().max(5000).optional().nullable(),
  compensation_rate: z.string().max(500).optional().nullable(),
  compensation_terms: z.string().max(2000).optional().nullable(),
  prior_testimony: z.string().max(5000).optional().nullable(),
  subject_matter: z.string().max(2000).optional().nullable(),
  facts_and_opinions_summary: z.string().max(10000).optional().nullable(),
  deposition_scheduled: z.boolean().optional(),
  deposition_date: z.string().optional().nullable(),
  deposition_duration_hours: z.number().optional().nullable(),
  is_rebuttal: z.boolean().optional(),
  rebuttal_to: z.string().uuid().optional().nullable(),
  rebuttal_due_date: z.string().optional().nullable(),
  designated_by: z.string().max(200).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
})

export const updateExpertDisclosureSchema = createExpertDisclosureSchema.partial()

export type CreateExpertDisclosureInput = z.infer<typeof createExpertDisclosureSchema>
export type UpdateExpertDisclosureInput = z.infer<typeof updateExpertDisclosureSchema>

// ============================================================
// Discovery Deadline Schemas
// ============================================================

export const deadlineTypes = [
  'initial_disclosure', 'expert_disclosure', 'expert_rebuttal',
  'pretrial_disclosure', 'pretrial_objections', 'discovery_cutoff',
  'deposition', 'interrogatory_response', 'rfa_response', 'rfp_response',
  'supplementation', 'rule26f_conference', 'scheduling_conference',
  'protective_order', 'custom',
] as const

export const deadlineStatuses = ['upcoming', 'due_soon', 'overdue', 'completed', 'waived', 'extended'] as const

export const createDeadlineSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500).trim(),
  description: z.string().max(2000).optional().nullable(),
  deadline_type: z.enum(deadlineTypes),
  due_date: z.string().min(1, 'Due date is required'),
  calculated_from: z.string().max(500).optional().nullable(),
  rule_reference: z.string().max(200).optional().nullable(),
  status: z.enum(deadlineStatuses).default('upcoming'),
  assigned_to: z.string().max(500).optional().nullable(),
  alert_days_before: z.array(z.number().int()).optional(),
  notes: z.string().max(5000).optional().nullable(),
})

export const updateDeadlineSchema = createDeadlineSchema.partial()

export type CreateDeadlineInput = z.infer<typeof createDeadlineSchema>
export type UpdateDeadlineInput = z.infer<typeof updateDeadlineSchema>

// ============================================================
// Privilege Log Schemas
// ============================================================

export const privilegeTypes = [
  'attorney_client', 'work_product', 'joint_defense',
  'common_interest', 'deliberative_process', 'other',
] as const

export const privilegeLogStatuses = ['withheld', 'redacted', 'produced_in_part', 'clawback', 'waived'] as const

export const createPrivilegeLogSchema = z.object({
  document_title: z.string().min(1, 'Document title is required').max(500).trim(),
  document_date: z.string().optional().nullable(),
  bates_number: z.string().max(100).optional().nullable(),
  linked_document_id: z.string().uuid().optional().nullable(),
  privilege_type: z.enum(privilegeTypes),
  author: z.string().max(500).optional().nullable(),
  recipients: z.array(z.string()).optional().default([]),
  date_of_communication: z.string().optional().nullable(),
  subject_matter: z.string().max(2000).optional().nullable(),
  basis_for_privilege: z.string().max(5000).optional().nullable(),
  is_opinion_work_product: z.boolean().optional().default(false),
  prepared_in_anticipation_of: z.string().max(1000).optional().nullable(),
  status: z.enum(privilegeLogStatuses).default('withheld'),
  notes: z.string().max(5000).optional().nullable(),
})

export const updatePrivilegeLogSchema = createPrivilegeLogSchema.partial()

export type CreatePrivilegeLogInput = z.infer<typeof createPrivilegeLogSchema>
export type UpdatePrivilegeLogInput = z.infer<typeof updatePrivilegeLogSchema>

// ============================================================
// Written Discovery Schemas
// ============================================================

export const writtenDiscoveryTypes = ['interrogatory', 'rfp', 'rfa'] as const
export const writtenDiscoveryDirections = ['outgoing', 'incoming'] as const
export const writtenDiscoveryStatuses = [
  'draft', 'served', 'response_due', 'response_received',
  'objections_pending', 'complete', 'overdue',
] as const

export const createWrittenDiscoverySchema = z.object({
  discovery_type: z.enum(writtenDiscoveryTypes),
  direction: z.enum(writtenDiscoveryDirections).default('outgoing'),
  set_number: z.number().int().min(1).default(1),
  title: z.string().min(1, 'Title is required').max(500).trim(),
  served_date: z.string().optional().nullable(),
  response_due_date: z.string().optional().nullable(),
  request_count: z.number().int().min(0).optional().default(0),
  status: z.enum(writtenDiscoveryStatuses).default('draft'),
  served_by: z.string().max(500).optional().nullable(),
  served_to: z.string().max(500).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
})

export const updateWrittenDiscoverySchema = createWrittenDiscoverySchema.partial()

export type CreateWrittenDiscoveryInput = z.infer<typeof createWrittenDiscoverySchema>
export type UpdateWrittenDiscoveryInput = z.infer<typeof updateWrittenDiscoverySchema>
