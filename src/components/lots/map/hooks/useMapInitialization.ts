
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
  const { setApiKey } = useApiKeyStorage();
  const { lotPolygons, savePolygons } = usePolygonStorage();
  const { addSkyRanchLabel, renderLotPolygons, togglePolygonsVisibility, toggleLabelsVisibility } = useMapRenderer(lots);
  const { 
    initializeDrawingManager, 
    startDrawingPolygon, 
    saveCurrentPolygon, 
    deletePolygonForLot, 
    setPolygonColor 
  } = usePolygonOperations(lots, lotPolygons, savePolygons);

  console.log('🗺️ useMapInitialization render - Force loading with API key');

  // Initialize map function - simplified to always use force key
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
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔑 Loading Google Maps API with FORCE key');
      
      const loader = new Loader({
        apiKey: FORCE_API_KEY,
        version: 'weekly',
        libraries: ['geometry', 'drawing', 'places']
      });

      await loader.load();
      
      if (!window.google?.maps?.geometry) {
        throw new Error('Google Maps geometry library failed to load');
      }
      
      console.log('🌍 Creating map instance with container:', mapContainer.current);
      
      map.current = new google.maps.Map(mapContainer.current, {
        ...GOOGLE_MAPS_CONFIG,
        center: SKYRANCH_CENTER
      });

      console.log('✅ Map instance created successfully');

      // Wait for map to be ready
      await new Promise<void>((resolve) => {
        const listener = map.current!.addListener('idle', () => {
          google.maps.event.removeListener(listener);
          resolve();
        });
      });

      console.log('✅ Map is ready and idle');
      
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
  }, [initializeDrawingManager, addSkyRanchLabel, renderLotPolygons, lotPolygons, toast]);

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
    apiKey: FORCE_API_KEY,
    showApiKeyInput: false, // Never show input
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
