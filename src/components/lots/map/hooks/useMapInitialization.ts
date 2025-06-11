
import { useRef, useState, useEffect, useCallback } from 'react';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@googlemaps/js-api-loader';
import { SKYRANCH_CENTER, GOOGLE_MAPS_CONFIG } from '../mapConstants';
import { useApiKeyStorage } from './useApiKeyStorage';
import { usePolygonStorage } from './usePolygonStorage';
import { useMapRenderer } from './useMapRenderer';
import { usePolygonOperations } from './usePolygonOperations';

const FORCE_API_KEY = 'AIzaSyBo7e7hBrnCCtJDSaftXEFHP4qi-KiKXzI';

export const useMapInitialization = (lots: Lot[]) => {
  const { toast } = useToast();
  
  // Core refs and state
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapRotation, setMapRotation] = useState(0);
  
  // Use the separated hooks
  const { apiKey: storedApiKey, showApiKeyInput, setApiKey } = useApiKeyStorage();
  const { lotPolygons, savePolygons } = usePolygonStorage();
  const { addSkyRanchLabel, renderLotPolygons, togglePolygonsVisibility, toggleLabelsVisibility } = useMapRenderer(lots);
  const { 
    initializeDrawingManager, 
    startDrawingPolygon, 
    saveCurrentPolygon, 
    deletePolygonForLot, 
    setPolygonColor 
  } = usePolygonOperations(lots, lotPolygons, savePolygons);

  // Force use the override API key
  const finalApiKey = FORCE_API_KEY || storedApiKey;
  const shouldShowInput = !finalApiKey;

  console.log('🗺️ useMapInitialization state:');
  console.log('  - Force API Key:', !!FORCE_API_KEY);
  console.log('  - Stored API Key:', !!storedApiKey);
  console.log('  - Final API Key:', !!finalApiKey);
  console.log('  - Should show input:', shouldShowInput);
  console.log('  - Loading:', isLoading);
  console.log('  - Container exists:', !!mapContainer.current);

  // Initialize map function
  const initializeMap = useCallback(async () => {
    console.log('🗺️ Starting forced map initialization');
    console.log('🗺️ Container ref:', !!mapContainer.current);
    console.log('🗺️ Final API key:', !!finalApiKey);

    if (!finalApiKey) {
      console.error('❌ No API key available for initialization');
      setError('API key requerida');
      setIsLoading(false);
      return;
    }

    if (!mapContainer.current) {
      console.error('❌ Map container not available');
      setError('Contenedor del mapa no disponible');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔑 Loading Google Maps API with force key');
      
      const loader = new Loader({
        apiKey: finalApiKey,
        version: 'weekly',
        libraries: ['geometry', 'drawing', 'places']
      });

      await loader.load();
      
      if (!window.google?.maps?.geometry) {
        throw new Error('Google Maps geometry library failed to load');
      }
      
      console.log('🌍 Creating map instance');
      
      map.current = new google.maps.Map(mapContainer.current, {
        ...GOOGLE_MAPS_CONFIG,
        center: SKYRANCH_CENTER
      });

      // Wait for map to be ready
      await new Promise<void>((resolve) => {
        const listener = map.current!.addListener('idle', () => {
          google.maps.event.removeListener(listener);
          resolve();
        });
      });

      console.log('✅ Map created successfully');
      
      // Setup rotation listener
      map.current.addListener('heading_changed', () => {
        if (map.current) {
          const heading = map.current.getHeading() || 0;
          setMapRotation(heading);
        }
      });

      // Initialize components
      initializeDrawingManager(map.current);
      addSkyRanchLabel(map.current);
      renderLotPolygons(map.current, lotPolygons);
      
      setIsLoading(false);
      
      toast({
        title: "Mapa Cargado",
        description: "SkyRanch cargado correctamente!",
      });

    } catch (error) {
      console.error('❌ Map initialization failed:', error);
      setError(`Error al inicializar el mapa: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setIsLoading(false);
      toast({
        title: "Error de Inicialización",
        description: "Error al inicializar el mapa. Verifica tu API key.",
        variant: "destructive"
      });
    }
  }, [finalApiKey, initializeDrawingManager, addSkyRanchLabel, renderLotPolygons, lotPolygons, toast]);

  // Effect to initialize map - force initialization with container and API key
  useEffect(() => {
    console.log('🔄 Effect triggered:');
    console.log('  - Final API key exists:', !!finalApiKey);
    console.log('  - Container exists:', !!mapContainer.current);
    console.log('  - Map exists:', !!map.current);
    
    // Force initialization if we have API key and container but no map
    if (finalApiKey && mapContainer.current && !map.current) {
      console.log('🚀 Force initializing map now!');
      initializeMap();
    }
  }, [finalApiKey, initializeMap]);

  // Additional effect to handle container ref changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('🔄 Delayed check:');
      console.log('  - Container exists:', !!mapContainer.current);
      console.log('  - API key exists:', !!finalApiKey);
      console.log('  - Map exists:', !!map.current);
      
      if (finalApiKey && mapContainer.current && !map.current) {
        console.log('🚀 Delayed initialization trigger');
        initializeMap();
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [finalApiKey, initializeMap]);

  // Effect to re-render polygons when lots change
  useEffect(() => {
    if (map.current && lotPolygons.length > 0) {
      console.log('🔄 Re-rendering polygons for lot changes');
      renderLotPolygons(map.current, lotPolygons);
    }
  }, [lots, renderLotPolygons, lotPolygons]);

  const resetMapRotation = useCallback(() => {
    if (map.current) {
      console.log('🔄 Resetting map rotation');
      map.current.setHeading(0);
      setMapRotation(0);
    }
  }, []);

  return {
    mapContainer,
    map,
    isLoading,
    error,
    apiKey: finalApiKey,
    showApiKeyInput: shouldShowInput,
    lotPolygons,
    mapRotation,
    setApiKey,
    resetMapRotation,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  };
};
