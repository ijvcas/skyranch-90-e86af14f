
import React from 'react';
import { type Lot } from '@/stores/lotStore';
import { useSimplePolygonDrawing } from '@/hooks/useSimplePolygonDrawing';
import MinimalPolygonControls from './controls/MinimalPolygonControls';

interface WorkingGoogleMapDrawingProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const WorkingGoogleMapDrawing = ({ lots, onLotSelect }: WorkingGoogleMapDrawingProps) => {
  const {
    mapRef,
    isMapReady,
    polygons,
    selectedLotId,
    isDrawing,
    startDrawing,
    stopDrawing,
    deletePolygon,
    getLotColor
  } = useSimplePolygonDrawing({ lots, onLotSelect });

  return (
    <div className="relative w-full h-[48rem] rounded-lg overflow-hidden bg-gray-100">
      {/* Loading overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Inicializando Google Maps...</p>
            <p className="text-sm text-gray-500">Cargando herramientas de dibujo</p>
          </div>
        </div>
      )}
      
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Controls overlay */}
      {isMapReady && (
        <MinimalPolygonControls
          lots={lots}
          selectedLotId={selectedLotId}
          isDrawing={isDrawing}
          polygons={polygons.map(p => ({ lotId: p.lotId, color: p.color }))}
          onStartDrawing={startDrawing}
          onStopDrawing={stopDrawing}
          onDeletePolygon={deletePolygon}
          getLotColor={getLotColor}
        />
      )}
    </div>
  );
};

export default WorkingGoogleMapDrawing;
