import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block p-6 bg-white border-2 border-black shadow-retro-md">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-nostalgic-200 mb-2"></div>
              <div className="h-3 w-24 bg-nostalgic-100"></div>
            </div>
            <p className="mt-4 text-sm font-mono">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
