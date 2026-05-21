import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In production (served together), call the same host's /api
  if (import.meta.env.PROD) {
    return '/api';
  }
  // Local development fallback
  return 'http://localhost:5001/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // critical for receiving and sending http-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach local storage token if present as fallback
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global unauthorized issues (session expiry)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired local sessions
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are not on auth page, we can redirect or trigger logout
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
