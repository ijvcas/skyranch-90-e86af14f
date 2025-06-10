
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
  
  const {
    lotPolygons,
    renderLotPolygons,
    initializeDrawingManager,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility,
    cleanup
  } = usePolygonManager(lots);

  const {
    handleStartDrawingPolygon,
    handleSaveCurrentPolygon,
    handleDeletePolygonForLot,
    handleSetPolygonColor
  } = usePolygonOperations({
    map,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor
  });

  const handleMapReady = (mapInstance: google.maps.Map) => {
    setupRotationListener(mapInstance);
    initializeDrawingManager(mapInstance);
    renderLotPolygons(mapInstance);
  };

  const handleInitializeMap = async () => {
    if (apiKey) {
      setShowApiKeyInput(false);
      await initializeMap(apiKey, handleMapReady);
    }
  };

  useEffect(() => {
    if (apiKey) {
      handleInitializeMap();
    }
    return () => {
      console.log('🧹 Cleaning up Google Maps...');
      cleanup();
    };
  }, [apiKey]);

  // Re-render polygons when lots change
  useEffect(() => {
    if (map.current) {
      renderLotPolygons(map.current);
    }
  }, [lots, lotPolygons]);

  return {
    mapContainer,
    map,
    isLoading,
    error,
    apiKey,
    showApiKeyInput,
    lotPolygons,
    mapRotation,
    setApiKey: saveApiKey,
    initializeMap: handleInitializeMap,
    resetMapRotation,
    startDrawingPolygon: handleStartDrawingPolygon,
    saveCurrentPolygon: handleSaveCurrentPolygon,
    deletePolygonForLot: handleDeletePolygonForLot,
    setPolygonColor: handleSetPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  };
};
