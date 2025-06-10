
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, AlertCircle, Fullscreen, Minimize } from 'lucide-react';
import { useGoogleMapsInitialization } from './map/useGoogleMapsInitialization';
import { MapControls } from './map/MapControls';
import { PolygonDrawer } from './map/PolygonDrawer';
import { API_KEY_INSTRUCTIONS } from './map/mapConstants';
import { type Lot } from '@/stores/lotStore';
import { useDraggable } from '@/hooks/useDraggable';

interface LotSatelliteMapProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotSatelliteMap = ({ lots, onLotSelect }: LotSatelliteMapProps) => {
  const [showControls, setShowControls] = useState(false);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [tempApiKey, setTempApiKey] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const {
    mapContainer,
    map,
    isLoading,
    error,
    apiKey,
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

  // Draggable hook for SkyRanch label
  const { position, dragRef, handleMouseDown, isDragging } = useDraggable({ x: 0, y: 0 });

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleApiKeySubmit = () => {
    if (tempApiKey.trim()) {
      setApiKey(tempApiKey.trim());
      setTempApiKey('');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainer.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Wrapper functions that match PolygonDrawer's expected signatures
  const handleStartDrawing = () => {
    if (selectedLot) {
      console.log('Starting drawing for lot:', selectedLot);
      setIsDrawing(true);
      startDrawingPolygon(selectedLot);
    } else {
      console.log('No lot selected for drawing');
    }
  };

  const handleSavePolygon = () => {
    if (selectedLot) {
      console.log('Saving polygon for lot:', selectedLot);
      saveCurrentPolygon(selectedLot);
      setIsDrawing(false);
    } else {
      console.log('No lot selected for saving');
    }
  };

  const handleDeletePolygon = () => {
    if (selectedLot) {
      console.log('Deleting polygon for lot:', selectedLot);
      deletePolygonForLot(selectedLot);
    } else {
      console.log('No lot selected for deletion');
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedLot) {
      console.log('Changing color for lot:', selectedLot, 'to:', color);
      setPolygonColor(selectedLot, color);
    } else {
      console.log('No lot selected for color change');
    }
  };

  const handleLotSelection = (lotId: string) => {
    console.log('Lot selected:', lotId);
    setSelectedLot(lotId);
    onLotSelect(lotId);
  };

  if (showApiKeyInput) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Configurar Google Maps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {API_KEY_INSTRUCTIONS}
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Ingresa tu Google Maps API Key"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
              />
              <Button onClick={handleApiKeySubmit} disabled={!tempApiKey.trim()}>
                Guardar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="w-full h-full rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-lg text-gray-600">Cargando mapa satelital...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar el mapa</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${isFullscreen ? 'bg-black' : ''}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {/* SkyRanch Label - Top Center, Draggable */}
      <div 
        ref={dragRef}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20"
        style={{ 
          transform: `translate(${position.x - 50}%, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg px-4 py-2 shadow-lg">
          <div className="text-sm font-semibold text-gray-800">SkyRanch</div>
          <div className="text-xs text-gray-600">40°19'3.52"N, 4°28'27.47"W</div>
        </div>
      </div>

      {/* Fullscreen Toggle - Top Right */}
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-4 right-16 z-30 shadow-lg bg-white/95 backdrop-blur-sm"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Fullscreen className="w-4 h-4" />}
      </Button>

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
          isFullscreen={isFullscreen}
        />
      )}
    </div>
  );
};

export default LotSatelliteMap;
