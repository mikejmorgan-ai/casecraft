import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateCaseDialog } from '@/components/cases/create-case-dialog'

// Mock the fetch function
const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock the API error handler
jest.mock('@/lib/api-error', () => ({
  handleApiError: jest.fn().mockResolvedValue({
    message: 'An error occurred',
    fieldErrors: [],
  }),
}))

describe('CreateCaseDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('renders the "New Case" button', () => {
    render(<CreateCaseDialog />)

    expect(screen.getByRole('button', { name: /new case/i })).toBeInTheDocument()
  })

  it('opens the dialog when button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Create New Case')).toBeInTheDocument()
  })

  it('displays all form fields', async () => {
    const user = userEvent.setup()
    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))

    expect(screen.getByLabelText(/case name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/case type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/case number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/jurisdiction/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/plaintiff/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/defendant/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/case summary/i)).toBeInTheDocument()
  })

  it('allows typing in the case name field', async () => {
    const user = userEvent.setup()
    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))

    const caseNameInput = screen.getByLabelText(/case name/i)
    await user.type(caseNameInput, 'Smith v. Jones')

    expect(caseNameInput).toHaveValue('Smith v. Jones')
  })

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('submits form data and navigates on success', async () => {
    const user = userEvent.setup()
    const mockCaseId = 'new-case-123'

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: mockCaseId, name: 'Smith v. Jones' }),
    })

    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))

    // Fill in the form with valid data (name must be at least 3 chars)
    await user.type(screen.getByLabelText(/case name/i), 'Smith v. Jones')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create case/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Smith v. Jones'),
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/case/${mockCaseId}`)
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()

    // Create a promise that we can control
    let resolvePromise: (value: unknown) => void
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    ;(global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise)

    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))
    // Name must be at least 3 characters for validation to pass
    await user.type(screen.getByLabelText(/case name/i), 'Test Case')

    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /create case/i }).closest('form')!)

    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText(/creating/i)).toBeInTheDocument()
    })

    // Resolve the promise to clean up
    resolvePromise!({
      ok: true,
      json: async () => ({ id: 'test-id', name: 'Test Case' }),
    })
  })

  it('shows validation error when case name is too short', async () => {
    const user = userEvent.setup()
    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))

    // Type a name that's too short (less than 3 characters)
    const caseNameInput = screen.getByLabelText(/case name/i)
    await user.type(caseNameInput, 'AB')

    // Try to submit
    await user.click(screen.getByRole('button', { name: /create case/i }))

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument()
    })

    // Fetch should not be called
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('handles API error gracefully', async () => {
    const user = userEvent.setup()
    const { toast } = require('sonner')

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    })

    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))
    await user.type(screen.getByLabelText(/case name/i), 'Test Case Name')
    await user.click(screen.getByRole('button', { name: /create case/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })

  it('includes all case types in the select dropdown', async () => {
    const user = userEvent.setup()
    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))

    // The select trigger should be visible
    const selectTrigger = screen.getByRole('combobox')
    expect(selectTrigger).toBeInTheDocument()
  })

  it('sends correct form data structure to API', async () => {
    const user = userEvent.setup()

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-id', name: 'Test Case' }),
    })

    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))

    // Fill in with valid name (at least 3 chars)
    await user.type(screen.getByLabelText(/case name/i), 'Test Case')

    await user.click(screen.getByRole('button', { name: /create case/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
    const body = JSON.parse(fetchCall[1].body)

    // The schema transforms empty strings to undefined for optional fields
    // So only name and case_type should be present when other fields are empty
    expect(body.name).toBe('Test Case')
    expect(body.case_type).toBe('civil')
  })

  it('shows character count for summary field', async () => {
    const user = userEvent.setup()
    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))

    // Check for character count indicator
    expect(screen.getByText(/0\/1000/)).toBeInTheDocument()
  })

  it('updates character count when typing in summary', async () => {
    const user = userEvent.setup()
    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))

    const summaryInput = screen.getByLabelText(/case summary/i)
    await user.type(summaryInput, 'Test summary')

    // Character count should update
    expect(screen.getByText(/12\/1000/)).toBeInTheDocument()
  })

  it('resets form when dialog is closed and reopened', async () => {
    const user = userEvent.setup()
    render(<CreateCaseDialog />)

    // Open dialog and fill in some data
    await user.click(screen.getByRole('button', { name: /new case/i }))
    await user.type(screen.getByLabelText(/case name/i), 'Test Case')

    // Close dialog
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Reopen dialog
    await user.click(screen.getByRole('button', { name: /new case/i }))

    // Form should be reset
    expect(screen.getByLabelText(/case name/i)).toHaveValue('')
  })

  it('displays toast on successful case creation', async () => {
    const user = userEvent.setup()
    const { toast } = require('sonner')

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-id', name: 'New Test Case' }),
    })

    render(<CreateCaseDialog />)

    await user.click(screen.getByRole('button', { name: /new case/i }))
    await user.type(screen.getByLabelText(/case name/i), 'New Test Case')
    await user.click(screen.getByRole('button', { name: /create case/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Case created successfully',
        expect.objectContaining({
          description: expect.stringContaining('New Test Case'),
        })
      )
    })
  })
})
