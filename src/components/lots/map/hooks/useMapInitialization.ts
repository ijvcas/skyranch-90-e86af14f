
import { useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useToast } from '@/hooks/use-toast';
import { SKYRANCH_CENTER, GOOGLE_MAPS_CONFIG } from '../mapConstants';
import { useMapRenderer } from './useMapRenderer';

export const useMapInitialization = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { addSkyRanchLabel } = useMapRenderer();

  const initializeMap = useCallback(async (apiKey: string, onMapReady?: (mapInstance: google.maps.Map) => void) => {
    console.log('🗺️ initializeMap called with API key:', !!apiKey);
    
    if (!apiKey) {
      console.error('❌ No API key provided');
      setError('API key de Google Maps requerida');
      setIsLoading(false);
      return;
    }

    console.log('🗺️ Starting Google Maps initialization...');
    
    setIsLoading(true);
    setError(null);

    // Check container availability with retry logic
    const checkContainer = () => {
      if (!mapContainer.current) {
        console.error('❌ Map container not found');
        return false;
      }
      console.log('✅ Map container found');
      return true;
    };

    if (!checkContainer()) {
      console.log('⏳ Waiting for container...');
      // Wait a bit for the DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 200));
      if (!checkContainer()) {
        setError('Map container not available');
        setIsLoading(false);
        return;
      }
    }

    try {
      console.log('🔑 Loading Google Maps API...');
      
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['geometry', 'drawing', 'places']
      });

      await loader.load();
      
      if (!window.google?.maps?.geometry) {
        throw new Error('Google Maps geometry library failed to load');
      }
      
      console.log('🌍 Creating Google Maps instance...');
      
      const mapConfig = {
        ...GOOGLE_MAPS_CONFIG,
        center: SKYRANCH_CENTER,
        controlSize: 32,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT
        },
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_LEFT,
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
        },
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER
        },
        rotateControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER
        },
        scaleControlOptions: {}
      };

      map.current = new google.maps.Map(mapContainer.current!, mapConfig);

      // Wait for map to be fully loaded
      await new Promise<void>((resolve) => {
        const listener = map.current!.addListener('idle', () => {
          google.maps.event.removeListener(listener);
          resolve();
        });
      });

      console.log('✅ Map loaded successfully');
      setIsLoading(false);
      addSkyRanchLabel(map.current);
      
      if (onMapReady) {
        onMapReady(map.current);
      }
      
      toast({
        title: "Mapa Cargado",
        description: "SkyRanch cargado correctamente!",
      });

    } catch (error) {
      console.error('❌ Google Maps initialization error:', error);
      setError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      toast({
        title: "Error de Inicialización",
        description: "Error al inicializar el mapa. Verifica tu API key.",
        variant: "destructive"
      });
    }
  }, [toast, addSkyRanchLabel]);

  return {
    mapContainer,
    map,
    isLoading,
    error,
    initializeMap
  };
};
