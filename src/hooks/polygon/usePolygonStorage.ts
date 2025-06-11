
import { useCallback } from 'react';
import { 
  saveLotPolygon, 
  getLotPolygons, 
  deleteLotPolygon, 
  migrateLocalStoragePolygons, 
  syncPolygonAreasWithLots 
} from '@/services/polygonService';

export const usePolygonStorage = () => {
  const savePolygonsToStorage = useCallback(async (polygons: any[]) => {
    console.log('Saving polygons to database...', polygons.length);
    
    for (const polygon of polygons) {
      if (polygon.lotId && polygon.coordinates) {
        await saveLotPolygon(polygon.lotId, polygon.coordinates, polygon.areaHectares);
      }
    }

    // Sync polygon areas with lot sizes after saving
    await syncPolygonAreasWithLots();
  }, []);

  const loadPolygonsFromStorage = useCallback(async () => {
    try {
      // First, try to migrate any existing localStorage data
      await migrateLocalStoragePolygons();
      
      // Then load from database
      const polygons = await getLotPolygons();
      console.log('Loaded polygon data from database:', polygons.length);
      
      return polygons.map(polygon => ({
        lotId: polygon.lot_id,
        coordinates: polygon.coordinates,
        areaHectares: polygon.area_hectares
      }));
    } catch (error) {
      console.error('Error loading polygon data from database:', error);
      return [];
    }
  }, []);

  const clearPolygonsFromStorage = useCallback(async () => {
    try {
      // This would clear all polygons - use with caution
      console.log('Clearing all polygon data from database');
      // Note: We don't implement a "clear all" function for safety
      // Individual polygons are deleted via deleteLotPolygon
    } catch (error) {
      console.error('Error clearing polygon data:', error);
    }
  }, []);

  const deletePolygonFromStorage = useCallback(async (lotId: string) => {
    try {
      await deleteLotPolygon(lotId);
      console.log('Deleted polygon data from database for lot:', lotId);
    } catch (error) {
      console.error('Error deleting polygon data from database:', error);
    }
  }, []);

  return {
    savePolygonsToStorage,
    loadPolygonsFromStorage,
    clearPolygonsFromStorage,
    deletePolygonFromStorage
  };
};
