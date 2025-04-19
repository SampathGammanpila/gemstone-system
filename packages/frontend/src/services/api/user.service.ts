// User API service

import { 
  UpdateProfileData, 
  UpdatePasswordData, 
  UpdateSettingsData, 
  UpdateSecurityData,
  UserSettings,
  SecuritySettings
} from '../../types/user.types';
import { UserProfile } from '../../types/auth.types';
import { getAccessToken, isTokenExpired } from '../../utils/tokenStorage';
import authService from './auth.service';

// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * User service for handling all user-related API requests
 */
class UserService {
  /**
   * Get auth header
   */
  private async getAuthHeader(): Promise<Headers> {
    // Check if token is expired and refresh if needed
    if (isTokenExpired()) {
      await authService.refreshToken();
    }

    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);
    return headers;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const headers = await this.getAuthHeader();
    
    // Handle file upload for avatar
    let body: FormData | string;
    
    if (data.avatar) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'avatar' && value) {
          formData.append(key, value);
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      body = formData;
    } else {
      headers.append('Content-Type', 'application/json');
      body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PATCH',
      headers,
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return await response.json();
  }

  /**
   * Update user password
   */
  async updatePassword(data: UpdatePasswordData): Promise<{ message: string }> {
    const headers = await this.getAuthHeader();
    headers.append('Content-Type', 'application/json');

    const response = await fetch(`${API_URL}/users/password`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update password');
    }

    return await response.json();
  }

  /**
   * Get user settings
   */
  async getUserSettings(): Promise<UserSettings> {
    const headers = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/users/settings`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user settings');
    }

    return await response.json();
  }

  /**
   * Update user settings
   */
  async updateSettings(data: UpdateSettingsData): Promise<UserSettings> {
    const headers = await this.getAuthHeader();
    headers.append('Content-Type', 'application/json');

    const response = await fetch(`${API_URL}/users/settings`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update settings');
    }

    return await response.json();
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(): Promise<SecuritySettings> {
    const headers = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/users/security`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get security settings');
    }

    return await response.json();
  }

  /**
   * Update security settings
   */
  async updateSecurity(data: UpdateSecurityData): Promise<SecuritySettings> {
    const headers = await this.getAuthHeader();
    headers.append('Content-Type', 'application/json');

    const response = await fetch(`${API_URL}/users/security`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update security settings');
    }

    return await response.json();
  }

  /**
   * Setup two-factor authentication
   */
  async setupTwoFactor(method: 'app' | 'sms' | 'email'): Promise<{ secret?: string, qrCode?: string }> {
    const headers = await this.getAuthHeader();
    headers.append('Content-Type', 'application/json');

    const response = await fetch(`${API_URL}/users/security/two-factor/setup`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ method }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to setup two-factor authentication');
    }

    return await response.json();
  }

  /**
   * Verify two-factor authentication
   */
  async verifyTwoFactor(code: string): Promise<void> {
    const headers = await this.getAuthHeader();
    headers.append('Content-Type', 'application/json');

    const response = await fetch(`${API_URL}/users/security/two-factor/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify two-factor code');
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(code: string): Promise<void> {
    const headers = await this.getAuthHeader();
    headers.append('Content-Type', 'application/json');

    const response = await fetch(`${API_URL}/users/security/two-factor/disable`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to disable two-factor authentication');
    }
  }
}

export default new UserService();