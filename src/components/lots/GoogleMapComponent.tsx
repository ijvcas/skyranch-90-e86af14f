
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';
import MapControls from './MapControls';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBo7e7hBrnCCtJDSaftXEFHP4qi-KiKXzI';

// SkyRanch coordinates (example coordinates - adjust as needed)
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
  const { toast } = useToast();

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
      if (!mapRef.current) return;

      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['drawing', 'geometry']
        });

        await loader.load();

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
        
        toast({
          title: "Mapa Cargado",
          description: "Google Maps se ha cargado correctamente",
        });

      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Error al cargar Google Maps",
          variant: "destructive"
        });
      }
    };

    initializeMap();
  }, [selectedLotId, toast]);

  // Load saved polygons from localStorage
  useEffect(() => {
    if (!map) return;

    const savedPolygons = localStorage.getItem('lotPolygons');
    if (savedPolygons) {
      try {
        const polygonData = JSON.parse(savedPolygons);
        
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
    setLotPolygons(prev => [...prev, { 
      lotId: selectedLotId, 
      polygon, 
      color 
    }]);

    // Save to localStorage
    savePolygons([...lotPolygons.filter(lp => lp.lotId !== selectedLotId), { 
      lotId: selectedLotId, 
      polygon, 
      color 
    }]);

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
  };

  const startDrawing = (lotId: string) => {
    if (!drawingManager || !lotId) return;
    
    setSelectedLotId(lotId);
    setIsDrawing(true);
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  };

  const deletePolygon = (lotId: string) => {
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
      map.setCenter(SKYRANCH_CENTER);
      map.setZoom(16);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      
      <MapControls
        lots={lots}
        selectedLotId={selectedLotId}
        isDrawing={isDrawing}
        lotPolygons={lotPolygons}
        onStartDrawing={startDrawing}
        onDeletePolygon={deletePolygon}
        onResetView={resetView}
        onCancelDrawing={() => {
          setIsDrawing(false);
          drawingManager?.setDrawingMode(null);
        }}
      />
    </div>
  );
};

export default GoogleMapComponent;
