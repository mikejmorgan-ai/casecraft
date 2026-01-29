import { describe, it, expect } from 'vitest'
import {
  calculateDeadline,
  UtahDeadlines,
  isUtahCourtDay,
  getUtahHolidays
} from '../deadline-calculator'

// Helper to create dates in local timezone avoiding UTC parsing issues
function localDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day) // month is 0-indexed in JS
}

// Helper to format date as YYYY-MM-DD in local timezone
function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

describe('Utah Rule 6 Deadline Calculator', () => {
  describe('calculateDeadline', () => {
    it('calculates a simple deadline correctly', () => {
      // Wednesday Jan 8, 2025 + 14 days = Wednesday Jan 22, 2025
      const result = calculateDeadline({
        startDate: localDate(2025, 1, 8),
        days: 14
      })

      expect(formatLocalDate(result.deadline)).toBe('2025-01-22')
      expect(result.serviceAddedDays).toBe(0)
    })

    it('extends deadline to Monday when it falls on Saturday', () => {
      // Monday Jan 6, 2025, add 4 days = Friday Jan 10 (no adjustment)
      // Monday Jan 6, 2025, add 5 days = Saturday Jan 11 -> Monday Jan 13
      const result = calculateDeadline({
        startDate: localDate(2025, 1, 6),
        days: 5
      })

      expect(formatLocalDate(result.deadline)).toBe('2025-01-13')
      expect(result.wasAdjusted).toBe(true)
    })

    it('extends deadline to Monday when it falls on Sunday', () => {
      // Monday Jan 6, 2025, add 6 days = Sunday Jan 12 -> Monday Jan 13
      const result = calculateDeadline({
        startDate: localDate(2025, 1, 6),
        days: 6
      })

      expect(formatLocalDate(result.deadline)).toBe('2025-01-13')
      expect(result.wasAdjusted).toBe(true)
    })

    it('adds 7 days for mail service per Rule 6(b)', () => {
      // 10 days + 7 days for mail = 17 days total
      // Jan 6 + 17 days = Jan 23
      const result = calculateDeadline({
        startDate: localDate(2025, 1, 6),
        days: 10,
        serviceMethod: 'mail'
      })

      expect(result.serviceAddedDays).toBe(7)
      expect(formatLocalDate(result.deadline)).toBe('2025-01-23')
    })

    it('adds 3 days for electronic service per Rule 6(b)', () => {
      // 10 days + 3 days for email = 13 days total
      // Jan 6 + 13 days = Jan 19 (Sunday) -> Jan 20 (MLK Day) -> Jan 21
      const result = calculateDeadline({
        startDate: localDate(2025, 1, 6),
        days: 10,
        serviceMethod: 'email'
      })

      expect(result.serviceAddedDays).toBe(3)
      expect(formatLocalDate(result.deadline)).toBe('2025-01-21')
    })

    it('adds 0 days for personal service', () => {
      const result = calculateDeadline({
        startDate: localDate(2025, 1, 6),
        days: 14,
        serviceMethod: 'personal'
      })

      expect(result.serviceAddedDays).toBe(0)
    })

    it('extends deadline when it falls on MLK Day (Utah holiday)', () => {
      // MLK Day 2025 is Jan 20
      // Jan 6 + 14 days = Jan 20 (holiday) -> Jan 21
      const result = calculateDeadline({
        startDate: localDate(2025, 1, 6),
        days: 14
      })

      expect(formatLocalDate(result.deadline)).toBe('2025-01-21')
      expect(result.wasAdjusted).toBe(true)
    })

    it('extends deadline when it falls on Pioneer Day (Utah-specific)', () => {
      // Pioneer Day 2025 is July 24
      // July 10 + 14 days = July 24 (Utah holiday) -> July 25
      const result = calculateDeadline({
        startDate: localDate(2025, 7, 10),
        days: 14
      })

      expect(formatLocalDate(result.deadline)).toBe('2025-07-25')
      expect(result.wasAdjusted).toBe(true)
    })

    it('includes breakdown of calculation', () => {
      const result = calculateDeadline({
        startDate: localDate(2025, 1, 6),
        days: 14,
        serviceMethod: 'mail'
      })

      expect(result.breakdown.length).toBeGreaterThan(0)
      expect(result.breakdown.some(b => b.includes('Rule 6'))).toBe(true)
      expect(result.breakdown.some(b => b.includes('mail'))).toBe(true)
    })
  })

  describe('UtahDeadlines', () => {
    it('calculates answer to complaint deadline (21 days)', () => {
      // Jan 6 + 21 days = Jan 27
      const result = UtahDeadlines.answerToComplaint(localDate(2025, 1, 6))
      expect(formatLocalDate(result.deadline)).toBe('2025-01-27')
    })

    it('calculates response to motion deadline (14 days)', () => {
      // Jan 6 + 14 days = Jan 20 (MLK Day) -> Jan 21
      const result = UtahDeadlines.responseToMotion(localDate(2025, 1, 6))
      expect(formatLocalDate(result.deadline)).toBe('2025-01-21')
    })

    it('calculates reply deadline (7 days)', () => {
      // Jan 6 + 7 days = Jan 13
      const result = UtahDeadlines.replyToResponse(localDate(2025, 1, 6))
      expect(formatLocalDate(result.deadline)).toBe('2025-01-13')
    })

    it('calculates notice of appeal deadline (30 days)', () => {
      // Jan 6 + 30 days = Feb 5
      const result = UtahDeadlines.noticeOfAppeal(localDate(2025, 1, 6))
      expect(formatLocalDate(result.deadline)).toBe('2025-02-05')
    })

    it('calculates discovery response deadline (28 days)', () => {
      // Jan 6 + 28 days = Feb 3
      const result = UtahDeadlines.discoveryResponse(localDate(2025, 1, 6))
      expect(formatLocalDate(result.deadline)).toBe('2025-02-03')
    })

    it('adds mail service days to answer deadline', () => {
      // Jan 6 + 21 + 7 = 28 days = Feb 3
      const result = UtahDeadlines.answerToComplaint(localDate(2025, 1, 6), 'mail')
      expect(formatLocalDate(result.deadline)).toBe('2025-02-03')
      expect(result.serviceAddedDays).toBe(7)
    })
  })

  describe('isUtahCourtDay', () => {
    it('returns true for a regular weekday', () => {
      // Wednesday Jan 8, 2025
      expect(isUtahCourtDay(localDate(2025, 1, 8))).toBe(true)
    })

    it('returns false for Saturday', () => {
      // Saturday Jan 11, 2025
      expect(isUtahCourtDay(localDate(2025, 1, 11))).toBe(false)
    })

    it('returns false for Sunday', () => {
      // Sunday Jan 12, 2025
      expect(isUtahCourtDay(localDate(2025, 1, 12))).toBe(false)
    })

    it('returns false for MLK Day', () => {
      // MLK Day Jan 20, 2025
      expect(isUtahCourtDay(localDate(2025, 1, 20))).toBe(false)
    })

    it('returns false for Pioneer Day', () => {
      // Pioneer Day July 24, 2025
      expect(isUtahCourtDay(localDate(2025, 7, 24))).toBe(false)
    })
  })

  describe('getUtahHolidays', () => {
    it('returns holidays for 2025', () => {
      const holidays = getUtahHolidays(2025)
      expect(holidays.length).toBe(12) // 12 Utah state holidays
    })

    it('includes Pioneer Day (Utah-specific)', () => {
      const holidays = getUtahHolidays(2025)
      const pioneerDay = holidays.find(
        d => d.toISOString().split('T')[0] === '2025-07-24'
      )
      expect(pioneerDay).toBeDefined()
    })

    it('includes Juneteenth', () => {
      const holidays = getUtahHolidays(2025)
      const juneteenth = holidays.find(
        d => d.toISOString().split('T')[0] === '2025-06-19'
      )
      expect(juneteenth).toBeDefined()
    })
  })
})
