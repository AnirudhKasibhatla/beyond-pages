import { useState } from "react";
import { BookList } from "@/components/BookList";
import { Community } from "@/components/Community";
import { Profile } from "@/components/Profile";
import { Tournament } from "@/components/Tournament";
import { Events } from "@/components/Events";
import { BookGroups } from "@/components/BookGroups";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Users, Trophy, Calendar, UserCircle, Users2 } from "lucide-react";
import heroImage from "@/assets/hero-books.jpg";

type ViewType = 'books' | 'community' | 'profile' | 'tournament' | 'events' | 'groups';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<ViewType>('books');
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'books':
        return <BookList />;
      case 'community':
        return <Community />;
      case 'profile':
        return <Profile />;
      case 'tournament':
        return <Tournament />;
      case 'events':
        return <Events />;
      case 'groups':
        return <BookGroups />;
      default:
        return <BookList />;
    }
  };

  const navItems = [
    { id: 'books' as ViewType, label: 'My Books', icon: Book },
    { id: 'community' as ViewType, label: 'Community', icon: Users },
    { id: 'tournament' as ViewType, label: 'Tournament', icon: Trophy },
    { id: 'events' as ViewType, label: 'Events', icon: Calendar },
    { id: 'groups' as ViewType, label: 'Groups', icon: Users2 },
    { id: 'profile' as ViewType, label: 'Profile', icon: UserCircle },
  ];

  if (currentView === 'books') {
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
              <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 animate-float">
                Beyond Pages
              </h1>
              <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Track your reading journey, connect with fellow readers, and discover your next favorite book
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Level {userLevel}
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2 bg-white/10 text-primary-foreground border-white/20">
                  {userXP} XP
                </Badge>
              </div>
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => setCurrentView('books')}
                className="animate-glow"
              >
                Start Reading Journey
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300">
              <div className="text-center">
                <Book className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Books Read</h3>
                <p className="text-3xl font-bold text-primary">0</p>
              </div>
            </Card>
            <Card className="p-6 bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300">
              <div className="text-center">
                <Trophy className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Current League</h3>
                <p className="text-3xl font-bold text-accent">Copper</p>
              </div>
            </Card>
            <Card className="p-6 bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300">
              <div className="text-center">
                <Users className="h-8 w-8 text-success mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Following</h3>
                <p className="text-3xl font-bold text-success">0</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <Navigation 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          navItems={navItems}
        />

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {renderCurrentView()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        navItems={navItems}
      />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default Dashboard;