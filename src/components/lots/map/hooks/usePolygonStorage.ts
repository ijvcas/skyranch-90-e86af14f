
import { useState, useCallback } from 'react';

const POLYGON_STORAGE_KEY = 'skyranch_lot_polygons';

export interface LotPolygon {
  lotId: string;
  coordinates: google.maps.LatLngLiteral[];
  color: string;
}

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage save failed:', error);
      return false;
    }
  }
};

export const usePolygonStorage = () => {
  const [lotPolygons, setLotPolygons] = useState<LotPolygon[]>(() => {
    const stored = safeLocalStorage.getItem(POLYGON_STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  });

  const savePolygons = useCallback((polygons: LotPolygon[]) => {
    console.log('💾 Saving polygons:', polygons.length);
    safeLocalStorage.setItem(POLYGON_STORAGE_KEY, JSON.stringify(polygons));
    setLotPolygons(polygons);
  }, []);

  return {
    lotPolygons,
    savePolygons
  };
};
