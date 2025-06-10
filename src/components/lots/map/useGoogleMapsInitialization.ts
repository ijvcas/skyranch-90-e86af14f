
import { useRef, useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';
import { SKYRANCH_CENTER, LOT_COLORS, GOOGLE_MAPS_CONFIG, calculatePolygonArea, formatArea } from './mapConstants';

// API Key storage in localStorage for persistence
const API_KEY_STORAGE_KEY = 'skyranch_google_maps_api_key';

// Polygon storage in localStorage for now (will be moved to database later)
const POLYGON_STORAGE_KEY = 'skyranch_lot_polygons';

interface LotPolygon {
  lotId: string;
  coordinates: google.maps.LatLngLiteral[];
  color: string;
}

export const useGoogleMapsInitialization = (lots: Lot[]) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);
  const polygons = useRef<Map<string, google.maps.Polygon>>(new Map());
  const labels = useRef<Map<string, google.maps.Marker>>(new Map());
  const currentDrawing = useRef<google.maps.Polygon | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const [lotPolygons, setLotPolygons] = useState<LotPolygon[]>(() => {
    const stored = localStorage.getItem(POLYGON_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  
  const { toast } = useToast();

  // Persist API key to localStorage
  const saveApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
  };

  // Save polygons to localStorage
  const savePolygons = (polygons: LotPolygon[]) => {
    localStorage.setItem(POLYGON_STORAGE_KEY, JSON.stringify(polygons));
    setLotPolygons(polygons);
  };

  const addSkyRanchLabel = () => {
    if (!map.current) return;

    console.log('🏷️ Adding SKYRANCH label...');

    const marker = new google.maps.Marker({
      position: SKYRANCH_CENTER,
      map: map.current,
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

    console.log('✅ SKYRANCH label added successfully');
  };

  const renderLotPolygons = () => {
    if (!map.current) return;

    console.log('📍 Rendering user-defined lot polygons...');

    // Clear existing polygons and labels
    polygons.current.forEach(polygon => polygon.setMap(null));
    labels.current.forEach(label => label.setMap(null));
    polygons.current.clear();
    labels.current.clear();

    lotPolygons.forEach(lotPolygon => {
      const lot = lots.find(l => l.id === lotPolygon.lotId);
      if (!lot || !lotPolygon.coordinates.length) return;

      // Create polygon
      const polygon = new google.maps.Polygon({
        paths: lotPolygon.coordinates,
        strokeColor: '#ffffff',
        strokeOpacity: 0.95,
        strokeWeight: 2.5,
        fillColor: lotPolygon.color,
        fillOpacity: 0.4,
        map: map.current,
        clickable: true
      });

      // Calculate area
      const area = calculatePolygonArea(lotPolygon.coordinates);
      const areaText = formatArea(area);

      // Add click handler
      polygon.addListener('click', () => {
        toast({
          title: lot.name,
          description: `Área: ${areaText}`,
        });
      });

      polygons.current.set(lotPolygon.lotId, polygon);

      // Calculate center point for label
      const bounds = new google.maps.LatLngBounds();
      lotPolygon.coordinates.forEach(coord => bounds.extend(coord));
      const center = bounds.getCenter();

      // Create lot label marker
      const labelMarker = new google.maps.Marker({
        position: center,
        map: map.current,
        label: {
          text: lot.name,
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          fillOpacity: 0.8,
          fillColor: lotPolygon.color
        }
      });

      labels.current.set(lotPolygon.lotId, labelMarker);
    });

    console.log('✅ User-defined lot polygons rendered successfully');
  };

  const initializeMap = async () => {
    if (!apiKey) {
      setError('API key de Google Maps requerida');
      return;
    }

    console.log('🗺️ Starting Google Maps initialization...');
    
    setIsLoading(true);
    setError(null);
    setShowApiKeyInput(false);

    if (!mapContainer.current) {
      console.error('❌ Map container not found');
      setError('Map container not available');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔑 Loading Google Maps API with geometry and drawing libraries...');
      
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['geometry', 'drawing']
      });

      await loader.load();
      
      console.log('🌍 Creating Google Maps instance...');
      map.current = new google.maps.Map(mapContainer.current, {
        ...GOOGLE_MAPS_CONFIG,
        center: SKYRANCH_CENTER
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

      setIsLoading(false);
      addSkyRanchLabel();
      renderLotPolygons();
      
      toast({
        title: "Mapa Cargado",
        description: "SkyRanch cargado con herramientas de dibujo!",
      });

    } catch (error) {
      console.error('❌ Google Maps initialization error:', error);
      setError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      setShowApiKeyInput(true);
      toast({
        title: "Error de Inicialización",
        description: "Error al inicializar el mapa. Verifica tu API key.",
        variant: "destructive"
      });
    }
  };

  const startDrawingPolygon = (lotId: string) => {
    if (!drawingManager.current) return;

    drawingManager.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);

    const listener = google.maps.event.addListener(
      drawingManager.current,
      'polygoncomplete',
      (polygon: google.maps.Polygon) => {
        currentDrawing.current = polygon;
        drawingManager.current?.setDrawingMode(null);
        google.maps.event.removeListener(listener);
      }
    );
  };

  const saveCurrentPolygon = (lotId: string) => {
    if (!currentDrawing.current) return;

    const path = currentDrawing.current.getPath();
    const coordinates: google.maps.LatLngLiteral[] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({ lat: point.lat(), lng: point.lng() });
    }

    const newPolygons = lotPolygons.filter(p => p.lotId !== lotId);
    newPolygons.push({
      lotId,
      coordinates,
      color: LOT_COLORS.default
    });

    savePolygons(newPolygons);
    currentDrawing.current.setMap(null);
    currentDrawing.current = null;
    renderLotPolygons();

    toast({
      title: "Polígono Guardado",
      description: "El polígono del lote ha sido guardado exitosamente.",
    });
  };

  const deletePolygonForLot = (lotId: string) => {
    const newPolygons = lotPolygons.filter(p => p.lotId !== lotId);
    savePolygons(newPolygons);
    renderLotPolygons();

    toast({
      title: "Polígono Eliminado",
      description: "El polígono del lote ha sido eliminado.",
    });
  };

  const setPolygonColor = (lotId: string, color: string) => {
    const newPolygons = lotPolygons.map(p => 
      p.lotId === lotId ? { ...p, color } : p
    );
    savePolygons(newPolygons);
    renderLotPolygons();
  };

  const togglePolygonsVisibility = () => {
    polygons.current.forEach(polygon => {
      const visible = polygon.getVisible();
      polygon.setVisible(!visible);
    });
  };

  const toggleLabelsVisibility = () => {
    labels.current.forEach(label => {
      const visible = label.getVisible();
      label.setVisible(!visible);
    });
  };

  useEffect(() => {
    if (apiKey) {
      initializeMap();
    }
    return () => {
      console.log('🧹 Cleaning up Google Maps...');
      polygons.current.clear();
      labels.current.clear();
      if (currentDrawing.current) {
        currentDrawing.current.setMap(null);
      }
    };
  }, [apiKey]);

  // Re-render polygons when lots change
  useEffect(() => {
    if (map.current) {
      renderLotPolygons();
    }
  }, [lots, lotPolygons]);

  return {
    mapContainer,
    map,
    isLoading,
    error,
    apiKey,
    showApiKeyInput,
    setApiKey: saveApiKey,
    initializeMap,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  };
};
