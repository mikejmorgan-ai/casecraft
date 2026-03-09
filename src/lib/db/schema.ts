/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  date,
  jsonb,
  primaryKey
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Organizations (law firms)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  plan: text('plan').default('trial'), // trial, professional, enterprise
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Users (attorneys, paralegals, admins)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  orgId: uuid('org_id').references(() => organizations.id),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').default('attorney'), // admin, attorney, paralegal, viewer
  barNumber: text('bar_number'),
  jurisdiction: text('jurisdiction'),
  createdAt: timestamp('created_at').defaultNow()
})

// Cases
export const cases = pgTable('cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  caseNumber: text('case_number').notNull(),
  title: text('title').notNull(),
  caseType: text('case_type').notNull(), // civil, criminal, family, corporate, ip, employment
  status: text('status').default('active'), // active, closed, archived, mock
  jurisdiction: text('jurisdiction').notNull(),
  court: text('court'),
  judgeName: text('judge_name'),
  filingDate: date('filing_date'),
  parties: jsonb('parties').default([]), // [{name, role: plaintiff|defendant|witness}]
  assignedAttorneys: text('assigned_attorneys').array().default([]),
  tags: text('tags').array().default([]),
  isMock: boolean('is_mock').default(false),
  isBlindTest: boolean('is_blind_test').default(false),
  realOutcome: text('real_outcome'), // for blind testing comparison
  realOutcomeHidden: boolean('real_outcome_hidden').default(true),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Documents
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').references(() => cases.id).notNull(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  title: text('title').notNull(),
  docType: text('doc_type').notNull(), // brief, motion, discovery, contract, exhibit, deposition, statute, ruling
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  extractedText: text('extracted_text'),
  embeddingId: text('embedding_id'), // reference to vector store
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow()
})

// Rule 26 Disclosures
export const rule26Disclosures = pgTable('rule26_disclosures', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').references(() => cases.id).notNull(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  disclosureType: text('disclosure_type').notNull(), // initial, expert, pretrial
  status: text('status').default('draft'), // draft, review, served, amended
  dueDate: date('due_date'),
  servedDate: date('served_date'),
  content: jsonb('content').notNull(), // structured disclosure data
  witnesses: jsonb('witnesses').default([]),
  exhibits: jsonb('exhibits').default([]),
  computationOfDamages: jsonb('computation_of_damages'),
  insuranceAgreements: jsonb('insurance_agreements'),
  createdBy: uuid('created_by').references(() => users.id),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Mock Trials / Hearings
export const mockSessions = pgTable('mock_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').references(() => cases.id).notNull(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  sessionType: text('session_type').notNull(), // trial, hearing, mediation, deposition
  title: text('title').notNull(),
  status: text('status').default('pending'), // pending, in_progress, completed
  jurisdiction: text('jurisdiction').notNull(),
  applicableStatutes: text('applicable_statutes').array().default([]),
  judgeInstructions: text('judge_instructions'), // custom instructions for AI judge
  aiJudgeModel: text('ai_judge_model').default('gpt-4o'),
  transcript: jsonb('transcript').default([]), // [{role, content, timestamp}]
  ruling: jsonb('ruling'), // {outcome, reasoning, statutes_cited, confidence}
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
})

// Case Analysis (AI-generated insights)
export const caseAnalyses = pgTable('case_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').references(() => cases.id).notNull(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  analysisType: text('analysis_type').notNull(), // strength, risk, strategy, discovery, statute_compliance
  content: jsonb('content').notNull(), // structured analysis
  statutesReferenced: text('statutes_referenced').array().default([]),
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }),
  modelUsed: text('model_used'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow()
})

// Blind Test Results
export const blindTestResults = pgTable('blind_test_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').references(() => cases.id).notNull(),
  mockSessionId: uuid('mock_session_id').references(() => mockSessions.id).notNull(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  aiOutcome: text('ai_outcome').notNull(),
  realOutcome: text('real_outcome'), // revealed after comparison
  matchScore: decimal('match_score', { precision: 3, scale: 2 }), // 0.00 to 1.00
  analysis: jsonb('analysis'), // detailed comparison
  revealedAt: timestamp('revealed_at'),
  createdAt: timestamp('created_at').defaultNow()
})

// Statute Library (cached/indexed statutes)
export const statutes = pgTable('statutes', {
  id: uuid('id').primaryKey().defaultRandom(),
  jurisdiction: text('jurisdiction').notNull(),
  code: text('code').notNull(), // e.g., "Utah Code 17-41-501"
  title: text('title').notNull(),
  fullText: text('full_text').notNull(),
  sectionHierarchy: jsonb('section_hierarchy'), // parent/child sections
  effectiveDate: date('effective_date'),
  embeddingId: text('embedding_id'),
  lastVerified: timestamp('last_verified').defaultNow()
})

// Activity Log (audit trail)
export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(), // case.created, document.uploaded, analysis.generated, etc.
  resourceType: text('resource_type').notNull(),
  resourceId: uuid('resource_id'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow()
})

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  cases: many(cases),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  cases: many(cases),
  documents: many(documents),
}))

export const casesRelations = relations(cases, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [cases.orgId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [cases.createdBy],
    references: [users.id],
  }),
  documents: many(documents),
  mockSessions: many(mockSessions),
  analyses: many(caseAnalyses),
}))