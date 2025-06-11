
import { useRef, useState, useCallback } from 'react';
import { SKYRANCH_CENTER, GOOGLE_MAPS_CONFIG } from '../mapConstants';
import { useToast } from '@/hooks/use-toast';

export const useMapInstance = () => {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [mapRotation, setMapRotation] = useState(0);

  const createMapInstance = useCallback(async (): Promise<google.maps.Map | null> => {
    if (!mapContainer.current) {
      console.error('❌ Map container not available for initialization');
      return null;
    }

    if (map.current) {
      console.log('✅ Map already initialized, returning existing instance');
      return map.current;
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

    toast({
      title: "Mapa Cargado",
      description: "SkyRanch cargado correctamente!",
    });

    return map.current;
  }, [toast]);

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
    mapRotation,
    createMapInstance,
    resetMapRotation
  };
};
