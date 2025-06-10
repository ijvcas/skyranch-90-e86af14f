
import { useState, useEffect } from 'react';

export const useMapState = () => {
  const [showControls, setShowControls] = useState(false);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return {
    showControls,
    setShowControls,
    showPolygons,
    setShowPolygons,
    showLabels,
    setShowLabels,
    isFullscreen,
    toggleFullscreen
  };
};
