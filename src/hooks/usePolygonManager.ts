
import { useState, useCallback, useRef, useEffect } from 'react';
import { type Lot } from '@/stores/lotStore';

interface PolygonData {
  lotId: string;
  polygon: google.maps.Polygon;
  color: string;
  coordinates: { lat: number; lng: number }[];
}

interface DrawingState {
  isActive: boolean;
  currentLotId: string | null;
  mode: 'idle' | 'drawing' | 'editing' | 'complete';
}

interface UsePolygonManagerOptions {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

export const usePolygonManager = ({ lots, onLotSelect }: UsePolygonManagerOptions) => {
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isActive: false,
    currentLotId: null,
    mode: 'idle'
  });
  
  const mapRef = useRef<google.maps.Map | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

  // Get color based on lot status with enhanced color scheme
  const getLotColor = useCallback((lot: Lot) => {
    switch (lot.status) {
      case 'active': return '#10b981'; // emerald-500
      case 'resting': return '#f59e0b'; // amber-500  
      case 'maintenance': return '#ef4444'; // red-500
      default: return '#6b7280'; // gray-500
    }
  }, []);

  // Initialize drawing manager
  const initializeDrawingManager = useCallback((map: google.maps.Map) => {
    if (drawingManagerRef.current) return drawingManagerRef.current;

    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillOpacity: 0.4,
        strokeWeight: 3,
        strokeOpacity: 0.8,
        editable: true,
        draggable: false,
        clickable: true,
      },
    });

    drawingManager.setMap(map);
    drawingManagerRef.current = drawingManager;

    // Handle polygon completion
    drawingManager.addListener('polygoncomplete', (polygon: google.maps.Polygon) => {
      if (drawingState.currentLotId) {
        completePolygon(drawingState.currentLotId, polygon);
      }
    });

    return drawingManager;
  }, [drawingState.currentLotId]);

  // Start drawing for a lot
  const startDrawing = useCallback((lotId: string) => {
    const lot = lots.find(l => l.id === lotId);
    if (!lot || !drawingManagerRef.current) return;

    console.log('Starting polygon drawing for lot:', lot.name);
    
    setDrawingState({
      isActive: true,
      currentLotId: lotId,
      mode: 'drawing'
    });

    const color = getLotColor(lot);
    drawingManagerRef.current.setOptions({
      polygonOptions: {
        fillColor: color,
        strokeColor: color,
        fillOpacity: 0.4,
        strokeWeight: 3,
        strokeOpacity: 0.8,
        editable: true,
        draggable: false,
        clickable: true,
      }
    });

    drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  }, [lots, getLotColor]);

  // Complete polygon drawing
  const completePolygon = useCallback((lotId: string, polygon: google.maps.Polygon) => {
    const lot = lots.find(l => l.id === lotId);
    if (!lot) return;

    console.log('Completing polygon for lot:', lot.name);

    // Remove existing polygon for this lot
    const existingIndex = polygons.findIndex(p => p.lotId === lotId);
    if (existingIndex !== -1) {
      polygons[existingIndex].polygon.setMap(null);
    }

    // Get coordinates
    const path = polygon.getPath();
    const coordinates = path.getArray().map(point => ({
      lat: point.lat(),
      lng: point.lng()
    }));

    // Create polygon data
    const polygonData: PolygonData = {
      lotId,
      polygon,
      color: getLotColor(lot),
      coordinates
    };

    // Add click listener for lot selection
    polygon.addListener('click', () => {
      onLotSelect(lotId);
    });

    // Update state
    setPolygons(prev => {
      const filtered = prev.filter(p => p.lotId !== lotId);
      return [...filtered, polygonData];
    });

    setDrawingState({
      isActive: false,
      currentLotId: null,
      mode: 'complete'
    });

    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
    }

    // Save to localStorage
    savePolygonsToStorage([...polygons.filter(p => p.lotId !== lotId), polygonData]);
  }, [lots, polygons, getLotColor, onLotSelect]);

  // Cancel drawing
  const cancelDrawing = useCallback(() => {
    console.log('Canceling polygon drawing');
    
    setDrawingState({
      isActive: false,
      currentLotId: null,
      mode: 'idle'
    });

    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
    }
  }, []);

  // Delete polygon
  const deletePolygon = useCallback((lotId: string) => {
    const polygonIndex = polygons.findIndex(p => p.lotId === lotId);
    if (polygonIndex !== -1) {
      polygons[polygonIndex].polygon.setMap(null);
      const updated = polygons.filter(p => p.lotId !== lotId);
      setPolygons(updated);
      savePolygonsToStorage(updated);
    }
  }, [polygons]);

  // Save polygons to localStorage
  const savePolygonsToStorage = useCallback((polygonData: PolygonData[]) => {
    const dataToSave = polygonData.map(p => ({
      lotId: p.lotId,
      color: p.color,
      coordinates: p.coordinates
    }));
    localStorage.setItem('lotPolygons', JSON.stringify(dataToSave));
  }, []);

  // Load polygons from localStorage
  const loadPolygonsFromStorage = useCallback((map: google.maps.Map) => {
    const saved = localStorage.getItem('lotPolygons');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      const loadedPolygons: PolygonData[] = [];

      data.forEach((item: any) => {
        const lot = lots.find(l => l.id === item.lotId);
        if (lot && item.coordinates) {
          const polygon = new google.maps.Polygon({
            paths: item.coordinates,
            fillColor: getLotColor(lot),
            fillOpacity: 0.4,
            strokeWeight: 3,
            strokeColor: getLotColor(lot),
            strokeOpacity: 0.8,
            editable: true,
            draggable: false,
            clickable: true,
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

      setPolygons(loadedPolygons);
    } catch (error) {
      console.error('Error loading saved polygons:', error);
    }
  }, [lots, getLotColor, onLotSelect]);

  // Initialize with map
  const initializeWithMap = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    initializeDrawingManager(map);
    loadPolygonsFromStorage(map);
  }, [initializeDrawingManager, loadPolygonsFromStorage]);

  // Update polygon colors when lot status changes
  useEffect(() => {
    polygons.forEach(polygonData => {
      const lot = lots.find(l => l.id === polygonData.lotId);
      if (lot) {
        const newColor = getLotColor(lot);
        if (newColor !== polygonData.color) {
          polygonData.polygon.setOptions({
            fillColor: newColor,
            strokeColor: newColor
          });
          polygonData.color = newColor;
        }
      }
    });
  }, [lots, polygons, getLotColor]);

  return {
    polygons,
    drawingState,
    startDrawing,
    cancelDrawing,
    deletePolygon,
    initializeWithMap,
    getLotColor
  };
};
