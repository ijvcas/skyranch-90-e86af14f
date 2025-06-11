
import { useRef, useCallback } from 'react';
import { type Lot } from '@/stores/lotStore';
import { calculatePolygonArea, metersToHectares, LOT_COLORS } from '../mapConstants';
import { type LotPolygon } from './usePolygonStorage';
import { updateLot } from '@/services/lotService';

export const usePolygonOperations = (
  lots: Lot[],
  lotPolygons: LotPolygon[],
  savePolygons: (polygons: LotPolygon[]) => void
) => {
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);
  const currentDrawing = useRef<google.maps.Polygon | null>(null);

  const initializeDrawingManager = useCallback((mapInstance: google.maps.Map) => {
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
    drawingManager.current.setMap(mapInstance);
  }, []);

  const startDrawingPolygon = useCallback((lotId: string) => {
    if (!drawingManager.current) {
      console.error('❌ Drawing manager not available');
      return;
    }

    console.log('🖊️ Starting polygon drawing for:', lotId);
    
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

    console.log('💾 Saving polygon for:', lotId);

    try {
      const path = currentDrawing.current.getPath();
      const coordinates: google.maps.LatLngLiteral[] = [];
      
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        coordinates.push({ lat: point.lat(), lng: point.lng() });
      }

      const areaInMeters = calculatePolygonArea(coordinates);
      const areaInHectares = metersToHectares(areaInMeters);

      console.log('📏 Area calculated:', areaInHectares.toFixed(2), 'ha');

      // Save polygon
      const newPolygons = lotPolygons.filter(p => p.lotId !== lotId);
      newPolygons.push({
        lotId,
        coordinates,
        color: LOT_COLORS.default
      });
      savePolygons(newPolygons);

      // Update lot area
      const lot = lots.find(l => l.id === lotId);
      if (lot) {
        try {
          await updateLot(lotId, {
            ...lot,
            sizeHectares: Number(areaInHectares.toFixed(4))
          });
          console.log('💾 Lot area updated in database');
        } catch (error) {
          console.error('❌ Error updating lot area:', error);
        }
      }

      // Clean up
      currentDrawing.current.setMap(null);
      currentDrawing.current = null;

      onComplete();

    } catch (error) {
      console.error('❌ Error saving polygon:', error);
      onComplete();
    }
  }, [lotPolygons, lots, savePolygons]);

  const deletePolygonForLot = useCallback((lotId: string) => {
    console.log('🗑️ Deleting polygon for:', lotId);
    const newPolygons = lotPolygons.filter(p => p.lotId !== lotId);
    savePolygons(newPolygons);
  }, [lotPolygons, savePolygons]);

  const setPolygonColor = useCallback((lotId: string, color: string) => {
    console.log('🎨 Setting polygon color for:', lotId, 'to:', color);
    const newPolygons = lotPolygons.map(p => 
      p.lotId === lotId ? { ...p, color } : p
    );
    savePolygons(newPolygons);
  }, [lotPolygons, savePolygons]);

  return {
    initializeDrawingManager,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor
  };
};
