
import React, { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { type Lot } from '@/stores/lotStore';
import { useMapInitialization } from './map/useMapInitialization';
import { LoadingOverlay, ErrorOverlay, CoordinatesInfo } from './map/MapOverlays';
import { MapControls, MapLegend } from './map/MapControls';

interface LotSatelliteMapProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotSatelliteMap = ({ lots, onLotSelect }: LotSatelliteMapProps) => {
  const [selectedLayers, setSelectedLayers] = useState({
    lots: true,
    labels: true
  });
  const [showControls, setShowControls] = useState(true);

  const {
    mapContainer,
    isLoading,
    error,
    selectedLot,
    lotColors,
    initializeMap,
    updateLotColor,
    toggleLayer
  } = useMapInitialization(lots, onLotSelect);

  const handleToggleLayer = (layerName: 'lots' | 'labels') => {
    setSelectedLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
    toggleLayer(layerName);
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container - Full Screen */}
      <div 
        ref={mapContainer} 
        className="w-full h-[calc(100vh-8rem)]" 
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} />

      {/* Error Overlay */}
      <ErrorOverlay error={error && !isLoading ? error : null} onRetry={initializeMap} />

      {/* Floating Controls */}
      {!isLoading && !error && (
        <>
          <MapControls
            showControls={showControls}
            selectedLayers={selectedLayers}
            selectedLot={selectedLot}
            lotColors={lotColors}
            onToggleControls={() => setShowControls(!showControls)}
            onToggleLayer={handleToggleLayer}
            onUpdateLotColor={updateLotColor}
          />

          {/* Legend */}
          <MapLegend showControls={showControls} />

          {/* Coordinates Info */}
          <CoordinatesInfo />
        </>
      )}
    </div>
  );
};

export default LotSatelliteMap;
