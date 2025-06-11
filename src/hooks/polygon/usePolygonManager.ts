
import { useState, useCallback } from 'react';
import { type Lot } from '@/stores/lotStore';
import { usePolygonUtils } from './usePolygonUtils';
import { usePolygonStorage } from './usePolygonStorage';

interface PolygonData {
  lotId: string;
  polygon: google.maps.Polygon;
  color: string;
  coordinates: { lat: number; lng: number }[];
  areaHectares?: number;
}

interface UsePolygonManagerOptions {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
  getLotColor: (lot: Lot) => string;
  savePolygonsToStorage: (polygons: PolygonData[]) => void;
}

export const usePolygonManager = ({ lots, onLotSelect, getLotColor }: UsePolygonManagerOptions) => {
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const { calculatePolygonArea } = usePolygonUtils();
  const { savePolygonsToStorage, deletePolygonFromStorage } = usePolygonStorage();

  const handlePolygonComplete = useCallback(async (polygon: google.maps.Polygon, selectedLotId: string) => {
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

    // Get coordinates
    const path = polygon.getPath();
    const coordinates = path.getArray().map(point => ({
      lat: point.lat(),
      lng: point.lng()
    }));

    // Calculate area
    const areaHectares = calculatePolygonArea(polygon);
    console.log('Calculated area:', areaHectares, 'hectares');

    // Get the color from the lot status
    const color = getLotColor(lot);
    console.log('Setting polygon color to:', color, 'for lot status:', lot.status);

    // Set polygon style with the selected color
    polygon.setOptions({
      fillColor: color,
      strokeColor: color === '#f3f4f6' ? '#9ca3af' : color,
      fillOpacity: color === '#f3f4f6' ? 0.8 : 0.35,
      strokeWeight: color === '#f3f4f6' ? 3 : 2,
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
      coordinates,
      areaHectares
    };

    console.log('Adding new polygon data:', polygonData);

    // Save to database immediately
    await savePolygonsToStorage([polygonData]);

    // Update state
    setPolygons(prev => {
      const updated = [...prev, polygonData];
      console.log('Updated polygons array:', updated);
      return updated;
    });
  }, [lots, onLotSelect, savePolygonsToStorage, calculatePolygonArea, getLotColor]);

  const deletePolygon = useCallback(async (lotId: string) => {
    console.log('Deleting polygon for lot:', lotId);
    
    // Delete from database
    await deletePolygonFromStorage(lotId);
    
    // Update local state
    setPolygons(prev => {
      const polygonData = prev.find(p => p.lotId === lotId);
      if (polygonData) {
        polygonData.polygon.setMap(null);
      }
      return prev.filter(p => p.lotId !== lotId);
    });
  }, [deletePolygonFromStorage]);

  const loadSavedPolygons = useCallback(async (map: google.maps.Map, savedData?: any[]) => {
    const loadedPolygons: PolygonData[] = [];

    // If no savedData provided, load from database via storage hook
    let dataToLoad = savedData;
    if (!dataToLoad) {
      const { loadPolygonsFromStorage } = usePolygonStorage();
      dataToLoad = await loadPolygonsFromStorage();
    }

    dataToLoad.forEach((item: any) => {
      const lot = lots.find(l => l.id === item.lotId);
      if (lot && item.coordinates) {
        // Use current lot status color
        const color = getLotColor(lot);
        
        const polygon = new google.maps.Polygon({
          paths: item.coordinates,
          fillColor: color,
          strokeColor: color === '#f3f4f6' ? '#9ca3af' : color,
          fillOpacity: color === '#f3f4f6' ? 0.8 : 0.35,
          strokeWeight: color === '#f3f4f6' ? 3 : 2,
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
          coordinates: item.coordinates,
          areaHectares
        });
      }
    });

    console.log('Loaded polygons from database:', loadedPolygons);
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
