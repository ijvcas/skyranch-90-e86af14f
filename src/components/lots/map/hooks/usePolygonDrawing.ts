
import { useRef } from 'react';
import { type Lot } from '@/stores/lotStore';
import { LOT_COLORS, calculatePolygonArea, formatArea, metersToHectares } from '../mapConstants';
import { type LotPolygon } from '../utils/mapStorage';
import { updateLot } from '@/services/lotService';

interface UsePolygonDrawingProps {
  lots: Lot[];
  addPolygonForLot: (lotPolygon: LotPolygon) => void;
}

export const usePolygonDrawing = ({ lots, addPolygonForLot }: UsePolygonDrawingProps) => {
  const currentDrawing = useRef<google.maps.Polygon | null>(null);
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);

  const initializeDrawingManager = (map: google.maps.Map) => {
    console.log('🖊️ Initializing drawing manager...');
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

    drawingManager.current.setMap(map);
    console.log('✅ Drawing manager initialized');
  };

  const startDrawingPolygon = (lotId: string) => {
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
        
        console.log('Polygon drawn - ready to save');
      }
    );
  };

  const saveCurrentPolygon = async (lotId: string, map: google.maps.Map, onComplete: () => void) => {
    if (!currentDrawing.current) {
      console.warn('⚠️ No polygon to save');
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

      console.log('📐 Polygon coordinates:', coordinates.length, 'points');

      // Calculate area
      const areaInMeters = calculatePolygonArea(coordinates);
      const areaInHectares = metersToHectares(areaInMeters);

      console.log('📏 Calculated area:', areaInMeters, 'm²', '=', areaInHectares, 'ha');

      if (areaInMeters === 0) {
        console.error('Error calculating polygon area');
        return;
      }

      // Save polygon to storage
      addPolygonForLot({
        lotId,
        coordinates,
        color: LOT_COLORS.default
      });

      // Clean up drawing
      currentDrawing.current.setMap(null);
      currentDrawing.current = null;

      // Update the lot's area in the database
      const lot = lots.find(l => l.id === lotId);
      if (lot) {
        try {
          const success = await updateLot(lotId, {
            ...lot,
            sizeHectares: Number(areaInHectares.toFixed(4))
          });

          if (success) {
            console.log('💾 Lot area updated in database:', areaInHectares.toFixed(2), 'ha');
          } else {
            console.warn('⚠️ Failed to update lot area in database');
          }
        } catch (error) {
          console.error('❌ Error updating lot area:', error);
        }
      }

      onComplete();

    } catch (error) {
      console.error('❌ Error saving polygon:', error);
    }
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up polygon drawing');
    if (currentDrawing.current) {
      currentDrawing.current.setMap(null);
    }
  };

  return {
    initializeDrawingManager,
    startDrawingPolygon,
    saveCurrentPolygon,
    cleanup
  };
};
