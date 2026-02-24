# CaseCraft - Legal Agent Simulation Platform

AI-powered legal simulation platform for running mock hearings, depositions, and strategy sessions with intelligent legal personas.

## Features

- **Multi-Agent Legal Simulation**: Configure AI agents (Judge, Plaintiff Attorney, Defense Attorney, etc.) with customizable personas
- **Document RAG**: Upload case documents, auto-embed with OpenAI, and have agents reference them during conversations
- **Case Management**: Track cases, facts, documents, and conversations
- **Streaming Chat**: Real-time streaming responses via AI SDK
- **Professional UI**: Navy/Gold legal aesthetic with shadcn/ui components

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| LLM | OpenAI GPT-4o |
| Embeddings | text-embedding-3-small |
| Streaming | AI SDK |

## Setup

### 1. Clone and Install

```bash
cd casecraft
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for embeddings)
- `OPENAI_API_KEY` - OpenAI API key

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable the Vector extension in SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run the migration file `supabase/migrations/001_initial_schema.sql` in the SQL Editor
4. Create a storage bucket named `case-documents`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
casecraft/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, Signup pages
│   │   ├── (dashboard)/      # Dashboard layout & page
│   │   ├── case/[id]/        # Case detail with tabs
│   │   ├── api/              # API routes
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── ui/               # shadcn components
│   │   ├── cases/            # Case components
│   │   ├── agents/           # Agent configuration
│   │   ├── documents/        # Document management
│   │   ├── chat/             # Chat interface
│   │   └── facts/            # Facts management
│   └── lib/
│       ├── supabase/         # Supabase clients
│       ├── ai/               # AI services (embeddings, prompts)
│       └── types.ts          # TypeScript types
├── supabase/
│   └── migrations/           # Database schema
└── .env.example
```

## Agent Roles

| Role | Temperature | Purpose |
|------|-------------|---------|
| Judge | 0.6 | Impartial rulings, procedural guidance |
| Plaintiff Attorney | 0.7 | Zealous advocacy for plaintiff |
| Defense Attorney | 0.7 | Protect defendant's rights |
| Court Clerk | 0.4 | Procedural tracking, deadlines |
| Expert Witness | 0.5 | Technical opinions |
| Mediator | 0.7 | Settlement facilitation |

## Usage

1. **Create Account**: Sign up at `/signup`
2. **Create Case**: Click "New Case" and fill in details
3. **Configure Agents**: Customize agent personas and temperatures
4. **Upload Documents**: Add case documents (text content for RAG)
5. **Add Facts**: Document key facts for agent context
6. **Start Conversation**: Create a new conversation and chat with agents

## API Routes

- `GET/POST /api/cases` - List and create cases
- `GET/PATCH/DELETE /api/cases/[id]` - Case CRUD
- `GET/POST /api/cases/[id]/agents` - Agent management
- `GET/POST /api/cases/[id]/documents` - Document management
- `POST /api/cases/[id]/documents/[docId]/embed` - Trigger embedding
- `GET/POST /api/cases/[id]/facts` - Facts management
- `GET/POST /api/cases/[id]/conversations` - Conversation management
- `POST /api/chat` - Streaming chat endpoint

## Deployment

### Replit

1. Import the repository into Replit
2. Set environment variables in the Replit Secrets tab
3. Run `npm run build && npm start` or use the dev server with `npm run dev`

## License

This software is proprietary and confidential. All rights reserved. Unauthorized copying, distribution, or modification of this software is strictly prohibited.
