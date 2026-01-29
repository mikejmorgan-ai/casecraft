/**
 * Utah Rule 6 Deadline Calculator
 *
 * Implements deadline computation per Utah Rules of Civil Procedure Rule 6.
 *
 * Key rules:
 * - Rule 6(a): Exclude the day of the event that triggers the period
 * - Rule 6(a): If last day is a Saturday, Sunday, or legal holiday, extend to next business day
 * - Rule 6(b): Service by mail adds 7 days (now 3 days per recent amendments for electronic)
 * - Rule 6(b): Service by email adds 3 days
 *
 * Reference: https://www.utcourts.gov/rules/view.php?type=urcp&rule=6
 */

export type ServiceMethod = 'personal' | 'mail' | 'electronic' | 'email' | 'fax'

export interface DeadlineOptions {
  /** The starting date (event that triggers the deadline) */
  startDate: Date
  /** Number of days for the deadline */
  days: number
  /** Method of service (affects additional days) */
  serviceMethod?: ServiceMethod
  /** Whether to count only business days (court days) */
  courtDaysOnly?: boolean
  /** Custom holidays to consider (in addition to federal holidays) */
  customHolidays?: Date[]
}

export interface DeadlineResult {
  /** The calculated deadline date */
  deadline: Date
  /** Original deadline before adjustments */
  originalDeadline: Date
  /** Days added for service method */
  serviceAddedDays: number
  /** Whether the deadline was adjusted for weekend/holiday */
  wasAdjusted: boolean
  /** Reason for adjustment, if any */
  adjustmentReason?: string
  /** Breakdown of the calculation */
  breakdown: string[]
}

/**
 * Utah State Legal Holidays
 * Reference: Utah Code 63G-1-301
 */
const UTAH_HOLIDAYS_2024_2026 = [
  // 2024
  new Date('2024-01-01'), // New Year's Day
  new Date('2024-01-15'), // Martin Luther King Jr. Day
  new Date('2024-02-19'), // Presidents' Day
  new Date('2024-05-27'), // Memorial Day
  new Date('2024-06-19'), // Juneteenth
  new Date('2024-07-04'), // Independence Day
  new Date('2024-07-24'), // Pioneer Day (Utah specific)
  new Date('2024-09-02'), // Labor Day
  new Date('2024-10-14'), // Columbus Day
  new Date('2024-11-11'), // Veterans Day
  new Date('2024-11-28'), // Thanksgiving
  new Date('2024-12-25'), // Christmas

  // 2025
  new Date('2025-01-01'), // New Year's Day
  new Date('2025-01-20'), // Martin Luther King Jr. Day
  new Date('2025-02-17'), // Presidents' Day
  new Date('2025-05-26'), // Memorial Day
  new Date('2025-06-19'), // Juneteenth
  new Date('2025-07-04'), // Independence Day
  new Date('2025-07-24'), // Pioneer Day (Utah specific)
  new Date('2025-09-01'), // Labor Day
  new Date('2025-10-13'), // Columbus Day
  new Date('2025-11-11'), // Veterans Day
  new Date('2025-11-27'), // Thanksgiving
  new Date('2025-12-25'), // Christmas

  // 2026
  new Date('2026-01-01'), // New Year's Day
  new Date('2026-01-19'), // Martin Luther King Jr. Day
  new Date('2026-02-16'), // Presidents' Day
  new Date('2026-05-25'), // Memorial Day
  new Date('2026-06-19'), // Juneteenth
  new Date('2026-07-03'), // Independence Day (observed)
  new Date('2026-07-24'), // Pioneer Day (Utah specific)
  new Date('2026-09-07'), // Labor Day
  new Date('2026-10-12'), // Columbus Day
  new Date('2026-11-11'), // Veterans Day
  new Date('2026-11-26'), // Thanksgiving
  new Date('2026-12-25'), // Christmas
]

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a Utah legal holiday
 */
function isHoliday(date: Date, customHolidays: Date[] = []): boolean {
  const dateStr = date.toISOString().split('T')[0]

  // Check standard Utah holidays
  const isStandardHoliday = UTAH_HOLIDAYS_2024_2026.some(
    h => h.toISOString().split('T')[0] === dateStr
  )

  // Check custom holidays
  const isCustomHoliday = customHolidays.some(
    h => h.toISOString().split('T')[0] === dateStr
  )

  return isStandardHoliday || isCustomHoliday
}

/**
 * Check if a date is a court business day
 */
function isCourtDay(date: Date, customHolidays: Date[] = []): boolean {
  return !isWeekend(date) && !isHoliday(date, customHolidays)
}

/**
 * Get additional days based on service method per Utah Rule 6(b)
 */
function getServiceAddedDays(method?: ServiceMethod): number {
  switch (method) {
    case 'mail':
      return 7 // Rule 6(b)(1)(B) - mail service
    case 'electronic':
    case 'email':
    case 'fax':
      return 3 // Rule 6(b)(1)(C) - electronic service
    case 'personal':
    default:
      return 0 // No additional days for personal service
  }
}

/**
 * Get the next business day (skipping weekends and holidays)
 */
function getNextBusinessDay(date: Date, customHolidays: Date[] = []): Date {
  const result = new Date(date)
  while (!isCourtDay(result, customHolidays)) {
    result.setDate(result.getDate() + 1)
  }
  return result
}

/**
 * Add calendar days to a date
 */
function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Add court days (business days) to a date
 */
function addCourtDays(date: Date, days: number, customHolidays: Date[] = []): Date {
  let result = new Date(date)
  let daysAdded = 0

  while (daysAdded < days) {
    result.setDate(result.getDate() + 1)
    if (isCourtDay(result, customHolidays)) {
      daysAdded++
    }
  }

  return result
}

/**
 * Format a date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Calculate a deadline per Utah Rule 6
 */
export function calculateDeadline(options: DeadlineOptions): DeadlineResult {
  const {
    startDate,
    days,
    serviceMethod,
    courtDaysOnly = false,
    customHolidays = []
  } = options

  const breakdown: string[] = []
  const serviceAddedDays = getServiceAddedDays(serviceMethod)
  const totalDays = days + serviceAddedDays

  breakdown.push(`Starting date: ${formatDate(startDate)}`)
  breakdown.push(`Base deadline: ${days} days`)

  if (serviceAddedDays > 0) {
    breakdown.push(
      `Service method (${serviceMethod}): +${serviceAddedDays} days per Rule 6(b)`
    )
    breakdown.push(`Total days: ${totalDays} days`)
  }

  // Rule 6(a): Exclude the day of the triggering event
  // Start counting from the next day
  const countingStart = addCalendarDays(startDate, 1)
  breakdown.push(`Rule 6(a): Begin counting from ${formatDate(countingStart)}`)

  // Calculate the deadline
  let originalDeadline: Date
  if (courtDaysOnly) {
    originalDeadline = addCourtDays(startDate, totalDays, customHolidays)
    breakdown.push(`Counting ${totalDays} court days (excluding weekends/holidays)`)
  } else {
    originalDeadline = addCalendarDays(startDate, totalDays)
    breakdown.push(`Counting ${totalDays} calendar days`)
  }

  breakdown.push(`Calculated deadline: ${formatDate(originalDeadline)}`)

  // Rule 6(a): Adjust if deadline falls on weekend or holiday
  let wasAdjusted = false
  let adjustmentReason: string | undefined
  let deadline = originalDeadline

  if (isWeekend(originalDeadline)) {
    wasAdjusted = true
    adjustmentReason = `Deadline falls on ${
      originalDeadline.getDay() === 0 ? 'Sunday' : 'Saturday'
    }`
    deadline = getNextBusinessDay(originalDeadline, customHolidays)
    breakdown.push(
      `Rule 6(a): ${adjustmentReason}, extended to next business day`
    )
  } else if (isHoliday(originalDeadline, customHolidays)) {
    wasAdjusted = true
    adjustmentReason = 'Deadline falls on a legal holiday'
    deadline = getNextBusinessDay(originalDeadline, customHolidays)
    breakdown.push(
      `Rule 6(a): ${adjustmentReason}, extended to next business day`
    )
  }

  breakdown.push(`Final deadline: ${formatDate(deadline)}`)

  return {
    deadline,
    originalDeadline,
    serviceAddedDays,
    wasAdjusted,
    adjustmentReason,
    breakdown
  }
}

/**
 * Common Utah deadline calculations
 */
export const UtahDeadlines = {
  /**
   * Answer to complaint: 21 days (URCP 12(a))
   */
  answerToComplaint: (serviceDate: Date, serviceMethod?: ServiceMethod) =>
    calculateDeadline({
      startDate: serviceDate,
      days: 21,
      serviceMethod
    }),

  /**
   * Response to motion: 14 days (URCP 7(d))
   */
  responseToMotion: (filingDate: Date, serviceMethod?: ServiceMethod) =>
    calculateDeadline({
      startDate: filingDate,
      days: 14,
      serviceMethod
    }),

  /**
   * Reply in support of motion: 7 days (URCP 7(d))
   */
  replyToResponse: (responseDate: Date, serviceMethod?: ServiceMethod) =>
    calculateDeadline({
      startDate: responseDate,
      days: 7,
      serviceMethod
    }),

  /**
   * Notice of appeal: 30 days (URAP 4(a))
   */
  noticeOfAppeal: (judgmentDate: Date) =>
    calculateDeadline({
      startDate: judgmentDate,
      days: 30
    }),

  /**
   * Discovery responses: 28 days (URCP 33, 34, 36)
   */
  discoveryResponse: (serviceDate: Date, serviceMethod?: ServiceMethod) =>
    calculateDeadline({
      startDate: serviceDate,
      days: 28,
      serviceMethod
    }),

  /**
   * Initial disclosures: 14 days after Rule 26 conference (URCP 26(a))
   */
  initialDisclosures: (conferenceDate: Date) =>
    calculateDeadline({
      startDate: conferenceDate,
      days: 14
    }),

  /**
   * Motion to compel: 14 days after discovery deadline (URCP 37)
   */
  motionToCompel: (discoveryDeadline: Date) =>
    calculateDeadline({
      startDate: discoveryDeadline,
      days: 14
    })
}

/**
 * Get all Utah legal holidays for a given year
 */
export function getUtahHolidays(year: number): Date[] {
  return UTAH_HOLIDAYS_2024_2026.filter(d => d.getFullYear() === year)
}

/**
 * Check if a specific date is a Utah court business day
 */
export function isUtahCourtDay(date: Date): boolean {
  return isCourtDay(date)
}
