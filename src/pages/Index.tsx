import React, { useRef, useState, useMemo } from "react";
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
  CarouselApi,
} from "@/components/ui/carousel";
import { CarouselDots } from "@/components/CarouselDots";
import { FeatureCard } from "@/components/MemoizedComponents";
import heroImage from "@/assets/hero-books.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { OptimizedImage } from "@/components/OptimizedImage";

const Index = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const [highlightedFeature, setHighlightedFeature] = useState<number | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();
  const { profile } = useProfile();

  const handleLearnMore = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      setHighlightedFeature(0);
      setTimeout(() => setHighlightedFeature(null), 3000);
    }, 500);
  };

  // Track current slide for dots
  React.useEffect(() => {
    if (!carouselApi) return;

    const updateCurrent = () => {
      setCurrentSlide(Math.floor(carouselApi.selectedScrollSnap() / 3));
    };

    carouselApi.on('select', updateCurrent);
    updateCurrent();

    return () => {
      carouselApi.off('select', updateCurrent);
    };
  }, [carouselApi]);

  // Memoize features for better performance
  const features = useMemo(() => [
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
  ], []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0">
          <OptimizedImage
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
              <Badge variant="secondary" className="text-lg px-6 py-2 bg-primary-foreground/20 text-primary-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Welcome to Beyond Pages
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
          <Badge variant="default" className="mb-4 text-lg px-6 py-2 flex items-center gap-2 mx-auto w-fit">
            <Star className="h-5 w-5" /> Features
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
          setApi={setCarouselApi}
        >
          <CarouselContent className="-ml-4">
            {features.map((feature, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        <CarouselDots 
          totalSlides={Math.ceil(features.length / 3)} 
          currentSlide={currentSlide}
          onDotClick={(index) => carouselApi?.scrollTo(index * 3)}
        />
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
