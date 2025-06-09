
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: (failureCount, error: any) => {
        if (error?.code === 'PGRST116') return false; // No data found
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});
