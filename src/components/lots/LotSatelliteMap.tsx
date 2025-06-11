
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
    lotPolygons,
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

  console.log('🎯 LotSatelliteMap render state:');
  console.log('  - Show API key input:', showApiKeyInput);
  console.log('  - Is loading:', isLoading);
  console.log('  - Error:', error);

  // Force skip API key input since we have a hardcoded key
  if (showApiKeyInput && !error) {
    console.log('⚠️ API key input would show, but we have force key - continuing to load');
  }

  // Only show API key setup if there's an actual error and no loading
  if (showApiKeyInput && error && !isLoading) {
    return <ApiKeySetup onApiKeySubmit={setApiKey} />;
  }

  if (isLoading) {
    console.log('🔄 Showing loading state');
    return <MapLoadingState />;
  }

  if (error) {
    console.log('❌ Showing error state:', error);
    return <MapErrorState error={error} />;
  }

  console.log('✅ Rendering map component');

  // Polygon handlers
  const handleStartDrawing = () => {
    if (selectedLot) {
      console.log('Starting drawing for lot:', selectedLot.id);
      setIsDrawing(true);
      startDrawingPolygon(selectedLot.id);
    }
  };

  const handleSavePolygon = () => {
    if (selectedLot) {
      console.log('Saving polygon for lot:', selectedLot.id);
      saveCurrentPolygon(selectedLot.id, () => {
        setIsDrawing(false);
      });
    }
  };

  const handleDeletePolygon = () => {
    if (selectedLot) {
      console.log('Deleting polygon for lot:', selectedLot.id);
      deletePolygonForLot(selectedLot.id);
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedLot) {
      console.log('Changing color for lot:', selectedLot.id, 'to:', color);
      setPolygonColor(selectedLot.id, color);
    }
  };

  const handleCancelDrawing = () => {
    console.log('Cancelling drawing');
    setIsDrawing(false);
  };

  // Check if selected lot has a polygon
  const hasPolygon = selectedLot ? lotPolygons.some(p => p.lotId === selectedLot.id) : false;

  // Get current color for selected lot
  const currentPolygon = selectedLot ? lotPolygons.find(p => p.lotId === selectedLot.id) : null;
  const currentColor = currentPolygon?.color || '#10b981';

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
