
import { useEffect, useRef } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBo7e7hBrnCCtJDSaftXEFHP4qi-KiKXzI';
const SKYRANCH_CENTER = { lat: 40.31764444, lng: -4.47409722 };

interface UseGoogleMapOptions {
  onMapReady?: (map: google.maps.Map, drawingManager: google.maps.drawing.DrawingManager) => void;
}

// Global flag to prevent multiple API loads
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
const loadingCallbacks: (() => void)[] = [];

const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isGoogleMapsLoaded && window.google?.maps) {
      resolve();
      return;
    }

    // If currently loading, add to callback queue
    if (isGoogleMapsLoading) {
      loadingCallbacks.push(resolve);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      isGoogleMapsLoaded = true;
      resolve();
      return;
    }

    isGoogleMapsLoading = true;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=drawing&loading=async`;
    script.async = true;
    
    script.onload = () => {
      isGoogleMapsLoaded = true;
      isGoogleMapsLoading = false;
      resolve();
      
      // Execute all pending callbacks
      loadingCallbacks.forEach(callback => callback());
      loadingCallbacks.length = 0;
    };

    script.onerror = () => {
      isGoogleMapsLoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
};

export const useGoogleMap = ({ onMapReady }: UseGoogleMapOptions = {}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        await loadGoogleMapsAPI();

        // Create map
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
          }
        });

        mapInstance.current = map;

        // Create drawing manager
        const drawing = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: false,
          polygonOptions: {
            fillOpacity: 0.3,
            strokeWeight: 2,
            editable: true,
            draggable: false,
          },
        });

        drawing.setMap(map);
        drawingManager.current = drawing;

        // Notify that map is ready
        onMapReady?.(map, drawing);
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    initMap();
  }, [onMapReady]);

  return {
    mapRef,
    mapInstance: mapInstance.current,
    drawingManager: drawingManager.current
  };
};
