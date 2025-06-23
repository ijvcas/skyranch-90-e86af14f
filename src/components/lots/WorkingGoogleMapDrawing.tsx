
import React, { useEffect, useState, useRef } from 'react';
import { type Lot } from '@/stores/lotStore';
import { useSimplePolygonDrawing } from '@/hooks/useSimplePolygonDrawing';
import SimplifiedPolygonControls from './controls/SimplifiedPolygonControls';
import MapLotLabelsControl from './controls/MapLotLabelsControl';
import { toast } from 'sonner';

interface WorkingGoogleMapDrawingProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const SKYRANCH_CENTER = { lat: 40.31764444, lng: -4.47409722 };
const SKYRANCH_NAME = "SkyRanch";

const WorkingGoogleMapDrawing = ({ lots, onLotSelect }: WorkingGoogleMapDrawingProps) => {
  const {
    mapRef,
    mapInstance,
    isMapReady,
    polygons,
    selectedLotId,
    isDrawing,
    startDrawing,
    stopDrawing,
    deletePolygon,
    getLotColor
  } = useSimplePolygonDrawing({ lots, onLotSelect });
  
  const [showLabels, setShowLabels] = useState(true);
  const [showPropertyName, setShowPropertyName] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const labelsRef = useRef<{[key: string]: google.maps.Marker}>({});
  const propertyLabelRef = useRef<google.maps.Marker | null>(null);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create or update lot labels on the map
  useEffect(() => {
    if (!isMapReady || !mapInstance) return;

    // Clear existing labels if toggled off
    if (!showLabels) {
      Object.values(labelsRef.current).forEach(label => {
        label.setMap(null);
      });
      labelsRef.current = {};
      return;
    }

    // Create or update lot labels
    lots.forEach(lot => {
      // Skip if no polygon - check if polygon exists for this lot
      const lotPolygon = polygons.get(lot.id);
      if (!lotPolygon) return;
      
      // Calculate centroid of polygon
      const path = lotPolygon.getPath();
      let lat = 0, lng = 0;
      
      for (let i = 0; i < path.getLength(); i++) {
        lat += path.getAt(i).lat();
        lng += path.getAt(i).lng();
      }
      
      lat /= path.getLength();
      lng /= path.getLength();
      
      // Create or update label
      if (labelsRef.current[lot.id]) {
        labelsRef.current[lot.id].setPosition({ lat, lng });
      } else {
        const label = new google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
          label: {
            text: lot.name,
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '700'
          },
          icon: {
            path: 'M 0,0 C 0,0 0,0 0,0 Z', // Empty path - just the label
            scale: 1,
          },
          clickable: true
        });
        
        label.addListener('click', () => {
          onLotSelect(lot.id);
        });
        
        labelsRef.current[lot.id] = label;
      }
    });
    
    // Remove labels for deleted polygons
    Object.keys(labelsRef.current).forEach(lotId => {
      if (!polygons.has(lotId)) {
        labelsRef.current[lotId].setMap(null);
        delete labelsRef.current[lotId];
      }
    });
    
  }, [isMapReady, mapInstance, lots, polygons, showLabels, onLotSelect]);
  
  // Create or update property name label
  useEffect(() => {
    if (!isMapReady || !mapInstance) return;
    
    if (!showPropertyName) {
      if (propertyLabelRef.current) {
        propertyLabelRef.current.setMap(null);
        propertyLabelRef.current = null;
      }
      return;
    }
    
    if (!propertyLabelRef.current) {
      propertyLabelRef.current = new google.maps.Marker({
        position: SKYRANCH_CENTER,
        map: mapInstance,
        label: {
          text: SKYRANCH_NAME,
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0, // Makes the icon invisible
        }
      });
    } else {
      propertyLabelRef.current.setMap(mapInstance);
    }
    
  }, [isMapReady, mapInstance, showPropertyName]);
  
  // Cleanup labels on unmount
  useEffect(() => {
    return () => {
      Object.values(labelsRef.current).forEach(label => {
        label.setMap(null);
      });
      
      if (propertyLabelRef.current) {
        propertyLabelRef.current.setMap(null);
      }
    };
  }, []);

  // Handle polygon deletions - show toast message
  const handleDeletePolygon = async (lotId: string) => {
    try {
      await deletePolygon(lotId);
      toast.success('Polígono eliminado correctamente');
    } catch (error) {
      console.error('Error deleting polygon:', error);
      toast.error('Error al eliminar el polígono');
    }
  };

  // Calculate polygon count from Map
  const polygonCount = polygons.size;

  return (
    <div className="relative w-full h-[48rem] rounded-lg overflow-hidden bg-gray-100">
      {/* Loading overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Inicializando Google Maps...</p>
            <p className="text-sm text-gray-500">Cargando herramientas de dibujo y geometría</p>
          </div>
        </div>
      )}
      
      {/* Map container with mobile optimizations */}
      <div 
        ref={mapRef} 
        className="w-full h-full" 
        style={{ touchAction: isMobile ? 'manipulation' : 'auto' }}
      />
      
      {/* Mobile notice */}
      {isMapReady && isMobile && (
        <div className="absolute top-2 left-2 right-2 bg-white p-2 rounded-md shadow-md z-10 text-sm text-center">
          <p className="font-medium text-gray-700">
            Usa dos dedos para mover el mapa y pellizcar para zoom
          </p>
        </div>
      )}
      
      {/* Controls overlay */}
      {isMapReady && (
        <>
          <SimplifiedPolygonControls
            onClearAll={() => {
              // Clear all polygons logic here
              polygons.forEach(polygon => polygon.setMap(null));
            }}
            selectedLotId={selectedLotId}
            onDeleteSelected={() => {
              if (selectedLotId) {
                handleDeletePolygon(selectedLotId);
              }
            }}
            polygonCount={polygonCount}
          />
          
          <MapLotLabelsControl
            showLabels={showLabels}
            onToggleLabels={setShowLabels}
            showPropertyName={showPropertyName}
            onTogglePropertyName={setShowPropertyName}
          />
        </>
      )}
    </div>
  );
};

export default WorkingGoogleMapDrawing;
