import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon, Home } from "lucide-react";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import UserMenu from "./UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  navItems: NavItem[];
  pinnedView?: string | null;
  hamburgerItems?: NavItem[];
}

export const Navigation = ({ currentView, setCurrentView, navItems, pinnedView, hamburgerItems = [] }: NavigationProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  
  // Filter hamburger items to exclude the pinned view
  const filteredHamburgerItems = hamburgerItems.filter(item => item.id !== pinnedView);
  
  // Get the welcome message
 /* const getWelcomeMessage = () => {
    if (user && profile?.first_name) {
      return `Hi ${profile.first_name}`;
    }
    return "Reading Community";
  }; */
  
  const handleProfileClick = () => {
    setCurrentView('profile');
  };

  const handleSettingsClick = () => {
    setCurrentView('settings');
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
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center gap-2 ${
                      isActive ? "shadow-medium" : "hover:shadow-soft"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                );
              })}
              <HamburgerMenu 
                currentView={currentView} 
                setCurrentView={setCurrentView} 
                menuItems={filteredHamburgerItems}
              />
              <UserMenu 
                onProfileClick={handleProfileClick}
                onSettingsClick={handleSettingsClick}
              />
            </div>
          </Card>
          
          {/* Home button - only show when not on default dashboard view */}
          {currentView !== 'books' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="absolute right-0 gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};