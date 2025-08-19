import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { HamburgerMenu } from "@/components/HamburgerMenu";

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
  // Filter hamburger items to exclude the pinned view
  const filteredHamburgerItems = hamburgerItems.filter(item => item.id !== pinnedView);
  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        <Card className="my-4 p-2 shadow-soft">
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
          </div>
        </Card>
      </div>
    </div>
  );
};