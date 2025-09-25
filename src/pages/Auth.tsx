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
import readingCharacter from "@/assets/reading-character.png";
import communityCharacter from "@/assets/community-character.png";
import challengeCharacter from "@/assets/challenge-character.png";

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-amber-600">
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Authentication */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BookOpen className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Beyond Pages</h1>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Join the Reading Community
              </Badge>
            </div>

            <Card className="shadow-lg bg-white/95 backdrop-blur-sm">
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
                className="text-white/80 hover:text-white"
              >
                ← Back to Home
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <h2 className="text-4xl font-bold text-white mb-8">Discover Amazing Features</h2>
            
            <div className="grid grid-cols-1 gap-8 mb-8">
              {/* Reading Feature */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <img 
                      src={readingCharacter} 
                      alt="Reading character" 
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <BookOpen className="h-8 w-8 text-white hidden" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">📚</span>
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-white mb-2">Smart Reading Tracker</h3>
                  <p className="text-white/70">Track your reading progress and discover new books with AI-powered recommendations</p>
                </div>
              </div>

              {/* Community Feature */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <img 
                      src={communityCharacter} 
                      alt="Community character" 
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <span className="text-2xl hidden">👥</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">💬</span>
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-white mb-2">Reading Community</h3>
                  <p className="text-white/70">Connect with fellow readers, share reviews, and join book discussions</p>
                </div>
              </div>

              {/* Challenges Feature */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <img 
                      src={challengeCharacter} 
                      alt="Challenge character" 
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <span className="text-2xl hidden">🎯</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">🏆</span>
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-white mb-2">Reading Challenges</h3>
                  <p className="text-white/70">Set goals, join challenges, and earn achievements for your reading milestones</p>
                </div>
              </div>
            </div>
            
            <p className="text-lg text-white/80 font-medium">Your reading journey starts here</p>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Beyond Pages</h1>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Join the Reading Community
            </Badge>
          </div>

          <Card className="shadow-lg bg-white/95 backdrop-blur-sm">
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
              className="text-white/80 hover:text-white"
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