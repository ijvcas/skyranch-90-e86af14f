
import { useState, useRef } from 'react';

export const useMapRotation = () => {
  const [mapRotation, setMapRotation] = useState(0);
  const map = useRef<google.maps.Map | null>(null);

  const resetMapRotation = () => {
    if (map.current) {
      console.log('🔄 Resetting map rotation');
      map.current.setHeading(0);
      setMapRotation(0);
    }
  };

  const setupRotationListener = (mapInstance: google.maps.Map) => {
    console.log('🎯 Setting up rotation listener');
    map.current = mapInstance;
    mapInstance.addListener('heading_changed', () => {
      if (mapInstance) {
        const heading = mapInstance.getHeading() || 0;
        setMapRotation(heading);
      }
    });
  };

  return {
    mapRotation,
    resetMapRotation,
    setupRotationListener
  };
};
