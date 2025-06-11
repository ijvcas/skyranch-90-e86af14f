
import React, { useState } from 'react';
import { type Lot } from '@/stores/lotStore';
import { useElegantGoogleMap } from '@/hooks/useElegantGoogleMap';
import { useGoogleMapsDrawing } from '@/hooks/useGoogleMapsDrawing';
import NewPolygonControls from './controls/NewPolygonControls';

interface NewGoogleMapWithDrawingProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const NewGoogleMapWithDrawing = ({ lots, onLotSelect }: NewGoogleMapWithDrawingProps) => {
  const [selectedLotId, setSelectedLotId] = useState<string>('');

  const {
    polygons,
    drawingState,
    startDrawing,
    stopDrawing,
    deletePolygon,
    initializeWithMap,
    getLotColor
  } = useGoogleMapsDrawing({ 
    lots, 
    onLotSelect
  });

  const { mapRef, isMapReady } = useElegantGoogleMap({
    onMapReady: (map) => {
      console.log('Google Map initialized for drawing');
      initializeWithMap(map);
    }
  });

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
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="pointer-events-auto">
            <NewPolygonControls
              lots={lots}
              selectedLotId={selectedLotId}
              drawingState={drawingState}
              polygons={polygons.map(p => ({ lotId: p.lotId, color: p.color }))}
              onStartDrawing={startDrawing}
              onStopDrawing={stopDrawing}
              onDeletePolygon={deletePolygon}
              onLotSelect={setSelectedLotId}
              getLotColor={getLotColor}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewGoogleMapWithDrawing;
