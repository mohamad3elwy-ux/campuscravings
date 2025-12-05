import React, { useEffect, useState } from 'react';

const SimplePageTransition = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsExiting(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30); // Very short delay for immediate feedback

    return () => {
      setIsExiting(true);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`min-h-full transition-all duration-300 ease-out transform ${
        isVisible && !isExiting 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-95'
      }`}
    >
      {children}
    </div>
  );
};

export default SimplePageTransition;
