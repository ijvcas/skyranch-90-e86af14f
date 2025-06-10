
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
  
  // Polygon management hooks - used directly
  const {
    lotPolygons,
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
    
    if (apiKey && mapContainer.current) {
      setShowApiKeyInput(false);
      await initializeMap(apiKey, handleMapReady);
    } else {
      console.log('❌ Missing requirements - API key:', !!apiKey, 'Container:', !!mapContainer.current);
    }
  };

  // Simplified polygon operation handlers
  const handleStartDrawingPolygon = (lotId: string) => {
    console.log('🖊️ Starting drawing for lot:', lotId);
    startDrawingPolygon(lotId);
  };

  const handleSaveCurrentPolygon = (lotId: string, onComplete: () => void) => {
    console.log('💾 Saving polygon for lot:', lotId);
    if (map.current) {
      saveCurrentPolygon(lotId, map.current, onComplete);
    } else {
      console.error('❌ Map not available for saving polygon');
      onComplete();
    }
  };

  const handleDeletePolygonForLot = (lotId: string) => {
    console.log('🗑️ Deleting polygon for lot:', lotId);
    deletePolygonForLot(lotId);
    if (map.current) {
      const updatedPolygons = lotPolygons.filter(p => p.lotId !== lotId);
      renderLotPolygons(map.current, updatedPolygons);
    }
  };

  const handleSetPolygonColor = (lotId: string, color: string) => {
    console.log('🎨 Setting polygon color for lot:', lotId, 'to:', color);
    updatePolygonForLot(lotId, { color });
    if (map.current) {
      renderLotPolygons(map.current, lotPolygons);
    }
  };

  // Initialize map when API key is available
  useEffect(() => {
    console.log('🔄 API key effect triggered. API Key:', !!apiKey, 'Container:', !!mapContainer.current);
    if (apiKey) {
      handleInitializeMap();
    }
    return () => {
      console.log('🧹 Cleaning up Google Maps...');
      cleanupRenderer();
      cleanupDrawing();
    };
  }, [apiKey]);

  // Re-render polygons when lots or polygons change
  useEffect(() => {
    if (map.current && lotPolygons.length > 0) {
      console.log('🔄 Re-rendering polygons - lots:', lots.length, 'polygons:', lotPolygons.length);
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
