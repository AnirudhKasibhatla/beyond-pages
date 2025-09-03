import { useState, useCallback, useMemo } from 'react';

// Custom hook for optimized state management
export const useOptimizedState = <T>(initialValue: T) => {
  const [state, setState] = useState<T>(initialValue);
  
  const optimizedSetState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(newValue);
  }, []);

  const memoizedState = useMemo(() => state, [state]);

  return [memoizedState, optimizedSetState] as const;
};

// Hook for managing view state with performance optimizations
export const useViewState = (initialView: string) => {
  const [currentView, setCurrentView] = useOptimizedState(initialView);
  const [isLoading, setIsLoading] = useOptimizedState(false);

  const handleViewChange = useCallback((view: string) => {
    setIsLoading(true);
    setCurrentView(view);
    // Simulate loading state for smooth transitions
    setTimeout(() => setIsLoading(false), 150);
  }, [setCurrentView, setIsLoading]);

  return {
    currentView,
    isLoading,
    handleViewChange
  };
};