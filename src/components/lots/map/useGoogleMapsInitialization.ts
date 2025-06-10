
import { useRef, useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';
import { SKYRANCH_CENTER, GOOGLE_MAPS_CONFIG } from './mapConstants';
import { mapStorage } from './utils/mapStorage';
import { usePolygonManager } from './hooks/usePolygonManager';
import { useMapRenderer } from './hooks/useMapRenderer';

export const useGoogleMapsInitialization = (lots: Lot[]) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => mapStorage.getApiKey());
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  
  const { toast } = useToast();
  const { addSkyRanchLabel } = useMapRenderer();
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

  // Persist API key to localStorage
  const saveApiKey = (key: string) => {
    mapStorage.saveApiKey(key);
    setApiKey(key);
  };

  const initializeMap = async () => {
    if (!apiKey) {
      setError('API key de Google Maps requerida');
      return;
    }

    console.log('🗺️ Starting Google Maps initialization...');
    
    setIsLoading(true);
    setError(null);
    setShowApiKeyInput(false);

    if (!mapContainer.current) {
      console.error('❌ Map container not found');
      setError('Map container not available');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔑 Loading Google Maps API with geometry and drawing libraries...');
      
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['geometry', 'drawing']
      });

      await loader.load();
      
      console.log('🌍 Creating Google Maps instance...');
      map.current = new google.maps.Map(mapContainer.current, {
        ...GOOGLE_MAPS_CONFIG,
        center: SKYRANCH_CENTER
      });

      // Initialize drawing manager
      initializeDrawingManager(map.current);

      setIsLoading(false);
      addSkyRanchLabel(map.current);
      renderLotPolygons(map.current);
      
      toast({
        title: "Mapa Cargado",
        description: "SkyRanch cargado con herramientas de dibujo!",
      });

    } catch (error) {
      console.error('❌ Google Maps initialization error:', error);
      setError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      setShowApiKeyInput(true);
      toast({
        title: "Error de Inicialización",
        description: "Error al inicializar el mapa. Verifica tu API key.",
        variant: "destructive"
      });
    }
  };

  const handleStartDrawingPolygon = (lotId: string) => {
    startDrawingPolygon(lotId);
  };

  const handleSaveCurrentPolygon = (lotId: string) => {
    if (map.current) {
      saveCurrentPolygon(lotId, map.current);
    }
  };

  const handleDeletePolygonForLot = (lotId: string) => {
    if (map.current) {
      deletePolygonForLot(lotId, map.current);
    }
  };

  const handleSetPolygonColor = (lotId: string, color: string) => {
    if (map.current) {
      setPolygonColor(lotId, color, map.current);
    }
  };

  useEffect(() => {
    if (apiKey) {
      initializeMap();
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
    setApiKey: saveApiKey,
    initializeMap,
    startDrawingPolygon: handleStartDrawingPolygon,
    saveCurrentPolygon: handleSaveCurrentPolygon,
    deletePolygonForLot: handleDeletePolygonForLot,
    setPolygonColor: handleSetPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  };
};
