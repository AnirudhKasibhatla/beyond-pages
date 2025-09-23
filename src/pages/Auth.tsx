import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useGuestAuth } from "@/hooks/useGuestAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { setGuestUser } = useGuestAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate with Google",
        variant: "destructive",
      });
    }
  };

  const handleSkipAuth = () => {
    setGuestUser();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-2 min-h-screen">
        {/* Left Side - Authentication */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
                <h1 className="text-3xl font-bold text-primary-foreground">Beyond Pages</h1>
              </div>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Join the Reading Community
              </Badge>
            </div>

            <Card className="shadow-strong bg-card/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to continue your reading journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleGoogleAuth}
                  className="w-full"
                  size="lg"
                >
                  Continue with Google
                </Button>
                <Button 
                  onClick={handleSkipAuth}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Skip Authentication (Guest)
                </Button>
              </CardContent>
            </Card>

            <div className="text-center mt-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-primary-foreground/80 hover:text-primary-foreground"
              >
                ← Back to Home
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Logo */}
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <BookOpen className="h-32 w-32 text-primary-foreground mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl font-bold text-primary-foreground mb-4">Beyond Pages</h2>
            <p className="text-xl text-primary-foreground/70">Your reading journey starts here</p>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
              <h1 className="text-3xl font-bold text-primary-foreground">Beyond Pages</h1>
            </div>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Join the Reading Community
            </Badge>
          </div>

          <Card className="shadow-strong bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to continue your reading journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGoogleAuth}
                className="w-full"
                size="lg"
              >
                Continue with Google
              </Button>
              <Button 
                onClick={handleSkipAuth}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Skip Authentication (Guest)
              </Button>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-primary-foreground/80 hover:text-primary-foreground"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;