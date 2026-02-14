/**
 * @jest-environment node
 */

/**
 * Tests for /api/cases/[id]/facts route (GET, POST, PATCH, DELETE)
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
  createServerSupabase: jest.fn().mockResolvedValue({
    auth: { getUser: mockAuthGetUser },
    from: mockFrom,
  }),
}))

// Import route handlers AFTER mocks are set up
import { GET, POST, PATCH, DELETE } from '@/app/api/cases/[id]/facts/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CASE_ID = 'case-123'
const FACT_ID = 'fact-456'

const MOCK_FACT = {
  id: FACT_ID,
  case_id: CASE_ID,
  category: 'undisputed',
  fact_text: 'The defendant was present at the scene.',
  source_document_id: null,
  is_disputed: false,
  created_at: '2025-01-01T00:00:00Z',
}

const VALID_FACT_BODY = {
  category: 'undisputed',
  fact_text: 'A new fact for the case.',
}

function makeParams(id: string = CASE_ID) {
  return { params: Promise.resolve({ id }) }
}

// ---------------------------------------------------------------------------
// GET /api/cases/[id]/facts
// ---------------------------------------------------------------------------

describe('GET /api/cases/[id]/facts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthGetUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuthGetUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts`)
    const response = await GET(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns list of facts on success', async () => {
    const facts = [MOCK_FACT, { ...MOCK_FACT, id: 'fact-789', fact_text: 'Another fact' }]
    const chain = createChainMock({ data: facts, error: null })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts`)
    const response = await GET(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(facts)
    expect(mockFrom).toHaveBeenCalledWith('case_facts')
  })

  it('returns 500 for database errors', async () => {
    const chain = createChainMock({
      data: null,
      error: { message: 'query failed' },
    })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts`)
    const response = await GET(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('query failed')
  })
})

// ---------------------------------------------------------------------------
// POST /api/cases/[id]/facts
// ---------------------------------------------------------------------------

describe('POST /api/cases/[id]/facts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthGetUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuthGetUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts`, {
      method: 'POST',
      body: VALID_FACT_BODY,
    })
    const response = await POST(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 404 when case does not exist', async () => {
    const casesChain = createChainMock({ data: null, error: null })
    mockFrom.mockReturnValueOnce(casesChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts`, {
      method: 'POST',
      body: VALID_FACT_BODY,
    })
    const response = await POST(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(404)
    expect(body.error).toBe('Case not found')
  })

  it('returns 400 for validation errors', async () => {
    const casesChain = createChainMock({ data: { id: CASE_ID }, error: null })
    mockFrom.mockReturnValueOnce(casesChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts`, {
      method: 'POST',
      body: { category: 'invalid_category' },
    })
    const response = await POST(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toBeDefined()
  })

  it('creates a fact on success', async () => {
    const casesChain = createChainMock({ data: { id: CASE_ID }, error: null })
    const factsChain = createChainMock({ data: MOCK_FACT, error: null })
    mockFrom
      .mockReturnValueOnce(casesChain)
      .mockReturnValueOnce(factsChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts`, {
      method: 'POST',
      body: VALID_FACT_BODY,
    })
    const response = await POST(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(201)
    expect(body).toEqual(MOCK_FACT)
    expect(mockFrom).toHaveBeenCalledWith('cases')
    expect(mockFrom).toHaveBeenCalledWith('case_facts')
  })

  it('returns 500 for database insert errors', async () => {
    const casesChain = createChainMock({ data: { id: CASE_ID }, error: null })
    const factsChain = createChainMock({
      data: null,
      error: { message: 'insert failed' },
    })
    mockFrom
      .mockReturnValueOnce(casesChain)
      .mockReturnValueOnce(factsChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts`, {
      method: 'POST',
      body: VALID_FACT_BODY,
    })
    const response = await POST(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('insert failed')
  })

  it('accepts optional fields (source_document_id, is_disputed)', async () => {
    const casesChain = createChainMock({ data: { id: CASE_ID }, error: null })
    const factsChain = createChainMock({ data: MOCK_FACT, error: null })
    mockFrom
      .mockReturnValueOnce(casesChain)
      .mockReturnValueOnce(factsChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts`, {
      method: 'POST',
      body: {
        ...VALID_FACT_BODY,
        source_document_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        is_disputed: true,
      },
    })
    const response = await POST(request, makeParams())

    expect(response.status).toBe(201)
  })

  it('validates category enum values', async () => {
    const casesChain = createChainMock({ data: { id: CASE_ID }, error: null })
    mockFrom.mockReturnValueOnce(casesChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts`, {
      method: 'POST',
      body: { category: 'made_up', fact_text: 'Some text' },
    })
    const response = await POST(request, makeParams())

    expect(response.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/cases/[id]/facts?factId=...
// ---------------------------------------------------------------------------

describe('PATCH /api/cases/[id]/facts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthGetUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 400 when factId query param is missing', async () => {
    const request = buildRequest(`/api/cases/${CASE_ID}/facts`, {
      method: 'PATCH',
      body: { fact_text: 'Updated text' },
    })
    const response = await PATCH(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toBe('Fact ID required')
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuthGetUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts?factId=${FACT_ID}`, {
      method: 'PATCH',
      body: { fact_text: 'Updated text' },
    })
    const response = await PATCH(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('updates a fact on success', async () => {
    const updatedFact = { ...MOCK_FACT, fact_text: 'Updated fact text' }
    const chain = createChainMock({ data: updatedFact, error: null })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts?factId=${FACT_ID}`, {
      method: 'PATCH',
      body: { fact_text: 'Updated fact text' },
    })
    const response = await PATCH(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body.fact_text).toBe('Updated fact text')
  })

  it('returns 400 for invalid update data', async () => {
    const request = buildRequest(`/api/cases/${CASE_ID}/facts?factId=${FACT_ID}`, {
      method: 'PATCH',
      body: { category: 'not_valid' },
    })
    const response = await PATCH(request, makeParams())

    expect(response.status).toBe(400)
  })

  it('returns 500 for database errors', async () => {
    const chain = createChainMock({
      data: null,
      error: { message: 'update failed' },
    })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts?factId=${FACT_ID}`, {
      method: 'PATCH',
      body: { fact_text: 'Updated' },
    })
    const response = await PATCH(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('update failed')
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/cases/[id]/facts?factId=...
// ---------------------------------------------------------------------------

describe('DELETE /api/cases/[id]/facts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthGetUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 400 when factId query param is missing', async () => {
    const request = buildRequest(`/api/cases/${CASE_ID}/facts`, { method: 'DELETE' })
    const response = await DELETE(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toBe('Fact ID required')
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuthGetUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts?factId=${FACT_ID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('deletes a fact on success', async () => {
    const chain = createChainMock({ data: null, error: null })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts?factId=${FACT_ID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('case_facts')
  })

  it('returns 500 for database errors', async () => {
    const chain = createChainMock({
      data: null,
      error: { message: 'delete failed' },
    })
    mockFrom.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}/facts?factId=${FACT_ID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('delete failed')
  })
})
