
import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMapsLoader } from '@/hooks/polygon/useGoogleMapsLoader';
import { usePolygonManager } from '@/hooks/polygon/usePolygonManager';
import { useDrawingManager } from '@/hooks/polygon/useDrawingManager';
import { type Lot } from '@/stores/lotStore';
import { type MapViewMode } from './LotMapViewModeControls';
import SimplifiedPolygonControls from './controls/SimplifiedPolygonControls';

interface CleanGoogleMapWithDrawingProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
  mapMode: MapViewMode;
  propertyLots: Lot[];
  pastureLots: Lot[];
}

const CleanGoogleMapWithDrawing: React.FC<CleanGoogleMapWithDrawingProps> = ({ 
  lots, 
  onLotSelect,
  mapMode,
  propertyLots,
  pastureLots
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded, loadError } = useGoogleMapsLoader();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  // Use polygon manager with different styling based on lot type
  const {
    polygons,
    handlePolygonComplete: originalHandlePolygonComplete,
    loadSavedPolygons,
    deletePolygon,
    clearAllPolygons,
    updatePolygonVisibility
  } = usePolygonManager(map, (lotId) => {
    setSelectedLotId(lotId);
    onLotSelect(lotId);
  });

  // Enhanced polygon complete handler that sets lot type based on map mode
  const handlePolygonComplete = (polygon: google.maps.Polygon, lotName: string) => {
    // Only allow creating pasture lots in pasture mode
    if (mapMode === 'pasture' || mapMode === 'combined') {
      originalHandlePolygonComplete(polygon, lotName, 'pasture');
    }
  };

  // Use drawing manager - only enable in pasture modes
  const drawingManagerHook = useDrawingManager(
    map, 
    handlePolygonComplete,
    mapMode === 'pasture' || mapMode === 'combined' // Only enable drawing for pasture lots
  );

  // Initialize map
  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const googleMap = new google.maps.Map(mapRef.current, {
        center: { lat: 4.7110, lng: -74.0721 }, // Bogotá, Colombia default
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      setMap(googleMap);
    }
  }, [isLoaded, map]);

  // Load polygons with different styling based on lot type
  useEffect(() => {
    if (map && lots.length > 0) {
      console.log('🗺️ Loading polygons for lots with type-based styling...');
      
      // Clear existing polygons
      clearAllPolygons();
      
      // Load polygons with different styles for property vs pasture lots
      lots.forEach(lot => {
        const isPropertyLot = lot.lotType === 'property';
        
        loadSavedPolygons([lot], {
          // Property lots: subtle, non-editable styling
          ...(isPropertyLot ? {
            fillColor: '#E5E7EB',
            fillOpacity: 0.15,
            strokeColor: '#6B7280',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            editable: false,
            clickable: true
          } : {
            // Pasture lots: vibrant, editable styling
            fillColor: '#10B981',
            fillOpacity: 0.3,
            strokeColor: '#059669',
            strokeWeight: 2,
            strokeOpacity: 0.9,
            editable: mapMode === 'pasture' || mapMode === 'combined',
            clickable: true
          })
        });
      });
    }
  }, [map, lots, mapMode, loadSavedPolygons, clearAllPolygons]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading Google Maps</p>
          <p className="text-gray-600 text-sm mt-1">Please check your internet connection</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      
      {map && mapMode !== 'property' && (
        <SimplifiedPolygonControls
          onClearAll={clearAllPolygons}
          selectedLotId={selectedLotId}
          onDeleteSelected={() => {
            if (selectedLotId) {
              deletePolygon(selectedLotId);
              setSelectedLotId(null);
            }
          }}
          polygonCount={pastureLots.length}
        />
      )}
      
      {mapMode === 'property' && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md border">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Vista de Propiedad:</span> Límites fijos no editables
          </p>
        </div>
      )}
    </div>
  );
};

export default CleanGoogleMapWithDrawing;
