import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authService } from './auth.service';

// Create API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // If error is 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await authService.refreshToken(refreshToken);
        
        // Store the new tokens
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        // Update the authorization header and retry the request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        } else {
          originalRequest.headers = {
            Authorization: `Bearer ${response.data.token}`,
          };
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out the user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    // Stringify error response for better error handling
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Create a more detailed error object
    const enhancedError = {
      ...error,
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    };
    
    return Promise.reject(enhancedError);
  }
);

// Generic GET request
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return api.get<T>(url, config);
};

// Generic POST request
export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return api.post<T>(url, data, config);
};

// Generic PUT request
export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return api.put<T>(url, data, config);
};

// Generic PATCH request
export const patch = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return api.patch<T>(url, data, config);
};

// Generic DELETE request
export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return api.delete<T>(url, config);
};

// Export the api instance and methods
export default {
  instance: api,
  get,
  post,
  put,
  patch,
  delete: del,
};