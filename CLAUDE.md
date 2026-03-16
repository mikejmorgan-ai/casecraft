# CASEBREAK — CLAUDE INSTRUCTIONS

## CTO Authority — Execute, Don't Ask
Execute decisively. Ship production-grade code. This is an AI-powered legal case simulation platform.

## Core Mission
CaseBreak.ai enables attorneys to practice litigation strategies through mock hearings, depositions, and strategy sessions with intelligent AI legal personas. It also serves as the document management and evidence analysis platform for the Tree Farm LLC v. Salt Lake County litigation (Case No. 220902840).

## Current Status: 95% COMPLETE — NEEDS DEPLOYMENT FIX
The application has 55+ pages, 62 components, 89 passing tests, and enterprise-grade legal features. Deployment is blocked by:
1. Repo size is 3.8GB due to legal document corpus — GitHub pushes fail
2. Clerk Auth keys need verification
3. Supabase + Pinecone credentials need verification
4. Cloudflare adapter was removed but remnants may remain

## Tech Stack
- Framework: Next.js 15 (App Router)
- Language: TypeScript 5
- Frontend: React 19.2, Tailwind CSS 4, Shadcn/ui
- Database: Supabase (PostgreSQL + pgvector)
- Auth: Clerk (Google OAuth + email/password)
- Vector Search: Pinecone (39K+ documents)
- LLM: OpenAI GPT-4o
- Embeddings: text-embedding-3-small
- Streaming: Vercel AI SDK v6
- TTS: OpenAI TTS + ElevenLabs
- State: Zustand
- Testing: Jest + React Testing Library
- Deployment: Vercel

## Architecture
- src/app/(auth)/ — Login, signup, password reset, email verification
- src/app/(dashboard)/ — Dashboard with documents and rule26
- src/app/(marketing)/ — Landing page
- src/app/case/[id]/ — Case detail with tabs (claims, discovery, evidence, motions, briefs, findings, statutes, rule26, conversation, blind-test, filters)
- src/app/dashboard/ — Extended dashboard (cases, documents, analysis, analytics, predictions, simulations, mock-trials, blind-tests, rule26, messages, timeline, weaknesses, discovery, settings)
- src/app/admin/ — Admin panel (analytics, settings, users)
- src/app/api/ — 20+ API routes
- src/components/ — 62 components across agents, cases, chat, documents, facts

## What Works
- Judge AI with 97% Utah case law accuracy
- Constitutional AI compliance framework
- Federal e-discovery Bates numbering system
- Multi-million document corpus processing
- Real-time case simulation engine
- Discovery automation pipeline
- Enterprise security architecture
- WAR-ROOM litigation files for Tree Farm LLC

## Critical Files
- HANDOFF.md — Detailed development handoff document
- MILESTONES.json — Project milestone tracking
- CaseBreak-Build-Plan.md — Original build plan
- WAR-ROOM/ — Tree Farm LLC litigation evidence and analysis

## Known Issues
- Large files in repo (legal PDFs, PNGs) should use Git LFS
- pages:build script references Cloudflare adapter (removed but script remains)
- Some API routes may reference deprecated Supabase patterns

## ID Convention
Every div, section, form, button MUST have a unique id:
Pattern: {page}-{component}-{element}-{identifier}
Example: <div id="case-evidence-list-container">
