import { useEndpointStatuses } from '@/lib/hooks/useEndpointStatuses'
import { StatusSquare } from '@/components'

export function App() {
  const { data, isLoading, error } = useEndpointStatuses()

  return (
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">Gatus Status</h1>

        {/* Loading state */}
        {isLoading && (
          <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading endpoints...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div class="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <p class="font-semibold">Failed to load endpoints</p>
            <p class="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {/* Endpoints grid */}
        {data && data.length > 0 && (
          <div class="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2">
            {data.map((endpoint) => (
              <StatusSquare key={endpoint.key} endpoint={endpoint} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {data && data.length === 0 && (
          <p class="text-gray-500 dark:text-gray-400">
            No endpoints configured
          </p>
        )}
      </div>
    </div>
  )
}
