import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authService } from '@services/api/auth.service';
import { UserType } from '@types/user.types';

interface AuthContextType {
  user: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
  updateUser: (userData: Partial<UserType>) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuthState: async () => {},
  updateUser: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Set the user and auth state
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      setIsLoading(true);
      await authService.register(userData);
      // Note: We don't automatically log in after registration
      // since email verification might be required
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call the logout API if needed
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout({ refresh_token: refreshToken });
      }
      
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Even if API call fails, we should clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAuthState = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      // Fetch the current user data
      const response = await authService.getCurrentUser();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token validation failed:', error);
      
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((userData: Partial<UserType>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  }, []);

  // Check authentication state when the component mounts
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuthState,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};