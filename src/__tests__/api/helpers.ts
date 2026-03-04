/**
 * Test helpers for API route testing.
 * Provides a configurable chainable Supabase mock and NextRequest builder.
 */
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChainResult {
  data: unknown
  error: unknown
}

interface ChainMock {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  delete: jest.Mock
  eq: jest.Mock
  order: jest.Mock
  single: jest.Mock
  // Allow setting the resolved value at any point in the chain
  _result: ChainResult
}

// ---------------------------------------------------------------------------
// Chainable Supabase mock
// ---------------------------------------------------------------------------

/**
 * Build a fresh chainable mock for `supabase.from(table)`.
 * Every chained method returns `this` so assertions like
 *   `.from('cases').select(...).eq(...).order(...)` resolve correctly.
 *
 * Set the result with `chain._result = { data: ..., error: ... }` before the
 * route handler runs.
 */
export function createChainMock(result: ChainResult = { data: null, error: null }): ChainMock {
  const chain: ChainMock = {
    _result: result,
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    single: jest.fn(),
  }

  // Every method returns the chain itself so calls can be chained in any order.
  // When awaited, the chain resolves with `_result` via a thenable.
  const proxy = new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') {
        // Make the chain thenable – this is what Supabase's PostgREST builder does.
        return (resolve: (v: ChainResult) => void) => resolve(target._result)
      }
      if (prop === '_result') return target._result
      const value = target[prop as keyof ChainMock]
      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          (value as jest.Mock)(...args)
          return proxy
        }
      }
      return value
    },
    set(target, prop, value) {
      if (prop === '_result') {
        target._result = value
        return true
      }
      return Reflect.set(target, prop, value)
    },
  })

  return proxy as unknown as ChainMock
}

/**
 * Create a full mock Supabase client.
 * `fromMocks` lets you pre-configure per-table chain mocks.
 * If a table isn't in `fromMocks`, a default empty-success chain is used.
 */
export function createMockSupabase(fromMocks: Record<string, ChainMock> = {}) {
  const defaultChain = createChainMock()
  const fromFn = jest.fn((table: string) => fromMocks[table] ?? defaultChain)

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
    from: fromFn,
    _chains: fromMocks,
    _defaultChain: defaultChain,
  }
}

// ---------------------------------------------------------------------------
// NextRequest builder
// ---------------------------------------------------------------------------

/**
 * Build a NextRequest with optional JSON body and query params.
 */
export function buildRequest(
  url: string,
  options: {
    method?: string
    body?: unknown
  } = {}
) {
  const { method = 'GET', body } = options
  const init: Parameters<typeof NextRequest>[1] = { method }

  if (body !== undefined) {
    init.body = JSON.stringify(body)
    init.headers = { 'Content-Type': 'application/json' }
  }

  return new NextRequest(new URL(url, 'http://localhost:3000'), init)
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

/** Parse a NextResponse body as JSON */
export async function parseResponse(response: Response) {
  return response.json()
}

// ---------------------------------------------------------------------------
// Mock user states
// ---------------------------------------------------------------------------

export const AUTHENTICATED_USER = {
  data: { user: { id: 'test-user-id', email: 'test@example.com' } },
  error: null,
}

export const UNAUTHENTICATED_USER = {
  data: { user: null },
  error: null,
}
