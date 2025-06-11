
import { useState, useCallback, useRef, useEffect } from 'react';
import { type Lot } from '@/stores/lotStore';

interface PolygonData {
  lotId: string;
  polygon: google.maps.Polygon;
  color: string;
  coordinates: { lat: number; lng: number }[];
}

interface UseSimplePolygonDrawingOptions {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBo7e7hBrnCCtJDSaftXEFHP4qi-KiKXzI';
const SKYRANCH_CENTER = { lat: 40.31764444, lng: -4.47409722 };

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

    isAPILoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=drawing&callback=initSimpleDrawing`;
    script.async = true;
    
    (window as any).initSimpleDrawing = () => {
      console.log('Google Maps Drawing API loaded successfully');
      isAPILoaded = true;
      isAPILoading = false;
      resolve();
      loadingCallbacks.forEach(cb => cb());
      loadingCallbacks.length = 0;
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      isAPILoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
};

export const useSimplePolygonDrawing = ({ lots, onLotSelect }: UseSimplePolygonDrawingOptions) => {
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);

  // Get lot color based on status
  const getLotColor = useCallback((lot: Lot) => {
    switch (lot.status) {
      case 'active': return '#10b981';
      case 'resting': return '#f59e0b'; 
      case 'maintenance': return '#ef4444';
      default: return '#6b7280';
    }
  }, []);

  // Initialize map and drawing manager
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        console.log('Loading Google Maps API...');
        await loadGoogleMapsAPI();
        
        console.log('Creating map...');
        const map = new google.maps.Map(mapRef.current, {
          center: SKYRANCH_CENTER,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapInstance.current = map;

        // Wait for map to be fully loaded
        google.maps.event.addListenerOnce(map, 'idle', () => {
          console.log('Map is ready, creating drawing manager...');
          
          // Create drawing manager
          const drawing = new google.maps.drawing.DrawingManager({
            drawingMode: null,
            drawingControl: false,
            polygonOptions: {
              fillOpacity: 0.35,
              strokeWeight: 2,
              clickable: true,
              editable: true,
            }
          });

          drawing.setMap(map);
          drawingManager.current = drawing;

          // Handle polygon completion
          google.maps.event.addListener(drawing, 'polygoncomplete', (polygon: google.maps.Polygon) => {
            console.log('Polygon completed for lot:', selectedLotId);
            handlePolygonComplete(polygon);
          });

          setIsMapReady(true);
          loadSavedPolygons(map);
          console.log('Drawing system initialized successfully');
        });

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();
  }, []);

  // Handle polygon completion
  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    console.log('handlePolygonComplete called with selectedLotId:', selectedLotId);
    
    if (!selectedLotId) {
      console.log('No lot selected, removing polygon');
      polygon.setMap(null);
      return;
    }

    const lot = lots.find(l => l.id === selectedLotId);
    if (!lot) {
      console.log('Lot not found, removing polygon');
      polygon.setMap(null);
      return;
    }

    console.log('Processing polygon for lot:', lot.name);

    // Get coordinates first
    const path = polygon.getPath();
    const coordinates = path.getArray().map(point => ({
      lat: point.lat(),
      lng: point.lng()
    }));

    console.log('Polygon coordinates:', coordinates);

    // Set polygon style
    const color = getLotColor(lot);
    polygon.setOptions({
      fillColor: color,
      strokeColor: color,
      fillOpacity: 0.35,
      strokeWeight: 2,
    });

    // Add click listener
    polygon.addListener('click', () => {
      console.log('Polygon clicked for lot:', lot.id);
      onLotSelect(lot.id);
    });

    // Remove existing polygon for this lot first
    setPolygons(prev => {
      const existing = prev.find(p => p.lotId === selectedLotId);
      if (existing) {
        console.log('Removing existing polygon for lot:', selectedLotId);
        existing.polygon.setMap(null);
      }
      return prev.filter(p => p.lotId !== selectedLotId);
    });

    // Create polygon data
    const polygonData: PolygonData = {
      lotId: selectedLotId,
      polygon,
      color,
      coordinates
    };

    console.log('Adding new polygon data:', polygonData);

    // Update state and save
    setPolygons(prev => {
      const updated = [...prev, polygonData];
      console.log('Updated polygons array:', updated);
      savePolygonsToStorage(updated);
      return updated;
    });

    // Stop drawing
    stopDrawing();
  }, [selectedLotId, lots, getLotColor, onLotSelect]);

  // Start drawing
  const startDrawing = useCallback((lotId: string) => {
    if (!drawingManager.current || !lotId) return;

    const lot = lots.find(l => l.id === lotId);
    if (!lot) return;

    console.log('Starting drawing for lot:', lot.name, 'with ID:', lotId);
    
    setSelectedLotId(lotId);
    setIsDrawing(true);

    const color = getLotColor(lot);
    
    // Update polygon options
    drawingManager.current.setOptions({
      polygonOptions: {
        fillColor: color,
        strokeColor: color,
        fillOpacity: 0.35,
        strokeWeight: 2,
        clickable: true,
        editable: true,
      }
    });

    // Enable polygon drawing mode
    drawingManager.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    console.log('Drawing mode activated for lot:', lotId);
  }, [lots, getLotColor]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (drawingManager.current) {
      drawingManager.current.setDrawingMode(null);
    }
    setIsDrawing(false);
    setSelectedLotId('');
    console.log('Drawing mode deactivated');
  }, []);

  // Delete polygon
  const deletePolygon = useCallback((lotId: string) => {
    console.log('Deleting polygon for lot:', lotId);
    setPolygons(prev => {
      const polygonData = prev.find(p => p.lotId === lotId);
      if (polygonData) {
        polygonData.polygon.setMap(null);
      }
      const updated = prev.filter(p => p.lotId !== lotId);
      savePolygonsToStorage(updated);
      return updated;
    });
  }, []);

  // Save to localStorage
  const savePolygonsToStorage = useCallback((polygonData: PolygonData[]) => {
    const dataToSave = polygonData.map(p => ({
      lotId: p.lotId,
      color: p.color,
      coordinates: p.coordinates
    }));
    console.log('Saving polygons to storage:', dataToSave);
    localStorage.setItem('lotPolygons', JSON.stringify(dataToSave));
  }, []);

  // Load from localStorage
  const loadSavedPolygons = useCallback((map: google.maps.Map) => {
    const saved = localStorage.getItem('lotPolygons');
    if (!saved) {
      console.log('No saved polygons found');
      return;
    }

    try {
      const data = JSON.parse(saved);
      console.log('Loading saved polygons:', data);
      const loadedPolygons: PolygonData[] = [];

      data.forEach((item: any) => {
        const lot = lots.find(l => l.id === item.lotId);
        if (lot && item.coordinates) {
          const polygon = new google.maps.Polygon({
            paths: item.coordinates,
            fillColor: getLotColor(lot),
            fillOpacity: 0.35,
            strokeWeight: 2,
            strokeColor: getLotColor(lot),
            clickable: true,
            editable: true,
          });

          polygon.setMap(map);
          polygon.addListener('click', () => onLotSelect(lot.id));
          
          loadedPolygons.push({
            lotId: item.lotId,
            polygon,
            color: getLotColor(lot),
            coordinates: item.coordinates
          });
        }
      });

      console.log('Loaded polygons:', loadedPolygons);
      setPolygons(loadedPolygons);
    } catch (error) {
      console.error('Error loading saved polygons:', error);
    }
  }, [lots, getLotColor, onLotSelect]);

  return {
    mapRef,
    isMapReady,
    polygons,
    selectedLotId,
    isDrawing,
    startDrawing,
    stopDrawing,
    deletePolygon,
    getLotColor
  };
};
