
import { useEffect, useRef, useState, useCallback } from 'react';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@googlemaps/js-api-loader';
import { SKYRANCH_CENTER, GOOGLE_MAPS_CONFIG, calculatePolygonArea, formatArea, metersToHectares, LOT_COLORS } from './mapConstants';
import { updateLot } from '@/services/lotService';

// Local storage utilities
const API_KEY_STORAGE_KEY = 'skyranch_google_maps_api_key';
const POLYGON_STORAGE_KEY = 'skyranch_lot_polygons';

interface LotPolygon {
  lotId: string;
  coordinates: google.maps.LatLngLiteral[];
  color: string;
}

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage save failed:', error);
      return false;
    }
  }
};

export const useGoogleMapsInitialization = (lots: Lot[]) => {
  const { toast } = useToast();
  
  // Core state
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapRotation, setMapRotation] = useState(0);
  
  // API key management
  const [apiKey, setApiKey] = useState<string>(() => safeLocalStorage.getItem(API_KEY_STORAGE_KEY) || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  
  // Polygon management
  const [lotPolygons, setLotPolygons] = useState<LotPolygon[]>(() => {
    const stored = safeLocalStorage.getItem(POLYGON_STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  });
  
  // Drawing state
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);
  const currentDrawing = useRef<google.maps.Polygon | null>(null);
  const polygons = useRef<Map<string, google.maps.Polygon>>(new Map());
  const labels = useRef<Map<string, google.maps.Marker>>(new Map());

  console.log('🚀 Hook initialized - API Key:', !!apiKey, 'Container ref:', !!mapContainer.current);

  // Save API key
  const saveApiKey = useCallback((key: string) => {
    console.log('💾 Saving API key...');
    const success = safeLocalStorage.setItem(API_KEY_STORAGE_KEY, key);
    if (success) {
      setApiKey(key);
      setShowApiKeyInput(false);
      console.log('✅ API key saved successfully');
    } else {
      console.error('❌ Failed to save API key');
      toast({
        title: "Error",
        description: "No se pudo guardar la API key",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Save polygons
  const savePolygons = useCallback((polygons: LotPolygon[]) => {
    console.log('💾 Saving polygons to localStorage:', polygons.length);
    safeLocalStorage.setItem(POLYGON_STORAGE_KEY, JSON.stringify(polygons));
    setLotPolygons(polygons);
  }, []);

  // Add SkyRanch label
  const addSkyRanchLabel = useCallback((mapInstance: google.maps.Map) => {
    console.log('🏷️ Adding SKYRANCH label...');
    new google.maps.Marker({
      position: SKYRANCH_CENTER,
      map: mapInstance,
      label: {
        text: 'SKYRANCH',
        color: '#ffffff',
        fontSize: '24px',
        fontWeight: 'bold'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0,
        strokeWeight: 0,
        fillOpacity: 0
      }
    });
  }, []);

  // Render polygons
  const renderLotPolygons = useCallback((mapInstance: google.maps.Map, polygonsToRender: LotPolygon[]) => {
    if (!mapInstance) return;

    console.log('📍 Rendering user-defined lot polygons...');
    
    // Clear existing polygons and labels
    polygons.current.forEach(polygon => polygon.setMap(null));
    labels.current.forEach(label => label.setMap(null));
    polygons.current.clear();
    labels.current.clear();

    polygonsToRender.forEach(lotPolygon => {
      const lot = lots.find(l => l.id === lotPolygon.lotId);
      if (!lot || !lotPolygon.coordinates.length) return;

      console.log('🎨 Rendering polygon for lot:', lot.name);

      // Create polygon
      const polygon = new google.maps.Polygon({
        paths: lotPolygon.coordinates,
        strokeColor: '#ffffff',
        strokeOpacity: 0.95,
        strokeWeight: 2.5,
        fillColor: lotPolygon.color,
        fillOpacity: 0.4,
        map: mapInstance,
        clickable: true
      });

      // Calculate area
      const area = calculatePolygonArea(lotPolygon.coordinates);
      const areaText = formatArea(area);

      polygon.addListener('click', (e: google.maps.PolyMouseEvent) => {
        e.stop();
        console.log(`Clicked on ${lot.name} polygon - Area: ${areaText}`);
      });

      polygons.current.set(lotPolygon.lotId, polygon);

      // Calculate center point for label
      const bounds = new google.maps.LatLngBounds();
      lotPolygon.coordinates.forEach(coord => bounds.extend(coord));
      const center = bounds.getCenter();

      // Create lot label marker
      const labelMarker = new google.maps.Marker({
        position: center,
        map: mapInstance,
        label: {
          text: lot.name,
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 'bold'
        },
        icon: {
          path: 'M 0,0 z',
          scale: 0,
          strokeWeight: 0,
          fillOpacity: 0
        },
        title: `${lot.name} - Área: ${areaText}`
      });

      labels.current.set(lotPolygon.lotId, labelMarker);
    });

    console.log('✅ User-defined lot polygons rendered successfully');
  }, [lots]);

  // Initialize map - SIMPLIFIED VERSION
  const initializeMap = useCallback(async (apiKeyToUse: string) => {
    console.log('🗺️ SIMPLIFIED initializeMap called');
    console.log('🗺️ API key available:', !!apiKeyToUse);
    console.log('🗺️ Container available:', !!mapContainer.current);
    
    if (!apiKeyToUse) {
      console.error('❌ No API key provided');
      setError('API key de Google Maps requerida');
      setIsLoading(false);
      return;
    }

    // Wait for container to be available
    let containerCheckCount = 0;
    while (!mapContainer.current && containerCheckCount < 10) {
      console.log('⏳ Waiting for container... attempt', containerCheckCount + 1);
      await new Promise(resolve => setTimeout(resolve, 100));
      containerCheckCount++;
    }

    if (!mapContainer.current) {
      console.error('❌ Map container not found after waiting');
      setError('Map container not available');
      setIsLoading(false);
      return;
    }

    console.log('✅ Container found, proceeding with map initialization');

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔑 Loading Google Maps API...');
      
      const loader = new Loader({
        apiKey: apiKeyToUse,
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
        center: SKYRANCH_CENTER
      };

      map.current = new google.maps.Map(mapContainer.current, mapConfig);

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
      
      // Setup rotation listener
      map.current.addListener('heading_changed', () => {
        if (map.current) {
          const heading = map.current.getHeading() || 0;
          setMapRotation(heading);
        }
      });

      // Initialize drawing manager
      drawingManager.current = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          strokeColor: '#ffffff',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: LOT_COLORS.default,
          fillOpacity: 0.35,
          editable: true
        }
      });
      drawingManager.current.setMap(map.current);
      
      // Render existing polygons
      renderLotPolygons(map.current, lotPolygons);
      
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
  }, [toast, addSkyRanchLabel, lotPolygons, renderLotPolygons]);

  // Polygon operations
  const startDrawingPolygon = useCallback((lotId: string) => {
    if (!drawingManager.current) {
      console.error('❌ Drawing manager not initialized');
      return;
    }

    console.log('🖊️ Starting polygon drawing for lot:', lotId);
    
    // Clear any existing drawing
    if (currentDrawing.current) {
      currentDrawing.current.setMap(null);
      currentDrawing.current = null;
    }

    drawingManager.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);

    const listener = google.maps.event.addListener(
      drawingManager.current,
      'polygoncomplete',
      (polygon: google.maps.Polygon) => {
        console.log('✅ Polygon drawing completed');
        currentDrawing.current = polygon;
        drawingManager.current?.setDrawingMode(null);
        google.maps.event.removeListener(listener);
      }
    );
  }, []);

  const saveCurrentPolygon = useCallback(async (lotId: string, onComplete: () => void) => {
    if (!currentDrawing.current) {
      console.warn('⚠️ No polygon to save');
      onComplete();
      return;
    }

    console.log('💾 Saving polygon for lot:', lotId);

    try {
      const path = currentDrawing.current.getPath();
      const coordinates: google.maps.LatLngLiteral[] = [];
      
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        coordinates.push({ lat: point.lat(), lng: point.lng() });
      }

      // Calculate area
      const areaInMeters = calculatePolygonArea(coordinates);
      const areaInHectares = metersToHectares(areaInMeters);

      console.log('📏 Calculated area:', areaInMeters, 'm²', '=', areaInHectares, 'ha');

      // Save polygon to storage
      const newPolygons = lotPolygons.filter(p => p.lotId !== lotId);
      newPolygons.push({
        lotId,
        coordinates,
        color: LOT_COLORS.default
      });
      savePolygons(newPolygons);

      // Clean up drawing
      currentDrawing.current.setMap(null);
      currentDrawing.current = null;

      // Update the lot's area in the database
      const lot = lots.find(l => l.id === lotId);
      if (lot) {
        try {
          await updateLot(lotId, {
            ...lot,
            sizeHectares: Number(areaInHectares.toFixed(4))
          });
          console.log('💾 Lot area updated in database:', areaInHectares.toFixed(2), 'ha');
        } catch (error) {
          console.error('❌ Error updating lot area:', error);
        }
      }

      onComplete();

    } catch (error) {
      console.error('❌ Error saving polygon:', error);
      onComplete();
    }
  }, [lotPolygons, lots, savePolygons]);

  const deletePolygonForLot = useCallback((lotId: string) => {
    console.log('🗑️ Deleting polygon for lot:', lotId);
    const newPolygons = lotPolygons.filter(p => p.lotId !== lotId);
    savePolygons(newPolygons);
    if (map.current) {
      renderLotPolygons(map.current, newPolygons);
    }
  }, [lotPolygons, savePolygons, renderLotPolygons]);

  const setPolygonColor = useCallback((lotId: string, color: string) => {
    console.log('🎨 Setting polygon color for lot:', lotId, 'to:', color);
    const newPolygons = lotPolygons.map(p => 
      p.lotId === lotId ? { ...p, color } : p
    );
    savePolygons(newPolygons);
    if (map.current) {
      renderLotPolygons(map.current, newPolygons);
    }
  }, [lotPolygons, savePolygons, renderLotPolygons]);

  const togglePolygonsVisibility = useCallback(() => {
    console.log('👁️ Toggling polygons visibility');
    polygons.current.forEach(polygon => {
      const visible = polygon.getVisible();
      polygon.setVisible(!visible);
    });
  }, []);

  const toggleLabelsVisibility = useCallback(() => {
    console.log('🏷️ Toggling labels visibility');
    labels.current.forEach(label => {
      const visible = label.getVisible();
      label.setVisible(!visible);
    });
  }, []);

  const resetMapRotation = useCallback(() => {
    if (map.current) {
      console.log('🔄 Resetting map rotation');
      map.current.setHeading(0);
      setMapRotation(0);
    }
  }, []);

  // Initialize map when API key is available - SIMPLIFIED
  useEffect(() => {
    console.log('🔄 Effect triggered - API key:', !!apiKey, 'Show input:', showApiKeyInput);
    if (apiKey && !showApiKeyInput) {
      console.log('🚀 Starting map initialization...');
      initializeMap(apiKey);
    }
  }, [apiKey, showApiKeyInput, initializeMap]);

  // Re-render polygons when lots change
  useEffect(() => {
    if (map.current && lotPolygons.length > 0) {
      console.log('🔄 Re-rendering polygons - lots:', lots.length, 'polygons:', lotPolygons.length);
      renderLotPolygons(map.current, lotPolygons);
    }
  }, [lots, lotPolygons, renderLotPolygons]);

  return {
    mapContainer,
    map,
    isLoading,
    error,
    apiKey,
    showApiKeyInput,
    lotPolygons,
    mapRotation,
    setApiKey: saveApiKey,
    resetMapRotation,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  };
};
