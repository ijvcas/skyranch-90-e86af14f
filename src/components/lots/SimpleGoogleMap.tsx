
import React, { useEffect, useRef, useState } from 'react';
import { type Lot } from '@/stores/lotStore';
import MapDrawingControls from './MapDrawingControls';

// SkyRanch coordinates (Adjust these to your actual location)
const SKYRANCH_CENTER = { lat: 40.7128, lng: -74.0060 };
const GOOGLE_MAPS_API_KEY = 'AIzaSyBo7e7hBrnCCtJDSaftXEFHP4qi-KiKXzI';

interface SimpleGoogleMapProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

interface LotPolygon {
  lotId: string;
  polygon: google.maps.Polygon;
  color: string;
}

const SimpleGoogleMap = ({ lots, onLotSelect }: SimpleGoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);
  
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [lotPolygons, setLotPolygons] = useState<LotPolygon[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Get color based on lot status
  const getLotColor = (lot: Lot) => {
    switch (lot.status) {
      case 'active': return '#22c55e'; // green
      case 'resting': return '#eab308'; // yellow  
      case 'maintenance': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=drawing`;
      script.async = true;
      
      script.onload = () => {
        // Create map
        const map = new google.maps.Map(mapRef.current!, {
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

        mapInstance.current = map;

        // Create drawing manager
        const drawing = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: false,
          polygonOptions: {
            fillOpacity: 0.3,
            strokeWeight: 2,
            editable: true,
            draggable: false,
          },
        });

        drawing.setMap(map);
        drawingManager.current = drawing;

        // Handle polygon completion
        drawing.addListener('polygoncomplete', (polygon: google.maps.Polygon) => {
          if (selectedLotId) {
            const lot = lots.find(l => l.id === selectedLotId);
            if (lot) {
              const color = getLotColor(lot);
              
              // Style polygon
              polygon.setOptions({
                fillColor: color,
                strokeColor: color,
              });

              // Add click listener
              polygon.addListener('click', () => onLotSelect(lot.id));

              // Remove existing polygon for this lot
              const existingIndex = lotPolygons.findIndex(lp => lp.lotId === selectedLotId);
              if (existingIndex !== -1) {
                lotPolygons[existingIndex].polygon.setMap(null);
              }

              // Add new polygon
              const newPolygons = lotPolygons.filter(lp => lp.lotId !== selectedLotId);
              newPolygons.push({ lotId: selectedLotId, polygon, color });
              setLotPolygons(newPolygons);

              // Save to localStorage
              savePolygons(newPolygons);
              
              setIsDrawing(false);
              drawing.setDrawingMode(null);
            }
          }
        });

        // Load saved polygons
        loadSavedPolygons(map);
      };

      document.head.appendChild(script);
    };

    initMap();
  }, []);

  // Save polygons to localStorage
  const savePolygons = (polygons: LotPolygon[]) => {
    const data = polygons.map(lp => ({
      lotId: lp.lotId,
      color: lp.color,
      coordinates: lp.polygon.getPath().getArray().map(point => ({
        lat: point.lat(),
        lng: point.lng()
      }))
    }));
    localStorage.setItem('lotPolygons', JSON.stringify(data));
  };

  // Load saved polygons
  const loadSavedPolygons = (map: google.maps.Map) => {
    const saved = localStorage.getItem('lotPolygons');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      const polygons: LotPolygon[] = [];

      data.forEach((item: any) => {
        const lot = lots.find(l => l.id === item.lotId);
        if (lot && item.coordinates) {
          const polygon = new google.maps.Polygon({
            paths: item.coordinates,
            fillColor: getLotColor(lot),
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: getLotColor(lot),
            editable: true,
            draggable: false,
          });

          polygon.setMap(map);
          polygon.addListener('click', () => onLotSelect(lot.id));
          
          polygons.push({ 
            lotId: item.lotId, 
            polygon, 
            color: getLotColor(lot) 
          });
        }
      });

      setLotPolygons(polygons);
    } catch (error) {
      console.error('Error loading saved polygons:', error);
    }
  };

  // Start drawing
  const startDrawing = (lotId: string) => {
    if (!drawingManager.current || !lotId) return;
    
    setSelectedLotId(lotId);
    setIsDrawing(true);
    drawingManager.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  };

  // Delete polygon
  const deletePolygon = (lotId: string) => {
    const index = lotPolygons.findIndex(lp => lp.lotId === lotId);
    if (index !== -1) {
      lotPolygons[index].polygon.setMap(null);
      const updated = lotPolygons.filter(lp => lp.lotId !== lotId);
      setLotPolygons(updated);
      savePolygons(updated);
    }
  };

  // Cancel drawing
  const cancelDrawing = () => {
    setIsDrawing(false);
    drawingManager.current?.setDrawingMode(null);
  };

  // Reset view
  const resetView = () => {
    mapInstance.current?.setCenter(SKYRANCH_CENTER);
    mapInstance.current?.setZoom(16);
  };

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full z-10" />
      
      <MapDrawingControls
        lots={lots}
        selectedLotId={selectedLotId}
        isDrawing={isDrawing}
        lotPolygons={lotPolygons}
        onStartDrawing={startDrawing}
        onDeletePolygon={deletePolygon}
        onResetView={resetView}
        onCancelDrawing={cancelDrawing}
        onLotSelect={setSelectedLotId}
      />
    </div>
  );
};

export default SimpleGoogleMap;
