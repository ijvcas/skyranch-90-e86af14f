
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export const useMobileOptimizations = () => {
  const isMobile = useIsMobile();
  const [isLandscape, setIsLandscape] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    const handleOrientationChange = () => {
      // Small delay to ensure viewport dimensions are updated
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const getMapHeight = () => {
    if (isMobile) {
      // On mobile, use more of the screen and account for safe areas
      return isLandscape ? '60vh' : '55vh';
    }
    return '48rem'; // Desktop default
  };

  const getControlPosition = () => {
    if (isMobile) {
      return {
        position: 'fixed' as const,
        bottom: '1rem',
        left: '1rem',
        right: '1rem',
        top: 'auto'
      };
    }
    return {
      position: 'absolute' as const,
      top: '1rem',
      right: '20rem',
      bottom: 'auto',
      left: 'auto'
    };
  };

  return {
    isMobile,
    isLandscape,
    viewportHeight,
    getMapHeight,
    getControlPosition
  };
};
