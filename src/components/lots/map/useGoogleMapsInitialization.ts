
import { useEffect } from 'react';
import { type Lot } from '@/stores/lotStore';
import { usePolygonManager } from './hooks/usePolygonManager';
import { useApiKeyManagement } from './hooks/useApiKeyManagement';
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapRotation } from './hooks/useMapRotation';
import { usePolygonOperations } from './hooks/usePolygonOperations';

export const useGoogleMapsInitialization = (lots: Lot[]) => {
  const { apiKey, showApiKeyInput, setShowApiKeyInput, saveApiKey } = useApiKeyManagement();
  const { mapContainer, map, isLoading, error, initializeMap } = useMapInitialization();
  const { mapRotation, resetMapRotation, setupRotationListener } = useMapRotation();
  
  const polygonManager = usePolygonManager(lots);
  
  const polygonOperations = usePolygonOperations({
    map,
    startDrawingPolygon: polygonManager.startDrawingPolygon,
    saveCurrentPolygon: polygonManager.saveCurrentPolygon,
    deletePolygonForLot: polygonManager.deletePolygonForLot,
    setPolygonColor: polygonManager.setPolygonColor
  });

  const handleMapReady = (mapInstance: google.maps.Map) => {
    console.log('🎯 Map ready, initializing components...');
    setupRotationListener(mapInstance);
    polygonManager.initializeDrawingManager(mapInstance);
    polygonManager.renderLotPolygons(mapInstance);
  };

  const handleInitializeMap = async () => {
    console.log('🚀 Attempting to initialize map...');
    console.log('API Key available:', !!apiKey);
    console.log('Container available:', !!mapContainer.current);
    
    if (apiKey) {
      setShowApiKeyInput(false);
      await initializeMap(apiKey, handleMapReady);
    } else {
      console.log('❌ No API key available');
    }
  };

  // Initialize map when API key is available
  useEffect(() => {
    console.log('🔄 API key effect triggered:', !!apiKey);
    if (apiKey) {
      handleInitializeMap();
    }
    return () => {
      console.log('🧹 Cleaning up Google Maps...');
      polygonManager.cleanup();
    };
  }, [apiKey]);

  // Re-render polygons when lots change
  useEffect(() => {
    if (map.current) {
      console.log('🔄 Re-rendering polygons for lots change');
      polygonManager.renderLotPolygons(map.current);
    }
  }, [lots, polygonManager.lotPolygons]);

  return {
    mapContainer,
    map,
    isLoading,
    error,
    apiKey,
    showApiKeyInput,
    lotPolygons: polygonManager.lotPolygons,
    mapRotation,
    setApiKey: saveApiKey,
    initializeMap: handleInitializeMap,
    resetMapRotation,
    startDrawingPolygon: polygonOperations.handleStartDrawingPolygon,
    saveCurrentPolygon: polygonOperations.handleSaveCurrentPolygon,
    deletePolygonForLot: polygonOperations.handleDeletePolygonForLot,
    setPolygonColor: polygonOperations.handleSetPolygonColor,
    togglePolygonsVisibility: polygonManager.togglePolygonsVisibility,
    toggleLabelsVisibility: polygonManager.toggleLabelsVisibility
  };
};
