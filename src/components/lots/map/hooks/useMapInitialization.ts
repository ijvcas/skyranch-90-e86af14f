
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
    if (!apiKey) {
      setError('API key de Google Maps requerida');
      setIsLoading(false);
      return;
    }

    console.log('🗺️ Starting Google Maps initialization...');
    
    setIsLoading(true);
    setError(null);

    // Wait for the container to be available
    if (!mapContainer.current) {
      console.error('❌ Map container not found - waiting for DOM');
      // Try again after a short delay
      setTimeout(() => {
        if (mapContainer.current) {
          initializeMap(apiKey, onMapReady);
        } else {
          setError('Map container not available');
          setIsLoading(false);
        }
      }, 100);
      return;
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

      map.current = new google.maps.Map(mapContainer.current, mapConfig);

      // Wait for map to be fully loaded
      await new Promise<void>((resolve) => {
        const listener = map.current!.addListener('idle', () => {
          google.maps.event.removeListener(listener);
          resolve();
        });
      });

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
