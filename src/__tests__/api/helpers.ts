/**
 * Shared test utilities for API route tests.
 *
 * IMPORTANT: The global jest.setup.tsx mocks `@/lib/supabase/server` with
 * `mockResolvedValue`. Because `clearMocks: true` is set in jest.config.ts,
 * every `beforeEach` clears those resolved values. To work around this, each
 * test file re-mocks `createServerSupabase` with `mockImplementation` (which
 * survives `clearAllMocks`).
 */

import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mock user helpers
// ---------------------------------------------------------------------------

export const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
}

/**
 * Returns a mock auth object that resolves to an authenticated user.
 */
export function mockAuthenticatedUser(mockAuthGetUser: jest.Mock) {
  mockAuthGetUser.mockResolvedValue({
    data: { user: TEST_USER },
    error: null,
  })
}

/**
 * Returns a mock auth object that resolves to no user (unauthenticated).
 */
export function mockUnauthenticatedUser(mockAuthGetUser: jest.Mock) {
  mockAuthGetUser.mockResolvedValue({
    data: { user: null },
    error: null,
  })
}

// ---------------------------------------------------------------------------
// Supabase chain mock helper
// ---------------------------------------------------------------------------

/**
 * Creates a mock Supabase query-builder chain that resolves to the given
 * `data` / `error` pair. Every chainable method (`select`, `insert`, etc.)
 * returns the same chain object so calls like
 *   `supabase.from('x').select('*').eq('id', id).single()`
 * work without additional setup.
 *
 * The chain is also a *thenable* so that bare `await supabase.from(...).select(...)`
 * (without `.single()`) resolves correctly.
 */
export function mockSupabaseChain(data: unknown, error: unknown = null) {
  const result = { data, error }
  const chain: Record<string, jest.Mock> & { then?: (resolve: (val: unknown) => void) => void } = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
  }

  // Make the chain itself a thenable so `await chain` resolves to { data, error }
  Object.defineProperty(chain, 'then', {
    value: (resolve: (val: unknown) => void) => resolve(result),
    writable: true,
    configurable: true,
    enumerable: false,
  })

  return chain
}

// ---------------------------------------------------------------------------
// NextRequest factory helpers
// ---------------------------------------------------------------------------

/**
 * Build a NextRequest for a simple GET endpoint.
 */
export function makeGetRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'GET' })
}

/**
 * Build a NextRequest with a JSON body.
 */
export function makeJsonRequest(
  url: string,
  method: string,
  body: unknown
): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/**
 * Build params wrapper for dynamic route segments.
 * Next.js 15 App Router passes params as `Promise<{ id: string }>`.
 */
export function makeDynamicParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

// ---------------------------------------------------------------------------
// Response parsing helper
// ---------------------------------------------------------------------------

/**
 * Parse a NextResponse / Response object as JSON.
 */
export async function parseResponse<T = unknown>(response: Response): Promise<T> {
  return response.json() as Promise<T>
}
