import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AuthContextState,
  LoginCredentials,
  RegistrationData,
  ProfessionalRegistrationData,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyEmailData,
  UserProfile,
  AuthRole
} from '../types/auth.types';
import authService from '../services/api/auth.service';
import { storeTokens, removeTokens, getTokens, isTokenExpired } from '../utils/tokenStorage';

// Create context with default values
const defaultAuthContext: AuthContextState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  roles: [],
  error: null,
  login: async () => {},
  register: async () => {},
  registerProfessional: async () => {},
  logout: () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  verifyEmail: async () => {},
  clearError: () => {},
  refreshAuth: async () => false
};

export const AuthContext = createContext<AuthContextState>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AuthRole[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        await refreshAuth();
      } catch (error) {
        console.error('Failed to initialize auth state', error);
        setIsAuthenticated(false);
        setUser(null);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Refresh authentication state
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Check if we have tokens stored
      const tokens = getTokens();
      if (!tokens) {
        setIsAuthenticated(false);
        setUser(null);
        setRoles([]);
        return false;
      }

      // Check if token is expired
      if (isTokenExpired()) {
        // Try to refresh the token
        const isValid = await authService.validateRefreshToken();
        if (!isValid) {
          removeTokens();
          setIsAuthenticated(false);
          setUser(null);
          setRoles([]);
          return false;
        }
        
        await authService.refreshToken();
      }

      // Get user profile with valid token
      const userProfile = await authService.getCurrentUser();
      setUser(userProfile);
      setRoles(userProfile.roles);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error refreshing auth:', error);
      removeTokens();
      setIsAuthenticated(false);
      setUser(null);
      setRoles([]);
      return false;
    }
  }, []);

  // Login handler
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { token, user } = await authService.login(credentials);
      
      // Store tokens
      storeTokens(token);
      
      // Update auth state
      setUser(user);
      setRoles(user.roles);
      setIsAuthenticated(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register handler
  const register = useCallback(async (data: RegistrationData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.register(data);
      // Note: We don't automatically log the user in after registration
      // as they may need to verify their email first
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Professional register handler
  const registerProfessional = useCallback(async (data: ProfessionalRegistrationData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.registerProfessional(data);
      // Professional registration requires verification by admin
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Professional registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback((): void => {
    removeTokens();
    setIsAuthenticated(false);
    setUser(null);
    setRoles([]);
  }, []);

  // Forgot password handler
  const forgotPassword = useCallback(async (data: ForgotPasswordData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.forgotPassword(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process forgot password request';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset password handler
  const resetPassword = useCallback(async (data: ResetPasswordData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.resetPassword(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify email handler
  const verifyEmail = useCallback(async (data: VerifyEmailData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.verifyEmail(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify email';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Context value
  const contextValue: AuthContextState = {
    isAuthenticated,
    isLoading,
    user,
    roles,
    error,
    login,
    register,
    registerProfessional,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    clearError,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};