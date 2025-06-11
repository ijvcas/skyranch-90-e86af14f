
import { useState, useCallback } from 'react';

export const useMapDrawing = () => {
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = useCallback((drawingManager: google.maps.drawing.DrawingManager | null, lotId: string) => {
    if (!drawingManager || !lotId) return;
    
    setSelectedLotId(lotId);
    setIsDrawing(true);
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  }, []);

  const cancelDrawing = useCallback((drawingManager: google.maps.drawing.DrawingManager | null) => {
    setIsDrawing(false);
    drawingManager?.setDrawingMode(null);
  }, []);

  const finishDrawing = useCallback(() => {
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
