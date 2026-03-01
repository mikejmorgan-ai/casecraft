# CaseCraft Development Handoff

**Last Updated**: 2026-02-13
**Session**: `session_018WihwqUkhYQ8rPmebe7zvn`
**Branch**: `claude/review-repo-next-steps-Blfe0`

---

## Project Overview

**CaseCraft** is an AI-powered legal case simulation platform for attorneys to practice litigation strategies through mock hearings, depositions, and strategy sessions with intelligent AI legal personas.

### Current Status
- **Milestone**: 2 (Case Management) - In Progress
- **MVP Target**: Milestone 3
- **Launch ETA**: Q2 2026
- **Test Coverage**: 89 tests passing (5 test suites)

---

## Tech Stack Summary

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Frontend | React 19.2, Tailwind CSS 4, shadcn/ui |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth + Google OAuth |
| Vector Search | Pinecone (39K+ documents) |
| LLM | OpenAI GPT-4o |
| Embeddings | text-embedding-3-small |
| Streaming | Vercel AI SDK v6 |
| TTS | OpenAI TTS + ElevenLabs |
| State | Zustand |
| Testing | Jest + React Testing Library |

---

## What Was Accomplished This Session

### 1. Fixed Failing Tests
- Added `cookies` mock from `next/headers` to dashboard tests
- Added `user_profiles` table mock to Supabase chain
- Updated test expectations to match current role-based dashboard output

### 2. Expanded Test Coverage (+37 tests)
- `facts-list.test.tsx` - 20 tests (CRUD, categories, validation, empty states)
- `conversations-list.test.tsx` - 17 tests (create, delete, navigation, dialogs)

### 3. Fixed Bug
- **File**: `src/components/facts/facts-list.tsx:218`
- **Issue**: Radix Select component rejected empty string value
- **Fix**: Changed `value=""` to `value="none"` for "None" option

### 4. Enhanced Documentation
- Updated `README.md` with testing instructions, API routes, keyboard shortcuts
- Added development workflow and contributing guidelines

---

## Key Files & Locations

### Core Application
```
src/app/
├── (auth)/                 # Login, Signup, Password reset
├── (dashboard)/dashboard/  # Main dashboard (role-based views)
├── case/[id]/              # Case detail pages with tabs
└── api/                    # 20+ API routes
```

### Components (62 total)
```
src/components/
├── agents/          # Agent configuration & management
├── cases/           # Case CRUD, templates, wizards
├── chat/            # Chat interface & conversations
├── documents/       # Document upload, management
├── facts/           # Case facts management
├── hearing/         # Hearing simulation runner
├── predictions/     # Blind prediction & comparison
├── analysis/        # Weakness analysis
├── dashboard/       # Role-based dashboard views
└── ui/              # shadcn/ui components
```

### AI & Services
```
src/lib/
├── ai/              # Prompts, embeddings, system prompts
├── supabase/        # Database clients
├── pinecone/        # Vector search
├── auth/            # RBAC utilities
├── pdf/             # PDF generation
├── voice/           # TTS integration
└── legal/           # Utah mining law knowledge base
```

### Tests
```
src/__tests__/
├── lib/utils.test.ts                    # 21 tests
├── components/dashboard.test.tsx        # 16 tests
├── components/create-case-dialog.test.tsx # 15 tests
├── components/facts-list.test.tsx       # 20 tests
└── components/conversations-list.test.tsx # 17 tests
```

---

## Agent Roles Available

| Role | Temperature | Purpose |
|------|-------------|---------|
| Judge | 0.6 | Impartial rulings, procedural guidance |
| Plaintiff Attorney | 0.7 | Zealous advocacy |
| Defense Attorney | 0.7 | Protect defendant's rights |
| Court Clerk | 0.4 | Procedural tracking |
| Witness | 0.6 | Testimony |
| Expert Witness | 0.5 | Technical opinions |
| Mediator | 0.7 | Settlement facilitation |
| Law Clerk | 0.5 | Legal research |
| County Recorder | 0.3 | Title/deed tracking |
| DOGM Agent | 0.4 | Mining permit regulatory |

---

## API Routes Reference

### Cases
- `GET/POST /api/cases` - List/create
- `GET/PATCH/DELETE /api/cases/[id]` - CRUD

### Case Resources
- `/api/cases/[id]/agents` - Agent management
- `/api/cases/[id]/documents` - Document management
- `/api/cases/[id]/documents/[docId]/embed` - Trigger embedding
- `/api/cases/[id]/documents/import-pinecone` - Bulk import
- `/api/cases/[id]/facts` - Facts management
- `/api/cases/[id]/conversations` - Conversations

### AI Features
- `POST /api/chat` - Streaming chat
- `POST /api/cases/[id]/predict` - Outcome prediction
- `POST /api/cases/[id]/weaknesses` - Weakness analysis
- `POST /api/cases/[id]/verify` - Claim verification
- `POST /api/cases/[id]/reveal` - Reveal actual ruling

### Simulation
- `POST /api/hearing` - Hearing orchestration
- `POST /api/cases/[id]/simulate` - Run simulation
- `POST /api/tts` - Text-to-speech

---

## Recommended Next Steps

### High Priority
1. **Add API Route Tests** - No API tests exist currently
2. **Add Integration Tests** - End-to-end workflow testing
3. **Implement Monte Carlo Prediction Mode** - Referenced but incomplete
4. **Add Error Logging Service** - Generic errors currently

### Medium Priority
5. **Add Caching Layer** - No caching for frequently accessed data
6. **Optimize Pinecone Queries** - Hardcoded to 10-15 results
7. **Add Document Size Validation** - No limits enforced
8. **Implement Feature Flags** - Beta features not clearly marked

### Lower Priority
9. **Add ARIA Labels** - Accessibility improvements
10. **Add OpenAPI Documentation** - No API docs
11. **Mobile Testing** - Responsive but not thoroughly tested
12. **Real-time Collaboration** - Case sharing exists but limited

---

## Environment Variables Needed

### Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=
```

### Optional
```
ELEVENLABS_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Database Migrations

Run in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_add_agent_roles.sql`
3. `supabase/migrations/003_blind_prediction.sql`
4. `supabase/migrations/004_rbac.sql`

---

## Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint

# Testing
npm test             # Run all tests
npm run test:watch   # Watch mode
npm test -- <file>   # Specific file
```

---

## Known Issues

1. **Build Warning**: "middleware" file convention deprecated (use "proxy")
2. **Google Fonts**: May fail in offline environments
3. **React act() Warnings**: In create-case-dialog tests (non-blocking)

---

## Recent Commits

```
617aa6d Expand test coverage and improve documentation
d92cbd8 Fix all ESLint errors for clean build
1afa9d9 Remove Vercel deployment references
e55eaac Merge feature branch with improved UI/UX
f824d6b Major homepage overhaul with Google OAuth
```

---

## Contact & Resources

- **Repository**: mikejmorgan-ai/casecraft
- **Current Branch**: `claude/review-repo-next-steps-Blfe0`
- **Milestones**: See `MILESTONES.json`
