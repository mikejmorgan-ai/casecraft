# HANDOFF PROMPT FOR NEW CLAUDE CODE SESSION
## CaseCraft — Tree Farm LLC v. Salt Lake County
### February 24, 2026

---

## PROJECT OVERVIEW

CaseCraft is a legal case management platform with TWO parts:

1. **A Next.js web app** (`src/`) — AI-powered litigation simulation platform with Clerk auth, agents (Judge, attorneys, experts), document RAG via Pinecone, chat interface, predictions, and hearing simulations. Currently at Milestone 2 of a 7-phase build plan. 89 tests passing. Auth migrated from Supabase to Clerk (Supabase still used for database).

2. **A Python-based discovery analysis pipeline** (root `*.py` files + `binder/`) — Analyzes 5,576 Bates-stamped documents produced by Salt Lake County in Tree Farm LLC v. Salt Lake County (Case No. 220903418). Complete analysis exists in `binder/` with 8 PDFs ready for attorney use.

**Repo:** `mikejmorgan-ai/casecraft`
**Working directory:** `/home/user/casecraft`
**Current branch:** `main`
**Last commit:** `732cb56` — Auth migrated to Clerk, all dashboard pages built

---

## CRITICAL LEGAL STRATEGY CONTEXT

**The client's attorney (Kass) has directed a major strategic pivot.** In a February 21, 2026 strategy call, Kass revealed:

1. **The CIM (Critical Infrastructure Materials) argument was a deliberate decoy.** The Bateman letters citing Utah Code 17-41-402(6) were sent intentionally to divert the County's attention away from the real legal theory. The County took the bait.

2. **The real case is VESTED MINING RIGHTS** under Utah Code 17-41-501 through -503 (now 17-81-401 to -403). Tree Farm claims a mining operation existed prior to 1972 zoning, giving them vested rights that the County cannot extinguish.

3. **The 2002 Carrier decision** (Utah Supreme Court) ruled that sand and gravel extraction is not permitted under the Parley's Canyon zoning. The County staff was correct that they didn't need to prohibit it — but Tree Farm's argument is that their pre-existing operation predates that zoning, so they have vested rights regardless.

4. **Kass wants the analysis tools to EXCLUDE critical infrastructure materials** and focus exclusively on vested mining terminology: "vested mining rights", "mining protection area", "mine operator", "mining use", "vested mining use".

5. **Key question for the AI to answer:** Did the County's 5,576 documents contain ANY evidence that they knew about or discussed Tree Farm's vested mining rights? Kass suspects they were so focused on the CIM decoy that they never investigated this angle — which would be devastating for their defense.

**This pivot means Packet 3 (Vested Mining Use) is now the PRIMARY packet, not a secondary claim.** Packets 1 and 4 (CIM preemption and taking) become secondary/alternative arguments.

---

## WHAT HAS BEEN COMPLETED

### Discovery Analysis (100% complete on current methodology)
- All 5,576 documents scanned by `build_packets.py` using bracketed term matching
- Documents assigned to 6 litigation packets by cause of action
- MASTER_BINDER.md has deep narrative analysis with "Why Critical" / "Recommended Use" per key exhibit
- 333 document narratives enriched into the PDF packets

### PDF Packets (just rebuilt with 5 improvements)
- **Improvement 1:** Dropped all LOW relevance docs (removed noise)
- **Improvement 2:** Added plain-English argument summaries per packet
- **Improvement 3:** Grouped CRITICAL docs by legal element (subheadings)
- **Improvement 4:** Fixed truncated key phrases (80→200 chars, 60→150 chars)
- **Improvement 5:** Merged MASTER_BINDER narratives into CRITICAL doc entries
- PDFs in `binder/pdfs/` — 8 files, ~927KB total

### Web App
- Full Next.js 16 app with Clerk auth, 40+ API routes, 27 component directories
- Dashboard, case detail pages with 9 tabs, agent system, chat interface
- Discovery, evidence, findings, claims pages exist but need data population
- 89 tests passing across 5 test suites
- Tech stack: Next.js 16, React 19, Clerk (auth), Supabase (database), OpenAI, Pinecone, shadcn/ui, Tailwind

### Web App — Platform Polish (February 24, 2026)
- **Auth migrated from Supabase to Clerk** — 60+ files, ClerkProvider, clerkMiddleware(), Clerk SignIn/SignUp components
- All 12 missing dashboard pages built (Documents, Analysis, Simulations, Predictions, Weaknesses, Timeline, Discovery, Settings, Messages + 3 admin pages)
- Settings page tailored for Parr Brown: profile fields with bar number, jurisdiction, firm name
- Custom 404 page ("This matter has been dismissed"), breadcrumbs, loading skeletons
- New auth helper: `src/lib/auth/clerk.ts` with getSupabase(), getAuthUserId(), getUserProfile(), etc.
- `.env.example` created with Clerk + Supabase + OpenAI + Pinecone variables
- Zero `supabase.auth` calls remaining — Supabase used for database only
- All sidebar navigation links resolve to real pages
- TypeScript clean: 0 source code errors

---

## WHAT NEEDS TO HAPPEN NEXT

### Immediate

1. **Import discovery analysis into the web app database** — The Python analysis results are in markdown/PDFs but not yet in Supabase. The schema supports it (migrations 007-010 added claims, evidence, filter_key_terms tables).

2. **Run the 4 blind test cases to establish accuracy baseline** — Validate the AI agent predictions against known case outcomes.

3. **Add DOCX text extraction (mammoth.js)** — Enable the platform to ingest Word documents directly.

### Medium-term (platform development)

4. **Continue Phase 1 of the build plan** — Motion Analyzer, Brief Drafter, Utah Statute Expert agents.

5. **Integrate the statute database** — `src/lib/legal/utah-mining-statutes.ts` has comprehensive statute text including the November 2025 recodification (17-41-xxx → 17-81-xxx).

---

## KEY FILE LOCATIONS

### Analysis Scripts
- `build_packets.py` — Main packet builder (scans all 5,576 docs, assigns to 6 packets)
- `generate_pdfs.py` — PDF generator (reads packets markdown + MASTER_BINDER, outputs 8 PDFs)
- `binder/build_master.py` — Builds MASTER_BINDER.md from section files
- `bracketed_terms.py` — Exact phrase matching engine

### Analysis Output
- `binder/CAUSE_OF_ACTION_PACKETS.md` — 11,570 lines, complete packet assignments
- `binder/MASTER_BINDER.md` — 4,047 lines, deep narrative analysis with trial strategy
- `binder/pdfs/` — 8 PDF files ready for attorney use
- `binder/sections/` — 6 section files for claims 1 and 3
- `CLAIM_EVIDENCE_MAP.md` — Maps 55 key documents to 4 claims

### Discovery Documents
- `data/discovery-0001/` through `data/discovery-0006/` — 5,576 text files
- Files named `Tree Farm SLCo######.txt` (Bates range SLCo002489–SLCo018710)
- `bates_inventory.txt` — Complete Bates ID list

### Web App
- `src/app/` — Pages and API routes
- `src/components/` — 27 component directories
- `src/lib/legal/` — Utah statute database and bracketed terms
- `src/lib/types.ts` — Core type definitions
- `src/lib/auth/clerk.ts` — Clerk auth helpers (getSupabase, getAuthUserId, getUserProfile)
- `src/app/(dashboard)/dashboard/settings/page.tsx` — Settings page (Parr Brown customized)
- `.env.example` — Required environment variables for Clerk + Supabase
- `supabase/migrations/` — 10 migration files

### Configuration
- `README.md` — Project overview
- `CaseCraft-Build-Plan.md` — 7-phase roadmap
- `MILESTONES.json` — Current: Milestone 2
- `.env.example` — Required environment variables
- `components.json` — shadcn/ui config

---

## DATABASE SCHEMA

10 migrations in `supabase/migrations/`:
1. `001_initial_schema.sql` — Cases, agents, conversations, messages, documents, facts, predictions
2. `002_add_agent_roles.sql` — Agent role templates
3. `003_blind_prediction.sql` — Blind prediction mode
4. `004_rbac.sql` — Role-based access control
5. `005_add_statutory_quiz_conversation_type.sql` — Statute quiz
6. `006_retell_voice_calls.sql` — Voice integration tables
7. `007_claims_for_relief.sql` — Claims table
8. `008_claim_evidence.sql` — Evidence linking
9. `009_platform_enhancements.sql` — Platform enhancements
10. `010_filter_key_terms.sql` — Filter key terms

---

## PACKET STATISTICS (current, post-pivot)

| Packet | Cause of Action | Docs | CRITICAL | HIGH |
|--------|----------------|------|----------|------|
| 1 | Ordinance Invalid (CIM) | 1922 | 40 | 1281 |
| 2 | Permanent Injunction | 1694 | 9 | 9 |
| 3 | **Vested Mining Use** | **804** | **28** | **64** |
| 4 | Regulatory Taking | 1209 | 87 | 121 |
| 5 | County Counterclaim | 2175 | 91 | 168 |
| 6 | Unassigned | 2468 | — | — |

**Kass's strategic pivot has been IMPLEMENTED.** Packet 3 is primary. The 28 CRITICAL and 64 HIGH docs for vested mining are the core evidence. HB288 reclassified as "bill" (not "statute"), VMU statute numbers updated to 17-81-401 to -403. Kass wants to know if there are MORE docs about vested mining rights hiding in the 2,468 unassigned documents or misfiled in other packets.

---

## GIT STATE

- **Branch:** `main`
- **Last commit:** `732cb56` — Auth migrated to Clerk, all dashboard pages built
- **Working tree:** Clean
- **Tests:** 89 passing (5 suites)

---

## QUICK START

```bash
cd /home/user/casecraft
git status                    # Verify clean state
# Required: Set Clerk keys in .env.local (see .env.example)
python3 build_packets.py      # Rebuild packet analysis (~30 seconds)
python3 generate_pdfs.py      # Regenerate PDFs (~10 seconds)
npm test                      # Run web app tests
npm run dev                   # Start dev server
```
