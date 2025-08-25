import React from 'react';
import { cn } from '@/lib/utils';

interface MotionWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-in' | 'fade-in-up' | 'page-turn';
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  className,
  delay = 0,
  animation = 'fade-in-up'
}) => {
  const delayClass = delay > 0 ? `stagger-${Math.min(5, Math.ceil(delay / 50))}` : '';
  
  return (
    <div 
      className={cn(
        `animate-${animation}`,
        delayClass,
        className
      )}
      style={{ 
        animationDelay: delay > 250 ? `${delay}ms` : undefined 
      }}
    >
      {children}
    </div>
  );
};

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className,
  staggerDelay = 50
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {children.map((child, index) => (
        <MotionWrapper 
          key={index} 
          delay={index * staggerDelay}
          animation="fade-in-up"
        >
          {child}
        </MotionWrapper>
      ))}
    </div>
  );
};

// Page transition wrapper for route changes
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <div className="animate-page-turn">
      {children}
    </div>
  );
};