import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0f]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-sm text-gray-400">Verifying session details...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect role to their correct dashboard rather than plain unauthorized
    const fallbackUrl = 
      user.role === 'Super Admin' ? '/admin' :
      ['Recruiter', 'Employer', 'HR Manager', 'Company Admin'].includes(user.role) ? '/recruiter-dashboard' :
      '/seeker-dashboard';
      
    return <Navigate to={fallbackUrl} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
