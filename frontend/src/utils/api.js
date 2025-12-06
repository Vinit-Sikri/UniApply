import axios from 'axios'

// Determine API URL
const getApiUrl = () => {
  // In production (Render), use environment variable
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    // Remove trailing slash and add /api
    return url.endsWith('/') ? `${url.slice(0, -1)}/api` : `${url}/api`;
  }
  
  // In development, use proxy
  return '/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (no response)
    if (!error.response) {
      console.error('Network Error:', error.message);
      // Show user-friendly message
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        error.userMessage = 'Network error. Please check your internet connection and ensure the backend server is running.';
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

