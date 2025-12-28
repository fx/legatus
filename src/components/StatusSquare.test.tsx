import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/preact'
import { StatusSquare } from './StatusSquare'
import type { EndpointStatus } from '@/lib/types/api'

// Mock formatDuration and formatTimestamp
vi.mock('@/lib/utils/format', () => ({
  formatDuration: (ns: number) => `${ns / 1_000_000}ms`,
  formatTimestamp: (ts: string) => ts,
}))

/**
 * Factory to create test endpoint data
 */
function createEndpoint(overrides: Partial<EndpointStatus> = {}): EndpointStatus {
  return {
    name: 'Test Service',
    key: 'test-service',
    results: [],
    ...overrides,
  }
}

describe('StatusSquare', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStatusColor helper (via button class)', () => {
    it('returns gray classes when no results', () => {
      const endpoint = createEndpoint({ results: [] })
      render(<StatusSquare endpoint={endpoint} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-400')
    })

    it('returns green classes when latest result success=true', () => {
      const endpoint = createEndpoint({
        results: [
          {
            success: true,
            duration: 100_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-green-500')
    })

    it('returns red classes when latest result success=false', () => {
      const endpoint = createEndpoint({
        results: [
          {
            success: false,
            duration: 100_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-500')
    })
  })

  describe('StatusBadge subcomponent (via popover)', () => {
    it('renders "Unknown" badge when success is undefined', () => {
      const endpoint = createEndpoint({ results: [] })
      render(<StatusSquare endpoint={endpoint} />)

      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('renders "Healthy" badge when success=true', () => {
      const endpoint = createEndpoint({
        results: [
          {
            success: true,
            duration: 100_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      expect(screen.getByText('Healthy')).toBeInTheDocument()
    })

    it('renders "Unhealthy" badge when success=false', () => {
      const endpoint = createEndpoint({
        results: [
          {
            success: false,
            duration: 100_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      expect(screen.getByText('Unhealthy')).toBeInTheDocument()
    })
  })

  describe('size variants', () => {
    it('applies sm size classes', () => {
      const endpoint = createEndpoint()
      render(<StatusSquare endpoint={endpoint} size="sm" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-8', 'h-8')
    })

    it('applies md size classes by default', () => {
      const endpoint = createEndpoint()
      render(<StatusSquare endpoint={endpoint} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-12', 'h-12')
    })

    it('applies lg size classes', () => {
      const endpoint = createEndpoint()
      render(<StatusSquare endpoint={endpoint} size="lg" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-16', 'h-16')
    })
  })

  describe('aria-label', () => {
    it('sets correct aria-label with name and status', () => {
      const endpoint = createEndpoint({
        name: 'API Service',
        results: [
          {
            success: true,
            duration: 100_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'API Service: healthy')
    })

    it('sets correct aria-label with name, group, and status', () => {
      const endpoint = createEndpoint({
        name: 'Database',
        group: 'Backend',
        results: [
          {
            success: false,
            duration: 100_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Database (Backend): unhealthy')
    })

    it('sets correct aria-label for unknown status', () => {
      const endpoint = createEndpoint({ name: 'New Service', results: [] })
      render(<StatusSquare endpoint={endpoint} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'New Service: unknown')
    })
  })

  describe('popover content', () => {
    it('displays endpoint name in popover', () => {
      const endpoint = createEndpoint({ name: 'My Service' })
      render(<StatusSquare endpoint={endpoint} />)

      const heading = screen.getByText('My Service')
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H3')
    })

    it('displays endpoint group when present', () => {
      const endpoint = createEndpoint({
        name: 'API',
        group: 'Production',
        results: [
          {
            success: true,
            duration: 100_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      expect(screen.getByText('Production')).toBeInTheDocument()
    })

    it('displays status badge in popover', () => {
      const endpoint = createEndpoint({
        results: [
          {
            success: true,
            duration: 100_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      expect(screen.getByText('Healthy')).toBeInTheDocument()
    })

    it('shows response duration formatted', () => {
      const endpoint = createEndpoint({
        results: [
          {
            success: true,
            duration: 150_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      // Uses mocked formatDuration
      expect(screen.getByText('150ms')).toBeInTheDocument()
    })

    it('shows HTTP status when present', () => {
      const endpoint = createEndpoint({
        results: [
          {
            success: true,
            status: 200,
            duration: 100_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      expect(screen.getByText('HTTP')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
    })

    it('shows timestamp formatted', () => {
      const timestamp = '2025-01-15T12:00:00Z'
      const endpoint = createEndpoint({
        results: [
          {
            success: true,
            duration: 100_000_000,
            timestamp,
            conditionResults: [],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      // Uses mocked formatTimestamp (returns timestamp as-is)
      expect(screen.getByText(timestamp)).toBeInTheDocument()
    })

    it('displays condition results with success icons', () => {
      const endpoint = createEndpoint({
        results: [
          {
            success: true,
            duration: 100_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [
              { condition: '[STATUS] == 200', success: true },
              { condition: '[RESPONSE_TIME] < 500', success: true },
            ],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      expect(screen.getByText('[STATUS] == 200')).toBeInTheDocument()
      expect(screen.getByText('[RESPONSE_TIME] < 500')).toBeInTheDocument()
      expect(screen.getAllByText('✓')).toHaveLength(2)
    })

    it('displays condition results with failure icons', () => {
      const endpoint = createEndpoint({
        results: [
          {
            success: false,
            duration: 100_000_000,
            timestamp: '2025-01-15T12:00:00Z',
            conditionResults: [
              { condition: '[STATUS] == 200', success: false },
              { condition: '[BODY].length > 0', success: true },
            ],
          },
        ],
      })
      render(<StatusSquare endpoint={endpoint} />)

      expect(screen.getByText('✗')).toBeInTheDocument()
      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('shows "No health check results" message when results empty', () => {
      const endpoint = createEndpoint({ results: [] })
      render(<StatusSquare endpoint={endpoint} />)

      expect(screen.getByText('No health check results available')).toBeInTheDocument()
    })
  })
})
