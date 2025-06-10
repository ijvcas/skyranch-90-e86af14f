
import React, { useState } from 'react';
import { type Lot } from '@/stores/lotStore';
import { useGoogleMapsInitialization } from './map/useGoogleMapsInitialization';
import { LoadingOverlay, ErrorOverlay, CoordinatesInfo, ApiKeyInput } from './map/MapOverlays';
import { MapControls, MapLegend } from './map/MapControls';

interface LotSatelliteMapProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotSatelliteMap = ({ lots, onLotSelect }: LotSatelliteMapProps) => {
  const [selectedLayers, setSelectedLayers] = useState({
    lots: true,
    labels: true,
    areas: true
  });
  const [showControls, setShowControls] = useState(true);

  const {
    mapContainer,
    isLoading,
    error,
    selectedLot,
    lotColors,
    apiKey,
    showApiKeyInput,
    setApiKey,
    initializeMap,
    updateLotColor,
    toggleLayer
  } = useGoogleMapsInitialization(lots, onLotSelect);

  const handleToggleLayer = (layerName: 'lots' | 'labels' | 'areas') => {
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

      {/* API Key Input Overlay */}
      <ApiKeyInput
        show={showApiKeyInput}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        onSubmit={initializeMap}
      />

      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} />

      {/* Error Overlay */}
      <ErrorOverlay 
        error={error && !isLoading && !showApiKeyInput ? error : null} 
        onRetry={initializeMap} 
      />

      {/* Floating Controls */}
      {!isLoading && !error && !showApiKeyInput && (
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

          {/* Enhanced Legend */}
          <MapLegend showControls={showControls} />

          {/* Coordinates Info */}
          <CoordinatesInfo />
        </>
      )}
    </div>
  );
};

export default LotSatelliteMap;
