/**
 * @jest-environment node
 */

/**
 * Tests for GET / PATCH / DELETE  /api/cases/[id]
 *
 * Route: src/app/api/cases/[id]/route.ts
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

import { GET, PATCH, DELETE } from '@/app/api/cases/[id]/route'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const TEST_CASE_ID = 'test-case-id'
const dynamicParams = makeDynamicParams(TEST_CASE_ID)

const sampleCase = {
  id: TEST_CASE_ID,
  name: 'Smith v. Jones',
  case_type: 'civil',
  status: 'draft',
  agents: [],
  documents: [],
  conversations: [],
  case_facts: [],
}

// ---------------------------------------------------------------------------
// GET /api/cases/[id]
// ---------------------------------------------------------------------------
describe('GET /api/cases/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns the case with all relations', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(sampleCase)
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(sampleCase)
    expect(mockFrom).toHaveBeenCalledWith('cases')
    expect(chain.eq).toHaveBeenCalledWith('id', TEST_CASE_ID)
    expect(chain.single).toHaveBeenCalled()
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 404 when case is not found (PGRST116)', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { code: 'PGRST116', message: 'not found' })
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(404)
    expect(body.error).toBe('Case not found')
  })

  it('returns 500 on generic database error', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { code: 'OTHER', message: 'db error' })
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('db error')
  })

  it('includes related agents, documents, conversations, and case_facts in the select', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(sampleCase)
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}`)
    await GET(request, dynamicParams)

    // Verify the select call includes relation expansions
    const selectArg = chain.select.mock.calls[0][0] as string
    expect(selectArg).toContain('agents')
    expect(selectArg).toContain('documents')
    expect(selectArg).toContain('conversations')
    expect(selectArg).toContain('case_facts')
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/cases/[id]
// ---------------------------------------------------------------------------
describe('PATCH /api/cases/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('updates case fields and returns updated case', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const updatedCase = { ...sampleCase, name: 'Updated Name', status: 'active' }
    const chain = mockSupabaseChain(updatedCase)
    mockFrom.mockReturnValue(chain)

    const request = makeJsonRequest(`http://localhost/api/cases/${TEST_CASE_ID}`, 'PATCH', {
      name: 'Updated Name',
      status: 'active',
    })
    const response = await PATCH(request, dynamicParams)
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(updatedCase)
    expect(chain.update).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', TEST_CASE_ID)
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest(`http://localhost/api/cases/${TEST_CASE_ID}`, 'PATCH', { name: 'X' })
    const response = await PATCH(request, dynamicParams)

    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid case_type', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest(`http://localhost/api/cases/${TEST_CASE_ID}`, 'PATCH', {
      case_type: 'unknown_type',
    })
    const response = await PATCH(request, dynamicParams)
    const body = await parseResponse<{ error: unknown }>(response)

    expect(response.status).toBe(400)
    expect(body.error).toBeDefined()
  })

  it('returns 500 when database update fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { message: 'update failed' })
    mockFrom.mockReturnValue(chain)

    const request = makeJsonRequest(`http://localhost/api/cases/${TEST_CASE_ID}`, 'PATCH', {
      name: 'New Name',
    })
    const response = await PATCH(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('update failed')
  })

  it('allows partial updates with only one field', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const updatedCase = { ...sampleCase, jurisdiction: 'California' }
    const chain = mockSupabaseChain(updatedCase)
    mockFrom.mockReturnValue(chain)

    const request = makeJsonRequest(`http://localhost/api/cases/${TEST_CASE_ID}`, 'PATCH', {
      jurisdiction: 'California',
    })
    const response = await PATCH(request, dynamicParams)

    expect(response.status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/cases/[id]
// ---------------------------------------------------------------------------
describe('DELETE /api/cases/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes case and returns success', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null)
    // DELETE chain doesn't call .single(), it just awaits after .eq()
    // Override the thenable to return { data: null, error: null }
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}`)
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ success: boolean }>(response)

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', TEST_CASE_ID)
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}`)
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 500 when database delete fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { message: 'delete failed' })
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}`)
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('delete failed')
  })
})
