import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';

interface NatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'page' | 'shelf' | 'leaf' | 'bark';
  hover?: boolean;
  children: React.ReactNode;
}

export const NatureCard: React.FC<NatureCardProps> = ({
  variant = 'page',
  hover = true,
  className,
  children,
  ...props
}) => {
  const variants = {
    page: "card-page",
    shelf: "nature-shelf", 
    leaf: "bg-gradient-to-br from-leaf/10 to-nature-leaf/20 border-leaf/30",
    bark: "bg-gradient-to-br from-bark/10 to-nature-bark/20 border-bark/30"
  };

  const hoverEffect = hover ? "hover-lift" : "";

  return (
    <Card
      className={cn(
        variants[variant],
        hoverEffect,
        "transition-all duration-300 animate-fade-in-up",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
};

export const BookSpine: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("book-spine", className)}>
    {children}
  </div>
);

export const ReadingBench: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("bench-layout", className)}>
    {children}
  </div>
);