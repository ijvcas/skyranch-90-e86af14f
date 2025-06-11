
import React from 'react';
import { type Lot } from '@/stores/lotStore';
import MapDrawingControls from './MapDrawingControls';
import { useGoogleMap } from '@/hooks/useGoogleMap';
import { useMapPolygons } from '@/hooks/useMapPolygons';
import { useMapDrawing } from '@/hooks/useMapDrawing';

interface SimpleGoogleMapProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const SimpleGoogleMap = ({ lots, onLotSelect }: SimpleGoogleMapProps) => {
  const { selectedLotId, isDrawing, setSelectedLotId, startDrawing, cancelDrawing, finishDrawing } = useMapDrawing();
  const { lotPolygons, addPolygon, deletePolygon, loadSavedPolygons } = useMapPolygons({ lots, onLotSelect });
  
  const { mapRef, drawingManager } = useGoogleMap({
    onMapReady: (map, drawing) => {
      // Handle polygon completion
      drawing.addListener('polygoncomplete', (polygon: google.maps.Polygon) => {
        if (selectedLotId) {
          addPolygon(selectedLotId, polygon);
          finishDrawing();
          drawing.setDrawingMode(null);
        }
      });

      // Load saved polygons
      loadSavedPolygons(map);
    }
  });

  // Start drawing
  const handleStartDrawing = (lotId: string) => {
    startDrawing(drawingManager, lotId);
  };

  // Cancel drawing
  const handleCancelDrawing = () => {
    cancelDrawing(drawingManager);
  };

  return (
    <div className="relative w-full h-[48rem] rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full z-10" />
      
      <MapDrawingControls
        lots={lots}
        selectedLotId={selectedLotId}
        isDrawing={isDrawing}
        lotPolygons={lotPolygons}
        onStartDrawing={handleStartDrawing}
        onDeletePolygon={deletePolygon}
        onCancelDrawing={handleCancelDrawing}
        onLotSelect={setSelectedLotId}
      />
    </div>
  );
};

export default SimpleGoogleMap;
