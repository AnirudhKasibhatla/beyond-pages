import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Settings, Target, Home, LogIn } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onChallengesClick?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onProfileClick, onSettingsClick, onChallengesClick }) => {
  const { user, signOut } = useAuth();
  const { isGuest } = useGuestAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigate to home after sign out
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user && !isGuest) return null;

  const userInitials = isGuest 
    ? 'G'
    : user?.user_metadata?.full_name 
      ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
      : user?.email?.charAt(0).toUpperCase() || 'U';

  // Show Sign In button for guests instead of profile avatar
  if (isGuest) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate('/auth')}
        className="flex items-center gap-2"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign In</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">
            {isGuest ? 'Guest User' : user?.user_metadata?.full_name || 'User'}
          </p>
          <p className="text-xs leading-none text-muted-foreground">
            {isGuest ? 'Browse as guest' : user?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.location.href = '/'}>
          <Home className="mr-2 h-4 w-4" />
          <span>Home</span>
        </DropdownMenuItem>
        {!isGuest && (
          <DropdownMenuItem onClick={onProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onChallengesClick} className="lg:hidden">
          <Target className="mr-2 h-4 w-4" />
          <span>Reading Challenges</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;