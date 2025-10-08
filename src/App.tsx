import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingSkeleton } from "./components/ui/loading-skeleton";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useGuestAuth } from "@/hooks/useGuestAuth";
import PostAuthSplash from "@/components/PostAuthSplash";

// Lazy load pages for better performance with retry logic
const Index = lazy(() => import("./pages/Index").catch(() => {
  console.error('Failed to load Index page, retrying...');
  return import("./pages/Index");
}));
const Dashboard = lazy(() => import("./pages/Dashboard").catch(() => {
  console.error('Failed to load Dashboard page, retrying...');
  return import("./pages/Dashboard");
}));
const Auth = lazy(() => import("./pages/Auth").catch(() => {
  console.error('Failed to load Auth page, retrying...');
  return import("./pages/Auth");
}));
const NotFound = lazy(() => import("./pages/NotFound").catch(() => {
  console.error('Failed to load NotFound page, retrying...');
  return import("./pages/NotFound");
}));
const SplashScreen = lazy(() => import("./pages/SplashScreen").catch(() => {
  console.error('Failed to load SplashScreen page, retrying...');
  return import("./pages/SplashScreen");
}));
const UserProfile = lazy(() => import("./pages/UserProfile").catch(() => {
  console.error('Failed to load UserProfile page, retrying...');
  return import("./pages/UserProfile");
}));
const BookDetails = lazy(() => import("./pages/BookDetails").catch(() => {
  console.error('Failed to load BookDetails page, retrying...');
  return import("./pages/BookDetails");
}));

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const { isGuest } = useGuestAuth();
  const [showPostAuthSplash, setShowPostAuthSplash] = React.useState(false);
  const [hasShownPostAuth, setHasShownPostAuth] = React.useState(false);

  // Track when user authenticates (not guest) and show post-auth splash
  React.useEffect(() => {
    if (!loading && user && !isGuest && !hasShownPostAuth) {
      // Only show if this is a fresh authentication, not on app refresh
      const lastAuth = sessionStorage.getItem('lastAuthTime');
      const currentTime = Date.now();
      
      if (!lastAuth || currentTime - parseInt(lastAuth) < 5000) {
        setShowPostAuthSplash(true);
        setHasShownPostAuth(true);
        sessionStorage.setItem('lastAuthTime', currentTime.toString());
      }
    }
  }, [user, loading, isGuest, hasShownPostAuth]);

  const handlePostAuthSplashComplete = () => {
    setShowPostAuthSplash(false);
  };

  if (showPostAuthSplash) {
    return <PostAuthSplash onComplete={handlePostAuthSplashComplete} />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSkeleton type="shelf" className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/dashboard" 
            element={<Dashboard />} 
          />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/user/:userId" element={<UserProfile />} />
          <Route path="/book/search" element={<BookDetails />} />
          <Route path="/book/:bookId" element={<BookDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => {
  // Check if we should show splash screen on first load
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500); // Show splash for 4.5 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
