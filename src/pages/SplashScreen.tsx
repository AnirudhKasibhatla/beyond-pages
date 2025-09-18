import React from 'react';

const SplashScreen: React.FC = () => {

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