
// Storage utilities for Google Maps data
const API_KEY_STORAGE_KEY = 'skyranch_google_maps_api_key';
const POLYGON_STORAGE_KEY = 'skyranch_lot_polygons';

export interface LotPolygon {
  lotId: string;
  coordinates: google.maps.LatLngLiteral[];
  color: string;
}

export const mapStorage = {
  // API Key storage
  getApiKey: (): string => {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  },

  saveApiKey: (key: string): void => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  },

  // Polygon storage
  getPolygons: (): LotPolygon[] => {
    const stored = localStorage.getItem(POLYGON_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  savePolygons: (polygons: LotPolygon[]): void => {
    localStorage.setItem(POLYGON_STORAGE_KEY, JSON.stringify(polygons));
  }
};
