import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { Card } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { isGuest, validateGuestSession } = useGuestAuth();

  // Validate guest session on route access
  React.useEffect(() => {
    if (isGuest && !validateGuestSession()) {
      // Guest session invalid, redirect to auth
      window.location.href = '/auth';
    }
  }, [isGuest, validateGuestSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-lg font-medium">Loading...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;