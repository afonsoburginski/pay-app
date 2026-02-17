import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minuto em memória antes de considerar stale
        gcTime: 5 * 60 * 1000, // 5 min (antes era cacheTime no v4)
      },
    },
  });
}
