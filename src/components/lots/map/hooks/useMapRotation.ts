
import { useState, useRef } from 'react';

export const useMapRotation = () => {
  const [mapRotation, setMapRotation] = useState(0);
  const map = useRef<google.maps.Map | null>(null);

  const resetMapRotation = () => {
    if (map.current) {
      map.current.setHeading(0);
      setMapRotation(0);
    }
  };

  const setupRotationListener = (mapInstance: google.maps.Map) => {
    map.current = mapInstance;
    mapInstance.addListener('heading_changed', () => {
      if (mapInstance) {
        setMapRotation(mapInstance.getHeading() || 0);
      }
    });
  };

  return {
    mapRotation,
    resetMapRotation,
    setupRotationListener
  };
};
