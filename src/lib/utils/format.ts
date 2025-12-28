/**
 * Formatting utilities for display values
 */

/**
 * Convert nanoseconds to human-readable duration
 * @param nanoseconds - Duration in nanoseconds
 * @returns Formatted string (e.g., "45ms", "1.2s", "2.5m")
 */
export function formatDuration(nanoseconds: number): string {
  const ms = nanoseconds / 1_000_000

  if (ms < 1) {
    return `${Math.round(nanoseconds / 1000)}µs`
  }
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  }
  const seconds = ms / 1000
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = seconds / 60
  return `${minutes.toFixed(1)}m`
}

/**
 * Format ISO timestamp to relative time or absolute if older than 24h
 * @param isoString - ISO 8601 timestamp
 * @returns Formatted string (e.g., "2m ago", "Dec 28, 2025")
 */
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)

  // Older than 24 hours - show absolute date
  if (diffHours >= 24) {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Future timestamps (shouldn't happen, but handle gracefully)
  if (diffMs < 0) {
    return 'just now'
  }

  if (diffSeconds < 60) {
    return diffSeconds <= 5 ? 'just now' : `${diffSeconds}s ago`
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }

  return `${diffHours}h ago`
}
