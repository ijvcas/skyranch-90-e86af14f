
import { useState, useCallback, useRef } from 'react';
import { type Lot } from '@/stores/lotStore';

interface UseDrawingManagerOptions {
  lots: Lot[];
  getLotColor: (lot: Lot) => string;
  onPolygonComplete: (polygon: google.maps.Polygon, selectedLotId: string) => void;
}

export const useDrawingManager = ({ lots, getLotColor, onPolygonComplete }: UseDrawingManagerOptions) => {
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);

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

    // Handle polygon completion
    google.maps.event.addListener(drawing, 'polygoncomplete', (polygon: google.maps.Polygon) => {
      console.log('Polygon completed for lot:', selectedLotId);
      onPolygonComplete(polygon, selectedLotId);
      stopDrawing();
    });

    console.log('Drawing manager initialized');
  }, [selectedLotId, onPolygonComplete]);

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

  const stopDrawing = useCallback(() => {
    if (drawingManager.current) {
      drawingManager.current.setDrawingMode(null);
    }
    setIsDrawing(false);
    setSelectedLotId('');
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
