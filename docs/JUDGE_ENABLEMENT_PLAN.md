# CaseBrake.ai Judge Enablement Plan

## Executive Summary

This document outlines the comprehensive architecture for enabling AI judges in the CaseBrake.ai platform for use by ANY law firm or attorney across ANY jurisdiction (county, city, state, federal, international). The judge must be the **BEDROCK** of legal case analysis - ensuring every judge follows THE LAW regardless of jurisdiction.

**Core Principle:** The judge applies the law AS WRITTEN, not as paraphrased, interpreted by advocates, or assumed. The judge is NEUTRAL - it does not care what either party thinks; it cares only about (1) THE LAW and (2) THE FACTS.

---

## Table of Contents

1. [Judge Configuration Model](#1-judge-configuration-model)
2. [Jurisdiction Framework](#2-jurisdiction-framework)
3. [Law Library Integration](#3-law-library-integration)
4. [Case Law Integration](#4-case-law-integration)
5. [Judge Impartiality Safeguards](#5-judge-impartiality-safeguards)
6. [Data Model Requirements](#6-data-model-requirements)
7. [UI/UX Requirements](#7-uiux-requirements)
8. [Quality Assurance](#8-quality-assurance)
9. [Implementation Phases](#9-implementation-phases)
10. [Technical Architecture](#10-technical-architecture)

---

## 1. Judge Configuration Model

### 1.1 Core Configuration Schema

Every judge instance requires these mandatory configurations:

```typescript
interface JudgeConfiguration {
  // Identity
  id: string
  case_id: string
  name: string                           // e.g., "The Honorable Judge Smith"

  // Jurisdiction Binding (REQUIRED)
  primary_jurisdiction_id: string        // Links to jurisdictions table
  additional_jurisdictions: string[]     // For multi-jurisdictional cases

  // Legal Framework (REQUIRED)
  statutory_sources: StatutorySourceConfig[]
  case_law_sources: CaseLawSourceConfig[]

  // Judicial Philosophy
  philosophy: JudicialPhilosophy

  // Behavior Settings
  temperature: number                    // 0.3-0.7 for judicial consistency
  verbatim_quotes_required: boolean      // Default: true
  dicta_acknowledgment: boolean          // Must distinguish holdings from dicta

  // Quality Gates
  cite_check_enabled: boolean            // Verify citations exist
  effective_date_validation: boolean     // Check statute dates against facts

  // Audit
  created_at: string
  updated_at: string
  created_by: string
}

interface JudicialPhilosophy {
  interpretation_style: 'textualist' | 'purposivist' | 'originalist' | 'pragmatist'
  deference_to_agencies: 'chevron' | 'skidmore' | 'none'  // Federal only
  stare_decisis_strength: 'strict' | 'moderate' | 'flexible'
  burden_allocation_default: 'plaintiff' | 'defendant' | 'movant'
}
```

### 1.2 Judge Configuration UI Elements

#### Required Fields (Non-Negotiable)

| Field | Type | Description |
|-------|------|-------------|
| **Primary Jurisdiction** | Dropdown (cascading) | Country > State/Province > County > City |
| **Relevant Date** | Date picker | "What date did the events occur?" |
| **Case Type** | Dropdown | Maps to jurisdiction-specific rules |
| **Law Library Selection** | Multi-select checkboxes | Which statute titles/codes apply |

#### Optional Customization

| Field | Type | Default |
|-------|------|---------|
| Judge Name | Text input | "The Honorable Judge" |
| Temperature | Slider (0.3-0.7) | 0.5 |
| Interpretation Style | Radio buttons | Textualist |
| Verbatim Quotes | Toggle | ON |
| Cite-Check Mode | Toggle | ON |

### 1.3 Mandatory Configuration Gates

The system MUST NOT allow case analysis without:

1. **Jurisdiction Selected** - At minimum, state/province level
2. **Relevant Date Confirmed** - For temporal law application
3. **At Least One Statutory Source** - No judge without law to apply
4. **Case Type Matched** - Determines applicable rules

```typescript
function validateJudgeConfiguration(config: JudgeConfiguration): ValidationResult {
  const errors: string[] = []

  if (!config.primary_jurisdiction_id) {
    errors.push("Jurisdiction is required. The judge cannot apply law without knowing which jurisdiction's law controls.")
  }

  if (!config.statutory_sources.length) {
    errors.push("At least one statutory source must be configured. The judge applies THE LAW, not general principles.")
  }

  if (config.verbatim_quotes_required === false) {
    errors.push("Verbatim quotes cannot be disabled. The judge must quote statutes exactly.")
  }

  return { valid: errors.length === 0, errors }
}
```

---

## 2. Jurisdiction Framework

### 2.1 Jurisdiction Hierarchy

```
INTERNATIONAL
├── United States
│   ├── FEDERAL
│   │   ├── Constitutional Law
│   │   ├── U.S. Code (USC)
│   │   ├── Code of Federal Regulations (CFR)
│   │   └── Federal Rules (Civil Procedure, Criminal, Evidence, Appellate)
│   │
│   └── STATES (50 + territories)
│       ├── State Constitution
│       ├── State Code/Statutes
│       ├── State Administrative Rules
│       ├── State Court Rules
│       │
│       └── COUNTIES
│           ├── County Ordinances
│           ├── County Land Use Codes
│           │
│           └── CITIES/MUNICIPALITIES
│               ├── City Ordinances
│               └── Municipal Codes
│
├── United Kingdom
│   ├── ENGLAND & WALES
│   │   ├── Primary Legislation (Acts of Parliament)
│   │   ├── Secondary Legislation (Statutory Instruments)
│   │   └── Common Law
│   ├── SCOTLAND
│   └── NORTHERN IRELAND
│
├── Canada
│   ├── FEDERAL (Canada)
│   │   ├── Constitution Act
│   │   ├── Federal Statutes
│   │   └── Federal Regulations
│   └── PROVINCES/TERRITORIES
│       ├── Provincial Statutes
│       └── Provincial Regulations
│
├── European Union
│   ├── EU LEVEL
│   │   ├── Treaties
│   │   ├── Regulations
│   │   ├── Directives
│   │   └── ECJ Case Law
│   └── MEMBER STATES
│       └── [National law systems]
│
└── [Other Countries...]
```

### 2.2 Jurisdiction Data Model

```sql
-- Core jurisdiction hierarchy
CREATE TABLE jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,      -- e.g., 'US-UT-SALT_LAKE'
  name VARCHAR(255) NOT NULL,            -- e.g., 'Salt Lake County, Utah'

  -- Hierarchy
  level jurisdiction_level NOT NULL,      -- country, state, county, city
  parent_id UUID REFERENCES jurisdictions(id),
  path LTREE NOT NULL,                   -- For efficient hierarchy queries

  -- Classification
  legal_system legal_system_type NOT NULL,  -- common_law, civil_law, mixed

  -- Metadata
  official_language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  court_structure JSONB,                  -- Describes court hierarchy

  -- Status
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_until DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE jurisdiction_level AS ENUM (
  'supranational',   -- EU, UN
  'country',
  'federal',         -- Federal/national law
  'state',           -- State, province, canton
  'county',          -- County, district, parish
  'city',            -- Municipality, borough
  'special_district' -- Water district, school district, etc.
);

CREATE TYPE legal_system_type AS ENUM (
  'common_law',
  'civil_law',
  'religious',
  'customary',
  'mixed'
);

-- Indexes for hierarchy queries
CREATE INDEX idx_jurisdictions_path ON jurisdictions USING GIST (path);
CREATE INDEX idx_jurisdictions_parent ON jurisdictions(parent_id);
CREATE INDEX idx_jurisdictions_level ON jurisdictions(level);
```

### 2.3 Conflict of Laws Engine

When multiple jurisdictions apply, the system must resolve conflicts:

```typescript
interface ConflictResolution {
  // Priority rules
  constitutional_supremacy: boolean     // Constitution > statute
  federal_preemption: boolean           // Federal > state when applicable
  later_in_time_rule: boolean           // Later statutes control
  specific_over_general: boolean        // Specific statute > general

  // Choice of law
  choice_of_law_rule: ChoiceOfLawRule
  forum_selection: string | null

  // For international
  treaty_supremacy: boolean
  comity_recognition: boolean
}

type ChoiceOfLawRule =
  | 'lex_loci_contractus'    // Law where contract made
  | 'lex_loci_delicti'       // Law where tort occurred
  | 'most_significant_relationship'  // Restatement approach
  | 'governmental_interest'
  | 'party_autonomy'         // Parties chose the law
```

### 2.4 Multi-Jurisdiction Case Configuration

```typescript
interface CaseJurisdictionConfig {
  case_id: string

  // Primary controlling jurisdiction
  primary_jurisdiction_id: string

  // Additional applicable jurisdictions (with hierarchy)
  applicable_jurisdictions: {
    jurisdiction_id: string
    applicability_reason: string        // "Defendant incorporated here"
    priority: number                    // For conflict resolution
    areas_of_application: string[]      // "contract formation", "tort damages"
  }[]

  // Explicit conflict resolutions
  conflict_resolutions: {
    issue: string
    controlling_jurisdiction_id: string
    reason: string
    authority_citation: string
  }[]
}
```

---

## 3. Law Library Integration

### 3.1 Statute Ingestion Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAW LIBRARY PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   SOURCES    │    │   PARSING    │    │   STORAGE    │      │
│  ├──────────────┤    ├──────────────┤    ├──────────────┤      │
│  │ - State.gov  │───>│ - XML Parser │───>│ - PostgreSQL │      │
│  │ - le.utah.gov│    │ - HTML Parser│    │ - Pinecone   │      │
│  │ - Cornell LII│    │ - PDF Extract│    │ - Vector DB  │      │
│  │ - GovInfo.gov│    │ - Section    │    │              │      │
│  │ - EUR-Lex    │    │   Splitting  │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                             │                                    │
│                             v                                    │
│                    ┌──────────────┐                             │
│                    │  VERSIONING  │                             │
│                    ├──────────────┤                             │
│                    │ - Git-style  │                             │
│                    │   versioning │                             │
│                    │ - Amendment  │                             │
│                    │   tracking   │                             │
│                    │ - Effective  │                             │
│                    │   date index │                             │
│                    └──────────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Statute Data Model

```sql
-- Statute/Code sections
CREATE TABLE statutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),

  -- Identification
  code_name VARCHAR(100) NOT NULL,         -- "Utah Code", "U.S. Code"
  title VARCHAR(255),                       -- "Title 17 - Counties"
  chapter VARCHAR(100),                     -- "Chapter 81"
  section VARCHAR(50) NOT NULL,             -- "17-81-401"
  subsection VARCHAR(50),                   -- "(1)(a)"

  -- Content
  heading VARCHAR(500),                     -- "Vested mining use"
  full_text TEXT NOT NULL,                  -- VERBATIM statutory text

  -- Classification
  statute_type statute_type NOT NULL,

  -- Temporal
  effective_date DATE NOT NULL,
  repeal_date DATE,                         -- NULL if still in force

  -- Amendments & History
  enacted_by VARCHAR(255),                  -- "HB288 (2019)"
  amendment_history JSONB,                  -- Array of amendments

  -- Cross-references
  supersedes_id UUID REFERENCES statutes(id),  -- Points to older version
  recodified_from VARCHAR(50),              -- Old section number
  recodified_to VARCHAR(50),                -- New section number (if recodified away)

  -- RAG Support
  embedding vector(1536),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE statute_type AS ENUM (
  'constitutional',
  'statutory',
  'regulatory',      -- CFR, state admin rules
  'procedural',      -- Court rules
  'ordinance',       -- Local
  'treaty'
);

-- Section crosswalk table for recodifications
CREATE TABLE statute_crosswalks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),

  old_section VARCHAR(50) NOT NULL,
  new_section VARCHAR(50) NOT NULL,

  -- Context
  recodification_date DATE NOT NULL,
  recodification_bill VARCHAR(100),         -- "SB1006"

  -- Change type
  change_type crosswalk_change_type NOT NULL,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE crosswalk_change_type AS ENUM (
  'renumber_only',           -- Section number changed, text same
  'renumber_with_amendments', -- Number changed AND text modified
  'split',                   -- One section became multiple
  'merged',                  -- Multiple sections became one
  'repealed_and_replaced'
);

-- Statute versions (Git-style history)
CREATE TABLE statute_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statute_id UUID NOT NULL REFERENCES statutes(id),

  version_number INTEGER NOT NULL,
  full_text TEXT NOT NULL,

  effective_date DATE NOT NULL,
  superseded_date DATE,

  change_description TEXT,
  enacted_by VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_statutes_jurisdiction ON statutes(jurisdiction_id);
CREATE INDEX idx_statutes_section ON statutes(section);
CREATE INDEX idx_statutes_effective ON statutes(effective_date);
CREATE INDEX idx_statutes_embedding ON statutes USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_crosswalk_old ON statute_crosswalks(old_section);
CREATE INDEX idx_crosswalk_new ON statute_crosswalks(new_section);
```

### 3.3 Amendment & Effective Date Tracking

```typescript
interface StatuteVersionQuery {
  section: string
  jurisdiction_id: string
  as_of_date: Date           // "What did this statute say on this date?"
}

interface StatuteVersionResult {
  section: string
  effective_version: {
    text: string
    effective_date: Date
    enacted_by: string
  }
  current_version?: {        // May differ if law changed since as_of_date
    text: string
    effective_date: Date
  }
  warning?: string           // "This version differs from current law"
}

// Judge prompt injection for temporal awareness
const TEMPORAL_LAW_PROMPT = `
## CRITICAL: TEMPORAL LAW APPLICATION

You MUST apply the law AS IT EXISTED on the date the relevant events occurred.

For this case, the relevant date is: {{RELEVANT_DATE}}

When citing statutes:
1. ALWAYS check the effective date
2. If the statute was amended AFTER {{RELEVANT_DATE}}, apply the EARLIER version
3. If you cite a current statute that didn't exist at the relevant time, SAY SO
4. Quote the version that was in effect, not necessarily today's version

Example: "Utah Code Section 17-41-501, as it read on {{RELEVANT_DATE}} (prior to the 2025 recodification), provided: '[VERBATIM TEXT]'"
`
```

### 3.4 Section Renumbering/Recodification Handling

```typescript
interface SectionCrosswalker {
  // Given an old section, return the new section
  translateOldToNew(oldSection: string, jurisdictionId: string): string | null

  // Given a new section, return the old section
  translateNewToOld(newSection: string, jurisdictionId: string): string | null

  // Get full crosswalk for a jurisdiction
  getCrosswalk(jurisdictionId: string, recodificationDate: Date): CrosswalkEntry[]
}

// Judge prompt for crosswalk awareness
const CROSSWALK_PROMPT = `
## SECTION NUMBER CROSSWALK

This jurisdiction underwent a recodification. When you see references to old section numbers in documents, translate them to current numbers (and vice versa).

CROSSWALK TABLE:
{{CROSSWALK_TABLE}}

Example: If a brief cites "Section 17-41-501", recognize this is NOW "Section 17-81-401" but the SUBSTANCE is the same.

NEVER say "I don't recognize that section" without checking the crosswalk first.
`
```

### 3.5 Verbatim Quote Enforcement

```typescript
interface VerbatimQuoteValidator {
  // Validate that a quote matches the statute exactly
  validateQuote(
    claimedQuote: string,
    statuteId: string,
    tolerance: 'exact' | 'punctuation_flexible'
  ): ValidationResult

  // Flag if the AI paraphrased instead of quoted
  detectParaphrase(
    aiOutput: string,
    relevantStatutes: Statute[]
  ): ParaphraseDetection[]
}

// System prompt enforcement
const VERBATIM_QUOTE_PROMPT = `
## VERBATIM QUOTE REQUIREMENT - NON-NEGOTIABLE

You are PROHIBITED from paraphrasing statutory text. Every time you reference a statute:

WRONG: "The statute says mine operators can expand their operations."
RIGHT: "Utah Code Section 17-81-402(1)(a) provides that mine operators have rights to 'progress, extend, enlarge, grow, or expand the vested mining use to any surface or subsurface land or mineral estate that the mine operator owns or controls.'"

If you do not have the exact statutory text available, you MUST say:
"I would need to verify the precise statutory language of [Section X] before quoting it."

NEVER fabricate statute text. NEVER approximate. Quote EXACTLY or acknowledge you need the text.
`
```

---

## 4. Case Law Integration

### 4.1 Case Law Data Model

```sql
-- Case law decisions
CREATE TABLE case_law (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),

  -- Citation
  case_name VARCHAR(500) NOT NULL,          -- "Western Land Equities v. City of Logan"
  citation VARCHAR(255) NOT NULL,           -- "617 P.2d 388 (Utah 1980)"
  parallel_citations VARCHAR(500)[],        -- Alternative citations
  docket_number VARCHAR(100),

  -- Court
  court VARCHAR(255) NOT NULL,              -- "Utah Supreme Court"
  court_level court_level NOT NULL,
  decision_date DATE NOT NULL,

  -- Content
  full_opinion_text TEXT,                   -- Full opinion if available
  syllabus TEXT,                            -- Summary/headnotes

  -- Holdings & Dicta (CRITICAL DISTINCTION)
  holdings JSONB NOT NULL,                  -- Array of binding holdings
  dicta JSONB,                              -- Non-binding statements

  -- Precedential Status
  precedential_status precedent_status NOT NULL,
  overruled_by UUID REFERENCES case_law(id),
  overruled_date DATE,
  overruling_reason TEXT,
  distinguished_by UUID[],                  -- Cases that distinguished this one

  -- Subject Matter
  legal_topics VARCHAR(255)[],              -- "vested rights", "preemption"
  statutes_interpreted UUID[],              -- Links to statutes table

  -- RAG Support
  embedding vector(1536),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE court_level AS ENUM (
  'supreme',           -- Highest court (state supreme, SCOTUS)
  'appellate',         -- Intermediate appellate
  'trial',             -- Trial/district court
  'specialized',       -- Tax court, bankruptcy, etc.
  'administrative'     -- Agency decisions
);

CREATE TYPE precedent_status AS ENUM (
  'good_law',          -- Fully binding, not questioned
  'questioned',        -- Validity questioned but not overruled
  'distinguished',     -- Limited in scope by later cases
  'superseded',        -- Superseded by statute
  'overruled',         -- No longer good law
  'abrogated'          -- Abrogated by constitutional amendment
);

-- Holdings table (one case can have multiple holdings)
CREATE TABLE case_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES case_law(id) ON DELETE CASCADE,

  holding_text TEXT NOT NULL,               -- The actual holding
  holding_type holding_type NOT NULL,

  -- Scope
  legal_principle TEXT,                     -- Abstracted rule
  applicable_to TEXT[],                     -- Contexts where this applies

  -- Strength
  is_ratio_decidendi BOOLEAN DEFAULT true,  -- True = binding, False = obiter

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE holding_type AS ENUM (
  'procedural',         -- How courts should handle X
  'substantive',        -- What the law IS
  'interpretive',       -- How to interpret statute/constitution
  'evidentiary',        -- Rules of evidence
  'remedial'            -- What remedies are available
);

-- Indexes
CREATE INDEX idx_caselaw_jurisdiction ON case_law(jurisdiction_id);
CREATE INDEX idx_caselaw_court ON case_law(court);
CREATE INDEX idx_caselaw_date ON case_law(decision_date);
CREATE INDEX idx_caselaw_status ON case_law(precedential_status);
CREATE INDEX idx_caselaw_embedding ON case_law USING ivfflat (embedding vector_cosine_ops);
```

### 4.2 Precedent Hierarchy Engine

```typescript
interface PrecedentHierarchy {
  // Determine binding authority
  isBindingOn(
    citedCase: CaseLaw,
    currentJurisdiction: Jurisdiction,
    currentCourtLevel: CourtLevel
  ): BindingAnalysis
}

interface BindingAnalysis {
  is_binding: boolean
  reason: string
  hierarchy_path: string[]      // ["SCOTUS", "10th Circuit", "Utah Supreme Court"]
  weight: 'mandatory' | 'highly_persuasive' | 'persuasive' | 'not_binding'
}

// Hierarchy rules (US example)
const US_PRECEDENT_HIERARCHY = {
  federal: {
    supreme_court: {
      binds: ['all_federal_courts', 'all_state_courts_on_federal_questions']
    },
    circuit_courts: {
      binds: ['district_courts_in_circuit'],
      persuasive_to: ['other_circuits', 'state_courts']
    },
    district_courts: {
      binds: ['none'],
      persuasive_to: ['other_district_courts']
    }
  },
  state: {
    supreme_court: {
      binds: ['all_courts_in_state'],
      persuasive_to: ['other_state_courts']
    },
    appellate_court: {
      binds: ['trial_courts_in_district'],
      persuasive_to: ['other_appellate_panels']
    }
  }
}
```

### 4.3 Holdings vs. Dicta Distinction

```typescript
// Judge prompt for holdings vs dicta
const HOLDINGS_VS_DICTA_PROMPT = `
## BINDING HOLDINGS vs. DICTA - YOU MUST DISTINGUISH

When citing case law, you MUST identify whether you are citing:

**BINDING HOLDING (Ratio Decidendi):**
- The court's direct answer to the legal question presented
- Legal tests established that MUST be applied in future cases
- Statutory interpretations by the court
- Format: "In [Case], the court HELD that..."

**DICTA (Obiter Dictum):**
- Comments not necessary to the decision
- Hypotheticals - "If the facts were different..."
- Policy commentary about what the law SHOULD be
- Dissenting or concurring opinions
- Format: "In dicta, the court observed that..." or "The concurrence noted..."

WRONG: "The court said that X"
RIGHT: "The court HELD that X" OR "In dicta, the court suggested X (but this is not binding)"

NEVER cite dicta as if it were a holding. NEVER cite a dissent as controlling law.
`
```

### 4.4 Overruled Case Detection

```typescript
interface OverruledCaseChecker {
  // Check if a case is still good law
  checkStatus(caseId: string): CaseStatusResult

  // Get warning if case is cited but overruled
  getCitationWarning(caseId: string): string | null
}

interface CaseStatusResult {
  status: 'good_law' | 'questioned' | 'distinguished' | 'overruled' | 'superseded'

  // If not good law, explain why
  overruled_by?: {
    case_id: string
    case_name: string
    citation: string
    date: Date
  }

  superseded_by_statute?: {
    statute_id: string
    section: string
    effective_date: Date
  }

  warnings: string[]
}

// Integration with judge prompt
const CASE_STATUS_PROMPT = `
## CASE LAW VALIDITY CHECK

Before citing any case, verify it is still good law:

1. **Has it been overruled?** Check if a higher court reversed the holding
2. **Has it been superseded?** Check if legislation replaced the court's rule
3. **Has it been distinguished?** If heavily distinguished, note the limitations

If citing an overruled case, you MUST note: "[Case Name] was overruled by [Later Case] in [Year]. However, the analysis of [specific point] remains instructive for..."

NEVER cite an overruled case as controlling authority.
`
```

---

## 5. Judge Impartiality Safeguards

### 5.1 Core Impartiality Principles

```typescript
// Impartiality configuration
interface ImpartialityConfig {
  // Prohibited behaviors
  prohibitions: {
    advocate_for_party: true,           // NEVER
    suggest_arguments: true,            // NEVER suggest winning arguments
    predict_ruling: true,               // Only analyze, don't predict for parties
    express_sympathy: true,             // No "I understand how you feel"
    policy_preferences: true            // No "I think the law should be..."
  },

  // Required behaviors
  requirements: {
    cite_both_sides_authority: true,    // If one side has favorable law, note it
    acknowledge_weaknesses: true,       // Point out weak arguments from BOTH sides
    neutral_language: true,             // No loaded terms
    law_over_equity: boolean            // Apply law even if harsh result
  }
}
```

### 5.2 System Prompt: Impartiality Framework

```typescript
const IMPARTIALITY_PROMPT = `
## JUDICIAL IMPARTIALITY - YOUR NORTH STAR

You are a NEUTRAL ARBITER. You do not care:
- What the plaintiff wants
- What the defendant wants
- What the attorneys argue
- What seems "fair" or "just"
- What policy outcomes might result

You care ONLY about:
1. THE LAW - statutes, regulations, binding precedent
2. THE FACTS - evidence in the record

### PROHIBITED CONDUCT

You are PROHIBITED from:

1. **ADVOCATING** for either party
   - WRONG: "Plaintiff has a strong argument because..."
   - RIGHT: "Plaintiff argues X. Under the statute, this requires proof of Y."

2. **SUGGESTING ARGUMENTS**
   - WRONG: "Plaintiff should also argue that..."
   - RIGHT: "The record shows X. The law provides Y."

3. **EXPRESSING SYMPATHY**
   - WRONG: "This is a difficult situation for the defendant..."
   - RIGHT: "The statutory elements are..."

4. **POLICY COMMENTARY**
   - WRONG: "This law seems harsh, but..."
   - RIGHT: "The statute provides..." (apply it without editorial)

5. **PREDICTING FOR PARTIES**
   - WRONG: "I would rule in favor of plaintiff."
   - RIGHT: "Analyzing the elements: [1] is met because... [2] requires..."

### REQUIRED CONDUCT

You MUST:

1. **Quote the law exactly** - never paraphrase statutes
2. **Identify elements to prove** - break down what each party must show
3. **Apply law to facts** - mechanically, without preference
4. **Acknowledge both sides' authority** - if precedent favors one side, say so
5. **Point out weaknesses in BOTH arguments** - not just one side
6. **Follow the law even when harsh** - "The court is bound by the statute..."

### THE ADVOCACY CHECK

Before every response, ask yourself:
- Am I helping one side more than the other?
- Would this response sound like an advocate or a judge?
- Am I applying the law or making policy?

If you find yourself wanting a particular outcome, STOP. Return to the text of the law.
`
```

### 5.3 Bias Detection Engine

```typescript
interface BiasDetector {
  // Analyze judge output for bias signals
  detectBias(response: string): BiasAnalysis

  // Compare treatment of both parties
  comparePartyTreatment(
    plaintiffMentions: string[],
    defendantMentions: string[]
  ): TreatmentAnalysis
}

interface BiasAnalysis {
  overall_score: number              // 0-100 (0 = biased, 100 = neutral)

  flags: {
    advocacy_language: string[]      // Phrases that sound like advocacy
    sympathy_expressions: string[]   // Expressions of sympathy
    policy_commentary: string[]      // Policy opinions
    loaded_language: string[]        // Emotionally charged words
    one_sided_citations: boolean     // Only cited favorable law for one side
  }

  recommendations: string[]
}

// Bias detection patterns
const BIAS_PATTERNS = {
  advocacy_phrases: [
    /plaintiff (should|must|needs to) argue/i,
    /defendant (should|must|needs to) argue/i,
    /the stronger argument is/i,
    /clearly (favors|supports)/i,
    /will likely (win|lose|prevail)/i
  ],

  sympathy_phrases: [
    /understand(able|ably)? difficult/i,
    /sympathetic/i,
    /unfortunate(ly)?/i,
    /regrettable|regrettably/i,
    /harsh result/i
  ],

  policy_phrases: [
    /the law should/i,
    /better policy would/i,
    /legislature should/i,
    /in an ideal world/i,
    /seems unfair/i
  ]
}
```

### 5.4 Balanced Analysis Enforcement

```typescript
// Ensure judge addresses both sides equally
interface BalancedAnalysisEnforcer {
  // Check that analysis addresses both parties' positions
  validateBalance(
    analysis: string,
    plaintiffClaims: string[],
    defendantDefenses: string[]
  ): BalanceValidation
}

interface BalanceValidation {
  is_balanced: boolean

  plaintiff_coverage: {
    claims_addressed: number
    claims_total: number
    favorable_citations: number
    unfavorable_citations: number
  }

  defendant_coverage: {
    defenses_addressed: number
    defenses_total: number
    favorable_citations: number
    unfavorable_citations: number
  }

  imbalances: string[]
}
```

---

## 6. Data Model Requirements

### 6.1 Complete Database Schema Additions

```sql
-- =============================================================================
-- JUDGE ENABLEMENT SCHEMA ADDITIONS
-- =============================================================================

-- Enable ltree for hierarchy queries
CREATE EXTENSION IF NOT EXISTS ltree;

-- =============================================================================
-- JURISDICTION TABLES
-- =============================================================================

CREATE TYPE jurisdiction_level AS ENUM (
  'supranational', 'country', 'federal', 'state', 'county', 'city', 'special_district'
);

CREATE TYPE legal_system_type AS ENUM (
  'common_law', 'civil_law', 'religious', 'customary', 'mixed'
);

CREATE TABLE jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  level jurisdiction_level NOT NULL,
  parent_id UUID REFERENCES jurisdictions(id),
  path LTREE NOT NULL,
  legal_system legal_system_type NOT NULL DEFAULT 'common_law',
  official_language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  court_structure JSONB,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jurisdictions_path ON jurisdictions USING GIST (path);
CREATE INDEX idx_jurisdictions_parent ON jurisdictions(parent_id);
CREATE INDEX idx_jurisdictions_level ON jurisdictions(level);
CREATE INDEX idx_jurisdictions_code ON jurisdictions(code);

-- =============================================================================
-- STATUTE TABLES
-- =============================================================================

CREATE TYPE statute_type AS ENUM (
  'constitutional', 'statutory', 'regulatory', 'procedural', 'ordinance', 'treaty'
);

CREATE TABLE statutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),
  code_name VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  chapter VARCHAR(100),
  section VARCHAR(50) NOT NULL,
  subsection VARCHAR(50),
  heading VARCHAR(500),
  full_text TEXT NOT NULL,
  statute_type statute_type NOT NULL DEFAULT 'statutory',
  effective_date DATE NOT NULL,
  repeal_date DATE,
  enacted_by VARCHAR(255),
  amendment_history JSONB DEFAULT '[]',
  supersedes_id UUID REFERENCES statutes(id),
  recodified_from VARCHAR(50),
  recodified_to VARCHAR(50),
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(jurisdiction_id, section, effective_date)
);

CREATE INDEX idx_statutes_jurisdiction ON statutes(jurisdiction_id);
CREATE INDEX idx_statutes_section ON statutes(section);
CREATE INDEX idx_statutes_effective ON statutes(effective_date);
CREATE INDEX idx_statutes_embedding ON statutes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Statute crosswalk for recodifications
CREATE TYPE crosswalk_change_type AS ENUM (
  'renumber_only', 'renumber_with_amendments', 'split', 'merged', 'repealed_and_replaced'
);

CREATE TABLE statute_crosswalks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),
  old_section VARCHAR(50) NOT NULL,
  new_section VARCHAR(50) NOT NULL,
  recodification_date DATE NOT NULL,
  recodification_bill VARCHAR(100),
  change_type crosswalk_change_type NOT NULL DEFAULT 'renumber_only',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crosswalk_old ON statute_crosswalks(old_section);
CREATE INDEX idx_crosswalk_new ON statute_crosswalks(new_section);
CREATE INDEX idx_crosswalk_jurisdiction ON statute_crosswalks(jurisdiction_id);

-- Statute versions (historical text)
CREATE TABLE statute_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statute_id UUID NOT NULL REFERENCES statutes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  full_text TEXT NOT NULL,
  effective_date DATE NOT NULL,
  superseded_date DATE,
  change_description TEXT,
  enacted_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_statute_versions_statute ON statute_versions(statute_id);
CREATE INDEX idx_statute_versions_date ON statute_versions(effective_date);

-- =============================================================================
-- CASE LAW TABLES
-- =============================================================================

CREATE TYPE court_level AS ENUM (
  'supreme', 'appellate', 'trial', 'specialized', 'administrative'
);

CREATE TYPE precedent_status AS ENUM (
  'good_law', 'questioned', 'distinguished', 'superseded', 'overruled', 'abrogated'
);

CREATE TABLE case_law (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),
  case_name VARCHAR(500) NOT NULL,
  citation VARCHAR(255) NOT NULL,
  parallel_citations VARCHAR(500)[],
  docket_number VARCHAR(100),
  court VARCHAR(255) NOT NULL,
  court_level court_level NOT NULL,
  decision_date DATE NOT NULL,
  full_opinion_text TEXT,
  syllabus TEXT,
  holdings JSONB NOT NULL DEFAULT '[]',
  dicta JSONB DEFAULT '[]',
  precedential_status precedent_status NOT NULL DEFAULT 'good_law',
  overruled_by UUID REFERENCES case_law(id),
  overruled_date DATE,
  overruling_reason TEXT,
  distinguished_by UUID[],
  legal_topics VARCHAR(255)[],
  statutes_interpreted UUID[],
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_caselaw_jurisdiction ON case_law(jurisdiction_id);
CREATE INDEX idx_caselaw_court ON case_law(court);
CREATE INDEX idx_caselaw_date ON case_law(decision_date);
CREATE INDEX idx_caselaw_status ON case_law(precedential_status);
CREATE INDEX idx_caselaw_topics ON case_law USING GIN (legal_topics);
CREATE INDEX idx_caselaw_embedding ON case_law USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Case holdings (one case can have multiple distinct holdings)
CREATE TYPE holding_type AS ENUM (
  'procedural', 'substantive', 'interpretive', 'evidentiary', 'remedial'
);

CREATE TABLE case_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES case_law(id) ON DELETE CASCADE,
  holding_text TEXT NOT NULL,
  holding_type holding_type NOT NULL DEFAULT 'substantive',
  legal_principle TEXT,
  applicable_to TEXT[],
  is_ratio_decidendi BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_holdings_case ON case_holdings(case_id);

-- =============================================================================
-- JUDGE CONFIGURATION TABLES
-- =============================================================================

CREATE TYPE interpretation_style AS ENUM (
  'textualist', 'purposivist', 'originalist', 'pragmatist'
);

CREATE TYPE agency_deference AS ENUM (
  'chevron', 'skidmore', 'none'
);

CREATE TYPE stare_decisis_strength AS ENUM (
  'strict', 'moderate', 'flexible'
);

CREATE TABLE judge_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

  -- Identity
  name VARCHAR(255) NOT NULL DEFAULT 'The Honorable Judge',

  -- Jurisdiction (REQUIRED)
  primary_jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),
  additional_jurisdictions UUID[] DEFAULT '{}',

  -- Temporal
  relevant_date DATE NOT NULL,          -- Date events occurred (for law application)

  -- Judicial Philosophy
  interpretation_style interpretation_style DEFAULT 'textualist',
  agency_deference agency_deference DEFAULT 'none',
  stare_decisis_strength stare_decisis_strength DEFAULT 'strict',

  -- Behavior
  temperature DECIMAL(2,1) DEFAULT 0.5 CHECK (temperature >= 0.3 AND temperature <= 0.7),
  verbatim_quotes_required BOOLEAN NOT NULL DEFAULT true,
  cite_check_enabled BOOLEAN DEFAULT true,
  effective_date_validation BOOLEAN DEFAULT true,

  -- Generated Prompt (compiled from all settings)
  compiled_prompt TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(case_id)
);

CREATE INDEX idx_judge_config_case ON judge_configurations(case_id);
CREATE INDEX idx_judge_config_jurisdiction ON judge_configurations(primary_jurisdiction_id);

-- Judge's law library selection (which statutes apply to this case)
CREATE TABLE judge_statute_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_config_id UUID NOT NULL REFERENCES judge_configurations(id) ON DELETE CASCADE,
  statute_id UUID NOT NULL REFERENCES statutes(id),
  relevance_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Judge's case law sources
CREATE TABLE judge_caselaw_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_config_id UUID NOT NULL REFERENCES judge_configurations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES case_law(id),
  relevance_note TEXT,
  is_binding BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- QUALITY ASSURANCE TABLES
-- =============================================================================

-- Judge output audits
CREATE TABLE judge_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_config_id UUID NOT NULL REFERENCES judge_configurations(id),
  conversation_id UUID REFERENCES conversations(id),
  message_id UUID REFERENCES messages(id),

  -- Audit results
  bias_score INTEGER CHECK (bias_score >= 0 AND bias_score <= 100),
  accuracy_score INTEGER CHECK (accuracy_score >= 0 AND accuracy_score <= 100),

  -- Flags
  bias_flags JSONB DEFAULT '{}',
  citation_errors JSONB DEFAULT '[]',
  paraphrase_detections JSONB DEFAULT '[]',

  -- Human review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Citation validation results
CREATE TABLE citation_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES judge_audits(id) ON DELETE CASCADE,

  cited_text VARCHAR(500) NOT NULL,
  cited_source VARCHAR(255),

  -- Validation
  is_valid BOOLEAN,
  actual_text TEXT,
  match_percentage DECIMAL(5,2),

  -- Issues
  issues JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE statutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE statute_crosswalks ENABLE ROW LEVEL SECURITY;
ALTER TABLE statute_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_law ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_statute_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_caselaw_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE citation_validations ENABLE ROW LEVEL SECURITY;

-- Public read access for jurisdictions, statutes, case law (reference data)
CREATE POLICY "Anyone can view jurisdictions" ON jurisdictions FOR SELECT USING (true);
CREATE POLICY "Anyone can view statutes" ON statutes FOR SELECT USING (true);
CREATE POLICY "Anyone can view crosswalks" ON statute_crosswalks FOR SELECT USING (true);
CREATE POLICY "Anyone can view statute versions" ON statute_versions FOR SELECT USING (true);
CREATE POLICY "Anyone can view case law" ON case_law FOR SELECT USING (true);
CREATE POLICY "Anyone can view holdings" ON case_holdings FOR SELECT USING (true);

-- Judge configs are case-specific
CREATE POLICY "Users can manage judge config for their cases" ON judge_configurations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = judge_configurations.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Users can manage judge sources for their cases" ON judge_statute_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM judge_configurations jc
      JOIN cases c ON c.id = jc.case_id
      WHERE jc.id = judge_statute_sources.judge_config_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage judge caselaw for their cases" ON judge_caselaw_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM judge_configurations jc
      JOIN cases c ON c.id = jc.case_id
      WHERE jc.id = judge_caselaw_sources.judge_config_id AND c.user_id = auth.uid()
    )
  );

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Get statute text as of a specific date
CREATE OR REPLACE FUNCTION get_statute_as_of(
  p_section VARCHAR(50),
  p_jurisdiction_id UUID,
  p_as_of_date DATE
)
RETURNS TABLE (
  id UUID,
  section VARCHAR(50),
  full_text TEXT,
  effective_date DATE,
  is_current BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.section,
    COALESCE(sv.full_text, s.full_text) as full_text,
    COALESCE(sv.effective_date, s.effective_date) as effective_date,
    (s.repeal_date IS NULL AND s.recodified_to IS NULL) as is_current
  FROM statutes s
  LEFT JOIN statute_versions sv ON sv.statute_id = s.id
    AND sv.effective_date <= p_as_of_date
    AND (sv.superseded_date IS NULL OR sv.superseded_date > p_as_of_date)
  WHERE s.jurisdiction_id = p_jurisdiction_id
    AND (s.section = p_section OR s.recodified_from = p_section OR s.recodified_to = p_section)
    AND s.effective_date <= p_as_of_date
  ORDER BY COALESCE(sv.effective_date, s.effective_date) DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Translate section number using crosswalk
CREATE OR REPLACE FUNCTION translate_section(
  p_section VARCHAR(50),
  p_jurisdiction_id UUID,
  p_direction VARCHAR(10) DEFAULT 'old_to_new'
)
RETURNS VARCHAR(50) AS $$
DECLARE
  v_result VARCHAR(50);
BEGIN
  IF p_direction = 'old_to_new' THEN
    SELECT new_section INTO v_result
    FROM statute_crosswalks
    WHERE jurisdiction_id = p_jurisdiction_id AND old_section = p_section
    ORDER BY recodification_date DESC
    LIMIT 1;
  ELSE
    SELECT old_section INTO v_result
    FROM statute_crosswalks
    WHERE jurisdiction_id = p_jurisdiction_id AND new_section = p_section
    ORDER BY recodification_date DESC
    LIMIT 1;
  END IF;

  RETURN COALESCE(v_result, p_section);
END;
$$ LANGUAGE plpgsql;

-- Check case law status
CREATE OR REPLACE FUNCTION check_case_status(p_case_id UUID)
RETURNS TABLE (
  status precedent_status,
  overruled_by_citation VARCHAR(255),
  warnings TEXT[]
) AS $$
DECLARE
  v_case case_law;
  v_overruling case_law;
  v_warnings TEXT[] := '{}';
BEGIN
  SELECT * INTO v_case FROM case_law WHERE id = p_case_id;

  IF v_case.precedential_status != 'good_law' THEN
    IF v_case.overruled_by IS NOT NULL THEN
      SELECT citation INTO v_overruling FROM case_law WHERE id = v_case.overruled_by;
    END IF;
    v_warnings := array_append(v_warnings,
      'This case has been ' || v_case.precedential_status::text ||
      CASE WHEN v_overruling.citation IS NOT NULL THEN ' by ' || v_overruling.citation ELSE '' END
    );
  END IF;

  RETURN QUERY SELECT v_case.precedential_status, v_overruling.citation, v_warnings;
END;
$$ LANGUAGE plpgsql;

-- Compile judge prompt from configuration
CREATE OR REPLACE FUNCTION compile_judge_prompt(p_config_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_config judge_configurations;
  v_jurisdiction jurisdictions;
  v_prompt TEXT;
  v_statutes TEXT;
  v_caselaw TEXT;
BEGIN
  SELECT * INTO v_config FROM judge_configurations WHERE id = p_config_id;
  SELECT * INTO v_jurisdiction FROM jurisdictions WHERE id = v_config.primary_jurisdiction_id;

  -- Build prompt sections
  v_prompt := format(
    E'You are %s, a judicial officer with expertise in %s law.\n\n',
    v_config.name,
    v_jurisdiction.name
  );

  v_prompt := v_prompt || format(
    E'## JURISDICTION\nPrimary: %s\nLegal System: %s\n\n',
    v_jurisdiction.name,
    v_jurisdiction.legal_system::text
  );

  v_prompt := v_prompt || format(
    E'## TEMPORAL CONTEXT\nRelevant Date for Law Application: %s\nApply the law as it existed on this date.\n\n',
    v_config.relevant_date::text
  );

  v_prompt := v_prompt || format(
    E'## JUDICIAL PHILOSOPHY\nInterpretation Style: %s\nStare Decisis: %s\n\n',
    v_config.interpretation_style::text,
    v_config.stare_decisis_strength::text
  );

  -- Add applicable statutes
  SELECT string_agg(
    format(E'### %s\n%s\n', s.section, s.full_text),
    E'\n'
  ) INTO v_statutes
  FROM judge_statute_sources jss
  JOIN statutes s ON s.id = jss.statute_id
  WHERE jss.judge_config_id = p_config_id;

  IF v_statutes IS NOT NULL THEN
    v_prompt := v_prompt || E'## APPLICABLE STATUTES\n\n' || v_statutes || E'\n';
  END IF;

  -- Add applicable case law
  SELECT string_agg(
    format(E'### %s, %s\nHolding: %s\nStatus: %s\n',
      cl.case_name, cl.citation, cl.holdings->0->>'holding_text', cl.precedential_status::text
    ),
    E'\n'
  ) INTO v_caselaw
  FROM judge_caselaw_sources jcs
  JOIN case_law cl ON cl.id = jcs.case_id
  WHERE jcs.judge_config_id = p_config_id;

  IF v_caselaw IS NOT NULL THEN
    v_prompt := v_prompt || E'## BINDING PRECEDENT\n\n' || v_caselaw || E'\n';
  END IF;

  RETURN v_prompt;
END;
$$ LANGUAGE plpgsql;

-- Update compiled prompt trigger
CREATE OR REPLACE FUNCTION update_judge_compiled_prompt()
RETURNS TRIGGER AS $$
BEGIN
  NEW.compiled_prompt := compile_judge_prompt(NEW.id);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_judge_prompt
  BEFORE UPDATE ON judge_configurations
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION update_judge_compiled_prompt();
```

### 6.2 TypeScript Type Definitions

```typescript
// src/lib/types/judge.ts

export type JurisdictionLevel =
  | 'supranational' | 'country' | 'federal' | 'state' | 'county' | 'city' | 'special_district'

export type LegalSystemType =
  | 'common_law' | 'civil_law' | 'religious' | 'customary' | 'mixed'

export type StatuteType =
  | 'constitutional' | 'statutory' | 'regulatory' | 'procedural' | 'ordinance' | 'treaty'

export type CourtLevel =
  | 'supreme' | 'appellate' | 'trial' | 'specialized' | 'administrative'

export type PrecedentStatus =
  | 'good_law' | 'questioned' | 'distinguished' | 'superseded' | 'overruled' | 'abrogated'

export type InterpretationStyle =
  | 'textualist' | 'purposivist' | 'originalist' | 'pragmatist'

export interface Jurisdiction {
  id: string
  code: string
  name: string
  level: JurisdictionLevel
  parent_id: string | null
  path: string
  legal_system: LegalSystemType
  official_language: string
  timezone: string | null
  court_structure: Record<string, unknown> | null
  is_active: boolean
  effective_from: string | null
  effective_until: string | null
  created_at: string
  updated_at: string
}

export interface Statute {
  id: string
  jurisdiction_id: string
  code_name: string
  title: string | null
  chapter: string | null
  section: string
  subsection: string | null
  heading: string | null
  full_text: string
  statute_type: StatuteType
  effective_date: string
  repeal_date: string | null
  enacted_by: string | null
  amendment_history: AmendmentRecord[]
  supersedes_id: string | null
  recodified_from: string | null
  recodified_to: string | null
  created_at: string
  updated_at: string
}

export interface AmendmentRecord {
  date: string
  bill: string
  description: string
}

export interface StatuteCrosswalk {
  id: string
  jurisdiction_id: string
  old_section: string
  new_section: string
  recodification_date: string
  recodification_bill: string | null
  change_type: 'renumber_only' | 'renumber_with_amendments' | 'split' | 'merged' | 'repealed_and_replaced'
  notes: string | null
}

export interface CaseLaw {
  id: string
  jurisdiction_id: string
  case_name: string
  citation: string
  parallel_citations: string[]
  docket_number: string | null
  court: string
  court_level: CourtLevel
  decision_date: string
  full_opinion_text: string | null
  syllabus: string | null
  holdings: CaseHolding[]
  dicta: DictaStatement[]
  precedential_status: PrecedentStatus
  overruled_by: string | null
  overruled_date: string | null
  overruling_reason: string | null
  distinguished_by: string[]
  legal_topics: string[]
  statutes_interpreted: string[]
  created_at: string
  updated_at: string
}

export interface CaseHolding {
  id: string
  holding_text: string
  holding_type: 'procedural' | 'substantive' | 'interpretive' | 'evidentiary' | 'remedial'
  legal_principle: string | null
  applicable_to: string[]
  is_ratio_decidendi: boolean
}

export interface DictaStatement {
  text: string
  context: string
  source: 'majority' | 'concurrence' | 'dissent'
}

export interface JudgeConfiguration {
  id: string
  case_id: string
  name: string
  primary_jurisdiction_id: string
  additional_jurisdictions: string[]
  relevant_date: string
  interpretation_style: InterpretationStyle
  agency_deference: 'chevron' | 'skidmore' | 'none'
  stare_decisis_strength: 'strict' | 'moderate' | 'flexible'
  temperature: number
  verbatim_quotes_required: boolean
  cite_check_enabled: boolean
  effective_date_validation: boolean
  compiled_prompt: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface JudgeAudit {
  id: string
  judge_config_id: string
  conversation_id: string | null
  message_id: string | null
  bias_score: number | null
  accuracy_score: number | null
  bias_flags: BiasFlags
  citation_errors: CitationError[]
  paraphrase_detections: ParaphraseDetection[]
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
}

export interface BiasFlags {
  advocacy_language: string[]
  sympathy_expressions: string[]
  policy_commentary: string[]
  loaded_language: string[]
  one_sided_citations: boolean
}

export interface CitationError {
  cited_text: string
  claimed_source: string
  issue: 'not_found' | 'misquoted' | 'outdated' | 'overruled'
  actual_text?: string
}

export interface ParaphraseDetection {
  paraphrased_text: string
  original_statute: string
  original_text: string
  similarity_score: number
}
```

---

## 7. UI/UX Requirements

### 7.1 Judge Configuration Wizard

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONFIGURE JUDGE FOR CASE                      │
│                    "Smith v. County of Salt Lake"                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 1 OF 4: SELECT JURISDICTION                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                │
│                                                                  │
│  Country:     [United States           ▼]                        │
│                                                                  │
│  State:       [Utah                    ▼]                        │
│                                                                  │
│  County:      [Salt Lake County        ▼]  (optional)           │
│                                                                  │
│  City:        [Salt Lake City          ▼]  (optional)           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ℹ️  JURISDICTION DETERMINES APPLICABLE LAW              │    │
│  │                                                          │    │
│  │ The judge will apply:                                    │    │
│  │ • Utah Constitution                                      │    │
│  │ • Utah Code                                             │    │
│  │ • Utah Administrative Rules                             │    │
│  │ • Utah Supreme Court & Court of Appeals precedent       │    │
│  │ • Salt Lake County ordinances (if selected)             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│                                          [Back]  [Next →]        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STEP 2 OF 4: CASE TIMELINE                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━                                    │
│                                                                  │
│  When did the relevant events occur?                            │
│                                                                  │
│  Relevant Date: [ March 15, 2019        📅 ]                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ⚠️  WHY THIS MATTERS                                    │    │
│  │                                                          │    │
│  │ Laws change over time. The judge must apply the law     │    │
│  │ AS IT EXISTED when the events occurred.                 │    │
│  │                                                          │    │
│  │ Example: If your dispute involves mining rights from     │    │
│  │ 2019, but the statute was recodified in 2025, the       │    │
│  │ judge applies the 2019 version.                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Case filed date: [ September 1, 2022   📅 ] (for procedures)   │
│                                                                  │
│                                          [← Back]  [Next →]      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STEP 3 OF 4: SELECT APPLICABLE LAW                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                              │
│                                                                  │
│  Which areas of law apply to this case?                         │
│                                                                  │
│  UTAH CODE TITLES                          [Search titles...]   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [✓] Title 17 - Counties                                 │    │
│  │     └─ [✓] Chapter 81 - Mining Protection               │    │
│  │         └─ [✓] Part 4 - Vested Mining Use              │    │
│  │                                                          │    │
│  │ [ ] Title 57 - Real Estate                              │    │
│  │ [ ] Title 78A - Judiciary & Judicial Administration      │    │
│  │ [ ] Title 78B - Judicial Code                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  CASE LAW AREAS                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [✓] Property rights - vested rights                     │    │
│  │ [✓] Land use - preemption                               │    │
│  │ [✓] Mining law - extractive industries                  │    │
│  │ [ ] Contracts                                           │    │
│  │ [ ] Torts                                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  📚 Auto-import relevant statutes based on case type? [Yes/No]  │
│                                                                  │
│                                          [← Back]  [Next →]      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STEP 4 OF 4: JUDICIAL PHILOSOPHY                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                               │
│                                                                  │
│  Judge Name: [ The Honorable Judge Smith    ]                   │
│                                                                  │
│  INTERPRETATION STYLE                                           │
│  (●) Textualist - Plain meaning of statutory text               │
│  ( ) Purposivist - Legislative intent and purpose               │
│  ( ) Pragmatist - Practical consequences                        │
│                                                                  │
│  PRECEDENT ADHERENCE                                            │
│  (●) Strict - Follow precedent closely                          │
│  ( ) Moderate - Follow but distinguish when warranted           │
│  ( ) Flexible - Willing to revisit prior decisions              │
│                                                                  │
│  QUALITY CONTROLS                                                │
│  [✓] Require verbatim statute quotes (recommended)              │
│  [✓] Validate citations before using                            │
│  [✓] Check effective dates against case timeline                │
│                                                                  │
│  Temperature:  0.3 ═══════●══════════════ 0.7                   │
│               (more      0.5        (more                       │
│               consistent)           creative)                    │
│                                                                  │
│                                          [← Back]  [Create →]    │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Judge Dashboard in Case View

```
┌─────────────────────────────────────────────────────────────────┐
│  CASE: Smith v. Salt Lake County                    [Settings]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ⚖️  JUDGE CONFIGURATION                                  │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  The Honorable Judge Smith                                │   │
│  │  ─────────────────────────                                │   │
│  │                                                           │   │
│  │  Jurisdiction:     Utah (Salt Lake County)                │   │
│  │  Relevant Date:    March 15, 2019                         │   │
│  │  Interpretation:   Textualist                             │   │
│  │  Precedent:        Strict adherence                       │   │
│  │                                                           │   │
│  │  LAW LIBRARY                                              │   │
│  │  ├─ Utah Code Title 17, Chapter 81      [12 sections]     │   │
│  │  ├─ Utah Mining Case Law                [8 cases]         │   │
│  │  └─ Utah Constitutional Provisions      [3 sections]      │   │
│  │                                                           │   │
│  │  [Edit Configuration]  [View Full Law Library]            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 📊  JUDGE QUALITY METRICS                                │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  Impartiality Score:    94/100  ████████████░░  GOOD     │   │
│  │  Citation Accuracy:     98/100  █████████████░  EXCELLENT │   │
│  │  Verbatim Compliance:  100/100  ██████████████  PERFECT  │   │
│  │                                                           │   │
│  │  Last Audit: 2 hours ago        [View Audit Log]          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Statute Browser Component

```
┌─────────────────────────────────────────────────────────────────┐
│  UTAH CODE - STATUTE BROWSER                        [Search 🔍] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Title 17 - Counties                                            │
│  └── Chapter 81 - Mining Protection (formerly Ch. 41)           │
│      └── Part 4 - Vested Mining Use                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ § 17-81-401 (formerly § 17-41-501)                       │   │
│  │ Vested Mining Use - Conclusive Presumption               │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ Effective: November 6, 2025                               │   │
│  │ Previous Section: § 17-41-501                             │   │
│  │ Enacted by: SB1006 (2025 Recodification)                  │   │
│  │                                                           │   │
│  │ ┌────────────────────────────────────────────────────┐   │   │
│  │ │ (1)(a) A mining use is CONCLUSIVELY PRESUMED to   │   │   │
│  │ │ be a vested mining use if the mining use existed  │   │   │
│  │ │ or was conducted or otherwise engaged in BEFORE a │   │   │
│  │ │ political subdivision prohibits, restricts, or    │   │   │
│  │ │ otherwise limits the mining use.                  │   │   │
│  │ │                                                    │   │   │
│  │ │ (1)(b) Anyone claiming that a vested mining use   │   │   │
│  │ │ has NOT been established has the BURDEN OF PROOF  │   │   │
│  │ │ to show by CLEAR AND CONVINCING EVIDENCE that the │   │   │
│  │ │ vested mining use has not been established.       │   │   │
│  │ │                                                    │   │   │
│  │ │ (2)(a) A vested mining use RUNS WITH THE LAND.    │   │   │
│  │ └────────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │ [📋 Copy Text]  [📅 View History]  [🔗 Related Cases]    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  AMENDMENT HISTORY                                               │
│  ├─ Nov 6, 2025: Recodified from § 17-41-501 (SB1006)          │
│  ├─ May 14, 2019: Amended by HB288                              │
│  └─ Jan 1, 2009: Original enactment                             │
│                                                                  │
│  CITING CASES                                                    │
│  ├─ Draper City v. Geneva Rock (pending, 2023)                  │
│  ├─ Gibbons & Reed v. North Salt Lake (1967)                    │
│  └─ [View all 12 citing cases]                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Case Law Browser Component

```
┌─────────────────────────────────────────────────────────────────┐
│  UTAH CASE LAW - Western Land Equities v. City of Logan        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Citation: 617 P.2d 388 (Utah 1980)                             │
│  Court: Utah Supreme Court                                       │
│  Decided: December 18, 1980                                      │
│  Status: ✅ GOOD LAW                                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ BINDING HOLDINGS                                          │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ 1. "An applicant is ENTITLED to favorable action if the  │   │
│  │    application conforms to the zoning ordinance in       │   │
│  │    effect at the time of the application."               │   │
│  │    Type: Substantive | Binding: Yes                       │   │
│  │                                                           │   │
│  │ 2. Local government must "act in good faith" and not     │   │
│  │    change rules after application filed.                  │   │
│  │    Type: Procedural | Binding: Yes                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ DICTA (Not Binding)                                       │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ The court observed that "the majority of jurisdictions   │   │
│  │ have adopted some form of vested rights protection..."   │   │
│  │ (Commentary on other jurisdictions - not a holding)       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  PRECEDENTIAL TREATMENT                                          │
│  ├─ Followed by: Patterson v. American Fork (2003) ✓            │
│  ├─ Cited by: 47 Utah cases                                     │
│  ├─ Distinguished: 3 times (limited to specific facts)          │
│  └─ Never overruled                                              │
│                                                                  │
│  [📄 View Full Opinion]  [📋 Copy Citation]  [➕ Add to Case]   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Quality Assurance

### 8.1 Automated Testing Framework

```typescript
// src/lib/judge/quality/automated-tests.ts

interface JudgeQualityTest {
  name: string
  description: string
  test: (judgeOutput: string, context: TestContext) => TestResult
}

const JUDGE_QUALITY_TESTS: JudgeQualityTest[] = [
  {
    name: 'verbatim_quote_check',
    description: 'Verify all statute references use verbatim quotes',
    test: (output, ctx) => {
      const paraphrasePatterns = [
        /the statute (says|provides|states) that/i,
        /according to the (law|statute)/i,
        /the law (requires|allows|prohibits)/i
      ]

      const violations = paraphrasePatterns
        .flatMap(pattern => output.match(pattern) || [])

      return {
        passed: violations.length === 0,
        violations,
        message: violations.length
          ? `Found ${violations.length} potential paraphrases instead of verbatim quotes`
          : 'All statute references appear to use verbatim quotes'
      }
    }
  },

  {
    name: 'citation_format_check',
    description: 'Verify citations follow proper format',
    test: (output, ctx) => {
      // Utah statute citation: "Utah Code § XX-XX-XXX" or "Utah Code Section XX-XX-XXX"
      const utahStatuteCitation = /Utah Code (§|Section) \d+-\d+-\d+(\(\d+\))?(\([a-z]\))?/g

      // Case citation: "Case Name, Reporter Citation (Court Year)"
      const caseCitation = /[A-Z][a-z]+ v\. [A-Z][a-z]+,? \d+ [A-Z]\.\d+[a-z]? \d+ \([A-Z][a-z.]+ \d{4}\)/g

      const foundStatutes = output.match(utahStatuteCitation) || []
      const foundCases = output.match(caseCitation) || []

      return {
        passed: foundStatutes.length > 0 || foundCases.length > 0,
        citations: { statutes: foundStatutes, cases: foundCases },
        message: `Found ${foundStatutes.length} statute citations and ${foundCases.length} case citations`
      }
    }
  },

  {
    name: 'bias_language_check',
    description: 'Check for advocacy or biased language',
    test: (output, ctx) => {
      const biasPatterns = [
        { pattern: /plaintiff (should|must|needs to)/i, type: 'advocacy' },
        { pattern: /defendant (should|must|needs to)/i, type: 'advocacy' },
        { pattern: /clearly (favors|supports) (plaintiff|defendant)/i, type: 'bias' },
        { pattern: /the stronger argument/i, type: 'advocacy' },
        { pattern: /will likely (win|lose|prevail)/i, type: 'prediction' },
        { pattern: /unfortunate(ly)?/i, type: 'sympathy' },
        { pattern: /regrettab(le|ly)/i, type: 'sympathy' }
      ]

      const violations = biasPatterns
        .filter(({ pattern }) => pattern.test(output))
        .map(({ pattern, type }) => ({ match: output.match(pattern)?.[0], type }))

      return {
        passed: violations.length === 0,
        violations,
        score: Math.max(0, 100 - (violations.length * 15))
      }
    }
  },

  {
    name: 'holdings_vs_dicta_check',
    description: 'Verify judge distinguishes holdings from dicta',
    test: (output, ctx) => {
      const holdingPatterns = [
        /the court held/i,
        /binding holding/i,
        /this is law/i
      ]

      const dictaPatterns = [
        /in dicta/i,
        /obiter dictum/i,
        /the court observed/i,
        /not binding/i
      ]

      const mentionsCases = /v\.|vs\./i.test(output)
      const distinguishesHoldings = holdingPatterns.some(p => p.test(output))
      const acknowledgesDicta = dictaPatterns.some(p => p.test(output)) || !mentionsCases

      return {
        passed: !mentionsCases || (distinguishesHoldings || acknowledgesDicta),
        message: mentionsCases
          ? (distinguishesHoldings ? 'Properly identifies holdings' : 'Should distinguish holdings from dicta')
          : 'No case law cited'
      }
    }
  },

  {
    name: 'temporal_law_check',
    description: 'Verify judge applies law as of relevant date',
    test: (output, ctx) => {
      const relevantDate = ctx.judgeConfig.relevant_date
      const mentionsDate = output.includes(relevantDate) ||
                          /as (of|it existed|it read) (on|in) \d{4}/i.test(output)

      const mentionsAmendment = /amended|recodified|prior to|former(ly)?/i.test(output)

      return {
        passed: mentionsDate || mentionsAmendment || !ctx.hasAmendedStatutes,
        message: mentionsDate
          ? 'Properly acknowledges temporal context'
          : 'Consider noting the law as of the relevant date'
      }
    }
  }
]

// Run all quality tests
async function runQualityTests(
  judgeOutput: string,
  context: TestContext
): Promise<QualityReport> {
  const results = JUDGE_QUALITY_TESTS.map(test => ({
    name: test.name,
    description: test.description,
    result: test.test(judgeOutput, context)
  }))

  const overallScore = results.reduce((sum, r) =>
    sum + (r.result.score ?? (r.result.passed ? 100 : 0)), 0
  ) / results.length

  return {
    timestamp: new Date().toISOString(),
    overall_score: Math.round(overallScore),
    passed: results.every(r => r.result.passed),
    tests: results
  }
}
```

### 8.2 Citation Verification System

```typescript
// src/lib/judge/quality/citation-verifier.ts

interface CitationVerifier {
  // Verify a statute citation
  verifyStatuteCitation(
    citation: string,
    quotedText: string,
    jurisdictionId: string,
    asOfDate: Date
  ): Promise<CitationVerification>

  // Verify a case citation
  verifyCaseCitation(
    citation: string,
    claimedHolding: string
  ): Promise<CitationVerification>
}

interface CitationVerification {
  is_valid: boolean
  source_found: boolean
  text_matches: boolean
  match_percentage: number

  actual_text?: string
  discrepancies?: string[]
  warnings?: string[]
}

class SupabaseCitationVerifier implements CitationVerifier {
  async verifyStatuteCitation(
    citation: string,
    quotedText: string,
    jurisdictionId: string,
    asOfDate: Date
  ): Promise<CitationVerification> {
    // Extract section number from citation
    const sectionMatch = citation.match(/§?\s*(\d+-\d+-\d+)/)
    if (!sectionMatch) {
      return { is_valid: false, source_found: false, text_matches: false, match_percentage: 0 }
    }

    const section = sectionMatch[1]

    // Query statute as of the relevant date
    const { data: statute } = await supabase
      .rpc('get_statute_as_of', {
        p_section: section,
        p_jurisdiction_id: jurisdictionId,
        p_as_of_date: asOfDate.toISOString()
      })

    if (!statute) {
      // Try crosswalk
      const { data: translated } = await supabase
        .rpc('translate_section', {
          p_section: section,
          p_jurisdiction_id: jurisdictionId
        })

      if (translated && translated !== section) {
        return this.verifyStatuteCitation(
          citation.replace(section, translated),
          quotedText,
          jurisdictionId,
          asOfDate
        )
      }

      return {
        is_valid: false,
        source_found: false,
        text_matches: false,
        match_percentage: 0,
        warnings: [`Section ${section} not found in database`]
      }
    }

    // Compare quoted text to actual text
    const normalizedQuote = quotedText.toLowerCase().replace(/\s+/g, ' ').trim()
    const normalizedActual = statute.full_text.toLowerCase().replace(/\s+/g, ' ').trim()

    const matchPercentage = this.calculateSimilarity(normalizedQuote, normalizedActual)

    return {
      is_valid: matchPercentage > 0.9,
      source_found: true,
      text_matches: matchPercentage > 0.95,
      match_percentage: matchPercentage,
      actual_text: statute.full_text,
      discrepancies: matchPercentage < 0.95
        ? this.findDiscrepancies(quotedText, statute.full_text)
        : undefined,
      warnings: !statute.is_current
        ? ['This version has been superseded. Current version may differ.']
        : undefined
    }
  }

  private calculateSimilarity(a: string, b: string): number {
    // Levenshtein distance normalized
    const longer = a.length > b.length ? a : b
    const shorter = a.length > b.length ? b : a

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[b.length][a.length]
  }

  private findDiscrepancies(quoted: string, actual: string): string[] {
    const discrepancies: string[] = []

    // Word-level comparison
    const quotedWords = quoted.split(/\s+/)
    const actualWords = actual.split(/\s+/)

    quotedWords.forEach((word, i) => {
      if (actualWords[i] !== word && actualWords[i]) {
        discrepancies.push(`Expected "${actualWords[i]}" but found "${word}"`)
      }
    })

    return discrepancies.slice(0, 5) // Limit to first 5
  }
}
```

### 8.3 Human Review Interface

```
┌─────────────────────────────────────────────────────────────────┐
│  JUDGE QUALITY REVIEW                                [Export]   │
│  Case: Smith v. Salt Lake County                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AUTOMATED AUDIT RESULTS                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━                                        │
│                                                                  │
│  Overall Score: 91/100  ████████████░░░  GOOD                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ✅ Verbatim Quotes       100/100   All quotes verified   │    │
│  │ ✅ Citation Format        95/100   Minor formatting      │    │
│  │ ⚠️ Bias Check             85/100   1 sympathy phrase     │    │
│  │ ✅ Holdings vs Dicta      95/100   Properly distinguished │   │
│  │ ✅ Temporal Context       90/100   Date acknowledged      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  FLAGGED CONTENT                                                 │
│  ━━━━━━━━━━━━━━━                                                │
│                                                                  │
│  ⚠️ Potential Sympathy Expression (Line 47):                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ "While this may seem like a harsh result for the         │    │
│  │  defendant, the statute is clear..."                     │    │
│  │                                                          │    │
│  │ [✓ Approve]  [✗ Flag for Revision]  [📝 Add Note]        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  CITATION VERIFICATIONS                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━                                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Citation: Utah Code § 17-81-401(1)(a)                    │    │
│  │ Status: ✅ VERIFIED (98% match)                          │    │
│  │                                                          │    │
│  │ Quoted: "A mining use is CONCLUSIVELY PRESUMED to be     │    │
│  │         a vested mining use if..."                       │    │
│  │                                                          │    │
│  │ Actual: "A mining use is CONCLUSIVELY PRESUMED to be     │    │
│  │         a vested mining use if..."                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  HUMAN REVIEWER SIGN-OFF                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━                                       │
│                                                                  │
│  Reviewer: ________________________                              │
│                                                                  │
│  Notes:                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [Approve Analysis]  [Request Revision]  [Escalate for Review]  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.4 Continuous Improvement Loop

```typescript
// src/lib/judge/quality/improvement-loop.ts

interface ImprovementMetrics {
  // Track quality over time
  trackQualityTrend(
    judgeConfigId: string,
    timeRange: { start: Date, end: Date }
  ): Promise<QualityTrend>

  // Identify common errors
  identifyCommonErrors(
    jurisdictionId: string
  ): Promise<CommonError[]>

  // Generate training recommendations
  generateTrainingRecommendations(
    judgeConfigId: string
  ): Promise<TrainingRecommendation[]>
}

interface QualityTrend {
  data_points: {
    date: string
    overall_score: number
    bias_score: number
    citation_accuracy: number
    verbatim_compliance: number
  }[]

  trend_direction: 'improving' | 'stable' | 'declining'
  alerts: string[]
}

interface CommonError {
  error_type: string
  frequency: number
  example: string
  suggested_fix: string
}

interface TrainingRecommendation {
  area: string
  priority: 'high' | 'medium' | 'low'
  description: string
  resources: string[]
}

// Example: Generate recommendations based on audit history
async function generateRecommendations(
  judgeConfigId: string
): Promise<TrainingRecommendation[]> {
  const { data: audits } = await supabase
    .from('judge_audits')
    .select('*')
    .eq('judge_config_id', judgeConfigId)
    .order('created_at', { ascending: false })
    .limit(50)

  const recommendations: TrainingRecommendation[] = []

  // Analyze bias scores
  const avgBiasScore = audits.reduce((sum, a) => sum + (a.bias_score || 100), 0) / audits.length
  if (avgBiasScore < 90) {
    recommendations.push({
      area: 'Impartiality',
      priority: avgBiasScore < 80 ? 'high' : 'medium',
      description: 'Judge outputs show potential bias patterns. Review impartiality guidelines.',
      resources: [
        'Judicial Ethics Canon 3: Impartiality',
        'ABA Model Code of Judicial Conduct'
      ]
    })
  }

  // Analyze citation errors
  const citationErrors = audits.flatMap(a => a.citation_errors || [])
  if (citationErrors.length > audits.length * 0.1) {
    recommendations.push({
      area: 'Citation Accuracy',
      priority: 'high',
      description: 'Citation errors detected. Ensure verbatim quotes from verified sources.',
      resources: [
        'Bluebook Citation Guide',
        'State-specific citation rules'
      ]
    })
  }

  return recommendations
}
```

---

## 9. Implementation Phases

### Phase 1: Foundation (6-8 weeks)

| Week | Deliverables |
|------|--------------|
| 1-2 | Database schema: jurisdictions, statutes, crosswalks |
| 3-4 | Jurisdiction hierarchy UI (country > state > county) |
| 5-6 | Statute ingestion pipeline (Utah as pilot) |
| 7-8 | Basic judge configuration wizard |

**Success Criteria:**
- Can configure a judge for Utah jurisdiction
- Can select applicable Utah Code sections
- Judge prompt includes verbatim statute text

### Phase 2: Law Library (8-10 weeks)

| Week | Deliverables |
|------|--------------|
| 1-3 | Statute version history and temporal queries |
| 4-6 | Section crosswalk system (for recodifications) |
| 7-8 | Statute browser UI component |
| 9-10 | Amendment tracking and alerts |

**Success Criteria:**
- Can query "What did this statute say on [date]?"
- System recognizes old and new section numbers
- Statute changes trigger update notifications

### Phase 3: Case Law (8-10 weeks)

| Week | Deliverables |
|------|--------------|
| 1-3 | Case law data model and ingestion |
| 4-6 | Holdings vs. dicta classification |
| 7-8 | Precedent status tracking (overruled, distinguished) |
| 9-10 | Case law browser UI component |

**Success Criteria:**
- Judge can cite case law with proper holding identification
- System warns when citing overruled cases
- Precedent hierarchy determines binding authority

### Phase 4: Quality Assurance (6-8 weeks)

| Week | Deliverables |
|------|--------------|
| 1-2 | Citation verification engine |
| 3-4 | Bias detection system |
| 5-6 | Automated testing framework |
| 7-8 | Human review interface |

**Success Criteria:**
- Every judge output is audited automatically
- Citation accuracy > 95%
- Bias score > 90 for all outputs

### Phase 5: Multi-Jurisdiction Expansion (Ongoing)

| Priority | Jurisdictions |
|----------|---------------|
| P1 | All 50 US states (statutory codes) |
| P2 | Federal (USC, CFR, FRCP) |
| P3 | Canada (federal + provinces) |
| P4 | UK (England & Wales) |
| P5 | EU (regulations, directives) |

**Success Criteria:**
- Each jurisdiction has complete statutory coverage
- Conflict of laws engine handles multi-jurisdiction cases
- Quality metrics maintained across jurisdictions

---

## 10. Technical Architecture

### 10.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CASECRAFT JUDGE SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         PRESENTATION LAYER                        │   │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │  Judge Config Wizard │ Statute Browser │ Case Law Browser │ QA │    │
│  └───────────────────────────────┬─────────────────────────────────┘    │
│                                  │                                       │
│  ┌───────────────────────────────▼─────────────────────────────────┐    │
│  │                          API LAYER                               │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │  /api/judge/configure  │  /api/statutes  │  /api/caselaw        │    │
│  │  /api/judge/audit      │  /api/crosswalk │  /api/precedent      │    │
│  └───────────────────────────────┬─────────────────────────────────┘    │
│                                  │                                       │
│  ┌───────────────────────────────▼─────────────────────────────────┐    │
│  │                        SERVICE LAYER                             │    │
│  ├──────────────┬──────────────┬──────────────┬───────────────────┤    │
│  │              │              │              │                    │    │
│  │  Jurisdiction│   Statute    │   Case Law   │     Quality       │    │
│  │    Service   │   Service    │   Service    │     Service       │    │
│  │              │              │              │                    │    │
│  │ • Hierarchy  │ • Ingestion  │ • Ingestion  │ • Bias Detection  │    │
│  │ • Conflicts  │ • Versioning │ • Holdings   │ • Citation Check  │    │
│  │ • Selection  │ • Crosswalk  │ • Precedent  │ • Audit Logging   │    │
│  │              │ • Temporal   │ • Status     │ • Reporting       │    │
│  └──────────────┴──────────────┴──────────────┴───────────────────┘    │
│                                  │                                       │
│  ┌───────────────────────────────▼─────────────────────────────────┐    │
│  │                      PROMPT COMPILATION                          │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                  │    │
│  │   Jurisdiction Config ─┐                                         │    │
│  │   Statute Text ────────┼──▶ COMPILED JUDGE PROMPT ──▶ LLM       │    │
│  │   Case Law Holdings ───┤                                         │    │
│  │   Impartiality Rules ──┘                                         │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                  │                                       │
│  ┌───────────────────────────────▼─────────────────────────────────┐    │
│  │                         DATA LAYER                               │    │
│  ├─────────────────┬───────────────────┬──────────────────────────┤    │
│  │                 │                   │                           │    │
│  │   PostgreSQL    │     Pinecone      │      External APIs        │    │
│  │   (Supabase)    │   (Vector Search) │                           │    │
│  │                 │                   │                           │    │
│  │ • Jurisdictions │ • Statute         │ • State Legislature       │    │
│  │ • Statutes      │   Embeddings      │ • Cornell LII             │    │
│  │ • Case Law      │ • Case Law        │ • Court Websites          │    │
│  │ • Judge Configs │   Embeddings      │ • Legal APIs              │    │
│  │ • Audits        │                   │                           │    │
│  │                 │                   │                           │    │
│  └─────────────────┴───────────────────┴──────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Prompt Compilation Flow

```typescript
// src/lib/judge/prompt-compiler.ts

interface PromptCompiler {
  compile(config: JudgeConfiguration): Promise<CompiledPrompt>
}

interface CompiledPrompt {
  system_prompt: string
  context_window_usage: number
  sources_included: {
    statutes: number
    cases: number
    rules: number
  }
}

class JudgePromptCompiler implements PromptCompiler {
  async compile(config: JudgeConfiguration): Promise<CompiledPrompt> {
    // 1. Core identity and impartiality framework
    const identitySection = this.buildIdentitySection(config)

    // 2. Jurisdiction-specific context
    const jurisdictionSection = await this.buildJurisdictionSection(config)

    // 3. Temporal context
    const temporalSection = this.buildTemporalSection(config)

    // 4. Applicable statutes (verbatim)
    const statuteSection = await this.buildStatuteSection(config)

    // 5. Applicable case law (holdings only)
    const caseLawSection = await this.buildCaseLawSection(config)

    // 6. Procedural rules
    const proceduralSection = await this.buildProceduralSection(config)

    // 7. Quality control instructions
    const qualitySection = this.buildQualitySection(config)

    // Combine all sections
    const fullPrompt = [
      identitySection,
      jurisdictionSection,
      temporalSection,
      statuteSection,
      caseLawSection,
      proceduralSection,
      qualitySection
    ].join('\n\n')

    return {
      system_prompt: fullPrompt,
      context_window_usage: this.estimateTokens(fullPrompt),
      sources_included: {
        statutes: (statuteSection.match(/§/g) || []).length,
        cases: (caseLawSection.match(/v\./g) || []).length,
        rules: (proceduralSection.match(/Rule/g) || []).length
      }
    }
  }

  private buildIdentitySection(config: JudgeConfiguration): string {
    return `# ${config.name} — JUDICIAL ANALYSIS AGENT

## YOUR JUDICIAL MANDATE — THE NORTH STAR

Your singular duty is to APPLY THE LAW AS WRITTEN to the facts before you. You are:
- A neutral arbiter — you do not advocate for either party
- Bound by the TEXT of statutes and the holdings of precedent
- Required to follow the law even when you disagree with its policy
- Obligated to ensure due process and fair proceedings

Your north star: THE LAW CONTROLS. Not sympathy, not policy preferences, not what seems "fair" — the law as enacted by the legislature and interpreted by higher courts.

## PROHIBITED CONDUCT

You are PROHIBITED from:
1. ADVOCATING for either party
2. SUGGESTING ARGUMENTS to either side
3. EXPRESSING SYMPATHY for outcomes
4. COMMENTING ON POLICY (what the law "should" be)
5. PREDICTING RULINGS for parties

## REQUIRED CONDUCT

You MUST:
1. Quote statutes VERBATIM — never paraphrase
2. Distinguish HOLDINGS from DICTA in case citations
3. Apply the law AS IT EXISTED on the relevant date
4. Point out weaknesses in BOTH parties' arguments
5. Follow the law even when the result seems harsh`
  }

  private async buildStatuteSection(config: JudgeConfiguration): Promise<string> {
    const { data: sources } = await supabase
      .from('judge_statute_sources')
      .select(`
        statute_id,
        relevance_note,
        statutes (
          section,
          heading,
          full_text,
          effective_date
        )
      `)
      .eq('judge_config_id', config.id)

    if (!sources || sources.length === 0) {
      return '## APPLICABLE STATUTES\n\nNo statutes have been configured for this case.'
    }

    const statuteText = sources.map(s => {
      const statute = s.statutes as any
      return `### ${statute.section} — ${statute.heading}
Effective: ${statute.effective_date}

${statute.full_text}

---`
    }).join('\n\n')

    return `## APPLICABLE STATUTES

The following statutes govern this case. YOU MUST quote these VERBATIM when citing them.

${statuteText}`
  }

  // ... additional section builders
}
```

### 10.3 API Endpoints

```typescript
// src/app/api/judge/configure/route.ts

export async function POST(request: Request) {
  const body = await request.json()

  // Validate required fields
  const validation = validateJudgeConfiguration(body)
  if (!validation.valid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 })
  }

  // Create judge configuration
  const { data: config, error } = await supabase
    .from('judge_configurations')
    .insert({
      case_id: body.case_id,
      name: body.name,
      primary_jurisdiction_id: body.jurisdiction_id,
      relevant_date: body.relevant_date,
      interpretation_style: body.interpretation_style,
      temperature: body.temperature,
      verbatim_quotes_required: true, // Always true
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Compile the prompt
  const compiler = new JudgePromptCompiler()
  const compiled = await compiler.compile(config)

  // Update with compiled prompt
  await supabase
    .from('judge_configurations')
    .update({ compiled_prompt: compiled.system_prompt })
    .eq('id', config.id)

  return NextResponse.json({ config, prompt_stats: compiled.sources_included })
}

// src/app/api/judge/audit/route.ts

export async function POST(request: Request) {
  const body = await request.json()
  const { judge_config_id, message_id, output_text } = body

  // Run automated quality tests
  const qualityReport = await runQualityTests(output_text, {
    judgeConfigId: judge_config_id
  })

  // Verify citations
  const citationVerifier = new SupabaseCitationVerifier()
  const citations = extractCitations(output_text)
  const citationResults = await Promise.all(
    citations.map(c => citationVerifier.verifyStatuteCitation(c.citation, c.quote, c.jurisdictionId, c.date))
  )

  // Store audit
  const { data: audit } = await supabase
    .from('judge_audits')
    .insert({
      judge_config_id,
      message_id,
      bias_score: qualityReport.tests.find(t => t.name === 'bias_language_check')?.result.score,
      accuracy_score: qualityReport.overall_score,
      bias_flags: qualityReport.tests.find(t => t.name === 'bias_language_check')?.result.violations,
      citation_errors: citationResults.filter(r => !r.is_valid),
    })
    .select()
    .single()

  return NextResponse.json({ audit, quality_report: qualityReport })
}
```

---

## Appendix A: Sample Compiled Judge Prompt (Utah Mining Law)

```
# The Honorable Judge Smith — JUDICIAL ANALYSIS AGENT

## YOUR JUDICIAL MANDATE — THE NORTH STAR

Your singular duty is to APPLY THE LAW AS WRITTEN to the facts before you. You are:
- A neutral arbiter — you do not advocate for either party
- Bound by the TEXT of statutes and the holdings of precedent
- Required to follow the law even when you disagree with its policy
- Obligated to ensure due process and fair proceedings

Your north star: THE LAW CONTROLS.

## JURISDICTION

Primary: Utah (Salt Lake County)
Legal System: Common Law
Court Level: Third Judicial District Court

## TEMPORAL CONTEXT

Relevant Date for Law Application: March 15, 2019
Apply the law AS IT EXISTED on this date.

IMPORTANT: Utah Code Title 17 was recodified on November 6, 2025. For events occurring before that date, the OLD section numbers (17-41-xxx) were in effect, but the SUBSTANCE is the same as current sections (17-81-xxx).

Section Crosswalk:
- § 17-41-101 → § 17-81-101 (Definitions)
- § 17-41-501 → § 17-81-401 (Vested Mining Use)
- § 17-41-502 → § 17-81-402 (Rights of Mine Operator)
- § 17-41-503 → § 17-81-403 (Abandonment)

## APPLICABLE STATUTES

### § 17-81-101(13) [formerly § 17-41-101(13)] — "Mine Operator" Definition
Effective: May 14, 2019 (HB288)

"Mine operator" means a natural person, corporation, association, partnership, receiver, trustee, executor, administrator, guardian, fiduciary, agent, or other organization or representative, either public or private, including a SUCCESSOR, ASSIGN, AFFILIATE, SUBSIDIARY, and RELATED PARENT COMPANY, that, ON OR BEFORE JANUARY 1, 2019:
(a) owns, controls, or manages a mining use under a large mine permit; AND
(b) has produced commercial quantities of a mineral deposit.

---

### § 17-81-401 [formerly § 17-41-501] — Vested Mining Use
Effective: January 1, 2009 (original); amended May 14, 2019

(1)(a) A mining use is CONCLUSIVELY PRESUMED to be a vested mining use if the mining use existed or was conducted or otherwise engaged in BEFORE a political subdivision prohibits, restricts, or otherwise limits the mining use.

(1)(b) Anyone claiming that a vested mining use has NOT been established has the BURDEN OF PROOF to show by CLEAR AND CONVINCING EVIDENCE that the vested mining use has not been established.

(2)(a) A vested mining use RUNS WITH THE LAND.

(2)(b) A vested mining use may be CHANGED TO ANOTHER MINING USE without losing its status as a vested mining use.

(3) The present or future boundary described in the large mine permit of a mine operator with a vested mining use does NOT LIMIT:
(a) the scope of the mine operator's rights under this chapter; or
(b) the protection that this chapter provides for a mining protection area.

---

## BINDING PRECEDENT

### Western Land Equities, Inc. v. City of Logan, 617 P.2d 388 (Utah 1980)
Court: Utah Supreme Court | Status: GOOD LAW

BINDING HOLDING: "An applicant is ENTITLED to favorable action if the application conforms to the zoning ordinance in effect at the time of the application."

This establishes Utah's vested rights doctrine. Local government must "act in good faith."

---

### Gibbons & Reed Co. v. North Salt Lake City, 431 P.2d 559 (Utah 1967)
Court: Utah Supreme Court | Status: GOOD LAW

BINDING HOLDING: "Doctrine of diminishing assets" — legal nonconforming extractive uses can expand beyond original boundaries because "the very nature and use of an extractive business contemplates continuance of such use of the entire parcel."

This is Utah's foundation for mining expansion rights.

---

## QUALITY REQUIREMENTS

1. VERBATIM QUOTES: You MUST quote statutes exactly as written above. Never paraphrase.
2. HOLDINGS vs DICTA: When citing cases, specify whether you are citing a HOLDING (binding) or DICTA (not binding).
3. TEMPORAL APPLICATION: Apply the 2019 version of statutes to 2019 events.
4. IMPARTIALITY: Analyze both parties' positions without advocacy.
```

---

## Appendix B: Jurisdiction Seed Data (US States)

```sql
-- Seed US state jurisdictions
INSERT INTO jurisdictions (code, name, level, parent_id, path, legal_system) VALUES
('US', 'United States', 'country', NULL, 'US', 'common_law'),
('US-FED', 'United States Federal', 'federal', (SELECT id FROM jurisdictions WHERE code = 'US'), 'US.FED', 'common_law'),
('US-AL', 'Alabama', 'state', (SELECT id FROM jurisdictions WHERE code = 'US'), 'US.AL', 'common_law'),
('US-AK', 'Alaska', 'state', (SELECT id FROM jurisdictions WHERE code = 'US'), 'US.AK', 'common_law'),
('US-AZ', 'Arizona', 'state', (SELECT id FROM jurisdictions WHERE code = 'US'), 'US.AZ', 'common_law'),
-- ... all 50 states
('US-UT', 'Utah', 'state', (SELECT id FROM jurisdictions WHERE code = 'US'), 'US.UT', 'common_law'),
('US-UT-SALT_LAKE', 'Salt Lake County, Utah', 'county', (SELECT id FROM jurisdictions WHERE code = 'US-UT'), 'US.UT.SALT_LAKE', 'common_law'),
('US-UT-SLC', 'Salt Lake City, Utah', 'city', (SELECT id FROM jurisdictions WHERE code = 'US-UT-SALT_LAKE'), 'US.UT.SALT_LAKE.SLC', 'common_law');
-- ... continue for all states and major counties
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-13 | Platform Architecture Team | Initial draft |

---

*This document serves as the comprehensive technical specification for CaseBrake.ai Judge Enablement. Implementation teams should reference this document for all judge-related features.*
