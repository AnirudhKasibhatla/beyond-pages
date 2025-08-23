import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Book, Users, Trophy, Star, ArrowRight, BookOpen, Target, Award, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import heroImage from "@/assets/hero-books.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const Index = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const [highlightedFeature, setHighlightedFeature] = useState<number | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();

  const handleLearnMore = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      setHighlightedFeature(0);
      setTimeout(() => setHighlightedFeature(null), 3000);
    }, 500);
  };

  const features = [
    {
      icon: Book,
      title: "Track Your Reading",
      description: "Organize your books with Want to Read, Currently Reading, and Finished lists. Set progress and add reviews."
    },
    {
      icon: Trophy,
      title: "Gamified Experience", 
      description: "Earn XP, level up, compete in tournaments, and unlock badges for your reading achievements."
    },
    {
      icon: Users,
      title: "Join the Community",
      description: "Connect with fellow readers, share reviews, join book clubs, and discover new recommendations."
    },
    {
      icon: Target,
      title: "Set Reading Goals",
      description: "Challenge yourself with annual reading goals and track your progress throughout the year."
    },
    {
      icon: BookOpen,
      title: "AI Book Assistant",
      description: "Get AI-powered answers about your current reads and discover insights about your favorite books."
    },
    {
      icon: Award,
      title: "Events & Groups",
      description: "Participate in book events, join discussion groups, and host your own literary gatherings."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Books and reading"
            className="w-full h-full object-cover opacity-20"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge variant="secondary" className="text-lg px-6 py-2 bg-primary-foreground/20 text-primary-foreground">
                📚 Welcome to Beyond Pages
              </Badge>
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20 gap-2"
                    >
                      <User className="h-4 w-4" />
                      {profile?.first_name ? `Hi, ${profile.first_name}` : 'Hi Reader'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-muted/95 backdrop-blur-sm border-border">
                    <DropdownMenuItem 
                      onClick={() => navigate('/dashboard')}
                      className="cursor-pointer gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Go to Dashboard
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6">
              Beyond Pages
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your reading journey with our gamified book tracking platform. 
              Connect with readers, earn achievements, and discover your next favorite book.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => navigate('/dashboard')}
                className="hover-scale gap-3 transition-all duration-300 hover:shadow-glow"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={handleLearnMore}
                className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Badge variant="default" className="mb-4 text-lg px-6 py-2">
            ✨ Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need for Your Reading Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From tracking your books to connecting with a vibrant community of readers, 
            Beyond Pages offers all the tools you need to enhance your literary experience.
          </p>
        </div>

        <Carousel 
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isCommunityFeature = feature.title === "Join the Community";
              return (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className={`p-8 text-center hover:shadow-strong transition-all duration-300 bg-gradient-card group h-full ${
                    highlightedFeature === index ? 'ring-2 ring-primary shadow-glow animate-pulse' : ''
                  } ${isCommunityFeature ? 'ring-2 ring-accent shadow-glow bg-accent/5' : ''}`}>
                    <div className={`inline-flex p-4 rounded-full mb-6 group-hover:bg-primary/20 transition-colors duration-300 ${
                      isCommunityFeature ? 'bg-accent/20' : 'bg-primary/10'
                    }`}>
                      <Icon className={`h-8 w-8 ${isCommunityFeature ? 'text-accent' : 'text-primary'}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>

      {/* Stats Section */}
      <div className="bg-secondary/30 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-primary mb-2">10K+</h3>
              <p className="text-muted-foreground font-medium">Active Readers</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-accent mb-2">50K+</h3>
              <p className="text-muted-foreground font-medium">Books Tracked</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-success mb-2">1K+</h3>
              <p className="text-muted-foreground font-medium">Book Clubs</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-primary-glow mb-2">25K+</h3>
              <p className="text-muted-foreground font-medium">Reviews Written</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <Card className="p-12 text-center bg-gradient-primary text-primary-foreground shadow-strong">
          <Star className="h-16 w-16 mx-auto mb-6 animate-glow" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Reading Experience?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of readers who have already discovered the joy of gamified reading. 
            Start tracking, connecting, and achieving your reading goals today!
          </p>
          <Button 
            variant="hero" 
            size="xl"
            onClick={() => navigate('/dashboard')}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-3 shadow-glow"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-6xl mx-auto px-6 text-center font-bold">
          <p className="opacity-80 mb-6">
            Connecting readers, one page at a time.
          </p>
          <div className="flex justify-center gap-6 text-sm opacity-60">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
