
import { useState, useCallback, useRef } from 'react';
import { type Lot } from '@/stores/lotStore';
import { toast } from 'sonner';

interface UseDrawingManagerOptions {
  lots: Lot[];
  getLotColor: (lot: Lot) => string;
  onPolygonComplete: (polygon: google.maps.Polygon, selectedLotId: string) => void;
}

export const useDrawingManager = ({ lots, getLotColor, onPolygonComplete }: UseDrawingManagerOptions) => {
  const [selectedLotId, setSelectedLotId] = useState<string>('');
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

  const startDrawing = useCallback((lotId: string) => {
    if (!drawingManager.current || !lotId) {
      console.log('Cannot start drawing - missing requirements:', { lotId });
      toast.error('Error al iniciar el dibujo');
      return;
    }

    const lot = lots.find(l => l.id === lotId);
    if (!lot) {
      console.log('Lot not found:', lotId);
      toast.error('Lote no encontrado');
      return;
    }

    console.log('Starting drawing for lot:', lot.name);
    
    setSelectedLotId(lotId);
    setIsDrawing(true);

    // Get the color from the lot status
    const color = getLotColor(lot);
    console.log('Using color:', color, 'for lot status:', lot.status);

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
        onPolygonComplete(polygon, lotId);
        stopDrawing();
        toast.success(`Polígono creado para lote: ${lot.name}`);
      }
    );

    // Update polygon options with selected color
    drawingManager.current.setOptions({
      polygonOptions: {
        fillColor: color,
        strokeColor: color === '#f3f4f6' ? '#9ca3af' : color, // Gray stroke for light gray polygons
        fillOpacity: color === '#f3f4f6' ? 0.8 : 0.35, // Higher opacity for light gray
        strokeWeight: color === '#f3f4f6' ? 3 : 2, // Thicker stroke for light gray
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
    toast.info(`Dibuja el polígono para: ${lot.name}`);
  }, [lots, getLotColor, onPolygonComplete]);

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
    console.log('Drawing mode deactivated');
  }, []);

  return {
    selectedLotId,
    isDrawing,
    initializeDrawingManager,
    startDrawing,
    stopDrawing
  };
};
