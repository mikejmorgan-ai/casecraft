/**
 * @jest-environment node
 */

/**
 * Tests for GET / POST / PATCH / DELETE  /api/cases/[id]/agents
 *
 * Route: src/app/api/cases/[id]/agents/route.ts
 */
// NextRequest imported by helpers
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

// Mock AGENT_ROLE_TEMPLATES for the POST template-merge logic
jest.mock('@/lib/ai/prompts', () => ({
  AGENT_ROLE_TEMPLATES: {
    judge: { defaultName: 'Judge', defaultPrompt: 'You are a judge.', defaultTemperature: 0.6 },
    plaintiff_attorney: { defaultName: 'Plaintiff', defaultPrompt: 'You are plaintiff.', defaultTemperature: 0.7 },
    defense_attorney: { defaultName: 'Defense', defaultPrompt: 'You are defense.', defaultTemperature: 0.7 },
    court_clerk: { defaultName: 'Clerk', defaultPrompt: 'You are a clerk.', defaultTemperature: 0.4 },
    witness: { defaultName: 'Witness', defaultPrompt: 'You are a witness.', defaultTemperature: 0.8 },
    expert_witness: { defaultName: 'Expert', defaultPrompt: 'You are an expert.', defaultTemperature: 0.5 },
    mediator: { defaultName: 'Mediator', defaultPrompt: 'You are a mediator.', defaultTemperature: 0.7 },
  },
}))

import { GET, POST, PATCH, DELETE } from '@/app/api/cases/[id]/agents/route'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const TEST_CASE_ID = 'test-case-id'
const TEST_AGENT_ID = 'test-agent-id'
const dynamicParams = makeDynamicParams(TEST_CASE_ID)

const sampleAgent = {
  id: TEST_AGENT_ID,
  case_id: TEST_CASE_ID,
  role: 'judge',
  name: 'The Honorable Judge',
  persona_prompt: 'You are a judge.',
  temperature: 0.6,
  is_active: true,
}

// ---------------------------------------------------------------------------
// GET /api/cases/[id]/agents
// ---------------------------------------------------------------------------
describe('GET /api/cases/[id]/agents', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns agents for the given case', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const agentsData = [
      sampleAgent,
      { ...sampleAgent, id: 'agent-2', role: 'plaintiff_attorney', name: 'Plaintiff Counsel' },
    ]
    const chain = mockSupabaseChain(agentsData)
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/agents`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(agentsData)
    expect(mockFrom).toHaveBeenCalledWith('agents')
    expect(chain.select).toHaveBeenCalledWith('*')
    expect(chain.eq).toHaveBeenCalledWith('case_id', TEST_CASE_ID)
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: true })
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/agents`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 500 on database error', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { message: 'agent query failed' })
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/agents`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('agent query failed')
  })

  it('returns empty array when no agents exist', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain([])
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/agents`)
    const response = await GET(request, dynamicParams)
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// POST /api/cases/[id]/agents
// ---------------------------------------------------------------------------
describe('POST /api/cases/[id]/agents', () => {
  const validAgentData = {
    role: 'witness',
    name: 'John Doe',
    persona_prompt: 'You are a witness to the contract signing.',
  }

  beforeEach(() => jest.clearAllMocks())

  it('creates an agent with valid data and returns 201', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    const agentChain = mockSupabaseChain({
      id: 'new-agent-id',
      ...validAgentData,
      case_id: TEST_CASE_ID,
      temperature: 0.7,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'cases') return caseChain
      return agentChain
    })

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents`,
      'POST',
      validAgentData
    )
    const response = await POST(request, dynamicParams)
    await parseResponse(response)

    expect(response.status).toBe(201)
    expect(mockFrom).toHaveBeenCalledWith('agents')
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents`,
      'POST',
      validAgentData
    )
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(401)
  })

  it('returns 404 when case does not exist', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain(null)
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents`,
      'POST',
      validAgentData
    )
    const response = await POST(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(404)
    expect(body.error).toBe('Case not found')
  })

  it('returns 400 when role is invalid', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents`,
      'POST',
      { role: 'invalid_role', name: 'Test', persona_prompt: 'Test prompt' }
    )
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(400)
  })

  it('returns 400 when required fields are missing', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents`,
      'POST',
      { role: 'judge' } // missing name and persona_prompt
    )
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(400)
  })

  it('returns 500 when database insert fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    const agentChain = mockSupabaseChain(null, { message: 'insert failed' })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'cases') return caseChain
      return agentChain
    })

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents`,
      'POST',
      validAgentData
    )
    const response = await POST(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('insert failed')
  })

  it('accepts optional temperature field', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    const agentChain = mockSupabaseChain({
      id: 'new-agent-id',
      ...validAgentData,
      temperature: 0.3,
      case_id: TEST_CASE_ID,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'cases') return caseChain
      return agentChain
    })

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents`,
      'POST',
      { ...validAgentData, temperature: 0.3 }
    )
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(201)
  })

  it('returns 400 when temperature is out of range', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const caseChain = mockSupabaseChain({ id: TEST_CASE_ID })
    mockFrom.mockReturnValue(caseChain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents`,
      'POST',
      { ...validAgentData, temperature: 5.0 }
    )
    const response = await POST(request, dynamicParams)

    expect(response.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/cases/[id]/agents?agentId=...
// ---------------------------------------------------------------------------
describe('PATCH /api/cases/[id]/agents', () => {
  beforeEach(() => jest.clearAllMocks())

  it('updates an agent and returns updated data', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const updatedAgent = { ...sampleAgent, name: 'Judge Smith' }
    const chain = mockSupabaseChain(updatedAgent)
    mockFrom.mockReturnValue(chain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents?agentId=${TEST_AGENT_ID}`,
      'PATCH',
      { name: 'Judge Smith' }
    )
    const response = await PATCH(request, dynamicParams)
    const body = await parseResponse(response)

    expect(response.status).toBe(200)
    expect(body).toEqual(updatedAgent)
    expect(chain.update).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', TEST_AGENT_ID)
    expect(chain.eq).toHaveBeenCalledWith('case_id', TEST_CASE_ID)
  })

  it('returns 400 when agentId query param is missing', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents`,
      'PATCH',
      { name: 'Updated' }
    )
    const response = await PATCH(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(400)
    expect(body.error).toBe('Agent ID required')
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents?agentId=${TEST_AGENT_ID}`,
      'PATCH',
      { name: 'Updated' }
    )
    const response = await PATCH(request, dynamicParams)

    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid update data', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents?agentId=${TEST_AGENT_ID}`,
      'PATCH',
      { temperature: 10 } // out of range (0-2)
    )
    const response = await PATCH(request, dynamicParams)

    expect(response.status).toBe(400)
  })

  it('returns 500 when database update fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { message: 'update failed' })
    mockFrom.mockReturnValue(chain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents?agentId=${TEST_AGENT_ID}`,
      'PATCH',
      { name: 'New Name' }
    )
    const response = await PATCH(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('update failed')
  })

  it('allows updating is_active field', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const updatedAgent = { ...sampleAgent, is_active: false }
    const chain = mockSupabaseChain(updatedAgent)
    mockFrom.mockReturnValue(chain)

    const request = makeJsonRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents?agentId=${TEST_AGENT_ID}`,
      'PATCH',
      { is_active: false }
    )
    const response = await PATCH(request, dynamicParams)

    expect(response.status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/cases/[id]/agents?agentId=...
// ---------------------------------------------------------------------------
describe('DELETE /api/cases/[id]/agents', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes an agent and returns success', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null)
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents?agentId=${TEST_AGENT_ID}`
    )
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ success: boolean }>(response)

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', TEST_AGENT_ID)
    expect(chain.eq).toHaveBeenCalledWith('case_id', TEST_CASE_ID)
  })

  it('returns 400 when agentId query param is missing', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const request = makeGetRequest(`http://localhost/api/cases/${TEST_CASE_ID}/agents`)
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(400)
    expect(body.error).toBe('Agent ID required')
  })

  it('returns 401 when not authenticated', async () => {
    mockUnauthenticatedUser(mockAuthGetUser)

    const request = makeGetRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents?agentId=${TEST_AGENT_ID}`
    )
    const response = await DELETE(request, dynamicParams)

    expect(response.status).toBe(401)
  })

  it('returns 500 when database delete fails', async () => {
    mockAuthenticatedUser(mockAuthGetUser)

    const chain = mockSupabaseChain(null, { message: 'delete failed' })
    mockFrom.mockReturnValue(chain)

    const request = makeGetRequest(
      `http://localhost/api/cases/${TEST_CASE_ID}/agents?agentId=${TEST_AGENT_ID}`
    )
    const response = await DELETE(request, dynamicParams)
    const body = await parseResponse<{ error: string }>(response)

    expect(response.status).toBe(500)
    expect(body.error).toBe('delete failed')
  })
})
