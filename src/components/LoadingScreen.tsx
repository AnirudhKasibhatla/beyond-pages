import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow fade out to complete
    }, 4000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="animate-scale-in">
          <img 
            src="/logo.png" 
            alt="Beyond Pages Logo" 
            className="w-64 h-64 object-contain animate-pulse"
          />
        </div>
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-primary animate-pulse">
            BEYOND PAGES
          </h1>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;