import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
vi.stubEnv('OPENAI_API_KEY', 'sk-test-key')
vi.stubEnv('PINECONE_API_KEY', 'test-pinecone-key')
vi.stubEnv('PINECONE_INDEX_NAME', 'test-index')

// Mock OpenAI as a proper class constructor
vi.mock('openai', () => {
  const MockOpenAI = class {
    embeddings = {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }],
      }),
    }
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mocked response' } }],
        }),
      },
    }
  }
  return { default: MockOpenAI }
})

// Mock Pinecone as a proper class constructor
vi.mock('@pinecone-database/pinecone', () => {
  const MockPinecone = class {
    index = vi.fn().mockReturnValue({
      namespace: vi.fn().mockReturnValue({
        query: vi.fn().mockResolvedValue({ matches: [] }),
      }),
    })
  }
  return { Pinecone: MockPinecone }
})
