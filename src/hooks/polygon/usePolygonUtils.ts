
import { useCallback } from 'react';

export const usePolygonUtils = () => {
  const calculatePolygonArea = useCallback((polygon: google.maps.Polygon): number => {
    if (!window.google?.maps?.geometry) {
      console.warn('Google Maps Geometry library not loaded');
      return 0;
    }

    try {
      const path = polygon.getPath();
      if (!path || path.getLength() < 3) {
        console.warn('Invalid polygon path: not enough points');
        return 0;
      }

      const area = google.maps.geometry.spherical.computeArea(path);
      // Convert from square meters to hectares (1 hectare = 10,000 square meters)
      const areaHectares = area / 10000;

      // Format to 4 decimal places for database consistency
      const formattedArea = Number(areaHectares.toFixed(4));

      console.log('Calculated area:', formattedArea, 'hectares');
      return formattedArea;
    } catch (error) {
      console.error('Error calculating polygon area:', error);
      return 0;
    }
  }, []);

  const formatArea = useCallback((areaHectares?: number): string => {
    if (!areaHectares || areaHectares <= 0) return '0 ha';
    
    if (areaHectares < 0.01) {
      const squareMeters = Math.round(areaHectares * 10000);
      return `${squareMeters} m²`;
    }
    
    // Always format to exactly 2 decimal places for display
    return `${areaHectares.toFixed(2)} ha`;
  }, []);

  return {
    calculatePolygonArea,
    formatArea
  };
};
