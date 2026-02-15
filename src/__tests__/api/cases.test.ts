/**
 * @jest-environment node
 */

/**
 * Tests for GET /api/cases and POST /api/cases
 *
 * Routes: src/app/api/cases/route.ts
 */
import { NextRequest } from 'next/server'
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
  mockSupabaseChain,
  makeGetRequest,
  makeJsonRequest,
  parseResponse,
} from './helpers'

// ---------------------------------------------------------------------------
// Mock setup – use mockImplementation so clearAllMocks doesn't break it
// ---------------------------------------------------------------------------
const mockAuthGetUser = jest.fn()
const mockFrom = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn().mockImplementation(() =>
    Promise.resolve({
      auth: { getUser: mockAuthGetUser },
      from: mockFrom,
    })
  ),
}))

// Mock AGENT_ROLE_TEMPLATES used during POST to create default agents
jest.mock('@/lib/ai/prompts', () => ({
  AGENT_ROLE_TEMPLATES: {
    judge: { defaultName: 'Judge', defaultPrompt: 'You are a judge.', defaultTemperature: 0.6 },
    plaintiff_attorney: { defaultName: 'Plaintiff', defaultPrompt: 'You are plaintiff.', defaultTemperature: 0.7 },
    defense_attorney: { defaultName: 'Defense', defaultPrompt: 'You are defense.', defaultTemperature: 0.7 },
  },
}))

// Import route handlers AFTER mocks are registered
import { GET, POST } from '@/app/api/cases/route'

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('GET /api/cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns cases for an authenticated user', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const casesData = [
      { id: '1', name: 'Case A', case_type: 'civil', agents: [{ count: 3 }], documents: [{ count: 0 }], conversations: [{ count: 1 }] },
      { id: '2', name: 'Case B', case_type: 'criminal', agents: [{ count: 2 }], documents: [{ count: 1 }], conversations: [{ count: 0 }] },
    ]
    const chain = mockSupabaseChain(casesData)
    mockFrom.mockReturnValue(chain)

    makeGetRequest('http://localhost/api/cases')
    const response = await GET()
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(casesData)
    expect(mockFrom).toHaveBeenCalledWith('cases')
    expect(chain.select).toHaveBeenCalled()
    expect(chain.order).toHaveBeenCalledWith('updated_at', { ascending: false })
  })

  it('returns 401 when user is not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const response = await GET()
    const body = await parseResponse<{ error: string; code: string }>(response)

    expect(response.status).toBe(401)
    expect(body.code).toBe('UNAUTHORIZED')
  })

  it('returns 500 when database query fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { message: 'DB connection failed' })
    mockFrom.mockReturnValue(chain)

    const response = await GET()
    const body = await parseResponse<{ code: string }>(response)

    expect(response.status).toBe(500)
    expect(body.code).toBe('DATABASE_ERROR')
  })

  it('returns empty array when user has no cases', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain([])
    mockFrom.mockReturnValue(chain)

    const response = await GET()
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual([])
  })
})

describe('POST /api/cases', () => {
  const validCaseData = {
    name: 'Test Case',
    case_type: 'civil' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a case with valid data and returns 201', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const createdCase = { id: 'new-case-id', ...validCaseData, user_id: 'test-user-id' }

    // First call: from('cases').insert().select().single() -> case creation
    const caseChain = mockSupabaseChain(createdCase)
    // Second call: from('agents').insert() -> default agents creation
    const agentsChain = mockSupabaseChain(null, null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'cases') return caseChain
      if (table === 'agents') return agentsChain
      return caseChain
    })

    const request = makeJsonRequest('http://localhost/api/cases', 'POST', validCaseData)
    const response = await POST(request)
    const body = await parseResponse(response)

    expect(response.status).toBe(201)
    expect(body).toEqual(createdCase)
    expect(mockFrom).toHaveBeenCalledWith('cases')
    expect(mockFrom).toHaveBeenCalledWith('agents')
  })

  it('returns 401 when user is not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest('http://localhost/api/cases', 'POST', validCaseData)
    const response = await POST(request)
    const body = await parseResponse<{ code: string }>(response)

    expect(response.status).toBe(401)
    expect(body.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 when name is missing', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest('http://localhost/api/cases', 'POST', { case_type: 'civil' })
    const response = await POST(request)
    const body = await parseResponse<{ code: string; fieldErrors?: Array<{ field: string }> }>(response)

    expect(response.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 when case_type is invalid', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest('http://localhost/api/cases', 'POST', {
      name: 'Test',
      case_type: 'invalid_type',
    })
    const response = await POST(request)
    const body = await parseResponse<{ code: string }>(response)

    expect(response.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 when request body is not valid JSON', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const request = new NextRequest('http://localhost/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json{{{',
    })
    const response = await POST(request)
    const body = await parseResponse<{ code: string }>(response)

    expect(response.status).toBe(400)
    expect(body.code).toBe('INVALID_INPUT')
  })

  it('returns 409 when case name already exists (duplicate key)', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain(null, { code: '23505', message: 'duplicate key' })
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest('http://localhost/api/cases', 'POST', validCaseData)
    const response = await POST(request)
    const body = await parseResponse<{ code: string }>(response)

    expect(response.status).toBe(409)
    expect(body.code).toBe('DUPLICATE_ENTRY')
  })

  it('returns 500 when database insert fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain(null, { code: 'OTHER', message: 'insert failed' })
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest('http://localhost/api/cases', 'POST', validCaseData)
    const response = await POST(request)
    const body = await parseResponse<{ code: string }>(response)

    expect(response.status).toBe(500)
    expect(body.code).toBe('DATABASE_ERROR')
  })

  it('creates case with all optional fields', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const fullCaseData = {
      ...validCaseData,
      case_number: 'CV-2024-001',
      jurisdiction: 'Utah',
      summary: 'A test summary',
      plaintiff_name: 'Alice',
      defendant_name: 'Bob',
      status: 'active',
    }
    const createdCase = { id: 'case-full', ...fullCaseData, user_id: 'test-user-id' }

    const caseChain = mockSupabaseChain(createdCase)
    const agentsChain = mockSupabaseChain(null, null)
    mockFrom.mockImplementation((table: string) => {
      if (table === 'agents') return agentsChain
      return caseChain
    })

    const request = makeJsonRequest('http://localhost/api/cases', 'POST', fullCaseData)
    const response = await POST(request)
    const body = await parseResponse(response)

    expect(response.status).toBe(201)
    expect(body).toEqual(createdCase)
  })
})
