# CaseCraft - Legal Simulation Platform

## Overview
CaseCraft is a legal simulation platform that allows users to practice case strategy with AI-powered agents. It enables running mock hearings, depositions, and strategy sessions with intelligent legal personas.

## Tech Stack
- **Framework**: Next.js 16.1.3 with React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI API, Vercel AI SDK
- **Vector Search**: Pinecone (optional, for document RAG)
- **State Management**: Zustand

## Project Structure
```
src/
├── app/           # Next.js App Router pages
│   ├── api/       # API routes
│   ├── (auth)/    # Authentication pages
│   ├── (dashboard)/ # Dashboard pages
│   └── case/      # Case-related pages
├── components/    # React components
├── lib/           # Utility functions and configurations
│   └── supabase/  # Supabase client configuration
└── middleware.ts  # Auth middleware
```

## Environment Variables
Required secrets (configured in Replit Secrets):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key

Optional:
- `PINECONE_API_KEY` - For document RAG features
- `PINECONE_INDEX_NAME` - Pinecone index name

## Running the Project
The development server runs on port 5000:
```bash
npm run dev -- -p 5000 -H 0.0.0.0
```

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
