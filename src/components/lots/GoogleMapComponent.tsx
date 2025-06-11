
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';
import MapControls from './MapControls';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBo7e7hBrnCCtJDSaftXEFHP4qi-KiKXzI';

// SkyRanch coordinates (these are example coordinates - adjust as needed)
const SKYRANCH_CENTER = {
  lat: 40.7128,
  lng: -74.0060
};

interface GoogleMapComponentProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

interface LotPolygon {
  lotId: string;
  polygon: google.maps.Polygon;
  color: string;
}

const GoogleMapComponent = ({ lots, onLotSelect }: GoogleMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [lotPolygons, setLotPolygons] = useState<LotPolygon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  console.log('GoogleMapComponent rendering, lots:', lots.length);

  // Color mapping based on lot status
  const getColorForLot = (lot: Lot) => {
    switch (lot.status) {
      case 'active': return '#22c55e'; // green
      case 'resting': return '#eab308'; // yellow
      case 'maintenance': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      console.log('Starting map initialization...');
      
      // Wait for the DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!mapRef.current) {
        console.log('Map container not available, retrying...');
        setError('Map container not ready');
        return;
      }

      try {
        setError('');
        setIsLoading(true);
        console.log('Creating Google Maps loader...');
        
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['drawing', 'geometry']
        });

        console.log('Loading Google Maps API...');
        const google = await loader.load();
        console.log('Google Maps API loaded successfully', google);

        if (!mapRef.current) {
          console.log('Map container lost during loading');
          setError('Map container lost during initialization');
          return;
        }

        console.log('Creating map instance...');
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: SKYRANCH_CENTER,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          streetViewControl: false,
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
          }
        });

        console.log('Map instance created, setting up drawing manager...');
        
        const drawingManagerInstance = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: false,
          polygonOptions: {
            fillColor: '#22c55e',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#22c55e',
            editable: true,
            draggable: false,
          },
        });

        drawingManagerInstance.setMap(mapInstance);
        
        // Handle polygon completion
        drawingManagerInstance.addListener('polygoncomplete', (polygon: google.maps.Polygon) => {
          console.log('Polygon completed');
          if (selectedLotId) {
            handlePolygonComplete(polygon);
          } else {
            polygon.setMap(null);
            toast({
              title: "Error",
              description: "Selecciona un lote antes de dibujar",
              variant: "destructive"
            });
          }
        });

        setMap(mapInstance);
        setDrawingManager(drawingManagerInstance);
        setIsLoading(false);
        
        console.log('Map initialization completed successfully');
        toast({
          title: "Mapa Cargado",
          description: "Google Maps se ha cargado correctamente",
        });

      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError(`Error al cargar Google Maps: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Error al cargar Google Maps. Verifica tu conexión a internet.",
          variant: "destructive"
        });
      }
    };

    // Only initialize if we have the ref
    if (mapRef.current) {
      initializeMap();
    } else {
      // Retry after a short delay if ref is not ready
      const timer = setTimeout(() => {
        if (mapRef.current) {
          initializeMap();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [mapRef.current]);

  // Load saved polygons from localStorage
  useEffect(() => {
    if (!map || lots.length === 0) return;

    console.log('Loading saved polygons...');
    const savedPolygons = localStorage.getItem('lotPolygons');
    if (savedPolygons) {
      try {
        const polygonData = JSON.parse(savedPolygons);
        console.log('Found saved polygons:', polygonData.length);
        
        polygonData.forEach((data: any) => {
          const lot = lots.find(l => l.id === data.lotId);
          if (lot && data.coordinates) {
            const polygon = new google.maps.Polygon({
              paths: data.coordinates,
              fillColor: getColorForLot(lot),
              fillOpacity: 0.3,
              strokeWeight: 2,
              strokeColor: getColorForLot(lot),
              editable: true,
              draggable: false,
            });
            
            polygon.setMap(map);
            
            // Add click listener for lot selection
            polygon.addListener('click', () => {
              onLotSelect(lot.id);
            });

            setLotPolygons(prev => [...prev, { 
              lotId: data.lotId, 
              polygon, 
              color: getColorForLot(lot) 
            }]);
          }
        });
      } catch (error) {
        console.error('Error loading saved polygons:', error);
      }
    }
  }, [map, lots, onLotSelect]);

  const handlePolygonComplete = (polygon: google.maps.Polygon) => {
    const lot = lots.find(l => l.id === selectedLotId);
    if (!lot) return;

    console.log('Handling polygon completion for lot:', lot.name);
    const color = getColorForLot(lot);
    
    // Style the polygon
    polygon.setOptions({
      fillColor: color,
      fillOpacity: 0.3,
      strokeWeight: 2,
      strokeColor: color,
    });

    // Add click listener
    polygon.addListener('click', () => {
      onLotSelect(lot.id);
    });

    // Remove existing polygon for this lot
    const existingIndex = lotPolygons.findIndex(lp => lp.lotId === selectedLotId);
    if (existingIndex !== -1) {
      lotPolygons[existingIndex].polygon.setMap(null);
      setLotPolygons(prev => prev.filter(lp => lp.lotId !== selectedLotId));
    }

    // Add new polygon
    const newPolygons = [...lotPolygons.filter(lp => lp.lotId !== selectedLotId), { 
      lotId: selectedLotId, 
      polygon, 
      color 
    }];
    
    setLotPolygons(newPolygons);
    savePolygons(newPolygons);

    setIsDrawing(false);
    drawingManager?.setDrawingMode(null);

    toast({
      title: "Polígono Guardado",
      description: `Polígono guardado para ${lot.name}`,
    });
  };

  const savePolygons = (polygons: LotPolygon[]) => {
    const polygonData = polygons.map(lp => ({
      lotId: lp.lotId,
      color: lp.color,
      coordinates: lp.polygon.getPath().getArray().map(point => ({
        lat: point.lat(),
        lng: point.lng()
      }))
    }));
    
    localStorage.setItem('lotPolygons', JSON.stringify(polygonData));
    console.log('Saved polygons to localStorage:', polygonData.length);
  };

  const startDrawing = (lotId: string) => {
    if (!drawingManager || !lotId) return;
    
    console.log('Starting drawing for lot:', lotId);
    setSelectedLotId(lotId);
    setIsDrawing(true);
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  };

  const deletePolygon = (lotId: string) => {
    console.log('Deleting polygon for lot:', lotId);
    const polygonIndex = lotPolygons.findIndex(lp => lp.lotId === lotId);
    if (polygonIndex !== -1) {
      lotPolygons[polygonIndex].polygon.setMap(null);
      const updatedPolygons = lotPolygons.filter(lp => lp.lotId !== lotId);
      setLotPolygons(updatedPolygons);
      savePolygons(updatedPolygons);
      
      toast({
        title: "Polígono Eliminado",
        description: "El polígono ha sido eliminado",
      });
    }
  };

  const resetView = () => {
    if (map) {
      console.log('Resetting map view to SkyRanch center');
      map.setCenter(SKYRANCH_CENTER);
      map.setZoom(16);
    }
  };

  const cancelDrawing = () => {
    console.log('Canceling drawing mode');
    setIsDrawing(false);
    drawingManager?.setDrawingMode(null);
  };

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <p className="text-red-600 font-medium">Error al cargar el mapa</p>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
          <button 
            onClick={() => {
              setError('');
              setIsLoading(true);
              window.location.reload();
            }} 
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando Google Maps...</p>
          <p className="text-gray-500 text-sm mt-1">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      
      {map && (
        <MapControls
          lots={lots}
          selectedLotId={selectedLotId}
          isDrawing={isDrawing}
          lotPolygons={lotPolygons}
          onStartDrawing={startDrawing}
          onDeletePolygon={deletePolygon}
          onResetView={resetView}
          onCancelDrawing={cancelDrawing}
        />
      )}
    </div>
  );
};

export default GoogleMapComponent;
