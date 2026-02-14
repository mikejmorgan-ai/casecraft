# CaseCraft Build Plan v1.0
## Phased Execution Plan — From Pilot to Platform

**Owner:** Mike Morgan, CEO — AI Venture Holdings LLC
**Pilot Customer:** Jesse Lassley / Tree Farm LLC + Parr Brown Gee & Loveless
**Date:** February 14, 2026

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CaseCraft Platform                         │
├─────────────┬──────────────┬──────────────┬─────────────────┤
│  Agent Chat │ Motion       │ Brief        │ Voice           │
│  (existing) │ Analyzer     │ Drafter      │ (Retell + TTS)  │
├─────────────┴──────────────┴──────────────┴─────────────────┤
│              buildAgentSystemPrompt() Pipeline               │
│    Agent Prompt + Case Context + Facts + Document Chunks     │
├─────────────────────────────────────────────────────────────┤
│  OpenAI GPT-4o  │  Pinecone RAG  │  Utah Statutes Module    │
├─────────────────┴────────────────┴──────────────────────────┤
│              Supabase (Auth + PostgreSQL + RLS)               │
└─────────────────────────────────────────────────────────────┘
```

---

## PHASE 1: Jesse's Power Tools
**Goal:** Jesse pastes a defense motion → gets structured analysis → gets draft responsive brief → talks to the judge by voice

### 1A. Motion Analyzer Agent + API

**New Agent: `motion_analyzer`**

Add to `AGENT_ROLE_TEMPLATES` in `src/lib/ai/prompts.ts`:

```
Role: motion_analyzer
Name: Motion Analyzer
Temperature: 0.4
Icon: Search
```

System prompt must include:
- Instruction to receive pasted motion text and produce STRUCTURED analysis
- Output format: JSON-parseable sections (summary, opposing_arguments, strengths, weaknesses, procedural_issues, factual_misstatements, strategic_recommendations, suggested_citations, overall_assessment, response_strategy)
- Full Utah mining law context via getUtahMiningLawContext()
- Carrier v. Salt Lake County distinction framework (5 specific arguments)
- Instruction to identify every statutory citation in the motion and verify accuracy
- Instruction to flag any mischaracterization of holdings or selective quoting

**New API: `POST /api/motions/analyze`**

```typescript
// src/app/api/motions/analyze/route.ts
Request: { motionText: string, caseId: string, focusAreas?: string[] }
Response: MotionAnalysisResponse (structured JSON)
```

Pipeline:
1. Auth check (Supabase)
2. Fetch case context + facts from Supabase
3. Inject getUtahMiningLawContext() into system prompt
4. Call OpenAI with motion_analyzer system prompt + motion text as user message
5. Parse structured response
6. Store analysis in new `motion_analyses` table
7. Return structured JSON

**New UI: Motion Analysis Page**

Route: `/cases/[id]/motions`
- Textarea to paste motion text
- "Analyze" button
- Structured results display with collapsible sections
- Each section: summary, strengths (green), weaknesses (red), procedural issues (yellow), recommendations (blue)
- "Draft Response" button that feeds analysis into Brief Drafter

### 1B. Brief Drafter Agent + API

**New Agent: `brief_drafter`**

Add to `AGENT_ROLE_TEMPLATES`:

```
Role: brief_drafter
Name: Brief Drafter
Temperature: 0.5
Icon: FileEdit
```

System prompt must include:
- Instruction to produce draft legal brief language organized by section
- Output sections: caption, statement_of_facts, legal_argument (array of sections with headers and body), anticipated_counterarguments (each with rebuttal), proposed_relief, citations
- Full Utah mining law context
- Utah Rules of Civil Procedure formatting requirements
- Instruction to cite specific statutory sections with verbatim text
- Instruction to distinguish binding holdings from dicta
- Can accept a prior motion_analysis as input context

**New API: `POST /api/briefs/draft`**

```typescript
// src/app/api/briefs/draft/route.ts
Request: { caseId: string, briefType: string, topic: string, arguments: string[], analysisId?: string, targetLength?: string }
Response: BriefDraftResponse (structured JSON with sections)
```

Pipeline:
1. Auth check
2. Fetch case context + facts
3. If analysisId provided, fetch prior motion analysis for context
4. Inject getUtahMiningLawContext()
5. Call OpenAI with brief_drafter prompt + request
6. Store draft in new `brief_drafts` table
7. Return structured JSON

**New UI: Brief Drafting Page**

Route: `/cases/[id]/briefs`
- Brief type selector (response, reply, opposition, memorandum, motion)
- Topic input
- Arguments list (add/remove)
- Optional: link to prior motion analysis
- "Draft Brief" button
- Results: formatted brief sections with copy-to-clipboard per section
- Export to DOCX button (uses jspdf or docx generation)

### 1C. Utah Statute Expert Agent

**New Agent: `statute_expert`**

Add to `AGENT_ROLE_TEMPLATES`:

```
Role: statute_expert
Name: Utah Statute Expert
Temperature: 0.3
Icon: BookMarked
```

System prompt must include:
- COMPLETE text of getUtahMiningLawContext()
- Full SECTION_CROSSWALK table
- Full AMENDMENT_TIMELINE
- HB288 details including sponsors, key provisions, legislative intent
- Instruction to ALWAYS quote statutes verbatim, never paraphrase
- Instruction to ALWAYS provide both old and new section numbers
- Instruction to identify effective dates for any provision cited
- Instruction to explain amendment history when relevant
- Knowledge of "before January 1, 2019" vs "as of January 1, 2019" interpretation dispute
- Knowledge that Carrier v. Salt Lake County (2004) was decided under PRE-HB288 law

### 1D. Enhance Existing Agent Prompts

**Plaintiff Attorney — Add Tree Farm specific arguments:**
- 5 Carrier distinction arguments:
  1. Carrier had no mine permit; Tree Farm has 1996 Large Mine Permit
  2. Carrier decided under pre-HB288 statute; current statute is materially different
  3. "Conclusive presumption" language not in Carrier-era statute
  4. Limestone quarrying vs gravel stockpiling = categorically different mining uses
  5. Corporate succession: Portland Cement (1896) → Ideal → Holnam → Lone Star → Tree Farm
- Government overreach framework
- Vested rights expansion under § 17-41-502
- State preemption argument under § 17-41-402

**Defense Attorney — Add litigation strategy depth:**
- Carrier controls argument with specific holdings
- "As of January 1, 2019" interpretation (continuous operations required)
- Regulatory taking defense (Penn Central factors)
- Zoning authority under police power
- Challenge to successor chain documentation

**Judge Stormont — Add:**
- Explicit instruction to recognize both old and new section numbers in any motion text pasted
- Carrier case analysis framework (what it held, what it didn't hold, how 2019 amendments change the analysis)

### 1E. TypeScript Types Update

In `src/lib/types.ts`, expand `AgentRole`:

```typescript
export type AgentRole =
  | 'judge' | 'plaintiff_attorney' | 'defense_attorney'
  | 'court_clerk' | 'witness' | 'expert_witness'
  | 'mediator' | 'law_clerk' | 'county_recorder' | 'dogm_agent'
  // Phase 1 additions:
  | 'motion_analyzer' | 'brief_drafter' | 'statute_expert'
  // Phase 2 additions:
  | 'case_researcher' | 'regulatory_analyst'
  | 'appeals_analyst' | 'ombudsman'
  | 'title_officer' | 'appraiser'
```

### 1F. Database Migrations

```sql
-- New tables for Phase 1

CREATE TABLE motion_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  motion_text TEXT NOT NULL,
  analysis JSONB NOT NULL,
  focus_areas TEXT[],
  agent_id UUID REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brief_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  brief_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  arguments TEXT[],
  analysis_id UUID REFERENCES motion_analyses(id),
  draft JSONB NOT NULL,
  agent_id UUID REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE motion_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own motion analyses"
  ON motion_analyses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own brief drafts"
  ON brief_drafts FOR ALL USING (auth.uid() = user_id);
```

### Phase 1 Validation Checkpoint
Jesse logs in → navigates to Tree Farm case → clicks "Analyze Motion" → pastes defense motion text → gets structured analysis with strengths, weaknesses, procedural issues, and citations to § 17-41-501 and Carrier → clicks "Draft Response" → gets draft brief language with statement of facts, legal argument, counterarguments, and proposed relief → opens chat with Judge Stormont → asks about § 17-41-501 interpretation → gets response citing verbatim statute text with both old and new section numbers → opens chat with Statute Expert → asks about HB288 amendment history → gets accurate timeline with effective dates

---

## PHASE 2: Complete Agent Roster (20 Agents)
**Goal:** All 20 agents operational with production-quality prompts

### New Agents to Build (7 remaining after Phase 1)

**Agent 14: `case_researcher`**
- Deep case law research agent
- Knows all Utah mining precedent from prompts.ts judge prompt
- Can distinguish holdings from dicta
- Finds analogous cases from other jurisdictions
- Temperature: 0.4, Icon: SearchCode

**Agent 15: `regulatory_analyst`**
- 5th Amendment takings analysis
- Penn Central three-factor test
- Lucas total taking
- Dolan nexus/proportionality
- Utah Constitution Art I § 22 (broader than federal)
- Temperature: 0.4, Icon: Scale

**Agent 16: `appeals_analyst`**
- Appellate preservation requirements
- Standards of review (de novo, clearly erroneous, abuse of discretion)
- Utah Court of Appeals / Supreme Court tendencies
- Issue framing for appellate briefing
- Temperature: 0.4, Icon: ArrowUpCircle

**Agent 17: `ombudsman`**
- Utah Office of Property Rights Ombudsman
- Advisory opinions on vested rights
- Government overreach patterns
- Land use regulation limits
- Temperature: 0.5, Icon: ShieldCheck

**Agent 18: `title_officer`**
- Chain of title analysis
- Mineral rights vs surface rights separation
- Corporate succession documentation
- Recorded declarations and entry numbers
- Temperature: 0.3, Icon: FileKey

**Agent 19: `appraiser`**
- Property valuation for mining operations
- Before/after analysis for takings claims
- Mineral deposit valuation methodology
- Highest and best use analysis
- Temperature: 0.4, Icon: DollarSign

**Agent 20: Fact Witness — Jesse Lassley (case-specific)**
- This is a case-specific agent, not a role template
- Created via the agent creation UI for the Tree Farm case
- Knows only what Jesse personally witnessed/knows
- Emotional about government overreach
- Temperature: 0.8

### Agent Category System

Add to types.ts:
```typescript
export type AgentCategory = 'courtroom' | 'government' | 'analysis' | 'operations' | 'strategic'
```

Add category metadata to AGENT_ROLE_TEMPLATES:
```typescript
// Each template gets a `category` field
judge: { category: 'courtroom', ... }
motion_analyzer: { category: 'analysis', ... }
```

### Agent Selector UI
- Grouped by category with headers
- Search/filter
- Favorite agents
- "Spin up" button creates agent instance for current case
- Agent cards show: name, role, category, description, temperature

### Phase 2 Validation
All 20 agent roles defined in prompts.ts → Agent selector shows categories → User can spin up any agent for any case → Each agent responds with domain-appropriate depth → Statute Expert quotes verbatim → Motion Analyzer produces structured JSON → Brief Drafter produces filing-ready sections

---

## PHASE 3: Document Processing Pipeline
**Goal:** Upload case documents (PDF, DOCX) → automatic chunking → Pinecone indexing → agents can cite specific documents

### Pipeline
1. File upload UI (drag-and-drop, multi-file)
2. Text extraction (pdf-parse for PDF, mammoth for DOCX)
3. Chunking with overlap (512 tokens, 64 token overlap)
4. Metadata extraction (document type, date, parties, authority level)
5. OpenAI embedding generation
6. Pinecone upsert with namespace = case_id
7. Authority level classification: statute > appellate_opinion > trial_order > motion > pleading > correspondence

### Document Types
- Motions and briefs filed by parties
- Court orders and rulings
- Deposition transcripts
- Expert reports
- Exhibits
- Correspondence

### RAG Enhancement
- When agents respond, include top-k document chunks in context
- Citation format: "[Doc: {filename}, p.{page}]"
- Agents instructed to cite specific documents when available

### Phase 3 Validation
Upload a 50-page PDF motion → system extracts text → chunks and indexes in Pinecone → chat with Judge Stormont → Judge cites specific pages from the uploaded document

---

## PHASE 4: Multi-Agent Simulation Engine
**Goal:** Run courtroom proceedings with multiple agents arguing, objecting, and ruling

### Simulation Modes
1. **Oral Argument** — Plaintiff argues, defense responds, judge questions, judge rules
2. **Cross-Examination** — Attorney questions witness, opposing counsel objects, judge rules on objections
3. **Motion Hearing** — Movant presents, opponent responds, judge rules
4. **Settlement Conference** — Mediator facilitates, parties negotiate

### Orchestration
- Turn-based with configurable turn order
- Automatic objection detection and ruling
- Transcript generation (exportable)
- Each agent sees only what they would see in real proceedings (no omniscient knowledge)

### Phase 4 Validation
Start oral argument simulation → Plaintiff Attorney argues vested mining rights → Defense Attorney responds with Carrier → Judge asks probing questions → Judge issues ruling citing statutes → Full transcript exportable as DOCX

---

## PHASE 5: Retell AI Voice Integration
**Goal:** Talk to any agent by voice via web call or phone call

### Architecture
- Custom LLM WebSocket server relays voice to OpenAI with agent system prompt
- Retell handles speech-to-text and text-to-speech
- Agent selection determines which system prompt loads
- Full case context injected into each voice session

### Components (already in progress in Claude Code)
- retell-sdk integration
- WebSocket server at `/api/voice/retell-ws`
- Voice agent registration API
- Voice call management (start, end, history)
- Web call UI component with agent selector
- Database tables: voice_agents, voice_calls

### Phase 5 Validation
Click "Call Judge Stormont" → browser microphone activates → speak question about § 17-41-501 → Judge responds by voice with accurate statutory analysis → call logged in database

---

## PHASE 6: Prediction Engine Enhancement
**Goal:** Claim-by-claim prediction with confidence scoring and weakness detection

### Blind Prediction
- Analyze each legal claim independently
- Confidence score per claim (0-100)
- Weakness detection with fix suggestions
- "Expand" deep-dive on any claim
- Verdict flip analysis (what would change the outcome)
- Monte Carlo simulation mode

### Phase 6 Validation
Run prediction on Tree Farm case → get per-claim breakdown → vested mining use claim shows 85%+ confidence → identify specific weaknesses in successor chain argument → suggest fixes with citations

---

## PHASE 7: Platform Generalization
**Goal:** Any law firm can create cases in any jurisdiction

### Multi-Jurisdiction Support
- Jurisdiction selector when creating a case
- Jurisdiction-specific statute modules (starting with Utah, then expand)
- Agent prompts accept jurisdiction context parameter
- Case law databases per jurisdiction

### Firm Management
- Firm accounts with multiple users
- Case assignment and access control
- Billing integration (usage-based per agent interaction)
- White-label capability

### Phase 7 Validation
New firm signs up → creates case in California → system loads California-specific agents → agents cite California statutes and case law → firm admin sees usage dashboard

---

## Database Schema Summary (All Phases)

### Existing Tables
cases, agents, conversations, messages, case_facts, predictions, simulation_runs

### Phase 1 New Tables
motion_analyses, brief_drafts

### Phase 5 New Tables (in progress)
voice_agents, voice_calls

### Phase 7 New Tables
firms, firm_users, jurisdictions, jurisdiction_statutes, billing_usage
