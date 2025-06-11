
import { useCallback } from 'react';

export const usePolygonUtils = () => {
  const calculatePolygonArea = useCallback((polygon: google.maps.Polygon): number => {
    if (!window.google?.maps?.geometry) {
      console.warn('Google Maps Geometry library not loaded');
      return 0;
    }

    try {
      const path = polygon.getPath();
      const area = google.maps.geometry.spherical.computeArea(path);
      // Convert from square meters to hectares (1 hectare = 10,000 square meters)
      return area / 10000;
    } catch (error) {
      console.error('Error calculating polygon area:', error);
      return 0;
    }
  }, []);

  const formatArea = useCallback((areaHectares: number): string => {
    if (areaHectares < 0.01) {
      return `${(areaHectares * 10000).toFixed(0)} m²`;
    }
    return `${areaHectares.toFixed(2)} ha`;
  }, []);

  return {
    calculatePolygonArea,
    formatArea
  };
};
