
import React from 'react';
import { useGoogleMapsInitialization } from './map/useGoogleMapsInitialization';
import { MapControls } from './map/MapControls';
import { PolygonDrawer } from './map/PolygonDrawer';
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
    lotPolygons,
    mapRotation,
    resetMapRotation,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  } = useGoogleMapsInitialization(lots);

  console.log('🎯 LotSatelliteMap render state:');
  console.log('  - Is loading:', isLoading);
  console.log('  - Error:', error);
  console.log('  - Container ref attached:', !!mapContainer);

  // Force skip API key input - we have hardcoded key
  if (isLoading) {
    console.log('🔄 Showing loading state');
    return <MapLoadingState />;
  }

  if (error) {
    console.log('❌ Showing error state:', error);
    return <MapErrorState error={error} />;
  }

  console.log('✅ Rendering map component');

  // Use the polygon handlers hook
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

  // Check if selected lot has a polygon
  const hasPolygon = selectedLot ? lotPolygons.some(p => p.lotId === selectedLot.id) : false;

  // Get current color for selected lot
  const currentPolygon = selectedLot ? lotPolygons.find(p => p.lotId === selectedLot.id) : null;
  const currentColor = currentPolygon?.color || '#10b981';

  return (
    <div className={`relative w-full h-full ${isFullscreen ? 'bg-black' : ''}`}>
      {/* Map Container - This ref MUST match the one from the hook */}
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
