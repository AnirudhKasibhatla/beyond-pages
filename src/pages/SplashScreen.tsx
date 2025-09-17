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
    }, 4000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-sky-200 via-emerald-100 to-orange-100 transition-opacity duration-500">
      <div className="flex flex-col items-center space-y-6">
        <div className="animate-scale-in">
          <img 
            src="/logo.png" 
            alt="Beyond Pages Logo" 
            className="w-80 h-80 object-contain animate-pulse drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;