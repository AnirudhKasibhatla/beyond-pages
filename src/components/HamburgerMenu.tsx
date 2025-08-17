import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Book, UserCircle, Settings } from "lucide-react";

interface HamburgerMenuProps {
  currentView: string;
  setCurrentView: (view: any) => void;
}

export const HamburgerMenu = ({ currentView, setCurrentView }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'books', label: 'My Books', icon: Book },
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (itemId: string) => {
    setCurrentView(itemId);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:shadow-soft"
        >
          <Menu className="h-4 w-4" />
          <span className="hidden sm:inline">Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <div key={item.id}>
              <DropdownMenuItem
                onClick={() => handleItemClick(item.id)}
                className={`flex items-center gap-2 cursor-pointer ${
                  isActive ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </DropdownMenuItem>
              {index < menuItems.length - 1 && <DropdownMenuSeparator />}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};