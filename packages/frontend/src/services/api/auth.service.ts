import { get, post, put } from './api.service';
import { ApiResponse } from '@types/api.types';
import { UserType } from '@types/user.types';

// Interface for login response
interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: UserType;
    token: string;
    refreshToken: string;
  };
}

// Interface for register response
interface RegisterResponse {
  status: string;
  message: string;
  data: {
    user: UserType;
  };
}

// Interface for token refresh response
interface RefreshResponse {
  status: string;
  message: string;
  data: {
    token: string;
    refreshToken: string;
  };
}

// Auth service methods
export const authService = {
  /**
   * Login user
   * @param email - User email
   * @param password - User password
   * @returns Promise with login response
   */
  login: (email: string, password: string) => {
    return post<LoginResponse>('/auth/login', { email, password });
  },

  /**
   * Register new user
   * @param userData - User registration data
   * @returns Promise with register response
   */
  register: (userData: any) => {
    return post<RegisterResponse>('/auth/register', userData);
  },

  /**
   * Register new professional user
   * @param userData - Professional user registration data
   * @returns Promise with register response
   */
  registerProfessional: (userData: any) => {
    return post<RegisterResponse>('/auth/register/professional', userData);
  },

  /**
   * Logout user
   * @param data - Optional refresh token
   * @returns Promise with API response
   */
  logout: (data?: { refresh_token: string }) => {
    return post<ApiResponse>('/auth/logout', data);
  },

  /**
   * Verify email address
   * @param token - Verification token
   * @returns Promise with API response
   */
  verifyEmail: (token: string) => {
    return get<ApiResponse>(`/auth/verify-email/${token}`);
  },

  /**
   * Request password reset
   * @param email - User email
   * @returns Promise with API response
   */
  forgotPassword: (email: string) => {
    return post<ApiResponse>('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   * @param token - Reset token
   * @param password - New password
   * @param confirmPassword - Confirm new password
   * @returns Promise with API response
   */
  resetPassword: (token: string, password: string, confirmPassword: string) => {
    return post<ApiResponse>('/auth/reset-password', {
      token,
      password,
      confirm_password: confirmPassword,
    });
  },

  /**
   * Change password (authenticated user)
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @param confirmPassword - Confirm new password
   * @returns Promise with API response
   */
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => {
    return post<ApiResponse>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
  },

  /**
   * Refresh authentication token
   * @param refreshToken - Refresh token
   * @returns Promise with refresh response
   */
  refreshToken: (refreshToken: string) => {
    return post<RefreshResponse>('/auth/refresh-token', {
      refresh_token: refreshToken,
    });
  },

  /**
   * Get current user data
   * @returns Promise with user data
   */
  getCurrentUser: () => {
    return get<ApiResponse>('/auth/me');
  },
};