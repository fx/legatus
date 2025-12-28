import { useRef, useCallback, useId, useEffect } from 'preact/hooks'
import type { EndpointStatus } from '@/lib/types/api'
import { formatDuration, formatTimestamp } from '@/lib/utils/format'

export type StatusSquareProps = {
  /** Endpoint status data */
  endpoint: EndpointStatus
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 min-w-[44px] min-h-[44px]',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
} as const

/**
 * Get status color based on latest result
 */
function getStatusColor(endpoint: EndpointStatus): string {
  const latestResult = endpoint.results[0]
  if (!latestResult) {
    return 'bg-gray-400 dark:bg-gray-600'
  }
  return latestResult.success
    ? 'bg-green-500 dark:bg-green-600'
    : 'bg-red-500 dark:bg-red-600'
}

/**
 * StatusSquare component displays a service status as a colored square
 * with hover popover showing details
 */
export function StatusSquare({ endpoint, size = 'md' }: StatusSquareProps) {
  const popoverId = useId()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const latestResult = endpoint.results[0]
  const statusColor = getStatusColor(endpoint)
  const sizeClass = SIZE_CLASSES[size]

  const showPopover = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      popoverRef.current?.showPopover()
    }, 150)
  }, [])

  const hidePopover = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    popoverRef.current?.hidePopover()
  }, [])

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const statusLabel = latestResult
    ? latestResult.success
      ? 'healthy'
      : 'unhealthy'
    : 'unknown'

  return (
    <>
      <button
        type="button"
        class={`
          ${sizeClass} ${statusColor}
          rounded-md cursor-pointer
          transition-transform hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          dark:focus:ring-offset-gray-900
        `}
        aria-label={`${endpoint.name}${endpoint.group ? ` (${endpoint.group})` : ''}: ${statusLabel}`}
        popovertarget={popoverId}
        onMouseEnter={showPopover}
        onMouseLeave={hidePopover}
        onFocus={showPopover}
        onBlur={hidePopover}
      />
      <div
        ref={popoverRef}
        id={popoverId}
        popover="hint"
        class="
          p-4 rounded-lg shadow-lg
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          border border-gray-200 dark:border-gray-700
          max-w-xs
          [&:popover-open]:opacity-100
        "
      >
        <div class="space-y-2">
          {/* Header */}
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="font-semibold text-sm">{endpoint.name}</h3>
              {endpoint.group && (
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {endpoint.group}
                </p>
              )}
            </div>
            <StatusBadge success={latestResult?.success} />
          </div>

          {/* Result details */}
          {latestResult && (
            <div class="text-xs space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Response</span>
                <span class="font-mono">
                  {formatDuration(latestResult.duration)}
                </span>
              </div>
              {latestResult.status !== undefined && (
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">HTTP</span>
                  <span class="font-mono">{latestResult.status}</span>
                </div>
              )}
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Checked</span>
                <span>{formatTimestamp(latestResult.timestamp)}</span>
              </div>

              {/* Condition results */}
              {latestResult.conditionResults.length > 0 && (
                <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p class="text-gray-500 dark:text-gray-400 mb-1">
                    Conditions
                  </p>
                  <ul class="space-y-0.5">
                    {latestResult.conditionResults.map((cr, i) => (
                      <li key={i} class="flex items-center gap-1.5">
                        <span
                          class={
                            cr.success
                              ? 'text-green-500'
                              : 'text-red-500'
                          }
                        >
                          {cr.success ? '✓' : '✗'}
                        </span>
                        <code class="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded truncate max-w-[200px]">
                          {cr.condition}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* No results message */}
          {!latestResult && (
            <p class="text-xs text-gray-500 dark:text-gray-400 italic">
              No health check results available
            </p>
          )}
        </div>
      </div>
    </>
  )
}

function StatusBadge({ success }: { success?: boolean }) {
  if (success === undefined) {
    return (
      <span class="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
        Unknown
      </span>
    )
  }
  return success ? (
    <span class="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
      Healthy
    </span>
  ) : (
    <span class="px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
      Unhealthy
    </span>
  )
}
