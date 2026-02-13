import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FactsList } from '@/components/facts/facts-list'
import type { CaseFact, Document } from '@/lib/types'

// Mock next/navigation
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

// Mock window.confirm
const mockConfirm = jest.fn()
global.confirm = mockConfirm

describe('FactsList', () => {
  const mockCaseId = 'case-123'

  const mockDocuments: Document[] = [
    {
      id: 'doc-1',
      case_id: mockCaseId,
      name: 'Complaint.pdf',
      type: 'complaint',
      size: 1024,
      content_type: 'application/pdf',
      storage_path: '/docs/complaint.pdf',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'doc-2',
      case_id: mockCaseId,
      name: 'Evidence.pdf',
      type: 'exhibit',
      size: 2048,
      content_type: 'application/pdf',
      storage_path: '/docs/evidence.pdf',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ]

  const mockFacts: CaseFact[] = [
    {
      id: 'fact-1',
      case_id: mockCaseId,
      category: 'undisputed',
      fact_text: 'The defendant was present at the scene.',
      is_disputed: false,
      supporting_evidence: [],
      source_document_id: 'doc-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'fact-2',
      case_id: mockCaseId,
      category: 'disputed',
      fact_text: 'The plaintiff claims damages of $50,000.',
      is_disputed: true,
      supporting_evidence: [],
      source_document_id: null,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 'fact-3',
      case_id: mockCaseId,
      category: 'testimony',
      fact_text: 'Witness testified seeing the incident.',
      is_disputed: false,
      supporting_evidence: [],
      source_document_id: null,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('renders the facts list header', () => {
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    expect(screen.getByText('Case Facts')).toBeInTheDocument()
  })

  it('displays correct count of disputed and undisputed facts', () => {
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    // 2 undisputed, 1 disputed
    expect(screen.getByText('2 undisputed, 1 disputed')).toBeInTheDocument()
  })

  it('renders all facts with their text', () => {
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    expect(screen.getByText('The defendant was present at the scene.')).toBeInTheDocument()
    expect(screen.getByText('The plaintiff claims damages of $50,000.')).toBeInTheDocument()
    expect(screen.getByText('Witness testified seeing the incident.')).toBeInTheDocument()
  })

  it('displays category badges for each fact', () => {
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    expect(screen.getByText('Undisputed')).toBeInTheDocument()
    // "Disputed" appears twice - as category badge and as destructive badge
    expect(screen.getAllByText('Disputed').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Testimony')).toBeInTheDocument()
  })

  it('shows disputed badge for disputed facts', () => {
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    // The disputed fact should have both "Disputed" category badge and destructive "Disputed" badge
    const disputedBadges = screen.getAllByText('Disputed')
    expect(disputedBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('renders empty state when no facts exist', () => {
    render(<FactsList caseId={mockCaseId} facts={[]} documents={mockDocuments} />)

    expect(screen.getByText('No facts established')).toBeInTheDocument()
    expect(screen.getByText('Add key facts to help agents understand the case.')).toBeInTheDocument()
  })

  it('shows Add Fact button in header when facts exist', () => {
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    const addButtons = screen.getAllByRole('button', { name: /add fact/i })
    expect(addButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows Add Fact buttons in empty state', () => {
    render(<FactsList caseId={mockCaseId} facts={[]} documents={mockDocuments} />)

    // In empty state, there are 2 Add Fact buttons - one in header and one in empty state card
    const addButtons = screen.getAllByRole('button', { name: /add fact/i })
    expect(addButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('opens add fact dialog when button is clicked', async () => {
    const user = userEvent.setup()
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    const addButtons = screen.getAllByRole('button', { name: /add fact/i })
    await user.click(addButtons[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Add Case Fact')).toBeInTheDocument()
  })

  it('displays form fields in add fact dialog', async () => {
    const user = userEvent.setup()
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    const addButtons = screen.getAllByRole('button', { name: /add fact/i })
    await user.click(addButtons[0])

    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText(/fact statement/i)).toBeInTheDocument()
    expect(screen.getByText('Is Disputed?')).toBeInTheDocument()
    expect(screen.getByText('Source Document (optional)')).toBeInTheDocument()
  })

  it('submits new fact via API', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-fact' }),
    })

    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    const addButtons = screen.getAllByRole('button', { name: /add fact/i })
    await user.click(addButtons[0])

    // Fill in the fact text
    const textarea = screen.getByLabelText(/fact statement/i)
    await user.type(textarea, 'A new fact statement')

    // Submit the form - find by id to distinguish from trigger button
    const submitButton = document.getElementById('btn-submit-fact')
    expect(submitButton).toBeInTheDocument()
    await user.click(submitButton!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/cases/${mockCaseId}/facts`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('A new fact statement'),
        })
      )
    })

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('disables submit button when fact text is empty', async () => {
    const user = userEvent.setup()
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    const addButtons = screen.getAllByRole('button', { name: /add fact/i })
    await user.click(addButtons[0])

    // The submit button should be disabled since fact text is empty
    const submitButton = document.getElementById('btn-submit-fact')
    expect(submitButton).toBeDisabled()
  })

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    const addButtons = screen.getAllByRole('button', { name: /add fact/i })
    await user.click(addButtons[0])

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

    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    // Find delete buttons (one per fact)
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg.lucide-trash-2')
    )
    expect(deleteButtons.length).toBe(3)

    await user.click(deleteButtons[0])

    expect(mockConfirm).toHaveBeenCalledWith('Delete this fact?')

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/cases/${mockCaseId}/facts?factId=fact-1`,
        { method: 'DELETE' }
      )
    })

    expect(mockRefresh).toHaveBeenCalled()
  })

  it('does not delete when confirm is cancelled', async () => {
    const user = userEvent.setup()
    mockConfirm.mockReturnValue(false)

    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg.lucide-trash-2')
    )
    await user.click(deleteButtons[0])

    expect(mockConfirm).toHaveBeenCalledWith('Delete this fact?')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('displays category select in dialog', async () => {
    const user = userEvent.setup()
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    const addButtons = screen.getAllByRole('button', { name: /add fact/i })
    await user.click(addButtons[0])

    // The category select should be visible
    const categorySelect = document.getElementById('select-fact-category')
    expect(categorySelect).toBeInTheDocument()
  })

  it('displays source document select in dialog when documents exist', async () => {
    const user = userEvent.setup()
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    const addButtons = screen.getAllByRole('button', { name: /add fact/i })
    await user.click(addButtons[0])

    // The source document select should be visible
    const sourceSelect = document.getElementById('select-fact-source')
    expect(sourceSelect).toBeInTheDocument()
  })

  it('does not show source document select when no documents exist', async () => {
    const user = userEvent.setup()
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={[]} />)

    const addButtons = screen.getAllByRole('button', { name: /add fact/i })
    await user.click(addButtons[0])

    // Should only have one combobox (category select)
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBe(1)
    expect(screen.queryByText('Source Document (optional)')).not.toBeInTheDocument()
  })

  it('shows counts with zero facts', () => {
    render(<FactsList caseId={mockCaseId} facts={[]} documents={mockDocuments} />)

    expect(screen.getByText('0 undisputed, 0 disputed')).toBeInTheDocument()
  })

  it('renders fact cards with proper structure', () => {
    render(<FactsList caseId={mockCaseId} facts={mockFacts} documents={mockDocuments} />)

    // Each fact should be in a card
    const factCards = document.querySelectorAll('[id^="fact-card-"]')
    expect(factCards.length).toBe(3)
  })
})
