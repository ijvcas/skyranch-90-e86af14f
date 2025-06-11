
import { useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useToast } from '@/hooks/use-toast';

const FORCE_API_KEY = 'AIzaSyBo7e7hBrnCCtJDSaftXEFHP4qi-KiKXzI';

export const useGoogleMapsLoader = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoogleMaps = useCallback(async (): Promise<boolean> => {
    console.log('🗺️ Loading Google Maps API with FORCE key');
    
    setIsLoading(true);
    setError(null);

    try {
      const loader = new Loader({
        apiKey: FORCE_API_KEY,
        version: 'weekly',
        libraries: ['geometry', 'drawing', 'places']
      });

      await loader.load();
      
      if (!window.google?.maps?.geometry) {
        throw new Error('Google Maps geometry library failed to load');
      }
      
      console.log('✅ Google Maps API loaded successfully');
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('❌ Google Maps API loading failed:', error);
      setError(`Error al cargar Google Maps: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setIsLoading(false);
      
      toast({
        title: "Error de Carga",
        description: "Error al cargar Google Maps API.",
        variant: "destructive"
      });
      
      return false;
    }
  }, [toast]);

  return {
    isLoading,
    error,
    loadGoogleMaps
  };
};
