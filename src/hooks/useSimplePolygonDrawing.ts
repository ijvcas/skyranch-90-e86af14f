
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

  // Get lot color based on status with more translucent colors
  const getLotColor = useCallback((lot: Lot) => {
    switch (lot.status) {
      case 'active': return 'rgba(16, 185, 129, 0.6)'; // More translucent green
      case 'resting': return 'rgba(245, 158, 11, 0.6)'; // More translucent amber
      case 'maintenance': return 'rgba(239, 68, 68, 0.6)'; // More translucent red
      case 'property': return 'rgba(243, 244, 246, 0.8)'; // More translucent light grey
      default: return 'rgba(107, 114, 128, 0.6)'; // More translucent gray
    }
  }, []);

  // Storage hooks - updated to use database
  const { loadPolygonsFromStorage } = usePolygonStorage();

  // Polygon manager - remove savePolygonsToStorage param since it's handled internally now
  const {
    polygons,
    handlePolygonComplete,
    deletePolygon,
    loadSavedPolygons
  } = usePolygonManager({
    lots,
    onLotSelect,
    getLotColor
  });

  // Drawing manager (updated to not use color type)
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
        google.maps.event.addListenerOnce(map, 'idle', async () => {
          console.log('Map is ready, initializing drawing manager...');
          
          initializeDrawingManager(map);
          setIsMapReady(true);
          
          // Load saved polygons from database
          console.log('Loading polygons from database...');
          const savedData = await loadPolygonsFromStorage();
          if (savedData.length > 0) {
            loadSavedPolygons(map, savedData);
          }
          
          console.log('Drawing system initialized successfully with database storage');
        });

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();
  }, [initializeDrawingManager, loadPolygonsFromStorage, loadSavedPolygons]);

  return {
    mapRef,
    mapInstance: mapInstance.current,
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
