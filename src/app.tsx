import { useEndpointStatuses } from '@/lib/hooks/useEndpointStatuses'

export function App() {
  const { data, isLoading, error } = useEndpointStatuses()

  return (
    <div class="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">Gatus Status</h1>
        <p class="text-gray-400">
          {isLoading ? 'Loading...' : error ? `Error: ${error.message}` : `Endpoints: ${data?.length ?? 0}`}
        </p>
      </div>
    </div>
  )
}
