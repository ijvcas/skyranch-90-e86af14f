
import React from 'react';
import { type Lot } from '@/stores/lotStore';
import { useMapPolygonDrawing } from '@/hooks/useMapPolygonDrawing';
import SimplePolygonControls from './controls/SimplePolygonControls';

interface CleanGoogleMapWithDrawingProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const CleanGoogleMapWithDrawing = ({ lots, onLotSelect }: CleanGoogleMapWithDrawingProps) => {
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
  } = useMapPolygonDrawing({ lots, onLotSelect });

  const handleLotSelect = (lotId: string) => {
    // Don't change selection while drawing
    if (!isDrawing) {
      onLotSelect(lotId);
    }
  };

  return (
    <div className="relative w-full h-[48rem] rounded-lg overflow-hidden bg-gray-100">
      {/* Loading overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando mapa...</p>
            <p className="text-sm text-gray-500">Inicializando herramientas de dibujo</p>
          </div>
        </div>
      )}
      
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Controls overlay */}
      {isMapReady && (
        <SimplePolygonControls
          lots={lots}
          selectedLotId={selectedLotId}
          isDrawing={isDrawing}
          polygons={polygons.map(p => ({ lotId: p.lotId, color: p.color }))}
          onStartDrawing={startDrawing}
          onStopDrawing={stopDrawing}
          onDeletePolygon={deletePolygon}
          onLotSelect={handleLotSelect}
          getLotColor={getLotColor}
        />
      )}
    </div>
  );
};

export default CleanGoogleMapWithDrawing;
