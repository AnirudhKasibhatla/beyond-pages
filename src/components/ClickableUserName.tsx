import React from 'react';
import { Button } from '@/components/ui/button';

interface ClickableUserNameProps {
  name: string;
  userId: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'link';
  onUserClick: (userId: string) => void;
  children?: React.ReactNode;
}

export const ClickableUserName: React.FC<ClickableUserNameProps> = ({ 
  name, 
  userId, 
  className = "", 
  variant = "ghost",
  onUserClick,
  children 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUserClick(userId);
  };

  return (
    <Button
      variant={variant}
      className={`p-0 h-auto font-medium hover:underline ${className}`}
      onClick={handleClick}
    >
      {children || name}
    </Button>
  );
};