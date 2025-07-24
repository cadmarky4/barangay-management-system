import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { triggerLogout } from '@/services/__shared/_auth/auth-error-handler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Token management utilities
export const tokenStorage = {
  get: (): string | null => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  },
  
  set: (token: string, remember = false): void => {
    if (remember) {
      localStorage.setItem('auth_token', token);
      sessionStorage.removeItem('auth_token');
    } else {
      sessionStorage.setItem('auth_token', token);
      localStorage.removeItem('auth_token');
    }
  },
  
  remove: (): void => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_user');
  },
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const { response } = error;
    
    // Handle authentication errors
    if (response?.status === 401 || response?.status === 403) {
      console.log('Authentication error detected:', response.status);
      tokenStorage.remove();
      triggerLogout();
    }
    
    // Transform error response for consistency
    if (response?.data) {
      const errorData = response.data as any;
      error.message = errorData.message || error.message;
    }
    
    return Promise.reject(error);
  }
);