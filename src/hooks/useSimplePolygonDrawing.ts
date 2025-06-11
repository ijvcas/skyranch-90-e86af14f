
import { useState, useCallback, useRef, useEffect } from 'react';
import { type Lot } from '@/stores/lotStore';
import { loadGoogleMapsAPI } from './polygon/useGoogleMapsLoader';
import { usePolygonStorage } from './polygon/usePolygonStorage';
import { usePolygonManager } from './polygon/usePolygonManager';
import { useDrawingManager } from './polygon/useDrawingManager';

interface UseSimplePolygonDrawingOptions {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const SKYRANCH_CENTER = { lat: 40.31764444, lng: -4.47409722 };

export const useSimplePolygonDrawing = ({ lots, onLotSelect }: UseSimplePolygonDrawingOptions) => {
  const [isMapReady, setIsMapReady] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  // Get lot color based on status
  const getLotColor = useCallback((lot: Lot) => {
    switch (lot.status) {
      case 'active': return '#10b981';
      case 'resting': return '#f59e0b'; 
      case 'maintenance': return '#ef4444';
      default: return '#6b7280';
    }
  }, []);

  // Storage hooks
  const { savePolygonsToStorage, loadPolygonsFromStorage } = usePolygonStorage();

  // Polygon manager
  const {
    polygons,
    handlePolygonComplete,
    deletePolygon,
    loadSavedPolygons
  } = usePolygonManager({
    lots,
    onLotSelect,
    getLotColor,
    savePolygonsToStorage
  });

  // Drawing manager
  const {
    selectedLotId,
    isDrawing,
    initializeDrawingManager,
    startDrawing,
    stopDrawing
  } = useDrawingManager({
    lots,
    getLotColor,
    onPolygonComplete: handlePolygonComplete
  });

  // Initialize map and drawing manager
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        console.log('Loading Google Maps API...');
        await loadGoogleMapsAPI();
        
        console.log('Creating map...');
        const map = new google.maps.Map(mapRef.current, {
          center: SKYRANCH_CENTER,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapInstance.current = map;

        // Wait for map to be fully loaded
        google.maps.event.addListenerOnce(map, 'idle', () => {
          console.log('Map is ready, initializing drawing manager...');
          
          initializeDrawingManager(map);
          setIsMapReady(true);
          
          // Load saved polygons
          const savedData = loadPolygonsFromStorage();
          if (savedData.length > 0) {
            loadSavedPolygons(map, savedData);
          }
          
          console.log('Drawing system initialized successfully');
        });

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();
  }, [initializeDrawingManager, loadPolygonsFromStorage, loadSavedPolygons]);

  return {
    mapRef,
    isMapReady,
    polygons,
    selectedLotId,
    isDrawing,
    startDrawing,
    stopDrawing,
    deletePolygon,
    getLotColor
  };
};
