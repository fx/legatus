import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { apiUrl } from '@/lib/api'
import type { EndpointStatuses } from '@/lib/types/api'

export function useEndpointStatuses(
  options?: Omit<UseQueryOptions<EndpointStatuses>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['endpoints', 'statuses'],
    queryFn: async () => {
      const url = apiUrl('/api/v1/endpoints/statuses')
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Request to ${url} failed: HTTP ${res.status} ${res.statusText}`)
      return res.json() as Promise<EndpointStatuses>
    },
    ...options,
  })
}
