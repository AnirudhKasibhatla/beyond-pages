import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedLazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
}

export const EnhancedLazyImage: React.FC<EnhancedLazyImageProps> = ({
  src,
  alt,
  fallback,
  className,
  aspectRatio,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading when image is 50px away from viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-card rounded-lg",
        aspectRatio && aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* Skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton" />
      )}
      
      {/* Error fallback */}
      {hasError && fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          {fallback}
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-base ease-out",
          isLoaded && !hasError ? "opacity-100" : "opacity-0"
        )}
        loading="lazy"
        {...props}
      />
    </div>
  );
};