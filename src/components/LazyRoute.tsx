import React, { Suspense } from 'react';
import { LoadingSkeleton } from './ui/loading-skeleton';

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({ 
  children, 
  fallback = <LoadingSkeleton type="shelf" className="min-h-screen" />
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);