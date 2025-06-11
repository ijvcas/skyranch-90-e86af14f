
import { useCallback } from 'react';

interface StoredPolygonData {
  lotId: string;
  color: string;
  colorType: string;
  coordinates: { lat: number; lng: number }[];
  areaHectares?: number;
}

export const usePolygonStorage = () => {
  const savePolygonsToStorage = useCallback((polygonData: any[]) => {
    const dataToSave = polygonData.map(p => ({
      lotId: p.lotId,
      color: p.color,
      colorType: p.colorType,
      coordinates: p.coordinates,
      areaHectares: p.areaHectares
    }));
    console.log('Saving polygons to storage:', dataToSave);
    localStorage.setItem('lotPolygons', JSON.stringify(dataToSave));
  }, []);

  const loadPolygonsFromStorage = useCallback((): StoredPolygonData[] => {
    const saved = localStorage.getItem('lotPolygons');
    if (!saved) {
      console.log('No saved polygons found');
      return [];
    }

    try {
      const data = JSON.parse(saved);
      console.log('Loading saved polygons:', data);
      return data;
    } catch (error) {
      console.error('Error loading saved polygons:', error);
      return [];
    }
  }, []);

  return {
    savePolygonsToStorage,
    loadPolygonsFromStorage
  };
};
