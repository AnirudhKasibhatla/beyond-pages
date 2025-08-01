import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Book, Users, Trophy, Star, ArrowRight, BookOpen, Target, Award } from "lucide-react";
import heroImage from "@/assets/hero-books.jpg";

const Index = () => {
  const navigate = useNavigate();

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
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 text-lg px-6 py-2 bg-primary-foreground/20 text-primary-foreground">
              📚 Welcome to Beyond Pages
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 animate-float">
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
                className="animate-glow gap-3"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-8 text-center hover:shadow-strong transition-all duration-300 bg-gradient-card group">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
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
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">Beyond Pages</h3>
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
