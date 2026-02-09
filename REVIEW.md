# CaseCraft - Codebase Review Report

**Date:** 2026-02-09
**Reviewed by:** Claude (Automated Review)
**Branch:** `claude/review-and-report-uhyD3`

---

## Executive Summary

CaseCraft is an AI-powered legal simulation platform built with Next.js 15, React 19, TypeScript, Supabase, and OpenAI. The codebase is well-structured and demonstrates strong architectural choices, but has several issues that need attention before production use:

| Category | Severity | Count |
|----------|----------|-------|
| Build broken | **CRITICAL** | 1 |
| Security vulnerabilities | **CRITICAL** | 8+ endpoints |
| Test coverage gaps | **HIGH** | ~3% coverage |
| Code quality issues | **MEDIUM** | 30+ items |

---

## 1. BUILD STATUS: BROKEN

The project **does not build** due to a missing export.

**Error:**
```
./src/app/api/cases/route.ts:7:1
Export caseTypes doesn't exist in target module
```

**Root cause:** `src/app/api/cases/route.ts:7` imports `{ caseTypes }` from `@/lib/validations/case`, but `caseTypes` is declared as a non-exported `const` in `src/lib/validations/case.ts:4`. The route also redeclares its own `createCaseSchema` (line 8) that duplicates the one already exported from the validation module.

**Fix:** Either export `caseTypes` from the validation module, or refactor the API route to use the existing `createCaseSchema` export instead of reimplementing it.

---

## 2. Security Vulnerabilities

### 2.1 CRITICAL: Missing Case Ownership Verification

**8+ API endpoints** allow any authenticated user to access or modify cases they don't own. The database queries fetch cases by ID without filtering by `user_id`.

| Endpoint | File | Issue |
|----------|------|-------|
| `GET/PATCH/DELETE /api/cases/[id]` | `src/app/api/cases/[id]/route.ts` | No `user_id` filter |
| `POST /api/cases/[id]/predict` | `src/app/api/cases/[id]/predict/route.ts` | No ownership check |
| `POST /api/cases/[id]/simulate` | `src/app/api/cases/[id]/simulate/route.ts` | No ownership check |
| `POST /api/cases/[id]/reveal` | `src/app/api/cases/[id]/reveal/route.ts` | Case fetched without `user_id` |
| `POST /api/cases/[id]/weaknesses` | `src/app/api/cases/[id]/weaknesses/route.ts` | No ownership check |
| `POST /api/cases/[id]/turbo` | `src/app/api/cases/[id]/turbo/route.ts` | No ownership check |
| `POST /api/cases/[id]/verify` | `src/app/api/cases/[id]/verify/route.ts` | No ownership check |
| `POST /api/chat` | `src/app/api/chat/route.ts` | Case/agent fetched without ownership |
| `POST /api/hearing` | `src/app/api/hearing/route.ts` | Case fetched without ownership |

**Impact:** User A can read, modify, predict, simulate, and delete User B's cases.

### 2.2 CRITICAL: Dev Bypass Endpoint

`src/app/api/dev-bypass/route.ts` sets a `dev_bypass` cookie with:
- No authentication required
- `httpOnly: false` (accessible to JavaScript/XSS)
- `secure: false` (sent over HTTP)
- 7-day expiration

This endpoint should be removed or restricted to development environments only.

### 2.3 HIGH: Database Error Exposure

20+ instances across 11 API files return `error.message` from Supabase errors directly to clients, leaking table names, query structure, and constraint details.

### 2.4 HIGH: Missing Input Validation

- `POST /api/chat` (`src/app/api/chat/route.ts:30`) — no schema validation on request body
- `POST /api/hearing` (`src/app/api/hearing/route.ts:36`) — no validation; `max_turns` could be negative or extremely large
- `POST /api/tts` (`src/app/api/tts/route.ts:15`) — no text length validation

### 2.5 MEDIUM: No Rate Limiting

All AI-powered endpoints (`/predict`, `/simulate`, `/turbo`, `/hearing`, `/chat`) lack rate limiting. With `maxDuration` values up to 300 seconds, this creates resource exhaustion and cost risks against OpenAI API billing.

---

## 3. Test Coverage

### Current State: ~3.7% coverage (3 test files for 80+ modules)

| Category | Modules | Tested | Coverage |
|----------|---------|--------|----------|
| API Routes | 19 | 0 | 0% |
| AI Modules | 5+ | 0 | 0% |
| Error Handling | 1 (285 LOC) | 0 | 0% |
| Validation Schemas | 3+ | 0 | 0% |
| Components | 52 | 2 | 3.8% |
| Utilities | 1 | 1 | 100% |

### Existing Tests

1. **`src/__tests__/lib/utils.test.ts`** (21 tests) — Comprehensive and well-written. Tests `cn()` utility with edge cases.
2. **`src/__tests__/components/create-case-dialog.test.tsx`** (15 tests) — Only tests happy path. Missing validation edge cases and error states.
3. **`src/__tests__/components/dashboard.test.tsx`** (20 tests) — Heavy mocking with brittle chainable mock pattern. Missing auth and error testing.

### Critical Testing Gaps

- **Zero API route tests** — `jest.config.ts` line 32 explicitly excludes `src/app/api/**/*` from coverage collection, hiding this gap
- **Zero tests for AI integration** — embeddings, Pinecone search, prompt construction
- **Zero tests for auth flow** — login, signup, middleware protection
- **Zero tests for validation schemas** — case number regex, field validators

### Test Anti-Patterns

- Global fetch mock contamination across test files
- Chainable Supabase mock objects that are brittle and don't match real behavior
- No test fixtures or factory functions for test data
- No error scenario testing (401, 400, 500, timeout)

---

## 4. Code Quality

### 4.1 Hardcoded Configuration Values

Magic numbers scattered across the codebase with no centralized configuration:

**Pinecone search thresholds (inconsistent across endpoints):**
- `chat/route.ts:94` — `minScore: 0.55`, `topK: 8`
- `chat/route.ts:121` — `match_threshold: 0.6`
- `weaknesses/route.ts:129` — `minScore: 0.5`, `topK: 15`
- `verify/route.ts:109` — `minScore: 0.5`, `topK: 20`
- `turbo/route.ts:72` — `minScore: 0.5`, `topK: 3`
- `simulate/route.ts:125` — `minScore: 0.5`, `topK: 10`
- `predict/route.ts:126` — `minScore: 0.6`, `topK: 10`

**Temperature and token limits:**
- `predict/route.ts:223` — `temperature: 0.3`
- `simulate/route.ts:226` — `temperature: 0.5`
- `hearing-runner.tsx:136` — `maxOutputTokens: 1500`
- `predict/route.ts:224` — `max_tokens: 4000`

**Recommendation:** Create `src/lib/constants.ts` for all threshold values.

### 4.2 Hardcoded Case Data

`src/components/hearing/hearing-runner.tsx:200-206` contains hardcoded case-specific text:
```typescript
'Case: Tree Farm LLC v. Salt Lake County\n'
'Case No: 220902840\n'
```
This should be parameterized.

### 4.3 Large Files Needing Decomposition

| File | Lines | Issue |
|------|-------|-------|
| `components/agents/agents-list.tsx` | 654 | Contains 3+ sub-components (AddAgentDialog, EditAgentDialog, QuickChatDialog) |
| `lib/pdf/case-report-pdf.ts` | 469 | Complex PDF generation monolith |
| `components/hearing/hearing-runner.tsx` | 444 | Mixes orchestration logic with UI |
| `components/predictions/blind-prediction.tsx` | 440 | Multiple prediction modes in one file |
| `components/documents/drag-drop-upload.tsx` | 428 | Upload + embedding + file handling combined |
| `components/simulation/mock-trial-chat.tsx` | 409 | Chat + simulation logic interleaved |
| `components/cases/create-case-dialog.tsx` | 409 | Form + validation + API logic |

### 4.4 Console Statements in Production

30+ `console.error`, `console.log`, and `console.warn` statements across components and API routes. These should be replaced with a structured logging utility.

### 4.5 Type Safety Issues

- Frequent `as` type assertions without type guards (`agents-list.tsx:144,155,292,471`, `chat/route.ts:33`, `hearing-runner.tsx:164`)
- Unsafe DOM element casts (`global-keyboard-shortcuts.tsx:15,28,41`)
- FormData casting without validation (`documents/route.ts:97-99`)

### 4.6 Async/Promise Issues

- `src/components/documents/drag-drop-upload.tsx:109` — `Promise.all()` in fire-and-forget pattern without await
- `src/app/api/cases/[id]/documents/route.ts:151-153` — Storage cleanup lacks proper error handling

---

## 5. Architecture Notes

### Strengths
- Clean Next.js App Router structure with proper route grouping (`(auth)`, `(dashboard)`)
- Good separation of concerns: components, lib, API routes
- Proper use of Supabase SSR client for server components
- AI SDK streaming integration is well-implemented
- Zod validation schemas exist (though not fully utilized)
- TypeScript types are comprehensive in `src/lib/types.ts`

### Concerns
- No error boundary components around major page routes
- No middleware-level auth pattern — each API route handles auth independently
- Database schema uses pgvector but also integrates Pinecone, creating dual vector storage complexity
- No environment variable validation at startup

---

## 6. Recommended Priority Actions

### P0 — Fix Build
1. Export `caseTypes` from `src/lib/validations/case.ts` or refactor the import in `src/app/api/cases/route.ts`

### P1 — Security Fixes
2. Add `user_id` ownership filters to all case-related API queries
3. Remove or gate the `/api/dev-bypass` endpoint
4. Replace `error.message` exposure with generic error responses
5. Add Zod validation to `/api/chat`, `/api/hearing`, and `/api/tts` request bodies

### P2 — Testing Foundation
6. Remove the API route exclusion from `jest.config.ts` coverage collection
7. Add tests for API authentication checks (every route returns 401 without auth)
8. Add tests for validation schemas (case number patterns, field limits)
9. Add tests for the error handling system (`src/lib/api-error.ts`)

### P3 — Code Quality
10. Create `src/lib/constants.ts` for search thresholds, temperature values, and token limits
11. Replace console statements with a logging utility
12. Split large component files (agents-list, hearing-runner, blind-prediction)
13. Add rate limiting middleware for AI-powered endpoints

---

*Report generated from automated codebase analysis. Manual verification recommended for all findings.*
