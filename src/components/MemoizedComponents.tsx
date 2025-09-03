import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Memoized feature card for better performance
export const FeatureCard = React.memo(({ 
  icon: Icon, 
  title, 
  description, 
  className = '' 
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}) => (
  <Card className={`p-8 text-center hover:shadow-strong transition-all duration-300 bg-gradient-card group h-full ${className}`}>
    <div className="inline-flex p-4 rounded-full mb-6 bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
      <Icon className="h-8 w-8 text-primary" />
    </div>
    <h3 className="text-xl font-semibold text-card-foreground mb-4">
      {title}
    </h3>
    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </Card>
));

FeatureCard.displayName = 'FeatureCard';

// Memoized navigation item for better performance
export const NavigationItem = React.memo(({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick,
  className = ''
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}) => (
  <Button
    variant={isActive ? "default" : "ghost"}
    onClick={onClick}
    className={`gap-2 ${className}`}
  >
    <Icon className="h-4 w-4" />
    {label}
  </Button>
));

NavigationItem.displayName = 'NavigationItem';

// Memoized stats badge
export const StatsBadge = React.memo(({ 
  variant, 
  children, 
  className = '' 
}: {
  variant: "default" | "secondary" | "outline" | "destructive";
  children: React.ReactNode;
  className?: string;
}) => (
  <Badge variant={variant} className={className}>
    {children}
  </Badge>
));

StatsBadge.displayName = 'StatsBadge';