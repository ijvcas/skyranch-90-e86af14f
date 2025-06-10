import React from 'react';
import { useGoogleMapsInitialization } from './map/useGoogleMapsInitialization';
import { MapControls } from './map/MapControls';
import { PolygonDrawer } from './map/PolygonDrawer';
import { ApiKeySetup } from './map/ApiKeySetup';
import { MapLoadingState } from './map/MapLoadingState';
import { MapErrorState } from './map/MapErrorState';
import { SkyRanchLabel } from './map/SkyRanchLabel';
import { FullscreenToggle } from './map/FullscreenToggle';
import { useMapState } from './map/hooks/useMapState';
import { useLotSelection } from './map/hooks/useLotSelection';
import { usePolygonHandlers } from './map/hooks/usePolygonHandlers';
import { type Lot } from '@/stores/lotStore';

interface LotSatelliteMapProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotSatelliteMap = ({ lots, onLotSelect }: LotSatelliteMapProps) => {
  const {
    showControls,
    setShowControls,
    showPolygons,
    setShowPolygons,
    showLabels,
    setShowLabels,
    isFullscreen,
    toggleFullscreen
  } = useMapState();

  const {
    selectedLot,
    isDrawing,
    setIsDrawing,
    handleLotSelection
  } = useLotSelection(onLotSelect);

  const {
    mapContainer,
    isLoading,
    error,
    showApiKeyInput,
    mapRotation,
    setApiKey,
    resetMapRotation,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  } = useGoogleMapsInitialization(lots);

  const {
    handleStartDrawing,
    handleSavePolygon,
    handleDeletePolygon,
    handleColorChange,
    handleCancelDrawing
  } = usePolygonHandlers({
    selectedLot,
    setIsDrawing,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor
  });

  // Check if selected lot has a polygon (placeholder logic)
  const hasPolygon = selectedLot ? false : false; // TODO: Implement polygon existence check

  // Get current color for selected lot (placeholder logic)
  const currentColor = selectedLot ? '#10b981' : '#6b7280'; // TODO: Implement color retrieval

  if (showApiKeyInput) {
    return <ApiKeySetup onApiKeySubmit={setApiKey} />;
  }

  if (isLoading) {
    return <MapLoadingState />;
  }

  if (error) {
    return <MapErrorState error={error} />;
  }

  return (
    <div className={`relative w-full h-full ${isFullscreen ? 'bg-black' : ''}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {/* SkyRanch Label - Top Center, Draggable */}
      <SkyRanchLabel />

      {/* Fullscreen Toggle - Top Right */}
      <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />

      {/* Map Controls */}
      <MapControls
        showControls={showControls}
        onToggleControls={() => setShowControls(!showControls)}
        showPolygons={showPolygons}
        showLabels={showLabels}
        onTogglePolygons={() => {
          setShowPolygons(!showPolygons);
          togglePolygonsVisibility();
        }}
        onToggleLabels={() => {
          setShowLabels(!showLabels);
          toggleLabelsVisibility();
        }}
        onResetRotation={resetMapRotation}
        mapRotation={mapRotation}
      />

      {/* Polygon Drawing Tools - Always visible in fullscreen */}
      {(showControls || isFullscreen) && (
        <PolygonDrawer
          lots={lots}
          selectedLot={selectedLot}
          isDrawing={isDrawing}
          onLotSelect={handleLotSelection}
          onStartDrawing={handleStartDrawing}
          onSavePolygon={handleSavePolygon}
          onDeletePolygon={handleDeletePolygon}
          onColorChange={handleColorChange}
          onCancelDrawing={handleCancelDrawing}
          hasPolygon={hasPolygon}
          currentColor={currentColor}
        />
      )}
    </div>
  );
};

export default LotSatelliteMap;
