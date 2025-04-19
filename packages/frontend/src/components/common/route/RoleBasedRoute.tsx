import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthRole } from '../../../types/auth.types';
import { useHasAnyRole } from '../../../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: AuthRole[];
  redirectPath?: string;
}

/**
 * A wrapper component that protects routes requiring specific roles
 */
const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectPath = '/unauthorized' 
}) => {
  const hasRequiredRole = useHasAnyRole(allowedRoles);

  return (
    <ProtectedRoute>
      {hasRequiredRole ? (
        children
      ) : (
        <Navigate to={redirectPath} replace />
      )}
    </ProtectedRoute>
  );
};

export default RoleBasedRoute;