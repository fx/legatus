import { useQuery } from '@tanstack/react-query'
import { apiUrl } from '@/lib/api'

export function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['endpoints'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/endpoints/statuses'))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
  })

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
