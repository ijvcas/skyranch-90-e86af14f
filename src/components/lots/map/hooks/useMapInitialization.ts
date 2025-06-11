
import { useRef, useState, useEffect, useCallback } from 'react';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@googlemaps/js-api-loader';
import { SKYRANCH_CENTER, GOOGLE_MAPS_CONFIG } from '../mapConstants';
import { useApiKeyStorage } from './useApiKeyStorage';
import { usePolygonStorage } from './usePolygonStorage';
import { useMapRenderer } from './useMapRenderer';
import { usePolygonOperations } from './usePolygonOperations';

export const useMapInitialization = (lots: Lot[]) => {
  const { toast } = useToast();
  
  // Core refs and state
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapRotation, setMapRotation] = useState(0);
  
  // Use the separated hooks
  const { apiKey, showApiKeyInput, setApiKey } = useApiKeyStorage();
  const { lotPolygons, savePolygons } = usePolygonStorage();
  const { addSkyRanchLabel, renderLotPolygons, togglePolygonsVisibility, toggleLabelsVisibility } = useMapRenderer(lots);
  const { 
    initializeDrawingManager, 
    startDrawingPolygon, 
    saveCurrentPolygon, 
    deletePolygonForLot, 
    setPolygonColor 
  } = usePolygonOperations(lots, lotPolygons, savePolygons);

  console.log('🔧 Hook state - API Key exists:', !!apiKey, 'Show input:', showApiKeyInput, 'Loading:', isLoading);

  // Initialize map function
  const initializeMap = useCallback(async () => {
    console.log('🗺️ Starting map initialization');
    console.log('🗺️ Container ref:', !!mapContainer.current);
    console.log('🗺️ API key:', !!apiKey);

    if (!apiKey) {
      console.error('❌ No API key available');
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
      console.log('🔑 Loading Google Maps API');
      
      const loader = new Loader({
        apiKey: apiKey,
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
  }, [apiKey, initializeDrawingManager, addSkyRanchLabel, renderLotPolygons, lotPolygons, toast]);

  // Effect to initialize map when ready
  useEffect(() => {
    console.log('🔄 Effect - API key:', !!apiKey, 'Show input:', showApiKeyInput, 'Container:', !!mapContainer.current);
    
    if (apiKey && !showApiKeyInput && mapContainer.current && !map.current) {
      console.log('🚀 Conditions met, initializing map');
      initializeMap();
    }
  }, [apiKey, showApiKeyInput, initializeMap]);

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
    apiKey,
    showApiKeyInput,
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
