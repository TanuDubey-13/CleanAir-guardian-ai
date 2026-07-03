import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuth();

  // Show a premium fullscreen loading spinner while checking session state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-950 font-sans">
        <Loader2 className="w-10 h-10 text-primary-600 dark:text-primary-400 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Securing session...</p>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to email verification page if user is not verified
  // (Ignore email verification block for mock accounts or local testing if needed, but in production we require it)
  if (!user.emailVerified && user.providerData.some(p => p.providerId === 'password')) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check role authorization for admin routes
  if (adminOnly) {
    if (!profile) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-950 font-sans">
          <Loader2 className="w-10 h-10 text-primary-600 dark:text-primary-400 animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading credentials...</p>
        </div>
      );
    }
    
    if (profile.role !== 'admin') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-950 p-6 font-sans text-center">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full mb-6">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
            You do not have the administrator permissions required to view this area.
          </p>
          <a href="/dashboard" className="btn-primary">
            Back to Dashboard
          </a>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
