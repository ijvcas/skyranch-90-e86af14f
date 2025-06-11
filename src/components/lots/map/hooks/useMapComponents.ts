
import { useCallback } from 'react';
import { type Lot } from '@/stores/lotStore';
import { usePolygonStorage } from './usePolygonStorage';
import { useMapRenderer } from './useMapRenderer';
import { usePolygonOperations } from './usePolygonOperations';

export const useMapComponents = (lots: Lot[]) => {
  const { lotPolygons, savePolygons } = usePolygonStorage();
  const { addSkyRanchLabel, renderLotPolygons, togglePolygonsVisibility, toggleLabelsVisibility } = useMapRenderer(lots);
  const { 
    initializeDrawingManager, 
    startDrawingPolygon, 
    saveCurrentPolygon, 
    deletePolygonForLot, 
    setPolygonColor 
  } = usePolygonOperations(lots, lotPolygons, savePolygons);

  const initializeMapComponents = useCallback((mapInstance: google.maps.Map) => {
    console.log('🔧 Initializing map components');
    
    // Initialize all map components
    initializeDrawingManager(mapInstance);
    addSkyRanchLabel(mapInstance);
    renderLotPolygons(mapInstance, lotPolygons);
    
    console.log('✅ Map components initialized');
  }, [initializeDrawingManager, addSkyRanchLabel, renderLotPolygons, lotPolygons]);

  return {
    lotPolygons,
    initializeMapComponents,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  };
};
