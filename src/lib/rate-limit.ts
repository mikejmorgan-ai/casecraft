/**
 * Simple in-memory rate limiter for API endpoints
 * For production, consider using Upstash Redis: @upstash/ratelimit
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60000, max: 100 })
 *   const result = await limiter.check(userId)
 *   if (!result.success) return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
 */

interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number
  /** Max requests per window */
  max: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store (cleared on server restart)
const stores = new Map<string, Map<string, RateLimitStore>>()

export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, max } = config
  const storeId = `${windowMs}-${max}`

  if (!stores.has(storeId)) {
    stores.set(storeId, new Map())
  }

  const store = stores.get(storeId)!

  return {
    async check(identifier: string): Promise<RateLimitResult> {
      const now = Date.now()
      const record = store.get(identifier)

      // Clean up expired entries periodically
      if (Math.random() < 0.01) {
        for (const [key, value] of store.entries()) {
          if (value.resetTime < now) {
            store.delete(key)
          }
        }
      }

      if (!record || record.resetTime < now) {
        // New window
        store.set(identifier, {
          count: 1,
          resetTime: now + windowMs,
        })
        return {
          success: true,
          remaining: max - 1,
          reset: now + windowMs,
        }
      }

      if (record.count >= max) {
        // Rate limited
        return {
          success: false,
          remaining: 0,
          reset: record.resetTime,
        }
      }

      // Increment
      record.count++
      return {
        success: true,
        remaining: max - record.count,
        reset: record.resetTime,
      }
    },

    /** Get headers for rate limit response */
    getHeaders(result: RateLimitResult): Record<string, string> {
      return {
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
      }
    },
  }
}

// Pre-configured limiters for different endpoint types
export const rateLimiters = {
  /** Standard API: 100 requests per minute */
  standard: createRateLimiter({ windowMs: 60 * 1000, max: 100 }),

  /** AI/Expensive operations: 10 requests per minute */
  ai: createRateLimiter({ windowMs: 60 * 1000, max: 10 }),

  /** Upload operations: 5 requests per minute */
  upload: createRateLimiter({ windowMs: 60 * 1000, max: 5 }),

  /** Auth operations: 5 requests per minute (prevent brute force) */
  auth: createRateLimiter({ windowMs: 60 * 1000, max: 5 }),
}

/**
 * Helper to apply rate limiting in API routes
 *
 * Example:
 *   const rateLimitResult = await applyRateLimit(request, 'ai')
 *   if (rateLimitResult) return rateLimitResult
 */
export async function applyRateLimit(
  request: Request,
  type: keyof typeof rateLimiters = 'standard'
): Promise<Response | null> {
  const limiter = rateLimiters[type]

  // Use IP or user ID as identifier
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0] ?? 'unknown'

  const result = await limiter.check(ip)

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...limiter.getHeaders(result),
        },
      }
    )
  }

  return null
}
