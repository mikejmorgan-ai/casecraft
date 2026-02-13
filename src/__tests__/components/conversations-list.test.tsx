import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConversationsList } from '@/components/chat/conversations-list'
import type { Conversation, Agent } from '@/lib/types'

// Mock next/navigation
const mockRefresh = jest.fn()
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: mockPush,
  }),
}))

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock window.confirm
const mockConfirm = jest.fn()
global.confirm = mockConfirm

describe('ConversationsList', () => {
  const mockCaseId = 'case-123'

  const mockAgents: Agent[] = [
    {
      id: 'agent-1',
      case_id: mockCaseId,
      role: 'judge',
      name: 'Judge Williams',
      persona_prompt: 'A fair and impartial judge.',
      temperature: 0.5,
      is_active: true,
      avatar_url: null,
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'agent-2',
      case_id: mockCaseId,
      role: 'plaintiff_attorney',
      name: 'Attorney Smith',
      persona_prompt: 'An aggressive plaintiff attorney.',
      temperature: 0.7,
      is_active: true,
      avatar_url: null,
      metadata: {},
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 'agent-3',
      case_id: mockCaseId,
      role: 'defense_attorney',
      name: 'Attorney Jones',
      persona_prompt: 'A defensive attorney.',
      temperature: 0.6,
      is_active: false,
      avatar_url: null,
      metadata: {},
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
  ]

  const mockConversations: Conversation[] = [
    {
      id: 'conv-1',
      case_id: mockCaseId,
      name: 'Motion Hearing',
      conversation_type: 'hearing',
      participants: ['agent-1', 'agent-2'],
      is_active: true,
      metadata: {},
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z',
    },
    {
      id: 'conv-2',
      case_id: mockCaseId,
      name: 'Deposition - Expert Witness',
      conversation_type: 'deposition',
      participants: ['agent-2'],
      is_active: true,
      metadata: {},
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 'conv-3',
      case_id: mockCaseId,
      name: 'Strategy Meeting',
      conversation_type: 'strategy_session',
      participants: ['agent-1', 'agent-2', 'agent-3'],
      is_active: true,
      metadata: {},
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('renders the conversations list header', () => {
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    expect(screen.getByText('Conversations')).toBeInTheDocument()
    expect(screen.getByText('Simulated proceedings and discussions')).toBeInTheDocument()
  })

  it('renders all conversations with their names', () => {
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    expect(screen.getByText('Motion Hearing')).toBeInTheDocument()
    expect(screen.getByText('Deposition - Expert Witness')).toBeInTheDocument()
    expect(screen.getByText('Strategy Meeting')).toBeInTheDocument()
  })

  it('displays conversation type badges', () => {
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    expect(screen.getByText('Hearing')).toBeInTheDocument()
    expect(screen.getByText('Deposition')).toBeInTheDocument()
    expect(screen.getByText('Strategy Session')).toBeInTheDocument()
  })

  it('renders empty state when no conversations exist', () => {
    render(<ConversationsList caseId={mockCaseId} conversations={[]} agents={mockAgents} />)

    expect(screen.getByText('No conversations yet')).toBeInTheDocument()
    expect(screen.getByText('Start a new conversation to simulate legal proceedings.')).toBeInTheDocument()
  })

  it('shows New Conversation button in header when conversations exist', () => {
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const newButtons = screen.getAllByRole('button', { name: /new conversation/i })
    expect(newButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Open button for each conversation', () => {
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const openButtons = screen.getAllByRole('button', { name: /open/i })
    expect(openButtons.length).toBe(3)
  })

  it('renders conversation links with correct hrefs', () => {
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/case/case-123/conversation/conv-1')
    expect(links[1]).toHaveAttribute('href', '/case/case-123/conversation/conv-2')
    expect(links[2]).toHaveAttribute('href', '/case/case-123/conversation/conv-3')
  })

  it('opens new conversation dialog when button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const newButtons = screen.getAllByRole('button', { name: /new conversation/i })
    await user.click(newButtons[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Start New Conversation')).toBeInTheDocument()
  })

  it('displays form fields in new conversation dialog', async () => {
    const user = userEvent.setup()
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const newButtons = screen.getAllByRole('button', { name: /new conversation/i })
    await user.click(newButtons[0])

    expect(screen.getByLabelText(/conversation name/i)).toBeInTheDocument()
    expect(screen.getByText('Conversation Type')).toBeInTheDocument()
  })

  it('shows active agents count in dialog', async () => {
    const user = userEvent.setup()
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const newButtons = screen.getAllByRole('button', { name: /new conversation/i })
    await user.click(newButtons[0])

    // 2 active agents (agent-3 is not active)
    expect(screen.getByText('2 active agents will participate.')).toBeInTheDocument()
  })

  it('submits new conversation via API', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-conv-123' }),
    })

    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const newButtons = screen.getAllByRole('button', { name: /new conversation/i })
    await user.click(newButtons[0])

    // Fill in the name
    const nameInput = screen.getByLabelText(/conversation name/i)
    await user.type(nameInput, 'Test Hearing')

    // Submit the form
    const submitButton = document.getElementById('btn-start-conversation')
    await user.click(submitButton!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/cases/${mockCaseId}/conversations`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test Hearing'),
        })
      )
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/case/case-123/conversation/new-conv-123')
    })
  })

  it('disables submit button when name is empty', async () => {
    const user = userEvent.setup()
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const newButtons = screen.getAllByRole('button', { name: /new conversation/i })
    await user.click(newButtons[0])

    const submitButton = document.getElementById('btn-start-conversation')
    expect(submitButton).toBeDisabled()
  })

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const newButtons = screen.getAllByRole('button', { name: /new conversation/i })
    await user.click(newButtons[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('calls delete API when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup()
    mockConfirm.mockReturnValue(true)
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    // Find delete buttons
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg.lucide-trash-2')
    )
    expect(deleteButtons.length).toBe(3)

    await user.click(deleteButtons[0])

    expect(mockConfirm).toHaveBeenCalledWith('Delete this conversation? All messages will be lost.')

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/cases/${mockCaseId}/conversations?convId=conv-1`,
        { method: 'DELETE' }
      )
    })

    expect(mockRefresh).toHaveBeenCalled()
  })

  it('does not delete when confirm is cancelled', async () => {
    const user = userEvent.setup()
    mockConfirm.mockReturnValue(false)

    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg.lucide-trash-2')
    )
    await user.click(deleteButtons[0])

    expect(mockConfirm).toHaveBeenCalledWith('Delete this conversation? All messages will be lost.')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('renders conversation cards with proper structure', () => {
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const convCards = document.querySelectorAll('[id^="conversation-card-"]')
    expect(convCards.length).toBe(3)
  })

  it('displays conversation type select in dialog', async () => {
    const user = userEvent.setup()
    render(<ConversationsList caseId={mockCaseId} conversations={mockConversations} agents={mockAgents} />)

    const newButtons = screen.getAllByRole('button', { name: /new conversation/i })
    await user.click(newButtons[0])

    const typeSelect = document.getElementById('select-conv-type')
    expect(typeSelect).toBeInTheDocument()
  })
})
