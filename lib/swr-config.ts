import { SWRConfiguration } from 'swr';
import { apiClient } from './axios-client';

/**
 * Default fetcher for SWR using Axios
 * @param url - API endpoint URL (will be appended to baseURL)
 */
export const swrFetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Default SWR configuration for the entire app
 * Use this in _app.tsx: <SWRConfig value={swrConfig}>
 */
export const swrConfig: SWRConfiguration = {
  fetcher: swrFetcher,

  // Revalidation options
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateIfStale: true,

  // Deduplication interval (5 seconds)
  dedupingInterval: 5000,

  // Error retry
  errorRetryCount: 3,
  errorRetryInterval: 5000,

  // Cache options
  shouldRetryOnError: true,

  // Callback on error
  onError: (error) => {
    console.error('SWR Error:', error);
  },
};

/**
 * SWR configuration for data that changes frequently
 * Use with: useSWR(url, { ...realtimeConfig })
 */
export const realtimeConfig: Partial<SWRConfiguration> = {
  refreshInterval: 5000, // Refresh every 5 seconds
  dedupingInterval: 1000,
};

/**
 * SWR configuration for static/rarely changing data
 * Use with: useSWR(url, { ...staticConfig })
 */
export const staticConfig: Partial<SWRConfiguration> = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0,
};
