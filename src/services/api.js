import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Simple event-listener pattern for cold-start wake notifications
const wakeListeners = new Set();

export function onServerWakeStatus(callback) {
  wakeListeners.add(callback);
  return () => wakeListeners.delete(callback);
}

function notifyWakeStatus(status) {
  wakeListeners.forEach((cb) => {
    try {
      cb(status);
    } catch (e) {
      console.warn('Error in wake listener:', e);
    }
  });
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000, // 50 seconds to accommodate Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer token into outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bazarcycle_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response handling, automatic cold-start retry, and auth expirations
api.interceptors.response.use(
  (response) => {
    // Notify subscribers that server is awake and responding
    notifyWakeStatus({ isWaking: false, success: true });
    return response;
  },
  async (error) => {
    const config = error.config;

    // Handle 401 Unauthorized expired sessions
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        localStorage.removeItem('bazarcycle_token');
        localStorage.removeItem('bazarcycle_user');
      }
      return Promise.reject(error);
    }

    // Check if error is indicative of Render cold start:
    // - 502 Bad Gateway
    // - 503 Service Unavailable
    // - 504 Gateway Timeout
    // - Network Error / timeout without response
    const status = error.response ? error.response.status : null;
    const isColdStartError =
      status === 502 ||
      status === 503 ||
      status === 504 ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error' ||
      (!error.response && error.request);

    if (config && isColdStartError) {
      config.__retryCount = config.__retryCount || 0;
      const MAX_RETRIES = 3;

      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        const delay = config.__retryCount * 2500; // 2.5s, 5.0s, 7.5s exponential backoff

        // Inform user via UI banner that server is cold starting and retrying
        notifyWakeStatus({ isWaking: true, attempt: config.__retryCount });

        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    notifyWakeStatus({ isWaking: false, error });
    return Promise.reject(error);
  }
);

export default api;
