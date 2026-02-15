/**
 * @jest-environment node
 */

/**
 * Tests for GET / POST / PATCH / DELETE  /api/cases/[id]/facts
 *
 * Route: src/app/api/cases/[id]/facts/route.ts
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

import { GET, POST, PATCH, DELETE } from '@/app/api/cases/[id]/facts/route'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const TEST_CASE_ID = 'test-case-id'
const TEST_FACT_ID = 'test-fact-id'
const dynamicParams = makeDynamicParams(TEST_CASE_ID)

const sampleFact = {
  id: TEST_FACT_ID,
  case_id: TEST_CASE_ID,
  category: 'undisputed',
  fact_text: 'The contract was signed on January 1, 2024.',
  source_document_id: null,
  is_disputed: false,
}

// ---------------------------------------------------------------------------
// GET /api/cases/[id]/facts
// ---------------------------------------------------------------------------
describe('GET /api/cases/[id]/facts', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns facts for the given case', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const factsData = [sampleFact, { ...sampleFact, id: 'fact-2', fact_text: 'Second fact' }]
    const chain = mockSupabaseChain(factsData)
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/facts`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(factsData)
    expect(mockFrom).toHaveBeenCalledWith('case_facts')
    expect(chain.eq).toHaveBeenCalledWith('case_id', TEST_CASE_ID)
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: true })
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/facts`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 500 on database error', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { message: 'query failed' })
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/facts`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('query failed')
  })

  it('returns empty array when no facts exist', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain([])
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/facts`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// POST /api/cases/[id]/facts
// ---------------------------------------------------------------------------
describe('POST /api/cases/[id]/facts', () => {
  const validFactData = {
    category: 'undisputed',
    fact_text: 'The property is located in Salt Lake County.',
  }

  beforeEach(() => jest.clearAllMocks())

  it('creates a fact with valid data and returns 201', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    // First from('cases') for ownership check, then from('case_facts') for insert
    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    const factChain = mockSupabaseChain({ id: 'new-fact-id', ...validFactData, case_id: TEST_CASE_ID })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'cases') return caseChain
      return factChain
    })

    const request = makeJsonRequest(`http://localhost/api/cases/${TEST_CASE_ID}/facts`, 'POST', validFactData)
    const response = await POST(request, dynamicParams)
    await parseResponse(response)

    expect(response.status).toBe(201)
    expect(mockFrom).toHaveBeenCalledWith('case_facts')
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest(`http://localhost/api/cases/${TEST_CASE_ID}/facts`, 'POST', validFactData)
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(401)
  })

  it('returns 404 when case does not exist', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    // Case ownership check returns null data
    const caseChain = mockSupabaseChain(null)
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest(`http://localhost/api/cases/${TEST_CASE_ID}/facts`, 'POST', validFactData)
    const response = await POST(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(404)
    expect(body.error).toBe('Case not found')
  })

  it('returns 400 when category is invalid', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest(`http://localhost/api/cases/${TEST_CASE_ID}/facts`, 'POST', {
      category: 'invalid_category',
      fact_text: 'Some fact.',
    })
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(400)
  })

  it('returns 400 when fact_text is missing', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest(`http://localhost/api/cases/${TEST_CASE_ID}/facts`, 'POST', {
      category: 'undisputed',
    })
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(400)
  })

  it('returns 500 when database insert fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    const factChain = mockSupabaseChain(null, { message: 'insert failed' })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'cases') return caseChain
      return factChain
    })

    const request = makeJsonRequest(`http://localhost/api/cases/${TEST_CASE_ID}/facts`, 'POST', validFactData)
    const response = await POST(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('insert failed')
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/cases/[id]/facts?factId=...
// ---------------------------------------------------------------------------
describe('PATCH /api/cases/[id]/facts', () => {
  beforeEach(() => jest.clearAllMocks())

  it('updates a fact and returns updated data', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const updatedFact = { ...sampleFact, fact_text: 'Updated text' }
    const chain = mockSupabaseChain(updatedFact)
    mockFrom.mockReturnValue(chain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/facts?factId=${TEST_FACT_ID}`,
      'PATCH',
      { fact_text: 'Updated text' }
    )
    const response = await PATCH(request, dynamicParams)
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(updatedFact)
    expect(chain.update).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', TEST_FACT_ID)
    expect(chain.eq).toHaveBeenCalledWith('case_id', TEST_CASE_ID)
  })

  it('returns 400 when factId query param is missing', async () => {
    // Note: factId check happens before auth check in the route
    mockAuthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/facts`,
      'PATCH',
      { fact_text: 'Updated text' }
    )
    const response = await PATCH(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(400)
    expect(body.error).toBe('Fact ID required')
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/facts?factId=${TEST_FACT_ID}`,
      'PATCH',
      { fact_text: 'Updated' }
    )
    const response = await PATCH(request, dynamicParams)

    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid update data', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/facts?factId=${TEST_FACT_ID}`,
      'PATCH',
      { category: 'not_a_real_category' }
    )
    const response = await PATCH(request, dynamicParams)

    expect(response.status).toBe(400)
  })

  it('returns 500 when database update fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { message: 'update failed' })
    mockFrom.mockReturnValue(chain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/facts?factId=${TEST_FACT_ID}`,
      'PATCH',
      { fact_text: 'Something' }
    )
    const response = await PATCH(request, dynamicParams)

    expect(response.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/cases/[id]/facts?factId=...
// ---------------------------------------------------------------------------
describe('DELETE /api/cases/[id]/facts', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes a fact and returns success', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null)
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/facts?factId=${TEST_FACT_ID}`
    )
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ success: boolean }>(response)

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', TEST_FACT_ID)
    expect(chain.eq).toHaveBeenCalledWith('case_id', TEST_CASE_ID)
  })

  it('returns 400 when factId query param is missing', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/facts`)
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(400)
    expect(body.error).toBe('Fact ID required')
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeGetRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/facts?factId=${TEST_FACT_ID}`
    )
    const response = await DELETE(request, dynamicParams)

    expect(response.status).toBe(401)
  })

  it('returns 500 when database delete fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { message: 'delete failed' })
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/facts?factId=${TEST_FACT_ID}`
    )
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('delete failed')
  })
})
