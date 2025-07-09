import { QueryClient } from '@tanstack/react-query';

// Create query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Default fetcher function
const defaultFetcher = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// API request helper for mutations
export const apiRequest = {
  get: (url: string) => defaultFetcher(url),
  post: (url: string, data: any) => 
    defaultFetcher(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: (url: string, data: any) => 
    defaultFetcher(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (url: string) => 
    defaultFetcher(url, {
      method: 'DELETE',
    }),
};

// Set default query function
queryClient.setQueryDefaults([''], {
  queryFn: ({ queryKey }) => defaultFetcher(queryKey[0] as string),
});