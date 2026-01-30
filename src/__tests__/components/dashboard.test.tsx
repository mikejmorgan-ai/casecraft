/**
 * Dashboard Component Tests
 *
 * Note: The DashboardPage is an async server component that fetches data from Supabase.
 * We test it by mocking the Supabase client and rendering the component with mocked data.
 */

import { render, screen } from '@testing-library/react'

// Mock the Supabase server client
const mockGetUser = jest.fn()
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockOrder = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => ({
      select: () => ({
        order: () => mockOrder(),
      }),
    }),
  }),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Import after mocks are set up
import DashboardPage from '@/app/(dashboard)/dashboard/page'
import { redirect } from 'next/navigation'

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  }

  const mockCases = [
    {
      id: 'case-1',
      user_id: 'user-123',
      name: 'Smith v. Jones',
      case_number: '2024-CV-001',
      case_type: 'civil' as const,
      jurisdiction: 'Federal Court',
      status: 'active' as const,
      summary: 'A civil dispute',
      plaintiff_name: 'John Smith',
      defendant_name: 'Jane Jones',
      filed_date: '2024-01-15',
      metadata: {},
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
      agents: [{ count: 3 }],
      documents: [{ count: 5 }],
      conversations: [{ count: 2 }],
    },
    {
      id: 'case-2',
      user_id: 'user-123',
      name: 'Doe v. State',
      case_number: '2024-CR-002',
      case_type: 'criminal' as const,
      jurisdiction: 'State Court',
      status: 'draft' as const,
      summary: 'A criminal case',
      plaintiff_name: 'State',
      defendant_name: 'John Doe',
      filed_date: null,
      metadata: {},
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-12T10:00:00Z',
      agents: [{ count: 2 }],
      documents: [{ count: 0 }],
      conversations: [{ count: 0 }],
    },
  ]

  it('redirects to login if user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    try {
      await DashboardPage()
    } catch {
      // redirect throws in tests
    }

    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('renders dashboard header', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    mockOrder.mockResolvedValueOnce({
      data: mockCases,
      error: null,
    })

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Manage your legal simulations')).toBeInTheDocument()
  })

  it('renders stats cards with correct counts', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    mockOrder.mockResolvedValueOnce({
      data: mockCases,
      error: null,
    })

    const page = await DashboardPage()
    render(page)

    // Check for stat labels
    expect(screen.getByText('Total Cases')).toBeInTheDocument()
    expect(screen.getByText('Active Cases')).toBeInTheDocument()
    expect(screen.getByText('Draft Cases')).toBeInTheDocument()

    // Check for stat values (2 total, 1 active, 1 draft)
    expect(screen.getByText('2')).toBeInTheDocument() // Total
    const oneElements = screen.getAllByText('1')
    expect(oneElements.length).toBeGreaterThanOrEqual(2) // Active and Draft
  })

  it('renders case cards with case information', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    mockOrder.mockResolvedValueOnce({
      data: mockCases,
      error: null,
    })

    const page = await DashboardPage()
    render(page)

    // Check for case names
    expect(screen.getByText('Smith v. Jones')).toBeInTheDocument()
    expect(screen.getByText('Doe v. State')).toBeInTheDocument()

    // Check for case types
    expect(screen.getByText(/Civil/)).toBeInTheDocument()
    expect(screen.getByText(/Criminal/)).toBeInTheDocument()

    // Check for status badges
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('renders case card with party names', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    mockOrder.mockResolvedValueOnce({
      data: mockCases,
      error: null,
    })

    const page = await DashboardPage()
    render(page)

    // Check for party names display
    expect(screen.getByText('John Smith v. Jane Jones')).toBeInTheDocument()
    expect(screen.getByText('State v. John Doe')).toBeInTheDocument()
  })

  it('renders case card with agent, document, and conversation counts', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    mockOrder.mockResolvedValueOnce({
      data: mockCases,
      error: null,
    })

    const page = await DashboardPage()
    render(page)

    // Check for counts
    expect(screen.getByText('3 agents')).toBeInTheDocument()
    expect(screen.getByText('5 documents')).toBeInTheDocument()
    expect(screen.getByText('2 conversations')).toBeInTheDocument()

    // Second case counts
    expect(screen.getByText('2 agents')).toBeInTheDocument()
    expect(screen.getByText('0 documents')).toBeInTheDocument()
    expect(screen.getByText('0 conversations')).toBeInTheDocument()
  })

  it('renders empty state when no cases exist', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    mockOrder.mockResolvedValueOnce({
      data: [],
      error: null,
    })

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('No cases yet')).toBeInTheDocument()
    expect(
      screen.getByText('Create your first case to start simulating legal proceedings.')
    ).toBeInTheDocument()
  })

  it('renders empty state when cases data is null', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    mockOrder.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('No cases yet')).toBeInTheDocument()
  })

  it('renders "New Case" button in header', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    mockOrder.mockResolvedValueOnce({
      data: mockCases,
      error: null,
    })

    const page = await DashboardPage()
    render(page)

    const newCaseButtons = screen.getAllByRole('button', { name: /new case/i })
    expect(newCaseButtons.length).toBeGreaterThan(0)
  })

  it('renders case cards as links to case detail pages', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    mockOrder.mockResolvedValueOnce({
      data: mockCases,
      error: null,
    })

    const page = await DashboardPage()
    render(page)

    // Check for links to case detail pages
    const links = screen.getAllByRole('link')
    const caseLinks = links.filter(
      (link) => link.getAttribute('href')?.includes('/case/')
    )
    expect(caseLinks.length).toBe(2)
    expect(caseLinks[0]).toHaveAttribute('href', '/case/case-1')
    expect(caseLinks[1]).toHaveAttribute('href', '/case/case-2')
  })

  it('displays zero stats when there are no cases', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    mockOrder.mockResolvedValueOnce({
      data: [],
      error: null,
    })

    const page = await DashboardPage()
    render(page)

    // All stats should be 0
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBe(3) // Total, Active, Draft
  })

  it('correctly calculates active and draft case counts', async () => {
    const mixedCases = [
      { ...mockCases[0], status: 'active' as const },
      { ...mockCases[1], status: 'draft' as const },
      { ...mockCases[0], id: 'case-3', status: 'active' as const },
      { ...mockCases[1], id: 'case-4', status: 'closed' as const },
    ]

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    })
    mockOrder.mockResolvedValueOnce({
      data: mixedCases,
      error: null,
    })

    const page = await DashboardPage()
    render(page)

    // Total: 4, Active: 2, Draft: 1
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
