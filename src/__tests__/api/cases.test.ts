/**
 * @jest-environment node
 */

/**
 * Tests for /api/cases route (GET list, POST create)
 */
import { NextRequest } from 'next/server'
import {
  createChainMock,
  buildRequest,
  parseResponse,
  AUTHENTICATED_USER,
  UNAUTHENTICATED_USER,
} from './helpers'

// ---------------------------------------------------------------------------
// Mocks – use var so jest.mock hoisting can reference them
// ---------------------------------------------------------------------------

/* eslint-disable no-var */
var mockAuthGetUser = jest.fn().mockResolvedValue(AUTHENTICATED_USER)
var mockFrom = jest.fn()
/* eslint-enable no-var */

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn().mockResolvedValue({
    auth: { getUser: mockAuthGetUser },
    from: mockFrom,
  }),
}))

jest.mock('@/lib/ai/prompts', () => ({
  AGENT_ROLE_TEMPLATES: {
    judge: { defaultName: 'Judge', defaultPrompt: 'You are a judge', defaultTemperature: 0.3 },
    plaintiff_attorney: { defaultName: 'Plaintiff Attorney', defaultPrompt: 'You are a plaintiff attorney', defaultTemperature: 0.7 },
    defense_attorney: { defaultName: 'Defense Attorney', defaultPrompt: 'You are a defense attorney', defaultTemperature: 0.7 },
  },
}))

// Import route handlers AFTER mocks are set up
import { GET, POST } from '@/app/api/cases/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_CASE = {
  id: 'case-123',
  name: 'Test Case',
  case_type: 'civil',
  status: 'draft',
  user_id: 'test-user-id',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

const VALID_BODY = {
  name: 'New Test Case',
  case_type: 'civil',
}

// ---------------------------------------------------------------------------
// GET /api/cases
// ---------------------------------------------------------------------------

describe('GET /api/cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthGetUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuthGetUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const response = await GET()
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.code).toBe('UNAUTHORIZED')
  })

  it('returns list of cases on success', async () => {
    const cases = [MOCK_CASE, { ...MOCK_CASE, id: 'case-456', name: 'Another Case' }]
    const chain = createChainMock({ data: cases, error: null })
    mockFrom.mockReturnValueOnce(chain)

    const response = await GET()
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(cases)
    expect(mockFrom).toHaveBeenCalledWith('cases')
  })

  it('returns 500 when database query fails', async () => {
    const chain = createChainMock({ data: null, error: { message: 'DB down', code: 'PGRST000' } })
    mockFrom.mockReturnValueOnce(chain)

    const response = await GET()
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.code).toBe('DATABASE_ERROR')
  })
})

// ---------------------------------------------------------------------------
// POST /api/cases
// ---------------------------------------------------------------------------

describe('POST /api/cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthGetUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuthGetUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const request = buildRequest('/api/cases', { method: 'POST', body: VALID_BODY })
    const response = await POST(request)
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 for invalid JSON body', async () => {
    const request = new NextRequest(
      new URL('/api/cases', 'http://localhost:3000'),
      { method: 'POST', body: 'not json', headers: { 'Content-Type': 'application/json' } }
    )

    const response = await POST(request)
    const body = await parseResponse(response)

    expect(response.status).toBe(400)
    expect(body.code).toBe('INVALID_INPUT')
  })

  it('returns 400 for validation errors (missing required fields)', async () => {
    const request = buildRequest('/api/cases', { method: 'POST', body: {} })
    const response = await POST(request)
    const body = await parseResponse(response)

    expect(response.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
    expect(body.fieldErrors).toBeDefined()
    expect(body.fieldErrors.length).toBeGreaterThan(0)
  })

  it('returns 400 for invalid case_type', async () => {
    const request = buildRequest('/api/cases', {
      method: 'POST',
      body: { name: 'Test', case_type: 'invalid_type' },
    })
    const response = await POST(request)
    const body = await parseResponse(response)

    expect(response.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('creates a case and default agents on success', async () => {
    const casesChain = createChainMock({ data: MOCK_CASE, error: null })
    const agentsChain = createChainMock({ data: null, error: null })

    mockFrom
      .mockReturnValueOnce(casesChain)
      .mockReturnValueOnce(agentsChain)

    const request = buildRequest('/api/cases', { method: 'POST', body: VALID_BODY })
    const response = await POST(request)
    const body = await parseResponse(response)

    expect(response.status).toBe(201)
    expect(body).toEqual(MOCK_CASE)
    expect(mockFrom).toHaveBeenCalledWith('cases')
    expect(mockFrom).toHaveBeenCalledWith('agents')
  })

  it('returns 409 for duplicate case name', async () => {
    const casesChain = createChainMock({
      data: null,
      error: { message: 'duplicate key', code: '23505' },
    })
    mockFrom.mockReturnValueOnce(casesChain)

    const request = buildRequest('/api/cases', { method: 'POST', body: VALID_BODY })
    const response = await POST(request)
    const body = await parseResponse(response)

    expect(response.status).toBe(409)
    expect(body.code).toBe('DUPLICATE_ENTRY')
  })

  it('returns 500 for other database errors during case creation', async () => {
    const casesChain = createChainMock({
      data: null,
      error: { message: 'connection refused', code: 'ECONNREFUSED' },
    })
    mockFrom.mockReturnValueOnce(casesChain)

    const request = buildRequest('/api/cases', { method: 'POST', body: VALID_BODY })
    const response = await POST(request)
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.code).toBe('DATABASE_ERROR')
  })

  it('still returns 201 if agent creation fails (non-critical)', async () => {
    const casesChain = createChainMock({ data: MOCK_CASE, error: null })
    const agentsChain = createChainMock({
      data: null,
      error: { message: 'agent insert failed' },
    })

    mockFrom
      .mockReturnValueOnce(casesChain)
      .mockReturnValueOnce(agentsChain)

    const request = buildRequest('/api/cases', { method: 'POST', body: VALID_BODY })
    const response = await POST(request)

    expect(response.status).toBe(201)
  })

  it('validates name length constraints', async () => {
    const longName = 'a'.repeat(256)
    const request = buildRequest('/api/cases', {
      method: 'POST',
      body: { name: longName, case_type: 'civil' },
    })
    const response = await POST(request)
    const body = await parseResponse(response)

    expect(response.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('accepts optional fields', async () => {
    const casesChain = createChainMock({ data: MOCK_CASE, error: null })
    const agentsChain = createChainMock({ data: null, error: null })
    mockFrom
      .mockReturnValueOnce(casesChain)
      .mockReturnValueOnce(agentsChain)

    const request = buildRequest('/api/cases', {
      method: 'POST',
      body: {
        ...VALID_BODY,
        jurisdiction: 'Utah',
        summary: 'A test case',
        plaintiff_name: 'John Doe',
        defendant_name: 'Jane Doe',
        case_number: 'CV-2024-001',
      },
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
  })
})
