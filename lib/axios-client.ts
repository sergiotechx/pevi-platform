import axios from 'axios';

/**
 * Axios client configured for the PEVI platform API
 * Base URL automatically uses the current origin in browser
 */
export const apiClient = axios.create({
  baseURL: typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Add authentication token or other headers here when needed
 */
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add authentication token when auth is implemented
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // TODO: Handle unauthorized (redirect to login when auth is implemented)
          console.error('Unauthorized access');
          break;
        case 403:
          console.error('Forbidden access');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 409:
          console.error('Conflict:', data.error);
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API Error:', data.error || 'Unknown error');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response from server');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);
