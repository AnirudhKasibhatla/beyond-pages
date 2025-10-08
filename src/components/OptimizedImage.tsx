import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  loading = 'lazy',
  fetchPriority = 'auto',
  onLoad,
  onError,
  placeholder
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // If image is already loaded
    if (img.complete && img.naturalHeight !== 0) {
      setIsLoaded(true);
      onLoad?.();
    }
  }, [onLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError && placeholder) {
    return (
      <img
        src={placeholder}
        alt={alt}
        className={className}
        loading={loading}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={cn(
        className,
        !isLoaded && 'opacity-0 transition-opacity duration-300',
        isLoaded && 'opacity-100 transition-opacity duration-300'
      )}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};