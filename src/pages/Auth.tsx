import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, Users, Target, Award } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useGuestAuth } from "@/hooks/useGuestAuth";
import readingCharacter from "@/assets/reading-character.png";
import communityCharacter from "@/assets/community-character.png";
import challengeCharacter from "@/assets/challenge-character.png";
import gamifiedCharacter from "@/assets/gamified-character.png";
import aiAssistantCharacter from "@/assets/ai-assistant-character.png";
import eventsCharacter from "@/assets/events-character.png";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { setGuestUser } = useGuestAuth();

  // All 6 features from the home page
  const features = [
    {
      icon: BookOpen,
      title: "Track Your Reading",
      description: "Track your reading progress and discover new books with AI-powered recommendations",
      image: readingCharacter,
      colorClass: "bg-sky-400",
      emoji: "📚"
    },
    {
      icon: Trophy,
      title: "Gamified Experience", 
      description: "Earn XP, level up, compete in tournaments, and unlock badges for your reading achievements",
      image: gamifiedCharacter,
      colorClass: "bg-yellow-400",
      emoji: "🏆"
    },
    {
      icon: Users,
      title: "Join the Community",
      description: "Connect with fellow readers, share reviews, and join book discussions",
      image: communityCharacter,
      colorClass: "bg-emerald-400",
      emoji: "💬"
    },
    {
      icon: Target,
      title: "Set Reading Goals",
      description: "Challenge yourself with annual reading goals and track your progress throughout the year",
      image: challengeCharacter,
      colorClass: "bg-orange-400",
      emoji: "🎯"
    },
    {
      icon: BookOpen,
      title: "AI Book Assistant",
      description: "Get AI-powered answers about your current reads and discover insights about your favorite books",
      image: aiAssistantCharacter,
      colorClass: "bg-purple-400",
      emoji: "🤖"
    },
    {
      icon: Award,
      title: "Events & Groups",
      description: "Participate in book events, join discussion groups, and host your own literary gatherings",
      image: eventsCharacter,
      colorClass: "bg-pink-400",
      emoji: "🎉"
    }
  ];


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
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-emerald-100 to-orange-100">
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Authentication */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BookOpen className="h-8 w-8 text-slate-800" />
                <h1 className="text-3xl font-bold text-slate-800">Beyond Pages</h1>
              </div>
              <Badge variant="secondary" className="bg-slate-800/10 text-slate-800 flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Join the Reading Community
              </Badge>
            </div>

            <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-slate-200/50">
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
                className="text-slate-700 hover:text-slate-800"
              >
                ← Back to Home
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <h2 className="text-4xl font-bold text-slate-800 mb-8">Why Beyond Pages?</h2>
            
            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm border border-amber-300/50">
                      <img 
                        src={feature.image} 
                        alt={`${feature.title} character`} 
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <feature.icon className="h-8 w-8 text-sky-600 hidden" />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-6 h-6 ${feature.colorClass} rounded-full flex items-center justify-center`}>
                      <span className="text-xs font-bold text-white">{feature.emoji}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-sky-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-sky-700">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-lg text-slate-600 font-medium mt-6">Experience the future of reading</p>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-slate-800" />
              <h1 className="text-3xl font-bold text-slate-800">Beyond Pages</h1>
            </div>
            <Badge variant="secondary" className="bg-slate-800/10 text-slate-800 flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Join the Reading Community
            </Badge>
          </div>

          <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-slate-200/50 mb-8">
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

          {/* Features Section - Mobile */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Discover Amazing Features</h2>
            
            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm border border-amber-300/50">
                      <img 
                        src={feature.image} 
                        alt={`${feature.title} character`} 
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <feature.icon className="h-6 w-6 text-sky-600 hidden" />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-5 h-5 ${feature.colorClass} rounded-full flex items-center justify-center`}>
                      <span className="text-xs font-bold text-white">{feature.emoji}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-sky-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-sky-700">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-base text-slate-600 font-medium mb-6 mt-4">Your reading journey starts here</p>
          </div>

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-slate-700 hover:text-slate-800"
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