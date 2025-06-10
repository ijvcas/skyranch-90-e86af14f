
import React, { useState } from 'react';
import { type Lot } from '@/stores/lotStore';
import { useGoogleMapsInitialization } from './map/useGoogleMapsInitialization';
import { LoadingOverlay, ErrorOverlay, CoordinatesInfo, ApiKeyInput } from './map/MapOverlays';
import { MapControls } from './map/MapControls';
import { PolygonDrawer } from './map/PolygonDrawer';

interface LotSatelliteMapProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotSatelliteMap = ({ lots, onLotSelect }: LotSatelliteMapProps) => {
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);

  const {
    mapContainer,
    isLoading,
    error,
    apiKey,
    showApiKeyInput,
    setApiKey,
    initializeMap,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  } = useGoogleMapsInitialization(lots);

  const handleLotSelect = (lot: Lot) => {
    setSelectedLot(lot);
    onLotSelect(lot.id);
  };

  const handleStartDrawing = () => {
    if (selectedLot) {
      setIsDrawing(true);
      startDrawingPolygon(selectedLot.id);
    }
  };

  const handleSavePolygon = () => {
    if (selectedLot) {
      saveCurrentPolygon(selectedLot.id);
      setIsDrawing(false);
    }
  };

  const handleDeletePolygon = () => {
    if (selectedLot) {
      deletePolygonForLot(selectedLot.id);
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedLot) {
      setPolygonColor(selectedLot.id, color);
    }
  };

  const handleTogglePolygons = () => {
    setShowPolygons(!showPolygons);
    togglePolygonsVisibility();
  };

  const handleToggleLabels = () => {
    setShowLabels(!showLabels);
    toggleLabelsVisibility();
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

      {/* Map Controls */}
      {!isLoading && !error && !showApiKeyInput && (
        <>
          <MapControls
            showControls={showControls}
            onToggleControls={() => setShowControls(!showControls)}
            showPolygons={showPolygons}
            showLabels={showLabels}
            onTogglePolygons={handleTogglePolygons}
            onToggleLabels={handleToggleLabels}
          />

          {/* Polygon Drawing Tool */}
          {showControls && (
            <PolygonDrawer
              lots={lots}
              selectedLot={selectedLot}
              onLotSelect={handleLotSelect}
              onStartDrawing={handleStartDrawing}
              onSavePolygon={handleSavePolygon}
              onDeletePolygon={handleDeletePolygon}
              onColorChange={handleColorChange}
              isDrawing={isDrawing}
            />
          )}

          {/* Coordinates Info */}
          <CoordinatesInfo />
        </>
      )}
    </div>
  );
};

export default LotSatelliteMap;
