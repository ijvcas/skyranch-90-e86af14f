
import { useEffect } from 'react';
import { type Lot } from '@/stores/lotStore';
import { useApiKeyManagement } from './hooks/useApiKeyManagement';
import { useMapInitialization } from './hooks/useMapInitialization';
import { useMapRotation } from './hooks/useMapRotation';
import { usePolygonStorage } from './hooks/usePolygonStorage';
import { usePolygonRenderer } from './hooks/usePolygonRenderer';
import { usePolygonDrawing } from './hooks/usePolygonDrawing';

export const useGoogleMapsInitialization = (lots: Lot[]) => {
  const { apiKey, showApiKeyInput, setShowApiKeyInput, saveApiKey } = useApiKeyManagement();
  const { mapContainer, map, isLoading, error, initializeMap } = useMapInitialization();
  const { mapRotation, resetMapRotation, setupRotationListener } = useMapRotation();
  
  // Polygon management hooks - used directly instead of through managers
  const {
    lotPolygons,
    savePolygons,
    updatePolygonForLot,
    deletePolygonForLot,
    addPolygonForLot
  } = usePolygonStorage();
  
  const {
    renderLotPolygons,
    togglePolygonsVisibility,
    toggleLabelsVisibility,
    cleanup: cleanupRenderer
  } = usePolygonRenderer(lots);
  
  const {
    initializeDrawingManager,
    startDrawingPolygon,
    saveCurrentPolygon,
    cleanup: cleanupDrawing
  } = usePolygonDrawing({ lots, addPolygonForLot });

  const handleMapReady = (mapInstance: google.maps.Map) => {
    console.log('🎯 Map ready, initializing components...');
    setupRotationListener(mapInstance);
    initializeDrawingManager(mapInstance);
    renderLotPolygons(mapInstance, lotPolygons);
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

  // Polygon operation handlers - simplified
  const handleStartDrawingPolygon = (lotId: string) => {
    startDrawingPolygon(lotId);
  };

  const handleSaveCurrentPolygon = (lotId: string, onComplete: () => void) => {
    if (map.current) {
      saveCurrentPolygon(lotId, map.current, onComplete);
    }
  };

  const handleDeletePolygonForLot = (lotId: string) => {
    deletePolygonForLot(lotId);
    if (map.current) {
      renderLotPolygons(map.current, lotPolygons.filter(p => p.lotId !== lotId));
    }
  };

  const handleSetPolygonColor = (lotId: string, color: string) => {
    updatePolygonForLot(lotId, { color });
    if (map.current) {
      renderLotPolygons(map.current, lotPolygons);
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
      cleanupRenderer();
      cleanupDrawing();
    };
  }, [apiKey]);

  // Re-render polygons when lots change
  useEffect(() => {
    if (map.current) {
      console.log('🔄 Re-rendering polygons for lots change');
      renderLotPolygons(map.current, lotPolygons);
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
