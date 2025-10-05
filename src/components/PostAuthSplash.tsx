import React, { useEffect, useState } from 'react';

interface PostAuthSplashProps {
  onComplete: () => void;
}

const PostAuthSplash: React.FC<PostAuthSplashProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow fade out to complete
    }, 3500); // Show for 3.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-sky-200 via-emerald-100 to-orange-100 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative w-96 mx-4">
        {/* Student SVG Animation */}
        <div className="student-container">
          <svg id="student" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 385" className="w-full h-auto">
            <circle className="circle animate-dash" 
              style={{ display: 'none' }} 
              id="BG" 
              opacity="0.2" 
              cx="200.011" 
              cy="200" 
              r="157.057" 
            />
            <circle className="circle animate-dash" 
              style={{ display: 'none' }} 
              id="dashed" 
              opacity="0.15" 
              fill="none" 
              stroke="#FFFFFF" 
              strokeWidth="15" 
              strokeMiterlimit="10" 
              strokeDasharray="6.5548" 
              cx="200.333" 
              cy="200" 
              r="175.667" 
            />
            <g id="stud_whole" style={{ display: 'none' }}>
              <g id="stud_body">
                <path fill="#FFFFFF" d="M300,323v-9.401c300,268.536,255,131,232,280.241,232,300l0.2,0.2
                  C143.809,232.268.536,99,313.599Y323.302v-269c-3.4,0-6.2-2.8-6.2-6.2C270.599,268.8,273.399,266,276.799,266z" />
              </g>
              <g id="stud_head">
                <path fill="#FFFFFF" d="M276.799,255.131,232,280.241,232,300l0.2,0.2
                  C273.535,183.9-66.8,183.9-63.2,180.3z M57.203,85.067H41.504V72.542h15.699V85.067L57.203,85.067z" />
              </g>
            </g>
            <g id="reflection">
              <path fill="#FFFFFF" opacity="0.45" d="M200.011,57.057C200.011,57.057,200.011,57.057,200.011,57.057" />
            </g>
            <g id="hair">
              <circle fill="#FFFFFF" cx="200" cy="150" r="25" className="animate-pulse" />
            </g>
            <g id="stud_body">
              <rect fill="#FFFFFF" x="175" y="200" width="50" height="80" rx="10" className="animate-float" />
            </g>
            <g id="pageFold">
              <polygon fill="#FFFFFF" opacity="0.8" points="220,240 260,220 260,320 220,320" className="animate-page-turn" />
            </g>
            <g id="stars">
              <circle fill="#FFFFFF" cx="120" cy="100" r="2" className="animate-twinkle" />
              <circle fill="#FFFFFF" cx="280" cy="120" r="1.5" className="animate-twinkle-delay" />
              <circle fill="#FFFFFF" cx="320" cy="280" r="2" className="animate-twinkle" />
              <circle fill="#FFFFFF" cx="80" cy="300" r="1.5" className="animate-twinkle-delay" />
            </g>
            <g id="circle">
              <circle fill="none" stroke="#FFFFFF" strokeWidth="2" cx="200" cy="200" r="150" className="animate-draw-circle" />
            </g>
            <g id="services_icon">
              <g id="dashed_services_icon">
                <circle fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="8,4" cx="320" cy="180" r="20" className="animate-rotate" />
              </g>
            </g>
          </svg>
        </div>
        
        {/* Loading Text */}
        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold text-white animate-pulse">
            Preparing Your Library...
          </h2>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dash {
          0% {
            stroke-dasharray: 0, 1000;
            opacity: 0;
          }
          50% {
            stroke-dasharray: 500, 500;
            opacity: 1;
          }
          100% {
            stroke-dasharray: 1000, 0;
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes page-turn {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes draw-circle {
          0% {
            stroke-dasharray: 0, 942;
            opacity: 0;
          }
          100% {
            stroke-dasharray: 942, 0;
            opacity: 1;
          }
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-dash {
          animation: dash 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-page-turn {
          animation: page-turn 2s ease-in-out infinite;
          transform-origin: left center;
        }

        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }

        .animate-twinkle-delay {
          animation: twinkle 2s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-draw-circle {
          animation: draw-circle 3s ease-in-out forwards;
        }

        .animate-rotate {
          animation: rotate 4s linear infinite;
          transform-origin: center;
        }

        .student-container {
          animation: scale-in 0.8s ease-out;
        }

        @keyframes scale-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PostAuthSplash;