
import { useCallback } from 'react';

export const usePolygonStorage = () => {
  const savePolygonsToStorage = useCallback((polygons: any[]) => {
    const dataToSave = polygons.map(p => ({
      lotId: p.lotId,
      color: p.color,
      coordinates: p.coordinates,
      areaHectares: p.areaHectares
    }));
    
    try {
      localStorage.setItem('lotPolygons', JSON.stringify(dataToSave));
      console.log('Saved polygon data to localStorage:', dataToSave.length);
    } catch (error) {
      console.error('Error saving polygon data to localStorage:', error);
    }
  }, []);

  const loadPolygonsFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('lotPolygons');
      if (saved) {
        const data = JSON.parse(saved);
        console.log('Loaded polygon data from localStorage:', data.length);
        return data;
      }
    } catch (error) {
      console.error('Error loading polygon data from localStorage:', error);
    }
    return [];
  }, []);

  const clearPolygonsFromStorage = useCallback(() => {
    try {
      localStorage.removeItem('lotPolygons');
      console.log('Cleared polygon data from localStorage');
    } catch (error) {
      console.error('Error clearing polygon data from localStorage:', error);
    }
  }, []);

  return {
    savePolygonsToStorage,
    loadPolygonsFromStorage,
    clearPolygonsFromStorage
  };
};
