import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { apiUrl } from '@/lib/api'
import type { EndpointStatuses } from '@/lib/types/api'

export function useEndpointStatuses(
  options?: Omit<UseQueryOptions<EndpointStatuses>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['endpoints', 'statuses'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/v1/endpoints/statuses'))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json() as Promise<EndpointStatuses>
    },
    ...options,
  })
}
