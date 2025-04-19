// Authentication API service

import { 
  LoginCredentials, 
  RegistrationData, 
  AuthToken, 
  ForgotPasswordData, 
  ResetPasswordData,
  VerifyEmailData,
  UserProfile,
  ProfessionalRegistrationData
} from '../../types/auth.types';
import { getAccessToken, getRefreshToken, storeTokens, isTokenExpired } from '../../utils/tokenStorage';

// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Authentication service for handling all auth-related API requests
 */
class AuthService {
  /**
   * User login
   */
  async login(credentials: LoginCredentials): Promise<{ token: AuthToken; user: UserProfile }> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }

    const data = await response.json();
    return data;
  }

  /**
   * User registration
   */
  async register(userData: RegistrationData): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register');
    }

    return await response.json();
  }

  /**
   * Professional user registration
   */
  async registerProfessional(userData: ProfessionalRegistrationData): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/register/professional`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register as professional');
    }

    return await response.json();
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process forgot password request');
    }

    return await response.json();
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }

    return await response.json();
  }

  /**
   * Verify email address with token
   */
  async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify email');
    }

    return await response.json();
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    // Check if token is expired and refresh if needed
    if (isTokenExpired()) {
      await this.refreshToken();
    }

    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired');
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user profile');
    }

    return await response.json();
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthToken> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();
    storeTokens(tokens);
    return tokens;
  }

  /**
   * Check if refresh token is valid
   */
  async validateRefreshToken(): Promise<boolean> {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${API_URL}/auth/validate-refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating refresh token', error);
      return false;
    }
  }
}

export default new AuthService();