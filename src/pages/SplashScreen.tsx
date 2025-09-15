import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Add 0.5 second gap before navigating
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-leaf/20 via-wood/10 to-bark/20 transition-opacity duration-500">
      <div className="flex flex-col items-center space-y-6">
        <div className="animate-scale-in">
          <img 
            src="/logo.png" 
            alt="Beyond Pages Logo" 
            className="w-64 h-64 object-contain animate-pulse"
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;