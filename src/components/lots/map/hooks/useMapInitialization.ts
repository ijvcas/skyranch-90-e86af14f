
import { useEffect, useCallback } from 'react';
import { type Lot } from '@/stores/lotStore';
import { useApiKeyStorage } from './useApiKeyStorage';
import { useGoogleMapsLoader } from './useGoogleMapsLoader';
import { useMapInstance } from './useMapInstance';
import { useMapComponents } from './useMapComponents';

export const useMapInitialization = (lots: Lot[]) => {
  // Use the separated hooks
  const { apiKey, showApiKeyInput } = useApiKeyStorage();
  const { isLoading, error, loadGoogleMaps } = useGoogleMapsLoader();
  const { mapContainer, map, mapRotation, createMapInstance, resetMapRotation } = useMapInstance();
  const {
    lotPolygons,
    initializeMapComponents,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  } = useMapComponents(lots);

  console.log('🗺️ useMapInitialization render - Force loading with API key');

  // Main initialization function
  const initializeMap = useCallback(async () => {
    console.log('🗺️ Starting FORCED map initialization');
    console.log('🗺️ Container ref current:', !!mapContainer.current);

    if (!mapContainer.current) {
      console.error('❌ Map container not available for initialization');
      setTimeout(() => {
        if (mapContainer.current && !map.current) {
          console.log('🔄 Retrying initialization with available container');
          initializeMap();
        }
      }, 100);
      return;
    }

    if (map.current) {
      console.log('✅ Map already initialized, skipping');
      return;
    }

    try {
      // Load Google Maps API
      const apiLoaded = await loadGoogleMaps();
      if (!apiLoaded) return;

      // Create map instance
      const mapInstance = await createMapInstance();
      if (!mapInstance) return;

      // Initialize components
      initializeMapComponents(mapInstance);

    } catch (error) {
      console.error('❌ Map initialization failed:', error);
    }
  }, [loadGoogleMaps, createMapInstance, initializeMapComponents, mapContainer, map]);

  // Single effect to handle initialization when container is ready
  useEffect(() => {
    console.log('🔄 Main initialization effect triggered');
    console.log('  - Container exists:', !!mapContainer.current);
    console.log('  - Map exists:', !!map.current);
    
    // Force immediate initialization if container is ready
    if (mapContainer.current && !map.current) {
      console.log('🚀 Container ready - force initializing map immediately!');
      initializeMap();
    }
  }, []); // Empty dependency array - run once on mount

  // Additional effect to handle container ref changes with delay
  useEffect(() => {
    const checkContainer = () => {
      console.log('🔄 Delayed container check:');
      console.log('  - Container exists:', !!mapContainer.current);
      console.log('  - Map exists:', !!map.current);
      
      if (mapContainer.current && !map.current) {
        console.log('🚀 Delayed initialization trigger');
        initializeMap();
      }
    };

    // Check immediately and with small delays
    checkContainer();
    const timeoutId1 = setTimeout(checkContainer, 50);
    const timeoutId2 = setTimeout(checkContainer, 200);
    const timeoutId3 = setTimeout(checkContainer, 500);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [initializeMap]);

  // Effect to re-render polygons when lots change
  useEffect(() => {
    if (map.current && lotPolygons.length > 0) {
      console.log('🔄 Re-rendering polygons for lot changes');
      // Re-initialize components when lots change
      initializeMapComponents(map.current);
    }
  }, [lots, initializeMapComponents, lotPolygons]);

  return {
    mapContainer,
    map,
    isLoading,
    error,
    apiKey,
    showApiKeyInput,
    lotPolygons,
    mapRotation,
    setApiKey: () => true, // No-op since we're using force key
    resetMapRotation,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  };
};
