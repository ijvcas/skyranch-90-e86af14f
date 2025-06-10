
import { type Lot } from '@/stores/lotStore';
import { usePolygonStorage } from './usePolygonStorage';
import { usePolygonRenderer } from './usePolygonRenderer';
import { usePolygonDrawing } from './usePolygonDrawing';

export const usePolygonManager = (lots: Lot[]) => {
  const {
    lotPolygons,
    updatePolygonForLot,
    deletePolygonForLot,
    addPolygonForLot
  } = usePolygonStorage();

  const {
    renderLotPolygons,
    togglePolygonsVisibility,
    toggleLabelsVisibility,
    cleanup: cleanupRenderer
  } = usePolygonRenderer(lots);

  const {
    initializeDrawingManager,
    startDrawingPolygon,
    saveCurrentPolygon,
    cleanup: cleanupDrawing
  } = usePolygonDrawing({ lots, addPolygonForLot });

  const handleRenderPolygons = (map: google.maps.Map) => {
    renderLotPolygons(map, lotPolygons);
  };

  const handleSaveCurrentPolygon = async (lotId: string, map: google.maps.Map) => {
    await saveCurrentPolygon(lotId, map, () => {
      handleRenderPolygons(map);
    });
  };

  const handleDeletePolygonForLot = (lotId: string, map: google.maps.Map) => {
    console.log('🗑️ Deleting polygon for lot:', lotId);
    deletePolygonForLot(lotId);
    handleRenderPolygons(map);
  };

  const setPolygonColor = (lotId: string, color: string, map: google.maps.Map) => {
    console.log('🎨 Setting polygon color for lot:', lotId, 'to:', color);
    updatePolygonForLot(lotId, { color });
    handleRenderPolygons(map);
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up polygon manager');
    cleanupRenderer();
    cleanupDrawing();
  };

  return {
    lotPolygons,
    renderLotPolygons: handleRenderPolygons,
    initializeDrawingManager,
    startDrawingPolygon,
    saveCurrentPolygon: handleSaveCurrentPolygon,
    deletePolygonForLot: handleDeletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility,
    cleanup
  };
};
