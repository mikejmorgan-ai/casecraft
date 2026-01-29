import { createServiceSupabase } from '@/lib/supabase/server'

export type MetricType =
  | 'chat_messages'
  | 'turbo_simulations'
  | 'full_simulations'
  | 'hearings'
  | 'tts_minutes'
  | 'documents_embedded'

export type PlanTier = 'free' | 'solo' | 'team' | 'enterprise'

export interface UsageStatus {
  allowed: boolean
  currentUsage: number
  limit: number
  remaining: number
  planTier: PlanTier
}

export interface UserSubscription {
  planTier: PlanTier
  status: string
  currentPeriodEnd: string | null
  limits: {
    maxCases: number
    maxMessages: number
    maxSimulations: number
    maxHearings: number
    maxTtsMinutes: number
    maxDocumentsPerCase: number
  }
  usage: {
    messages: number
    simulations: number
    hearings: number
  }
}

// Plan limits (fallback if DB lookup fails)
const PLAN_LIMITS: Record<
  PlanTier,
  {
    max_messages: number
    max_simulations: number
    max_hearings: number
    max_tts_minutes: number
    max_documents: number
    max_cases: number
  }
> = {
  free: {
    max_messages: 10,
    max_simulations: 1,
    max_hearings: 0,
    max_tts_minutes: 0,
    max_documents: 3,
    max_cases: 1,
  },
  solo: {
    max_messages: 500,
    max_simulations: 20,
    max_hearings: 5,
    max_tts_minutes: 30,
    max_documents: 25,
    max_cases: 5,
  },
  team: {
    max_messages: 2500,
    max_simulations: 100,
    max_hearings: 25,
    max_tts_minutes: 120,
    max_documents: 100,
    max_cases: 25,
  },
  enterprise: {
    max_messages: -1, // unlimited
    max_simulations: -1,
    max_hearings: -1,
    max_tts_minutes: -1,
    max_documents: -1,
    max_cases: -1,
  },
}

/**
 * Get user's current plan tier
 */
export async function getUserPlanTier(userId: string): Promise<PlanTier> {
  const supabase = createServiceSupabase()

  const { data } = await supabase
    .from('subscriptions')
    .select('plan_tier, status')
    .eq('user_id', userId)
    .single()

  if (!data || data.status === 'canceled') {
    return 'free'
  }

  return data.plan_tier as PlanTier
}

/**
 * Get user's current usage for a specific metric
 */
export async function getUserUsage(
  userId: string,
  metricType: MetricType
): Promise<number> {
  const supabase = createServiceSupabase()

  // Get current month start
  const periodStart = new Date()
  periodStart.setDate(1)
  periodStart.setHours(0, 0, 0, 0)
  const periodStartStr = periodStart.toISOString().split('T')[0]

  const { data } = await supabase
    .from('usage_records')
    .select('quantity')
    .eq('user_id', userId)
    .eq('metric_type', metricType)
    .eq('period_start', periodStartStr)

  if (!data || data.length === 0) {
    return 0
  }

  return data.reduce((sum, record) => sum + record.quantity, 0)
}

/**
 * Record usage for a metric
 */
export async function recordUsage(
  userId: string,
  metricType: MetricType,
  quantity: number = 1
): Promise<void> {
  const supabase = createServiceSupabase()

  // Get current month start
  const periodStart = new Date()
  periodStart.setDate(1)
  periodStart.setHours(0, 0, 0, 0)
  const periodStartStr = periodStart.toISOString().split('T')[0]

  const { error } = await supabase.from('usage_records').insert({
    user_id: userId,
    metric_type: metricType,
    quantity,
    period_start: periodStartStr,
  })

  if (error) {
    console.error('Failed to record usage:', error)
    // Don't throw - usage tracking shouldn't block operations
  }
}

/**
 * Check if user can perform an action based on their usage limits
 */
export async function checkUsageLimit(
  userId: string,
  metricType: MetricType
): Promise<UsageStatus> {
  const [planTier, currentUsage] = await Promise.all([
    getUserPlanTier(userId),
    getUserUsage(userId, metricType),
  ])

  const limits = PLAN_LIMITS[planTier]
  let limit: number

  switch (metricType) {
    case 'chat_messages':
      limit = limits.max_messages
      break
    case 'turbo_simulations':
    case 'full_simulations':
      limit = limits.max_simulations
      break
    case 'hearings':
      limit = limits.max_hearings
      break
    case 'tts_minutes':
      limit = limits.max_tts_minutes
      break
    case 'documents_embedded':
      limit = limits.max_documents
      break
    default:
      limit = 0
  }

  // -1 means unlimited
  const allowed = limit === -1 || currentUsage < limit
  const remaining = limit === -1 ? Infinity : Math.max(0, limit - currentUsage)

  return {
    allowed,
    currentUsage,
    limit,
    remaining,
    planTier,
  }
}

/**
 * Check if user can create a new case
 */
export async function checkCaseLimit(userId: string): Promise<UsageStatus> {
  const supabase = createServiceSupabase()
  const planTier = await getUserPlanTier(userId)
  const limits = PLAN_LIMITS[planTier]

  // Count existing cases
  const { count } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'archived')

  const currentUsage = count || 0
  const limit = limits.max_cases
  const allowed = limit === -1 || currentUsage < limit
  const remaining = limit === -1 ? Infinity : Math.max(0, limit - currentUsage)

  return {
    allowed,
    currentUsage,
    limit,
    remaining,
    planTier,
  }
}

/**
 * Get user's full subscription info with usage
 */
export async function getUserSubscription(
  userId: string
): Promise<UserSubscription> {
  const supabase = createServiceSupabase()

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  const planTier: PlanTier = subscription?.plan_tier || 'free'
  const limits = PLAN_LIMITS[planTier]

  // Get current usage
  const [messagesUsage, simulationsUsage, hearingsUsage] = await Promise.all([
    getUserUsage(userId, 'chat_messages'),
    getUserUsage(userId, 'turbo_simulations'),
    getUserUsage(userId, 'hearings'),
  ])

  return {
    planTier,
    status: subscription?.status || 'free',
    currentPeriodEnd: subscription?.current_period_end || null,
    limits: {
      maxCases: limits.max_cases,
      maxMessages: limits.max_messages,
      maxSimulations: limits.max_simulations,
      maxHearings: limits.max_hearings,
      maxTtsMinutes: limits.max_tts_minutes,
      maxDocumentsPerCase: limits.max_documents,
    },
    usage: {
      messages: messagesUsage,
      simulations: simulationsUsage,
      hearings: hearingsUsage,
    },
  }
}

/**
 * Middleware helper to check and record usage in one call
 * Returns null if allowed, or a Response if blocked
 */
export async function enforceUsageLimit(
  userId: string,
  metricType: MetricType,
  quantity: number = 1
): Promise<Response | null> {
  const status = await checkUsageLimit(userId, metricType)

  if (!status.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Usage limit exceeded',
        limit: status.limit,
        current: status.currentUsage,
        planTier: status.planTier,
        upgradeUrl: '/pricing',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-Usage-Limit': status.limit.toString(),
          'X-Usage-Current': status.currentUsage.toString(),
          'X-Plan-Tier': status.planTier,
        },
      }
    )
  }

  // Record the usage
  await recordUsage(userId, metricType, quantity)

  return null
}
