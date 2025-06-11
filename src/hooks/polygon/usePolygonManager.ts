
import { useState, useCallback } from 'react';
import { type Lot } from '@/stores/lotStore';
import { usePolygonUtils } from './usePolygonUtils';

interface PolygonData {
  lotId: string;
  polygon: google.maps.Polygon;
  color: string;
  colorType: string;
  coordinates: { lat: number; lng: number }[];
  areaHectares?: number;
}

interface UsePolygonManagerOptions {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
  getLotColor: (lot: Lot) => string;
  savePolygonsToStorage: (polygons: PolygonData[]) => void;
}

// Color mapping for different statuses
const COLOR_MAP = {
  active: '#10b981',     // En Uso - Green
  resting: '#f59e0b',    // Descanso - Amber
  breeding: '#8b5cf6',   // Reproducción - Purple
  maintenance: '#ef4444', // Mantenimiento - Red
  property: '#ffffff'     // Propiedad - White
};

export const usePolygonManager = ({ lots, onLotSelect, getLotColor, savePolygonsToStorage }: UsePolygonManagerOptions) => {
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const { calculatePolygonArea } = usePolygonUtils();

  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon, selectedLotId: string, selectedColor: string) => {
    console.log('handlePolygonComplete called with selectedLotId:', selectedLotId, 'colorType:', selectedColor);
    
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

    // Get coordinates
    const path = polygon.getPath();
    const coordinates = path.getArray().map(point => ({
      lat: point.lat(),
      lng: point.lng()
    }));

    // Calculate area
    const areaHectares = calculatePolygonArea(polygon);
    console.log('Calculated area:', areaHectares, 'hectares');

    // Get the color from the color map
    const color = COLOR_MAP[selectedColor as keyof typeof COLOR_MAP];
    console.log('Setting polygon color to:', color, 'for type:', selectedColor);

    // Set polygon style with the selected color
    polygon.setOptions({
      fillColor: color,
      strokeColor: color === '#ffffff' ? '#000000' : color,
      fillOpacity: color === '#ffffff' ? 0.8 : 0.35,
      strokeWeight: color === '#ffffff' ? 3 : 2,
      clickable: true,
      editable: true,
    });

    // Add click listener for lot selection
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
      colorType: selectedColor,
      coordinates,
      areaHectares
    };

    console.log('Adding new polygon data:', polygonData);

    // Update state and save
    setPolygons(prev => {
      const updated = [...prev, polygonData];
      console.log('Updated polygons array:', updated);
      savePolygonsToStorage(updated);
      return updated;
    });
  }, [lots, onLotSelect, savePolygonsToStorage, calculatePolygonArea]);

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
        // Use saved color type or default to active
        const colorType = item.colorType || 'active';
        const color = COLOR_MAP[colorType as keyof typeof COLOR_MAP] || getLotColor(lot);
        
        const polygon = new google.maps.Polygon({
          paths: item.coordinates,
          fillColor: color,
          strokeColor: color === '#ffffff' ? '#000000' : color,
          fillOpacity: color === '#ffffff' ? 0.8 : 0.35,
          strokeWeight: color === '#ffffff' ? 3 : 2,
          clickable: true,
          editable: true,
        });

        polygon.setMap(map);
        
        // Add click listener for lot selection
        polygon.addListener('click', () => onLotSelect(lot.id));
        
        // Calculate area if not stored or recalculate for accuracy
        const areaHectares = item.areaHectares || calculatePolygonArea(polygon);
        
        loadedPolygons.push({
          lotId: item.lotId,
          polygon,
          color,
          colorType,
          coordinates: item.coordinates,
          areaHectares
        });
      }
    });

    console.log('Loaded polygons:', loadedPolygons);
    setPolygons(loadedPolygons);
  }, [lots, getLotColor, onLotSelect, calculatePolygonArea]);

  return {
    polygons,
    setPolygons,
    handlePolygonComplete,
    deletePolygon,
    loadSavedPolygons
  };
};
