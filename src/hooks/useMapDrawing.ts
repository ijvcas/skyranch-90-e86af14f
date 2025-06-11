
import { useState, useCallback } from 'react';

export const useMapDrawing = () => {
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = useCallback((drawingManager: google.maps.drawing.DrawingManager | null, lotId: string) => {
    if (!drawingManager || !lotId) {
      console.log('Cannot start drawing - missing drawingManager or lotId');
      return;
    }
    
    console.log('Starting drawing mode for lot:', lotId);
    setSelectedLotId(lotId);
    setIsDrawing(true);
    
    // Enable drawing mode
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    console.log('Drawing mode set to POLYGON');
  }, []);

  const cancelDrawing = useCallback((drawingManager: google.maps.drawing.DrawingManager | null) => {
    console.log('Canceling drawing mode');
    setIsDrawing(false);
    drawingManager?.setDrawingMode(null);
  }, []);

  const finishDrawing = useCallback(() => {
    console.log('Finishing drawing mode');
    setIsDrawing(false);
  }, []);

  return {
    selectedLotId,
    isDrawing,
    setSelectedLotId,
    startDrawing,
    cancelDrawing,
    finishDrawing
  };
};
