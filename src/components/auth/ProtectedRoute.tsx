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
      <div className="min-h-screen w-full flex items-center justify-center bg-nostalgic-50 p-4">
        <div className="flex flex-col items-center justify-center w-full h-full">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-[120px] max-h-[120px]">
            {/* Path: Serifs at bottom, up, down, serif at bottom, crossbar */}
            <path
              d="M20 90 L30 90 M25 90 L50 15 L75 90 M70 90 L80 90 M37 60 L63 60"
              stroke="black"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-[dash_2s_ease-in-out_infinite]"
              style={{
                strokeDasharray: 400,
                strokeDashoffset: 400,
              }}
            />
            <style>
              {`
                @keyframes dash {
                  0% {
                    stroke-dashoffset: 400;
                    opacity: 0;
                  }
                  15% {
                    opacity: 1;
                  }
                  80% {
                    stroke-dashoffset: 0;
                    opacity: 1;
                  }
                  100% {
                    stroke-dashoffset: 0;
                    opacity: 0;
                  }
                }
              `}
            </style>
          </svg>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
