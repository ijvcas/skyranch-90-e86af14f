
import React, { useState, useCallback } from 'react';
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

  const {
    mapContainer,
    map,
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
    toggleLabelsVisibility,
    lotPolygons
  } = useGoogleMapsInitialization(lots);

  // Get current lot polygon data
  const currentLotPolygon = selectedLot ? lotPolygons.find(p => p.lotId === selectedLot.id) : null;

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

  const handleResetRotation = useCallback(() => {
    if (map.current) {
      map.current.setHeading(0);
      setMapRotation(0);
    }
  }, [map]);

  // Listen for map rotation changes
  React.useEffect(() => {
    if (map.current) {
      const listener = map.current.addListener('heading_changed', () => {
        const heading = map.current?.getHeading() || 0;
        setMapRotation(heading);
      });

      return () => {
        google.maps.event.removeListener(listener);
      };
    }
  }, [map.current]);

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
            onResetRotation={handleResetRotation}
            mapRotation={mapRotation}
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
