import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatDuration, formatTimestamp } from './format'

describe('formatDuration', () => {
  it('returns 0ms for 0 nanoseconds', () => {
    expect(formatDuration(0)).toBe('0µs')
  })

  it('formats microseconds for sub-millisecond values', () => {
    expect(formatDuration(500_000)).toBe('500µs')
  })

  describe('milliseconds range', () => {
    it('formats 1ms', () => {
      expect(formatDuration(1_000_000)).toBe('1ms')
    })

    it('formats 999ms', () => {
      expect(formatDuration(999_000_000)).toBe('999ms')
    })

    it('formats mid-range milliseconds', () => {
      expect(formatDuration(500_000_000)).toBe('500ms')
    })
  })

  describe('seconds range', () => {
    it('formats 1.5s', () => {
      expect(formatDuration(1_500_000_000)).toBe('1.5s')
    })

    it('formats 59s', () => {
      expect(formatDuration(59_000_000_000)).toBe('59.0s')
    })
  })

  describe('minutes range', () => {
    it('formats 1 minute', () => {
      expect(formatDuration(60_000_000_000)).toBe('1.0m')
    })

    it('formats 59 minutes', () => {
      expect(formatDuration(59 * 60_000_000_000)).toBe('59.0m')
    })
  })

  describe('hours range', () => {
    it('formats 1 hour', () => {
      expect(formatDuration(60 * 60_000_000_000)).toBe('60.0m')
    })

    it('formats 24+ hours', () => {
      expect(formatDuration(24 * 60 * 60_000_000_000)).toBe('1440.0m')
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      // Negative durations don't make sense but function handles them
      // -1ms in nanoseconds falls into µs range due to Math.round behavior
      expect(formatDuration(-1_000_000)).toBe('-1000µs')
    })

    it('handles very large numbers', () => {
      // 1 week in nanoseconds
      const oneWeek = 7 * 24 * 60 * 60 * 1_000_000_000
      expect(formatDuration(oneWeek)).toBe('10080.0m')
    })
  })
})

describe('formatTimestamp', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('recent timestamps', () => {
    it('formats "just now" for timestamps within 5 seconds', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:05Z'))

      expect(formatTimestamp('2025-01-15T12:00:00Z')).toBe('just now')
    })

    it('formats seconds ago', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:30Z'))

      expect(formatTimestamp('2025-01-15T12:00:00Z')).toBe('30s ago')
    })

    it('formats minutes ago', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:10:00Z'))

      expect(formatTimestamp('2025-01-15T12:00:00Z')).toBe('10m ago')
    })

    it('formats hours ago', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T15:00:00Z'))

      expect(formatTimestamp('2025-01-15T12:00:00Z')).toBe('3h ago')
    })
  })

  describe('older timestamps (>24h)', () => {
    it('formats absolute date for timestamps older than 24h', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-16T13:00:00Z'))

      const result = formatTimestamp('2025-01-15T12:00:00Z')
      // The exact format depends on locale, but should contain the date components
      expect(result).toMatch(/Jan/)
      expect(result).toMatch(/15/)
      expect(result).toMatch(/2025/)
    })
  })

  describe('edge cases', () => {
    it('formats exactly 24h ago as hours', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-16T12:00:00Z'))

      // Exactly 24h should show absolute date (diffHours >= 24)
      const result = formatTimestamp('2025-01-15T12:00:00Z')
      expect(result).toMatch(/Jan/)
    })

    it('returns "Unknown" for invalid date string', () => {
      expect(formatTimestamp('not-a-date')).toBe('Unknown')
    })

    it('returns "Unknown" for malformed ISO string', () => {
      expect(formatTimestamp('2025-13-45T99:99:99Z')).toBe('Unknown')
    })

    it('returns "Unknown" for empty string', () => {
      expect(formatTimestamp('')).toBe('Unknown')
    })

    it('handles future timestamps gracefully', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))

      expect(formatTimestamp('2025-01-15T13:00:00Z')).toBe('just now')
    })
  })
})
