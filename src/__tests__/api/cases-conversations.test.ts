/**
 * @jest-environment node
 */

/**
 * Tests for GET / POST / DELETE  /api/cases/[id]/conversations
 *
 * Route: src/app/api/cases/[id]/conversations/route.ts
 */
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
  mockSupabaseChain,
  makeGetRequest,
  makeJsonRequest,
  makeDynamicParams,
  parseResponse,
} from './helpers'

// ---------------------------------------------------------------------------
// Mock setup
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

import { GET, POST, DELETE } from '@/app/api/cases/[id]/conversations/route'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const TEST_CASE_ID = 'test-case-id'
const TEST_CONV_ID = 'test-conv-id'
const dynamicParams = makeDynamicParams(TEST_CASE_ID)

const sampleConversation = {
  id: TEST_CONV_ID,
  case_id: TEST_CASE_ID,
  name: 'Initial Hearing',
  conversation_type: 'hearing',
  participants: [],
  messages: [{ count: 5 }],
}

// ---------------------------------------------------------------------------
// GET /api/cases/[id]/conversations
// ---------------------------------------------------------------------------
describe('GET /api/cases/[id]/conversations', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns conversations with message counts', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const conversationsData = [
      sampleConversation,
      { ...sampleConversation, id: 'conv-2', name: 'Deposition Session', conversation_type: 'deposition' },
    ]
    const chain = mockSupabaseChain(conversationsData)
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/conversations`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(conversationsData)
    expect(mockFrom).toHaveBeenCalledWith('conversations')
    expect(chain.eq).toHaveBeenCalledWith('case_id', TEST_CASE_ID)
    expect(chain.order).toHaveBeenCalledWith('updated_at', { ascending: false })
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/conversations`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 500 on database error', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { message: 'db fail' })
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/conversations`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('db fail')
  })

  it('returns empty array when no conversations exist', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain([])
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/conversations`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual([])
  })

  it('includes messages(count) in select', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain([])
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/conversations`)
    await GET(request, dynamicParams)

    const selectArg = chain.select.mock.calls[0][0] as string
    expect(selectArg).toContain('messages(count)')
  })
})

// ---------------------------------------------------------------------------
// POST /api/cases/[id]/conversations
// ---------------------------------------------------------------------------
describe('POST /api/cases/[id]/conversations', () => {
  const validConversationData = {
    name: 'New Hearing',
    conversation_type: 'hearing',
  }

  beforeEach(() => jest.clearAllMocks())

  it('creates a conversation and returns 201', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    const convChain = mockSupabaseChain({
      id: 'new-conv-id',
      ...validConversationData,
      case_id: TEST_CASE_ID,
      participants: [],
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'cases') return caseChain
      return convChain
    })

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/conversations`,
      'POST',
      validConversationData
    )
    const response = await POST(request, dynamicParams)
    await parseResponse(response)

    expect(response.status).toBe(201)
    expect(mockFrom).toHaveBeenCalledWith('conversations')
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/conversations`,
      'POST',
      validConversationData
    )
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(401)
  })

  it('returns 404 when case does not exist', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain(null)
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/conversations`,
      'POST',
      validConversationData
    )
    const response = await POST(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(404)
    expect(body.error).toBe('Case not found')
  })

  it('returns 400 when name is missing', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/conversations`,
      'POST',
      { conversation_type: 'hearing' }
    )
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(400)
  })

  it('returns 400 when conversation_type is invalid', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/conversations`,
      'POST',
      { name: 'Test', conversation_type: 'invalid_type' }
    )
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(400)
  })

  it('returns 500 when database insert fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    const convChain = mockSupabaseChain(null, { message: 'insert failed' })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'cases') return caseChain
      return convChain
    })

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/conversations`,
      'POST',
      validConversationData
    )
    const response = await POST(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('insert failed')
  })

  it('accepts optional participants array', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    const convChain = mockSupabaseChain({
      id: 'new-conv-id',
      ...validConversationData,
      case_id: TEST_CASE_ID,
      participants: ['agent-id-1'],
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'cases') return caseChain
      return convChain
    })

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/conversations`,
      'POST',
      { ...validConversationData, participants: ['a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'] }
    )
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(201)
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/cases/[id]/conversations?convId=...
// ---------------------------------------------------------------------------
describe('DELETE /api/cases/[id]/conversations', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes a conversation and returns success', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null)
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/conversations?convId=${TEST_CONV_ID}`
    )
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ success: boolean }>(response)

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', TEST_CONV_ID)
    expect(chain.eq).toHaveBeenCalledWith('case_id', TEST_CASE_ID)
  })

  it('returns 400 when convId query param is missing', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/conversations`)
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(400)
    expect(body.error).toBe('Conversation ID required')
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeGetRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/conversations?convId=${TEST_CONV_ID}`
    )
    const response = await DELETE(request, dynamicParams)

    expect(response.status).toBe(401)
  })

  it('returns 500 when database delete fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { message: 'delete failed' })
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/conversations?convId=${TEST_CONV_ID}`
    )
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('delete failed')
  })
})
