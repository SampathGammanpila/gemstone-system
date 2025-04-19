import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AuthContextState, AuthRole } from '../types/auth.types';

/**
 * Custom hook for using authentication context
 */
export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Check if user has specific role
 */
export const useHasRole = (role: AuthRole): boolean => {
  const { isAuthenticated, roles } = useAuth();
  
  if (!isAuthenticated || !roles.length) {
    return false;
  }
  
  return roles.includes(role) || roles.includes('admin');
};

/**
 * Check if user has any of the specified roles
 */
export const useHasAnyRole = (requiredRoles: AuthRole[]): boolean => {
  const { isAuthenticated, roles } = useAuth();
  
  if (!isAuthenticated || !roles.length) {
    return false;
  }
  
  // Admin has all permissions
  if (roles.includes('admin')) {
    return true;
  }
  
  return requiredRoles.some(role => roles.includes(role));
};

/**
 * Check if user is a professional (dealer, cutter, or appraiser)
 */
export const useIsProfessional = (): boolean => {
  const professionalRoles: AuthRole[] = ['dealer', 'cutter', 'appraiser'];
  return useHasAnyRole(professionalRoles);
};

export default useAuth;