
import { useState, useCallback, useRef } from 'react';
import { type Lot } from '@/stores/lotStore';

interface UseDrawingManagerOptions {
  lots: Lot[];
  getLotColor: (lot: Lot) => string;
  onPolygonComplete: (polygon: google.maps.Polygon, selectedLotId: string, selectedColor: string) => void;
}

// Color mapping for different statuses
const COLOR_MAP = {
  active: '#10b981',     // En Uso - Green
  resting: '#f59e0b',    // Descanso - Amber
  breeding: '#8b5cf6',   // Reproducción - Purple
  maintenance: '#ef4444', // Mantenimiento - Red
  property: '#ffffff'     // Propiedad - White
};

export const useDrawingManager = ({ lots, getLotColor, onPolygonComplete }: UseDrawingManagerOptions) => {
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);
  const polygonCompleteListener = useRef<google.maps.MapsEventListener | null>(null);

  const initializeDrawingManager = useCallback((map: google.maps.Map) => {
    console.log('Creating drawing manager...');
    
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

    console.log('Drawing manager initialized');
  }, []);

  const startDrawing = useCallback((lotId: string, colorType: string) => {
    if (!drawingManager.current || !lotId || !colorType) {
      console.log('Cannot start drawing - missing requirements:', { lotId, colorType });
      return;
    }

    const lot = lots.find(l => l.id === lotId);
    if (!lot) {
      console.log('Lot not found:', lotId);
      return;
    }

    console.log('Starting drawing for lot:', lot.name, 'with color type:', colorType);
    
    setSelectedLotId(lotId);
    setSelectedColor(colorType);
    setIsDrawing(true);

    // Get the color from the color map
    const color = COLOR_MAP[colorType as keyof typeof COLOR_MAP];
    console.log('Using color:', color, 'for type:', colorType);

    // Remove existing listener
    if (polygonCompleteListener.current) {
      google.maps.event.removeListener(polygonCompleteListener.current);
    }

    // Add new polygon complete listener
    polygonCompleteListener.current = google.maps.event.addListener(
      drawingManager.current, 
      'polygoncomplete', 
      (polygon: google.maps.Polygon) => {
        console.log('Polygon completed for lot:', lotId, 'with color:', color);
        onPolygonComplete(polygon, lotId, colorType);
        stopDrawing();
      }
    );

    // Update polygon options with selected color
    drawingManager.current.setOptions({
      polygonOptions: {
        fillColor: color,
        strokeColor: color === '#ffffff' ? '#000000' : color, // Black stroke for white polygons
        fillOpacity: color === '#ffffff' ? 0.8 : 0.35, // Higher opacity for white
        strokeWeight: color === '#ffffff' ? 3 : 2, // Thicker stroke for white
        clickable: true,
        editable: true,
      }
    });

    // Enable polygon drawing mode
    drawingManager.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    
    // Add crosshair cursor
    const mapDiv = (drawingManager.current.getMap() as google.maps.Map)?.getDiv();
    if (mapDiv) {
      mapDiv.style.cursor = 'crosshair';
    }
    
    console.log('Drawing mode activated for lot:', lotId, 'with color:', color);
  }, [lots, onPolygonComplete]);

  const stopDrawing = useCallback(() => {
    if (drawingManager.current) {
      drawingManager.current.setDrawingMode(null);
      
      // Remove crosshair cursor
      const mapDiv = (drawingManager.current.getMap() as google.maps.Map)?.getDiv();
      if (mapDiv) {
        mapDiv.style.cursor = '';
      }
    }
    
    // Remove polygon complete listener
    if (polygonCompleteListener.current) {
      google.maps.event.removeListener(polygonCompleteListener.current);
      polygonCompleteListener.current = null;
    }
    
    setIsDrawing(false);
    setSelectedColor('');
    console.log('Drawing mode deactivated');
  }, []);

  return {
    selectedLotId,
    selectedColor,
    isDrawing,
    initializeDrawingManager,
    startDrawing,
    stopDrawing
  };
};
