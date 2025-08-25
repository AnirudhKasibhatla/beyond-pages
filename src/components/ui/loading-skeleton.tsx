import React from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, Leaf } from 'lucide-react';

interface LoadingSkeletonProps {
  type?: 'book' | 'card' | 'shelf' | 'text';
  className?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  className,
  lines = 3
}) => {
  const renderBookSkeleton = () => (
    <div className={cn("card-page p-6 space-y-4", className)}>
      <div className="flex items-center space-x-3">
        <div className="skeleton w-12 h-16 rounded" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton h-3 w-full rounded" />
        ))}
      </div>
    </div>
  );

  const renderShelfSkeleton = () => (
    <div className={cn("nature-shelf space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="h-5 w-5 text-muted-foreground animate-leaf-sway" />
        <div className="skeleton h-6 w-32 rounded" />
      </div>
      <div className="bench-layout">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-40 rounded-lg" />
        ))}
      </div>
    </div>
  );

  const renderCardSkeleton = () => (
    <div className={cn("card-page p-6 space-y-4", className)}>
      <div className="skeleton h-6 w-1/3 rounded" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton h-4 w-full rounded" />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-20 rounded" />
        <div className="skeleton h-8 w-16 rounded" />
      </div>
    </div>
  );

  const renderTextSkeleton = () => (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "skeleton h-4 rounded",
            i === lines - 1 ? "w-2/3" : "w-full"
          )} 
        />
      ))}
    </div>
  );

  switch (type) {
    case 'book':
      return renderBookSkeleton();
    case 'shelf':
      return renderShelfSkeleton();
    case 'text':
      return renderTextSkeleton();
    default:
      return renderCardSkeleton();
  }
};

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, description, action, className }) => (
  <div className={cn("text-center py-12 px-6", className)}>
    <div className="max-w-md mx-auto">
      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-gentle-float">
        {icon || <BookOpen className="h-8 w-8 text-primary" />}
      </div>
      <h3 className="text-lg font-playfair font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6">
        {description}
      </p>
      {action && (
        <div className="animate-fade-in-up">
          {action}
        </div>
      )}
    </div>
  </div>
);