import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface RoleBasedRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  allowedRoles, 
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated, loading } = useAuth();


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user?.role || '')) {
    
    
    
    if (user?.role === 'patient') {
      return <Navigate to="/dashboard" />;
    }
    if (user?.role === 'doctor') {
      return <Navigate to="/dashboard" />;
    }
    if (user?.role === 'admin') {
      return <Navigate to="/dashboard" />;
    }
    if (user?.role === 'superadmin') {
      return <Navigate to="/superadmin" />;
    }
    
    return <Navigate to={redirectTo} />;
  }

  
  return <Outlet />;
};

export default RoleBasedRoute;