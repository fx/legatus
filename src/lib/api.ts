/**
 * API base URL for Gatus backend.
 * - Development: Empty string (uses Vite proxy)
 * - Production: Set VITE_API_BASE_URL to Gatus URL
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

/**
 * Build full API URL from path.
 * @param path - API path starting with /api/
 */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}
