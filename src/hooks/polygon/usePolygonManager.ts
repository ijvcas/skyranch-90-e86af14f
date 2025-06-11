
import { useState, useCallback } from 'react';
import { type Lot } from '@/stores/lotStore';

interface PolygonData {
  lotId: string;
  polygon: google.maps.Polygon;
  color: string;
  coordinates: { lat: number; lng: number }[];
}

interface UsePolygonManagerOptions {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
  getLotColor: (lot: Lot) => string;
  savePolygonsToStorage: (polygons: PolygonData[]) => void;
}

export const usePolygonManager = ({ lots, onLotSelect, getLotColor, savePolygonsToStorage }: UsePolygonManagerOptions) => {
  const [polygons, setPolygons] = useState<PolygonData[]>([]);

  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon, selectedLotId: string) => {
    console.log('handlePolygonComplete called with selectedLotId:', selectedLotId);
    
    if (!selectedLotId) {
      console.log('No lot selected, removing polygon');
      polygon.setMap(null);
      return;
    }

    const lot = lots.find(l => l.id === selectedLotId);
    if (!lot) {
      console.log('Lot not found, removing polygon');
      polygon.setMap(null);
      return;
    }

    console.log('Processing polygon for lot:', lot.name);

    // Get coordinates first
    const path = polygon.getPath();
    const coordinates = path.getArray().map(point => ({
      lat: point.lat(),
      lng: point.lng()
    }));

    console.log('Polygon coordinates:', coordinates);

    // Set polygon style
    const color = getLotColor(lot);
    polygon.setOptions({
      fillColor: color,
      strokeColor: color,
      fillOpacity: 0.35,
      strokeWeight: 2,
    });

    // Add click listener
    polygon.addListener('click', () => {
      console.log('Polygon clicked for lot:', lot.id);
      onLotSelect(lot.id);
    });

    // Remove existing polygon for this lot first
    setPolygons(prev => {
      const existing = prev.find(p => p.lotId === selectedLotId);
      if (existing) {
        console.log('Removing existing polygon for lot:', selectedLotId);
        existing.polygon.setMap(null);
      }
      return prev.filter(p => p.lotId !== selectedLotId);
    });

    // Create polygon data
    const polygonData: PolygonData = {
      lotId: selectedLotId,
      polygon,
      color,
      coordinates
    };

    console.log('Adding new polygon data:', polygonData);

    // Update state and save
    setPolygons(prev => {
      const updated = [...prev, polygonData];
      console.log('Updated polygons array:', updated);
      savePolygonsToStorage(updated);
      return updated;
    });
  }, [lots, getLotColor, onLotSelect, savePolygonsToStorage]);

  const deletePolygon = useCallback((lotId: string) => {
    console.log('Deleting polygon for lot:', lotId);
    setPolygons(prev => {
      const polygonData = prev.find(p => p.lotId === lotId);
      if (polygonData) {
        polygonData.polygon.setMap(null);
      }
      const updated = prev.filter(p => p.lotId !== lotId);
      savePolygonsToStorage(updated);
      return updated;
    });
  }, [savePolygonsToStorage]);

  const loadSavedPolygons = useCallback((map: google.maps.Map, savedData: any[]) => {
    const loadedPolygons: PolygonData[] = [];

    savedData.forEach((item: any) => {
      const lot = lots.find(l => l.id === item.lotId);
      if (lot && item.coordinates) {
        const polygon = new google.maps.Polygon({
          paths: item.coordinates,
          fillColor: getLotColor(lot),
          fillOpacity: 0.35,
          strokeWeight: 2,
          strokeColor: getLotColor(lot),
          clickable: true,
          editable: true,
        });

        polygon.setMap(map);
        polygon.addListener('click', () => onLotSelect(lot.id));
        
        loadedPolygons.push({
          lotId: item.lotId,
          polygon,
          color: getLotColor(lot),
          coordinates: item.coordinates
        });
      }
    });

    console.log('Loaded polygons:', loadedPolygons);
    setPolygons(loadedPolygons);
  }, [lots, getLotColor, onLotSelect]);

  return {
    polygons,
    setPolygons,
    handlePolygonComplete,
    deletePolygon,
    loadSavedPolygons
  };
};
