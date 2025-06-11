
import { useState, useCallback } from 'react';

export const useMapDrawing = () => {
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = useCallback((drawingManager: google.maps.drawing.DrawingManager | null, lotId: string) => {
    if (!drawingManager || !lotId) {
      console.log('Cannot start drawing - missing drawingManager or lotId', { drawingManager: !!drawingManager, lotId });
      return;
    }
    
    console.log('Starting drawing mode for lot:', lotId);
    console.log('Drawing manager object:', drawingManager);
    
    setSelectedLotId(lotId);
    setIsDrawing(true);
    
    // Enable drawing mode
    try {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      console.log('Drawing mode set to POLYGON successfully');
      console.log('Current drawing mode:', drawingManager.getDrawingMode());
    } catch (error) {
      console.error('Error setting drawing mode:', error);
    }
  }, []);

  const cancelDrawing = useCallback((drawingManager: google.maps.drawing.DrawingManager | null) => {
    console.log('Canceling drawing mode');
    setIsDrawing(false);
    if (drawingManager) {
      try {
        drawingManager.setDrawingMode(null);
        console.log('Drawing mode canceled successfully');
      } catch (error) {
        console.error('Error canceling drawing mode:', error);
      }
    }
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
