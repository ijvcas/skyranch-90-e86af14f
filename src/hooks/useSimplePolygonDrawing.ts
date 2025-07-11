
import { useState, useCallback, useRef, useEffect } from 'react';
import { type Lot } from '@/stores/lotStore';
import { loadGoogleMapsAPI } from './polygon/useGoogleMapsLoader';
import { usePolygonStorage } from './polygon/usePolygonStorage';
import { usePolygonManager } from './polygon/usePolygonManager';
import { useDrawingManager } from './polygon/useDrawingManager';
import { syncPolygonAreasWithLots } from '@/services/polygonService';

interface UseSimplePolygonDrawingOptions {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const SKYRANCH_CENTER = { lat: 40.31764444, lng: -4.47409722 };

export const useSimplePolygonDrawing = ({ lots, onLotSelect }: UseSimplePolygonDrawingOptions) => {
  const [isMapReady, setIsMapReady] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const isInitialized = useRef(false);

  // Get lot color based on auto-generated status
  const getLotColor = useCallback((lot: Lot) => {
    // Auto-generated lots (property lots) are shown in light gray
    if ((lot as any).autoGenerated === true) {
      return 'rgba(229, 231, 235, 0.8)'; // Light gray for auto-generated
    }
    
    // User-created lots get full colors based on status
    switch (lot.status) {
      case 'active': return 'rgba(16, 185, 129, 0.6)'; // Green
      case 'resting': return 'rgba(245, 158, 11, 0.6)'; // Amber
      case 'maintenance': return 'rgba(239, 68, 68, 0.6)'; // Red
      default: return 'rgba(107, 114, 128, 0.6)'; // Gray
    }
  }, []);

  // Storage hooks
  const { loadPolygonsFromStorage } = usePolygonStorage();

  // Polygon manager
  const {
    polygons,
    handlePolygonComplete,
    deletePolygon,
    loadSavedPolygons
  } = usePolygonManager(mapInstance.current, onLotSelect);

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

  // Initialize map only once
  useEffect(() => {
    if (isInitialized.current || !mapRef.current) return;

    const initMap = async () => {
      try {
        console.log('🗺️ Initializing Google Maps (one-time)...');
        await loadGoogleMapsAPI();
        
        const map = new google.maps.Map(mapRef.current, {
          center: SKYRANCH_CENTER,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          disableDefaultUI: false,
        });

        mapInstance.current = map;
        isInitialized.current = true;

        // Wait for map to be fully loaded
        google.maps.event.addListenerOnce(map, 'idle', () => {
          console.log('✅ Map ready, initializing drawing manager...');
          initializeDrawingManager(map);
          setIsMapReady(true);
        });

      } catch (error) {
        console.error('❌ Error initializing map:', error);
      }
    };

    initMap();
  }, []); // Only run once on mount

  // Load polygons when map is ready and lots are available
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || lots.length === 0) return;

    const loadPolygons = async () => {
      console.log('🔄 Loading polygons for', lots.length, 'lots...');
      
      const autoGeneratedLots = lots.filter(lot => (lot as any).autoGenerated === true);
      const userCreatedLots = lots.filter(lot => (lot as any).autoGenerated !== true);
      
      console.log('🏢 Auto-generated lots:', autoGeneratedLots.length);
      console.log('🌿 User-created lots:', userCreatedLots.length);
      
      await loadSavedPolygons(lots);
      
      // Sync polygon areas with lots
      await syncPolygonAreasWithLots();
      
      console.log('✅ Polygon loading complete');
    };

    loadPolygons();
  }, [isMapReady, lots.length]); // Only depend on map readiness and lot count

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
