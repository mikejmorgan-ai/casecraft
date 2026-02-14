/**
 * @jest-environment node
 */

/**
 * Tests for /api/cases/[id]/conversations route (GET, POST, DELETE)
 */
import {
  createMockSupabase,
  createChainMock,
  buildRequest,
  parseResponse,
  AUTHENTICATED_USER,
  UNAUTHENTICATED_USER,
} from './helpers'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSupabase = createMockSupabase()

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn().mockResolvedValue(mockSupabase),
}))

// Import route handlers AFTER mocks are set up
import { GET, POST, DELETE } from '@/app/api/cases/[id]/conversations/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CASE_ID = 'case-123'
const CONV_ID = 'conv-456'

const MOCK_CONVERSATION = {
  id: CONV_ID,
  case_id: CASE_ID,
  name: 'Initial Hearing',
  conversation_type: 'hearing',
  participants: [],
  messages: [{ count: 5 }],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

const VALID_CONVERSATION_BODY = {
  name: 'Strategy Meeting',
  conversation_type: 'strategy_session',
}

function makeParams(id: string = CASE_ID) {
  return { params: Promise.resolve({ id }) }
}

// ---------------------------------------------------------------------------
// GET /api/cases/[id]/conversations
// ---------------------------------------------------------------------------

describe('GET /api/cases/[id]/conversations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 401 when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const request = buildRequest(`/api/cases/${CASE_ID}/conversations`)
    const response = await GET(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns list of conversations on success', async () => {
    const conversations = [MOCK_CONVERSATION]
    const chain = createChainMock({ data: conversations, error: null })
    mockSupabase.from.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}/conversations`)
    const response = await GET(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(conversations)
    expect(mockSupabase.from).toHaveBeenCalledWith('conversations')
  })

  it('returns 500 for database errors', async () => {
    const chain = createChainMock({
      data: null,
      error: { message: 'query failed' },
    })
    mockSupabase.from.mockReturnValueOnce(chain)

    const request = buildRequest(`/api/cases/${CASE_ID}/conversations`)
    const response = await GET(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('query failed')
  })
})

// ---------------------------------------------------------------------------
// POST /api/cases/[id]/conversations
// ---------------------------------------------------------------------------

describe('POST /api/cases/[id]/conversations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 401 when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const request = buildRequest(`/api/cases/${CASE_ID}/conversations`, {
      method: 'POST',
      body: VALID_CONVERSATION_BODY,
    })
    const response = await POST(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 404 when case does not exist', async () => {
    const casesChain = createChainMock({ data: null, error: null })
    mockSupabase.from.mockReturnValueOnce(casesChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/conversations`, {
      method: 'POST',
      body: VALID_CONVERSATION_BODY,
    })
    const response = await POST(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(404)
    expect(body.error).toBe('Case not found')
  })

  it('returns 400 for validation errors', async () => {
    const casesChain = createChainMock({ data: { id: CASE_ID }, error: null })
    mockSupabase.from.mockReturnValueOnce(casesChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/conversations`, {
      method: 'POST',
      body: { name: '', conversation_type: 'invalid_type' },
    })
    const response = await POST(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toBeDefined()
  })

  it('creates a conversation on success', async () => {
    const casesChain = createChainMock({ data: { id: CASE_ID }, error: null })
    const convsChain = createChainMock({ data: MOCK_CONVERSATION, error: null })
    mockSupabase.from
      .mockReturnValueOnce(casesChain)
      .mockReturnValueOnce(convsChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/conversations`, {
      method: 'POST',
      body: VALID_CONVERSATION_BODY,
    })
    const response = await POST(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(201)
    expect(body).toEqual(MOCK_CONVERSATION)
    expect(mockSupabase.from).toHaveBeenCalledWith('cases')
    expect(mockSupabase.from).toHaveBeenCalledWith('conversations')
  })

  it('returns 500 for database insert errors', async () => {
    const casesChain = createChainMock({ data: { id: CASE_ID }, error: null })
    const convsChain = createChainMock({
      data: null,
      error: { message: 'insert failed' },
    })
    mockSupabase.from
      .mockReturnValueOnce(casesChain)
      .mockReturnValueOnce(convsChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/conversations`, {
      method: 'POST',
      body: VALID_CONVERSATION_BODY,
    })
    const response = await POST(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('insert failed')
  })

  it('accepts optional participants array', async () => {
    const casesChain = createChainMock({ data: { id: CASE_ID }, error: null })
    const convsChain = createChainMock({ data: MOCK_CONVERSATION, error: null })
    mockSupabase.from
      .mockReturnValueOnce(casesChain)
      .mockReturnValueOnce(convsChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/conversations`, {
      method: 'POST',
      body: {
        ...VALID_CONVERSATION_BODY,
        participants: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
      },
    })
    const response = await POST(request, makeParams())

    expect(response.status).toBe(201)
  })

  it('validates conversation_type enum', async () => {
    const casesChain = createChainMock({ data: { id: CASE_ID }, error: null })
    mockSupabase.from.mockReturnValueOnce(casesChain)

    const request = buildRequest(`/api/cases/${CASE_ID}/conversations`, {
      method: 'POST',
      body: { name: 'Test', conversation_type: 'nonexistent' },
    })
    const response = await POST(request, makeParams())

    expect(response.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/cases/[id]/conversations?convId=...
// ---------------------------------------------------------------------------

describe('DELETE /api/cases/[id]/conversations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue(AUTHENTICATED_USER)
  })

  it('returns 400 when convId query param is missing', async () => {
    const request = buildRequest(`/api/cases/${CASE_ID}/conversations`, {
      method: 'DELETE',
    })
    const response = await DELETE(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(400)
    expect(body.error).toBe('Conversation ID required')
  })

  it('returns 401 when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce(UNAUTHENTICATED_USER)

    const request = buildRequest(
      `/api/cases/${CASE_ID}/conversations?convId=${CONV_ID}`,
      { method: 'DELETE' }
    )
    const response = await DELETE(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('deletes a conversation on success', async () => {
    const chain = createChainMock({ data: null, error: null })
    mockSupabase.from.mockReturnValueOnce(chain)

    const request = buildRequest(
      `/api/cases/${CASE_ID}/conversations?convId=${CONV_ID}`,
      { method: 'DELETE' }
    )
    const response = await DELETE(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockSupabase.from).toHaveBeenCalledWith('conversations')
  })

  it('returns 500 for database errors', async () => {
    const chain = createChainMock({
      data: null,
      error: { message: 'delete failed' },
    })
    mockSupabase.from.mockReturnValueOnce(chain)

    const request = buildRequest(
      `/api/cases/${CASE_ID}/conversations?convId=${CONV_ID}`,
      { method: 'DELETE' }
    )
    const response = await DELETE(request, makeParams())
    const body = await parseResponse(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('delete failed')
  })
})
