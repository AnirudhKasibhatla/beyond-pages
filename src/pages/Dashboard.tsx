import { useState, useRef } from "react";
import { BookList } from "@/components/BookList";
import { Community } from "@/components/Community";
import { Profile } from "@/components/Profile";
import { Tournament } from "@/components/Tournament";
import { Events } from "@/components/Events";
import { BookGroups } from "@/components/BookGroups";
import { Settings } from "@/components/Settings";
import { ReadingChallenges } from "@/components/ReadingChallenges";
import { HighlightsList } from "@/components/HighlightsList";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Users, Trophy, Calendar, UserCircle, Users2, Target, Settings as SettingsIcon } from "lucide-react";
import heroImage from "@/assets/hero-bookshelf.jpg";
import { CommunityProvider } from "@/context/CommunityContext";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGuestAuth } from "@/hooks/useGuestAuth";
import { useFirstTimeUser } from "@/hooks/useFirstTimeUser";
import { ReadingChallengeModal } from "@/components/ReadingChallengeModal";

type ViewType = 'books' | 'community' | 'profile' | 'tournament' | 'events' | 'groups' | 'settings' | 'challenges' | 'highlights';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<ViewType>('community');
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [highlightButtons, setHighlightButtons] = useState(false);
  const [pinnedView, setPinnedView] = useState<ViewType | null>(null);
  const libraryRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isGuest } = useGuestAuth();
  const { showModal, closeModal } = useFirstTimeUser();

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setPinnedView(view);
  };

  const handleStartReading = () => {
    setCurrentView('books');
    setTimeout(() => {
      libraryRef.current?.scrollIntoView({ behavior: 'smooth' });
      setHighlightButtons(true);
      setTimeout(() => setHighlightButtons(false), 3000);
    }, 100);
  };

  const getWelcomeMessage = () => {
    if (isGuest) {
      return "Hi Reader";
    }
    if (user && profile?.first_name) {
      return `Hi ${profile.first_name}`;
    }
    return "Hi Reader";
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'books':
        if (isGuest) {
          return (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Book className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Create Your Personal Library</h2>
                  <p className="text-muted-foreground">
                    Sign in and add books that you're reading currently,  or you want to read, or books that you've finished reading.
                  </p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="px-8"
                >
                  Sign In to Get Started
                </Button>
              </div>
            </div>
          );
        }
        return <BookList highlightButtons={highlightButtons} />;
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
      case 'settings':
        return <Settings />;
      case 'challenges':
        return <ReadingChallenges />;
      case 'highlights':
        return <HighlightsList />;
      default:
        return <BookList highlightButtons={highlightButtons} />;
    }
  };

  const baseNavItems = [
    { id: 'community' as ViewType, label: 'Community', icon: Users },
    { id: 'events' as ViewType, label: 'Events', icon: Calendar },
    { id: 'groups' as ViewType, label: 'Groups', icon: Users2 },
    { id: 'books' as ViewType, label: 'My Shelf', icon: Book },
  ];

  const hamburgerItems = [
    { id: 'profile' as ViewType, label: 'Profile', icon: UserCircle },
    { id: 'settings' as ViewType, label: 'Settings', icon: SettingsIcon },
  ];

  // Use baseNavItems directly without hamburger menu logic
  const navItems = baseNavItems;

  if (currentView === 'books') {
    return (
      <CommunityProvider>
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
                <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
                  {getWelcomeMessage()}
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
                  onClick={handleStartReading}
                  className="hover-scale transition-all duration-300 hover:shadow-glow"
                >
                  Start Reading Journey
                </Button>
              </div>
            </div>
          </div>


          {/* Navigation */}
        <Navigation 
          currentView={currentView} 
          setCurrentView={handleViewChange} 
          navItems={navItems}
          onProfileClick={() => setCurrentView('profile')}
          onSettingsClick={() => setCurrentView('settings')}
          onChallengesClick={() => setCurrentView('challenges')}
          onHighlightsClick={() => setCurrentView('highlights')}
          dynamicTab={(['profile', 'challenges'] as ViewType[]).includes(currentView) ? currentView : undefined}
          />

          {/* Main Content */}
          <div ref={libraryRef} className="max-w-6xl mx-auto px-6 py-8">
            {renderCurrentView()}
          </div>
          
          {/* First Time User Modal for Books View */}
          {!isGuest && (
            <ReadingChallengeModal 
              isOpen={showModal}
              onClose={closeModal}
              onComplete={closeModal}
            />
          )}
        </div>
      </CommunityProvider>
    );
  }

  return (
    <CommunityProvider>
      <div className="min-h-screen bg-background">
        <Navigation 
          currentView={currentView} 
          setCurrentView={handleViewChange} 
          navItems={navItems}
          onProfileClick={() => setCurrentView('profile')}
          onSettingsClick={() => setCurrentView('settings')}
          onChallengesClick={() => setCurrentView('challenges')}
          onHighlightsClick={() => setCurrentView('highlights')}
          dynamicTab={(['profile', 'challenges'] as ViewType[]).includes(currentView) ? currentView : undefined}
        />
        <div className="max-w-6xl mx-auto px-6 py-8 justify-center">
          {renderCurrentView()}
        </div>
      </div>
    </CommunityProvider>
  );
};

export default Dashboard;