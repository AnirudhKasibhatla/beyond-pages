import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon, Home, Microscope } from "lucide-react";
import UserMenu from "./UserMenu";
import { GlobalSearch } from "./GlobalSearch";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGuestAuth } from "@/hooks/useGuestAuth";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  navItems: NavItem[];
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onChallengesClick?: () => void;
  onHighlightsClick?: () => void;
}

export const Navigation = ({ currentView, setCurrentView, navItems, onProfileClick, onSettingsClick, onChallengesClick, onHighlightsClick }: NavigationProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isGuest } = useGuestAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      setCurrentView('profile');
    }
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      setCurrentView('settings');
    }
  };

  const handleChallengesClick = () => {
    if (onChallengesClick) {
      onChallengesClick();
    } else {
      setCurrentView('challenges');
    }
  };

  const handleHighlightsClick = () => {
    if (onHighlightsClick) {
      onHighlightsClick();
    } else {
      setCurrentView('highlights');
    }
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };
  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-center py-4 relative">
          <Card className="p-2 shadow-soft">
            <div className="flex flex-wrap justify-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const isChallenges = item.id === 'challenges';
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center gap-2 ${
                      isActive ? "shadow-medium" : "hover:shadow-soft"
                    } ${isChallenges ? "hidden lg:flex" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                  );
                })}
                
                {/* Search Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSearchClick}
                  className="flex items-center gap-2 hover:shadow-soft"
                >
                  <Microscope className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
                
                <UserMenu 
                  onProfileClick={handleProfileClick}
                  onSettingsClick={handleSettingsClick}
                  onChallengesClick={handleChallengesClick}
                  onHighlightsClick={handleHighlightsClick}
                />
              </div>
            </Card>
            
          </div>
        </div>
        
        {/* Global Search Modal */}
        <GlobalSearch isOpen={isSearchOpen} onClose={handleSearchClose} />
      </div>
    );
  };