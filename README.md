# CaseCraft - Legal Agent Simulation Platform

AI-powered legal simulation platform for running mock hearings, depositions, and strategy sessions with intelligent legal personas.

## Features

- **Multi-Agent Legal Simulation**: Configure AI agents (Judge, Plaintiff Attorney, Defense Attorney, etc.) with customizable personas
- **Document RAG**: Upload case documents, auto-embed with OpenAI, and have agents reference them during conversations
- **Case Management**: Track cases, facts, documents, and conversations
- **Streaming Chat**: Real-time streaming responses via AI SDK
- **Case Outcome Prediction**: AI-powered predictions with confidence scoring and key factors analysis
- **Blind Test Mode**: Make predictions before actual ruling is revealed for accuracy tracking
- **Weakness Analysis**: Identify evidence, legal, procedural, and strategic weaknesses
- **Text-to-Speech**: Audio playback of agent responses using OpenAI + ElevenLabs
- **Professional UI**: Navy/Gold legal aesthetic with shadcn/ui components

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth + Google OAuth |
| Storage | Supabase Storage |
| LLM | OpenAI GPT-4o |
| Embeddings | text-embedding-3-small |
| Vector Search | Pinecone |
| Streaming | Vercel AI SDK |
| State | Zustand |
| Testing | Jest + React Testing Library |

## Quick Start

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
- `PINECONE_API_KEY` - Pinecone API key (for vector search)
- `PINECONE_INDEX` - Pinecone index name

Optional variables:
- `ELEVENLABS_API_KEY` - ElevenLabs API key (for TTS)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable the Vector extension in SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_agent_roles.sql`
   - `supabase/migrations/003_blind_prediction.sql`
   - `supabase/migrations/004_rbac.sql`
4. Create a storage bucket named `case-documents`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest test suite |
| `npm run test:watch` | Run tests in watch mode |

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/__tests__/components/dashboard.test.tsx
```

### Test Coverage

The project includes tests for:
- Utility functions (`cn` class name merger)
- Dashboard component (role-based views, stats, empty states)
- Create Case dialog (form validation, API submission)
- Facts List component (CRUD operations, categories)
- Conversations List component (create, delete, navigation)

## Project Structure

```
casecraft/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, Signup, Password reset
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
│   │   ├── facts/            # Facts management
│   │   ├── hearing/          # Hearing simulation
│   │   ├── predictions/      # Prediction components
│   │   ├── analysis/         # Weakness analysis
│   │   └── dashboard/        # Role-based dashboards
│   ├── lib/
│   │   ├── supabase/         # Supabase clients
│   │   ├── pinecone/         # Pinecone vector search
│   │   ├── ai/               # AI services (embeddings, prompts)
│   │   ├── auth/             # RBAC utilities
│   │   ├── pdf/              # PDF generation
│   │   ├── voice/            # TTS integration
│   │   └── types.ts          # TypeScript types
│   └── __tests__/            # Jest test files
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
| Witness | 0.6 | Testimony based on facts |
| Expert Witness | 0.5 | Technical opinions |
| Mediator | 0.7 | Settlement facilitation |
| Law Clerk | 0.5 | Legal research assistance |
| County Recorder | 0.3 | Title and deed tracking |
| DOGM Agent | 0.4 | Mining permit regulatory knowledge |

## Usage

1. **Create Account**: Sign up at `/signup` or use Google OAuth
2. **Create Case**: Click "New Case" and fill in details
3. **Configure Agents**: Customize agent personas and temperatures
4. **Upload Documents**: Add case documents (auto-embedded for RAG)
5. **Add Facts**: Document key facts for agent context
6. **Start Conversation**: Create a new conversation and chat with agents
7. **Run Prediction**: Get AI-powered case outcome predictions
8. **Analyze Weaknesses**: Identify gaps in your case strategy

## API Routes

### Cases
- `GET/POST /api/cases` - List and create cases
- `GET/PATCH/DELETE /api/cases/[id]` - Case CRUD

### Case Resources
- `GET/POST /api/cases/[id]/agents` - Agent management
- `GET/POST /api/cases/[id]/documents` - Document management
- `POST /api/cases/[id]/documents/[docId]/embed` - Trigger embedding
- `POST /api/cases/[id]/documents/import-pinecone` - Import from Pinecone
- `GET/POST /api/cases/[id]/facts` - Facts management
- `GET/POST /api/cases/[id]/conversations` - Conversation management

### AI Features
- `POST /api/chat` - Streaming chat endpoint
- `POST /api/cases/[id]/predict` - Case outcome prediction
- `POST /api/cases/[id]/weaknesses` - Weakness analysis
- `POST /api/cases/[id]/verify` - Claim verification
- `POST /api/cases/[id]/reveal` - Reveal actual ruling

### Simulation
- `POST /api/hearing` - Hearing orchestration
- `POST /api/cases/[id]/simulate` - Run simulation
- `POST /api/cases/[id]/turbo` - Turbo simulation mode
- `POST /api/tts` - Text-to-speech

## Deployment

### Replit

1. Import the repository into Replit
2. Set environment variables in the Replit Secrets tab
3. Run `npm run build && npm start` or use the dev server with `npm run dev`

### Other Platforms

The app is a standard Next.js application and can be deployed to:
- Vercel
- Railway
- Docker
- Any Node.js hosting platform

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Quick Search |
| `Cmd/Ctrl + N` | New Case |
| `Cmd/Ctrl + P` | Run Prediction |
| `Cmd/Ctrl + /` | Shortcuts Help |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Submit a pull request

## License

MIT
