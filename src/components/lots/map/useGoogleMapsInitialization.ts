
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

  // Enhanced API key persistence
  const saveApiKey = (key: string) => {
    console.log('💾 Saving API key...');
    const success = mapStorage.saveApiKey(key);
    if (success) {
      setApiKey(key);
      console.log('✅ API key saved successfully');
    } else {
      console.error('❌ Failed to save API key');
      toast({
        title: "Error",
        description: "No se pudo guardar la API key",
        variant: "destructive"
      });
    }
  };

  const initializeMap = async () => {
    if (!apiKey) {
      setError('API key de Google Maps requerida');
      return;
    }

    console.log('🗺️ Starting Google Maps initialization with full controls...');
    
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
      console.log('🔑 Loading Google Maps API with ALL libraries...');
      
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['geometry', 'drawing', 'places'] // Load all necessary libraries
      });

      await loader.load();
      
      // Verify geometry library is available
      if (!window.google?.maps?.geometry) {
        throw new Error('Google Maps geometry library failed to load');
      }
      
      console.log('🌍 Creating Google Maps instance with all native controls...');
      map.current = new google.maps.Map(mapContainer.current, {
        ...GOOGLE_MAPS_CONFIG,
        center: SKYRANCH_CENTER,
        // Ensure ALL controls are properly positioned
        controlSize: 28,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT
        },
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_LEFT
        },
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER
        }
      });

      // Wait for map to be fully loaded
      await new Promise<void>((resolve) => {
        const listener = map.current!.addListener('idle', () => {
          google.maps.event.removeListener(listener);
          resolve();
        });
      });

      // Initialize drawing manager
      initializeDrawingManager(map.current);

      setIsLoading(false);
      addSkyRanchLabel(map.current);
      renderLotPolygons(map.current);
      
      toast({
        title: "Mapa Cargado",
        description: "SkyRanch cargado con controles de rotación nativos de Google!",
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
    lotPolygons,
    setApiKey: saveApiKey,
    initializeMap,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  };
};
