
import React, { useState, useCallback, useEffect } from 'react';
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
  const [mapRotation, setMapRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    mapContainer,
    map,
    isLoading,
    error,
    apiKey,
    showApiKeyInput,
    lotPolygons = [],
    setApiKey,
    initializeMap,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  } = useGoogleMapsInitialization(lots);

  // Get current lot polygon data with proper null checking
  const currentLotPolygon = selectedLot && lotPolygons ? 
    lotPolygons.find(p => p.lotId === selectedLot.id) : null;

  const handleLotSelect = (lot: Lot) => {
    setSelectedLot(lot);
    console.log('🎯 Lot selected for drawing:', lot.name);
  };

  const handleStartDrawing = () => {
    if (selectedLot) {
      console.log('✏️ Starting drawing mode for lot:', selectedLot.name);
      setIsDrawing(true);
      startDrawingPolygon(selectedLot.id);
      
      // Change cursor to crosshair when drawing
      if (mapContainer.current) {
        mapContainer.current.style.cursor = 'crosshair';
      }
    }
  };

  const handleSavePolygon = () => {
    if (selectedLot) {
      console.log('💾 Saving polygon for lot:', selectedLot.name);
      saveCurrentPolygon(selectedLot.id);
      setIsDrawing(false);
      
      // Reset cursor
      if (mapContainer.current) {
        mapContainer.current.style.cursor = 'default';
      }
    }
  };

  const handleCancelDrawing = () => {
    console.log('❌ Canceling drawing mode');
    setIsDrawing(false);
    
    // Reset cursor
    if (mapContainer.current) {
      mapContainer.current.style.cursor = 'default';
    }
  };

  const handleDeletePolygon = () => {
    if (selectedLot) {
      console.log('🗑️ Deleting polygon for lot:', selectedLot.name);
      deletePolygonForLot(selectedLot.id);
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedLot) {
      console.log('🎨 Changing color for lot:', selectedLot.name, 'to:', color);
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

  // Fixed north button functionality
  const handleResetRotation = useCallback(() => {
    if (map.current) {
      console.log('🧭 Resetting map rotation to north');
      map.current.setHeading(0);
      map.current.setTilt(0);
      setMapRotation(0);
    }
  }, [map]);

  // Listen for map rotation changes
  useEffect(() => {
    if (map.current) {
      const headingListener = map.current.addListener('heading_changed', () => {
        const heading = map.current?.getHeading() || 0;
        setMapRotation(heading);
      });

      return () => {
        google.maps.event.removeListener(headingListener);
      };
    }
  }, [map.current]);

  // Listen for fullscreen changes to adjust controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Map Container - Full Screen with proper height */}
      <div 
        ref={mapContainer} 
        className={`w-full ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-8rem)]'}`}
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

      {/* Map Controls - always available when map is loaded */}
      {!isLoading && !error && !showApiKeyInput && (
        <>
          <MapControls
            showControls={showControls}
            onToggleControls={() => setShowControls(!showControls)}
            showPolygons={showPolygons}
            showLabels={showLabels}
            onTogglePolygons={handleTogglePolygons}
            onToggleLabels={handleToggleLabels}
            onResetRotation={handleResetRotation}
            mapRotation={mapRotation}
          />

          {/* Polygon Drawing Tool - works in all views */}
          {showControls && (
            <PolygonDrawer
              lots={lots}
              selectedLot={selectedLot}
              onLotSelect={handleLotSelect}
              onStartDrawing={handleStartDrawing}
              onSavePolygon={handleSavePolygon}
              onDeletePolygon={handleDeletePolygon}
              onColorChange={handleColorChange}
              onCancelDrawing={handleCancelDrawing}
              isDrawing={isDrawing}
              hasPolygon={!!currentLotPolygon}
              currentColor={currentLotPolygon?.color}
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
