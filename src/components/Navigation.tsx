import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon, Home, Microscope, Quote } from "lucide-react";
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
  
  dynamicTab?: string;
}

export const Navigation = ({ currentView, setCurrentView, navItems, onProfileClick, onSettingsClick, onChallengesClick, dynamicTab }: NavigationProps) => {
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
    setCurrentView('highlights');
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };
  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-center py-2 sm:py-4 relative">
          <Card className="p-1 sm:p-2 shadow-soft w-full max-w-4xl">
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
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
                    className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${
                      isActive ? "shadow-medium" : "hover:shadow-soft"
                    } ${isChallenges ? "hidden lg:flex" : ""}`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden text-xs">
                      {item.label === 'Community' ? 'Comm' : 
                       item.label === 'My Shelf' ? 'Books' : 
                       item.label}
                    </span>
                  </Button>
                  );
                })}
                
                {/* Highlights Tab (dynamic based on selection) */}
                <Button
                  variant={currentView === 'highlights' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView('highlights')}
                  className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${
                    currentView === 'highlights' ? "shadow-medium" : "hover:shadow-soft"
                  }`}
                >
                  <Quote className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Highlights</span>
                  <span className="sm:hidden text-xs">Quotes</span>
                </Button>

                {/* Dynamic Tab (profile item promoted from dropdown) */}
                {dynamicTab && dynamicTab !== 'highlights' && (
                  <Button
                    variant={currentView === dynamicTab ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentView(dynamicTab)}
                    className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${
                      currentView === dynamicTab ? "shadow-medium" : "hover:shadow-soft"
                    }`}
                  >
                    {dynamicTab === 'profile' && <Home className="h-3 w-3 sm:h-4 sm:w-4" />}
                    {dynamicTab === 'challenges' && <Home className="h-3 w-3 sm:h-4 sm:w-4" />}
                    <span className="hidden sm:inline">
                      {dynamicTab.charAt(0).toUpperCase() + dynamicTab.slice(1)}
                    </span>
                    <span className="sm:hidden text-xs">
                      {dynamicTab === 'profile' ? 'Prof' : 
                       dynamicTab === 'challenges' ? 'Chall' : 
                       dynamicTab.charAt(0).toUpperCase() + dynamicTab.slice(1)}
                    </span>
                  </Button>
                )}
                
                {/* Search Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSearchClick}
                  className="flex items-center gap-1 sm:gap-2 hover:shadow-soft text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                >
                  <Microscope className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Search</span>
                  <span className="sm:hidden text-xs">Find</span>
                </Button>
                
                <UserMenu 
                  onProfileClick={handleProfileClick}
                  onSettingsClick={handleSettingsClick}
                  onChallengesClick={handleChallengesClick}
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