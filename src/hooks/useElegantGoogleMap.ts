
import { useEffect, useRef, useState } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBo7e7hBrnCCtJDSaftXEFHP4qi-KiKXzI';
const SKYRANCH_CENTER = { lat: 40.31764444, lng: -4.47409722 };

interface UseElegantGoogleMapOptions {
  onMapReady?: (map: google.maps.Map) => void;
}

// Global state for API loading
let isAPILoaded = false;
let isAPILoading = false;
const loadingCallbacks: (() => void)[] = [];

const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isAPILoaded && window.google?.maps?.drawing) {
      resolve();
      return;
    }

    if (isAPILoading) {
      loadingCallbacks.push(resolve);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const checkAPI = () => {
        if (window.google?.maps?.drawing) {
          isAPILoaded = true;
          resolve();
          loadingCallbacks.forEach(cb => cb());
          loadingCallbacks.length = 0;
        } else {
          setTimeout(checkAPI, 100);
        }
      };
      checkAPI();
      return;
    }

    isAPILoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=drawing&callback=initElegantGoogleMaps`;
    script.async = true;
    
    (window as any).initElegantGoogleMaps = () => {
      isAPILoaded = true;
      isAPILoading = false;
      resolve();
      loadingCallbacks.forEach(cb => cb());
      loadingCallbacks.length = 0;
    };

    script.onerror = () => {
      isAPILoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
};

export const useElegantGoogleMap = ({ onMapReady }: UseElegantGoogleMapOptions = {}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const idleListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        await loadGoogleMapsAPI();

        if (mapInstance.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: SKYRANCH_CENTER,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          streetViewControl: false,
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
          // Enhanced styling for better polygon visibility
          styles: [
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ saturation: -20 }]
            }
          ]
        });

        mapInstance.current = map;

        // Wait for map to be fully loaded
        const onMapIdle = () => {
          console.log('Elegant Google Map is ready');
          setIsMapReady(true);
          if (onMapReady) {
            onMapReady(map);
          }
          // Remove the listener properly
          if (idleListenerRef.current) {
            google.maps.event.removeListener(idleListenerRef.current);
            idleListenerRef.current = null;
          }
        };

        idleListenerRef.current = map.addListener('idle', onMapIdle);

      } catch (error) {
        console.error('Error initializing elegant Google Maps:', error);
      }
    };

    initializeMap();

    return () => {
      if (idleListenerRef.current) {
        google.maps.event.removeListener(idleListenerRef.current);
        idleListenerRef.current = null;
      }
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, [onMapReady]);

  return {
    mapRef,
    map: mapInstance.current,
    isMapReady
  };
};
