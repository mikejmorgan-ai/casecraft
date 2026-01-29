# CASECRAFT DEVELOPMENT INSTRUCTIONS

## Architecture Overview

CaseCraft is a **Next.js 16 / Supabase** legal simulation platform enabling mock hearings, depositions, and case strategy sessions with AI-powered legal personas.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.1.3 (App Router) |
| **Language** | TypeScript 5 (strict mode) |
| **Database** | Supabase (PostgreSQL + pgvector) |
| **Vector Search** | Pinecone (primary) + Supabase pgvector (fallback) |
| **AI/LLM** | OpenAI GPT-4o, text-embedding-3-small |
| **Auth** | Supabase Auth + Row-Level Security |
| **Streaming** | Vercel AI SDK v6 |
| **UI** | Tailwind CSS 4 + Shadcn/UI |

---

## Core Methodology: AgenticSimLaw Protocol

### 7-Turn Debate Protocol

CaseCraft uses a structured **7-turn debate protocol** for hearing simulations:

1. **Opening** - Judge calls court to order
2. **Plaintiff Opening Statement** - Plaintiff attorney presents theory
3. **Defense Opening Statement** - Defense attorney responds
4. **Plaintiff Case-in-Chief** - Evidence and witness presentation
5. **Defense Case** - Counter-evidence and cross-examination
6. **Closing Arguments** - Both sides summarize
7. **Verdict/Ruling** - Judge issues decision

### Agent Grounding via RAG

All agents are grounded using **Retrieval-Augmented Generation (RAG)**, NOT fine-tuning:

```
User Query → Vector Search (Pinecone/pgvector) → Context Injection → LLM Response
```

**Why RAG over fine-tuning:**
- Case-specific context without model retraining
- Real-time document updates
- Role-based access control on document retrieval
- Citation tracking for every response

---

## Case Schema (JSON Structure)

All case data follows this structured schema:

```typescript
interface Case {
  id: string                  // UUID
  name: string                // "Smith v. Jones"
  case_number?: string        // "CV-2024-001234"
  case_type: CaseType         // civil, criminal, contract, etc.
  jurisdiction?: string       // "Utah State Court"
  status: CaseStatus          // draft, active, closed, archived
  summary?: string            // Case summary
  plaintiff_name?: string     // "John Smith"
  defendant_name?: string     // "ABC Corporation"
  filed_date?: string         // ISO date
  metadata?: Record<string, unknown>
}

type CaseType =
  | 'civil' | 'criminal' | 'family' | 'contract'
  | 'tort' | 'property' | 'constitutional' | 'administrative'

type CaseStatus = 'draft' | 'active' | 'closed' | 'archived'
```

---

## Agent Roles (10 Specialized Personas)

| Role | Temperature | Purpose |
|------|-------------|---------|
| `judge` | 0.6 | Impartial rulings, procedural guidance |
| `plaintiff_attorney` | 0.7 | Zealous advocacy for plaintiff |
| `defense_attorney` | 0.7 | Defend client rights |
| `court_clerk` | 0.4 | Procedural tracking |
| `witness` | 0.8 | Direct testimony |
| `expert_witness` | 0.5 | Technical opinions |
| `mediator` | 0.7 | Settlement facilitation |
| `law_clerk` | 0.3 | Statutory research |
| `county_recorder` | 0.3 | Property records |
| `dogm_agent` | 0.3 | Mining permits (Utah-specific) |

---

## API Endpoints

### Core CRUD
- `GET/POST /api/cases` - List/create cases
- `GET/PATCH/DELETE /api/cases/[id]` - Case CRUD
- `GET/POST /api/cases/[id]/agents` - Agent management
- `GET/POST /api/cases/[id]/documents` - Document management
- `GET/POST /api/cases/[id]/facts` - Case facts

### AI Operations (Rate Limited: 10 req/min)
- `POST /api/chat` - Streaming chat with RAG
- `POST /api/hearing` - Multi-agent hearing orchestration
- `POST /api/cases/[id]/simulate` - Full case simulation
- `POST /api/cases/[id]/turbo` - Quick case analysis
- `POST /api/tts` - Text-to-speech

---

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (single run)
npm run test:coverage # With coverage
```

---

## Database Schema (7 Tables)

All tables have Row-Level Security enabled:

1. **cases** - Core case records
2. **agents** - AI agent configurations per case
3. **documents** - Uploaded case documents
4. **document_chunks** - Vector embeddings (1536d)
5. **conversations** - Chat sessions
6. **messages** - Individual messages with citations
7. **case_facts** - Categorized facts (undisputed, disputed, etc.)

---

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
```

---

## Key Files Reference

| Purpose | Path |
|---------|------|
| Agent prompts | `src/lib/ai/prompts.ts` |
| Embedding logic | `src/lib/ai/embeddings.ts` |
| Pinecone search | `src/lib/pinecone/search.ts` |
| Hearing orchestrator | `src/lib/hearing/orchestrator.ts` |
| Rate limiting | `src/lib/rate-limit.ts` |
| Type definitions | `src/lib/types.ts` |
| Database migrations | `supabase/migrations/` |

---

## CI/CD Pipeline

GitHub Actions runs on all PRs:
1. **Lint** - ESLint checks
2. **Typecheck** - TypeScript compilation
3. **Test** - Vitest unit tests
4. **Build** - Production build verification

---

## Coding Standards

- **TypeScript strict mode** - No `any` types
- **Zod validation** - All API inputs validated
- **RLS enforced** - All DB queries respect user auth
- **Rate limiting** - All AI endpoints protected
- **Error boundaries** - Graceful error handling
