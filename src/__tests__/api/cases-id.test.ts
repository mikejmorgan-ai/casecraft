/**
 * @jest-environment node
 */

/**
 * Tests for /api/cases/[id] route (GET single, PATCH update, DELETE)
 */
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
  createServerSupabase: jest.fn(() => Promise.resolve({
    auth: { getUser: mockAuthGetUser },
    from: mockFrom,
  })),
}))

// Import route handlers AFTER mocks are set up
import { GET, PATCH, DELETE } from '@/app/api/cases/[id]/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CASE_ID = 'case-123'
const MOCK_CASE = {
  id: CASE_ID,
  name: 'Test Case',
  case_type: 'civil',
  status: 'draft',
  user_id: 'test-user-id',
  agents: [],
  documents: [],
  conversations: [],
  case_facts: [],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

function makeParams(id: string = CASE_ID) {
  return { params: Promise.resolve({ id }) }
}

// ---------------------------------------------------------------------------
// GET /api/cases/[id]
// ---------------------------------------------------------------------------

describe('GET /api/cases/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthGetUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuthGetUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const request = buildRequest(`/api/cases/${CASE_ID}`)
    const response = await GET(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns case with relations on success', async () => {
    const chain = createChainMock({ data: MOCK_CASE, error: null })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}`)
    const response = await GET(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(MOCK_CASE)
    expect(mockFrom).toHaveBeenCalledWith('cases')
  })

  it('returns 404 when case is not found (PGRST116)', async () => {
    const chain = createChainMock({
      data: null,
      error: { message: 'not found', code: 'PGRST116' },
    })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}`)
    const response = await GET(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(404)
    expect(body.error).toBe('Case not found')
  })

  it('returns 500 for other database errors', async () => {
    const chain = createChainMock({
      data: null,
      error: { message: 'connection error', code: 'PGRST000' },
    })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}`)
    const response = await GET(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('connection error')
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/cases/[id]
// ---------------------------------------------------------------------------

describe('PATCH /api/cases/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthGetUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuthGetUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const request = buildRequest(`/api/cases/${CASE_ID}`, {
      method: 'PATCH',
      body: { name: 'Updated' },
    })
    const response = await PATCH(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('updates a case on success', async () => {
    const updatedCase = { ...MOCK_CASE, name: 'Updated Case' }
    const chain = createChainMock({ data: updatedCase, error: null })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}`, {
      method: 'PATCH',
      body: { name: 'Updated Case' },
    })
    const response = await PATCH(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body.name).toBe('Updated Case')
  })

  it('returns 400 for invalid fields', async () => {
    const request = buildRequest(`/api/cases/${CASE_ID}`, {
      method: 'PATCH',
      body: { case_type: 'nonexistent_type' },
    })
    const response = await PATCH(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toBeDefined()
  })

  it('allows partial updates', async () => {
    const updatedCase = { ...MOCK_CASE, status: 'active' }
    const chain = createChainMock({ data: updatedCase, error: null })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}`, {
      method: 'PATCH',
      body: { status: 'active' },
    })
    const response = await PATCH(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body.status).toBe('active')
  })

  it('returns 500 for database errors', async () => {
    const chain = createChainMock({
      data: null,
      error: { message: 'update failed' },
    })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}`, {
      method: 'PATCH',
      body: { name: 'Updated' },
    })
    const response = await PATCH(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('update failed')
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/cases/[id]
// ---------------------------------------------------------------------------

describe('DELETE /api/cases/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthGetUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuthGetUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const request = buildRequest(`/api/cases/${CASE_ID}`, { method: 'DELETE' })
    const response = await DELETE(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('deletes a case on success', async () => {
    const chain = createChainMock({ data: null, error: null })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}`, { method: 'DELETE' })
    const response = await DELETE(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('cases')
  })

  it('returns 500 for database errors', async () => {
    const chain = createChainMock({
      data: null,
      error: { message: 'delete failed' },
    })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}`, { method: 'DELETE' })
    const response = await DELETE(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('delete failed')
  })
})
