/**
 * Copyright (c) 2026 CaseBreak Technologies
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

export type CaseType = 'civil' | 'criminal' | 'family' | 'corporate' | 'ip' | 'employment'
export type CaseStatus = 'active' | 'closed' | 'archived' | 'mock'
export type UserRole = 'admin' | 'attorney' | 'paralegal' | 'viewer'
export type DocumentType = 'brief' | 'motion' | 'discovery' | 'contract' | 'exhibit' | 'deposition' | 'statute' | 'ruling'
export type DisclosureType = 'initial' | 'expert' | 'pretrial'
export type SessionType = 'trial' | 'hearing' | 'mediation' | 'deposition'

export interface Case {
  id: string
  orgId: string
  caseNumber: string
  title: string
  caseType: CaseType
  status: CaseStatus
  jurisdiction: string
  court?: string
  judgeName?: string
  filingDate?: string
  parties: Array<{ name: string; role: string }>
  assignedAttorneys: string[]
  tags: string[]
  isMock: boolean
  isBlindTest: boolean
  realOutcome?: string
  realOutcomeHidden: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  clerkId: string
  orgId: string
  email: string
  fullName: string
  role: UserRole
  barNumber?: string
  jurisdiction?: string
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan: 'trial' | 'professional' | 'enterprise'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  caseId: string
  orgId: string
  title: string
  docType: DocumentType
  fileUrl: string
  fileSize?: number
  mimeType?: string
  extractedText?: string
  embeddingId?: string
  uploadedBy: string
  createdAt: string
}