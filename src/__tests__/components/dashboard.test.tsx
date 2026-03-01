/**
 * Dashboard Component Tests
 *
 * The DashboardPage is an async server component that fetches data from Supabase.
 * It queries three tables: cases, case_predictions, and documents.
 * We mock the Supabase client and render the component with mocked data.
 */

import { render, screen } from '@testing-library/react'

// Build chainable query mocks per table
function createChainMock(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, jest.Mock> = {}
  chain.select = jest.fn().mockReturnValue(chain)
  chain.order = jest.fn().mockReturnValue(chain)
  chain.limit = jest.fn().mockResolvedValue(resolvedValue)
  chain.single = jest.fn().mockResolvedValue(resolvedValue)
  chain.eq = jest.fn().mockReturnValue(chain)
  // Allow .then() so Promise.all works on the chain directly
  chain.then = jest.fn((resolve: (v: unknown) => void) => resolve(resolvedValue))
  return chain
}

let casesChain: ReturnType<typeof createChainMock>
let predictionsChain: ReturnType<typeof createChainMock>
let documentsChain: ReturnType<typeof createChainMock>
let profilesChain: ReturnType<typeof createChainMock>

const mockGetUser = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn().mockImplementation(async () => ({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      if (table === 'cases') return casesChain
      if (table === 'case_predictions') return predictionsChain
      if (table === 'documents') return documentsChain
      if (table === 'user_profiles') return profilesChain
      return createChainMock({ data: null, error: null })
    },
  })),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock next/headers cookies
const mockCookiesGet = jest.fn()
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: (name: string) => mockCookiesGet(name),
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

// Import after mocks are set up
import DashboardPage from '@/app/(dashboard)/dashboard/page'
import { redirect } from 'next/navigation'

describe('DashboardPage', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  }

  const mockCases = [
    {
      id: 'case-1',
      name: 'Smith v. Jones',
      case_number: '2024-CV-001',
      case_type: 'civil',
      status: 'active',
      is_blind_test: false,
      updated_at: '2024-01-20T10:00:00Z',
      case_predictions: [{ count: 1 }],
    },
    {
      id: 'case-2',
      name: 'Doe v. State',
      case_number: '2024-CR-002',
      case_type: 'criminal',
      status: 'draft',
      is_blind_test: true,
      updated_at: '2024-01-12T10:00:00Z',
      case_predictions: [{ count: 0 }],
    },
  ]

  const mockPredictions = [
    {
      id: 'pred-1',
      predicted_outcome: 'plaintiff',
      confidence_score: 75,
      is_correct: true,
      accuracy_score: 85,
      created_at: '2024-01-18T10:00:00Z',
      cases: { name: 'Smith v. Jones' },
    },
  ]

  function setupMocks(options?: {
    user?: typeof mockUser | null
    cases?: typeof mockCases | null
    predictions?: typeof mockPredictions | null
    totalDocs?: number
    hasBetaBypass?: boolean
  }) {
    const {
      user = mockUser,
      cases = mockCases,
      predictions = mockPredictions,
      totalDocs = 10,
      hasBetaBypass = false,
    } = options || {}

    mockGetUser.mockResolvedValueOnce({
      data: { user },
      error: null,
    })

    // Mock beta_bypass cookie
    mockCookiesGet.mockImplementation((name: string) => {
      if (name === 'beta_bypass' && hasBetaBypass) {
        return { value: 'true' }
      }
      return undefined
    })

    casesChain = createChainMock({ data: cases, error: null })
    predictionsChain = createChainMock({ data: predictions, error: null })
    documentsChain = createChainMock({ data: { count: totalDocs }, error: null })
    profilesChain = createChainMock({ data: { role: 'attorney' }, error: null })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCookiesGet.mockReset()
  })

  it('redirects to login if user is not authenticated', async () => {
    setupMocks({ user: null })

    try {
      await DashboardPage()
    } catch {
      // redirect throws in tests
    }

    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('renders dashboard header', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('Attorney Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/litigation intelligence/i)).toBeInTheDocument()
  })

  it('renders stat cards with correct labels', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('Total Cases')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Blind Tests')).toBeInTheDocument()
    expect(screen.getByText('Avg Accuracy')).toBeInTheDocument()
  })

  it('renders correct total cases count', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    // 2 cases total, 1 blind test
    const totalCasesCard = screen.getByText('Total Cases').closest('[class]')
    expect(totalCasesCard).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders blind test count correctly', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    // 1 case has is_blind_test: true
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders quick action cards', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    // These appear in both quick actions and keyboard shortcuts, so use getAllByText
    expect(screen.getAllByText('Run Prediction').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Start Simulation')).toBeInTheDocument()
    expect(screen.getByText('Find Weaknesses')).toBeInTheDocument()
    // Check descriptions unique to quick action cards
    expect(screen.getByText('Analyze case documents and predict outcomes')).toBeInTheDocument()
    expect(screen.getByText('Mock trial with AI attorneys and judge')).toBeInTheDocument()
    expect(screen.getByText('Identify gaps and strategic fixes')).toBeInTheDocument()
  })

  it('renders recent cases section with case names', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('Recent Cases')).toBeInTheDocument()
    // "Smith v. Jones" appears in both Recent Cases and Recent Predictions
    expect(screen.getAllByText('Smith v. Jones').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Doe v. State')).toBeInTheDocument()
  })

  it('renders case cards with status badges', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('renders blind test badge for blind test cases', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('Blind Test')).toBeInTheDocument()
  })

  it('renders case cards as links to case detail pages', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    const links = screen.getAllByRole('link')
    const caseLinks = links.filter(
      (link) => link.getAttribute('href')?.includes('/case/')
    )
    expect(caseLinks.length).toBe(2)
    expect(caseLinks[0]).toHaveAttribute('href', '/case/case-1')
    expect(caseLinks[1]).toHaveAttribute('href', '/case/case-2')
  })

  it('renders empty state when no cases exist', async () => {
    setupMocks({ cases: [], predictions: [] })

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('No cases yet')).toBeInTheDocument()
  })

  it('renders empty state for predictions when none exist', async () => {
    setupMocks({ predictions: [] })

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('No predictions yet')).toBeInTheDocument()
  })

  it('renders recent predictions section with prediction data', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('Recent Predictions')).toBeInTheDocument()
    expect(screen.getByText(/plaintiff/)).toBeInTheDocument()
    expect(screen.getByText(/75% confidence/)).toBeInTheDocument()
  })

  it('renders New Case and Import Test Case buttons', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    // "New Case" appears in both header button and keyboard shortcuts
    expect(screen.getAllByText('New Case').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Import Test Case')).toBeInTheDocument()
  })

  it('renders keyboard shortcuts section', async () => {
    setupMocks()

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('Quick Search')).toBeInTheDocument()
    expect(screen.getByText('Shortcuts Help')).toBeInTheDocument()
  })

  it('handles null cases data gracefully', async () => {
    setupMocks({ cases: null, predictions: null })

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('No cases yet')).toBeInTheDocument()
  })
})
