import { describe, it, expect } from 'vitest'
import { apiUrl } from './api'

describe('apiUrl', () => {
  it('returns path unchanged for API endpoint', () => {
    expect(apiUrl('/api/v1/endpoints/statuses')).toBe('/api/v1/endpoints/statuses')
  })

  it('returns root path unchanged', () => {
    expect(apiUrl('/')).toBe('/')
  })

  it('returns empty string unchanged', () => {
    expect(apiUrl('')).toBe('')
  })

  it('returns path without leading slash unchanged', () => {
    expect(apiUrl('api/test')).toBe('api/test')
  })

  it('preserves query parameters', () => {
    expect(apiUrl('/api/test?foo=bar')).toBe('/api/test?foo=bar')
  })
})
