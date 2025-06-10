
// Storage utilities for Google Maps data with better mobile support
const API_KEY_STORAGE_KEY = 'skyranch_google_maps_api_key';
const POLYGON_STORAGE_KEY = 'skyranch_lot_polygons';

export interface LotPolygon {
  lotId: string;
  coordinates: google.maps.LatLngLiteral[];
  color: string;
}

// Enhanced storage with better error handling for mobile
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
      // Verify it was actually saved (important for mobile)
      const saved = localStorage.getItem(key);
      if (saved !== value) {
        console.warn('localStorage save verification failed');
        return false;
      }
      return true;
    } catch (error) {
      console.warn('localStorage save failed:', error);
      return false;
    }
  }
};

export const mapStorage = {
  // API Key storage with mobile-friendly handling
  getApiKey: (): string => {
    const key = safeLocalStorage.getItem(API_KEY_STORAGE_KEY) || '';
    console.log('📱 Retrieved API key from storage:', key ? '✅ Found' : '❌ Not found');
    return key;
  },

  saveApiKey: (key: string): boolean => {
    console.log('📱 Saving API key to storage...');
    const success = safeLocalStorage.setItem(API_KEY_STORAGE_KEY, key);
    console.log('📱 API key save result:', success ? '✅ Success' : '❌ Failed');
    return success;
  },

  // Polygon storage with better error handling
  getPolygons: (): LotPolygon[] => {
    const stored = safeLocalStorage.getItem(POLYGON_STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Failed to parse stored polygons:', error);
      return [];
    }
  },

  savePolygons: (polygons: LotPolygon[]): boolean => {
    try {
      return safeLocalStorage.setItem(POLYGON_STORAGE_KEY, JSON.stringify(polygons));
    } catch (error) {
      console.warn('Failed to save polygons:', error);
      return false;
    }
  }
};
