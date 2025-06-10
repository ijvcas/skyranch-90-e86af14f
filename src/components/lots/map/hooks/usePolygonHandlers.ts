
import { type Lot } from '@/stores/lotStore';

interface UsePolygonHandlersProps {
  selectedLot: Lot | null;
  setIsDrawing: (drawing: boolean) => void;
  startDrawingPolygon: (lotId: string) => void;
  saveCurrentPolygon: (lotId: string) => void;
  deletePolygonForLot: (lotId: string) => void;
  setPolygonColor: (lotId: string, color: string) => void;
}

export const usePolygonHandlers = ({
  selectedLot,
  setIsDrawing,
  startDrawingPolygon,
  saveCurrentPolygon,
  deletePolygonForLot,
  setPolygonColor
}: UsePolygonHandlersProps) => {
  const handleStartDrawing = () => {
    if (selectedLot) {
      console.log('Starting drawing for lot:', selectedLot.id);
      setIsDrawing(true);
      startDrawingPolygon(selectedLot.id);
    } else {
      console.log('No lot selected for drawing');
    }
  };

  const handleSavePolygon = () => {
    if (selectedLot) {
      console.log('Saving polygon for lot:', selectedLot.id);
      saveCurrentPolygon(selectedLot.id);
      setIsDrawing(false);
    } else {
      console.log('No lot selected for saving');
    }
  };

  const handleDeletePolygon = () => {
    if (selectedLot) {
      console.log('Deleting polygon for lot:', selectedLot.id);
      deletePolygonForLot(selectedLot.id);
    } else {
      console.log('No lot selected for deletion');
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedLot) {
      console.log('Changing color for lot:', selectedLot.id, 'to:', color);
      setPolygonColor(selectedLot.id, color);
    } else {
      console.log('No lot selected for color change');
    }
  };

  const handleCancelDrawing = () => {
    console.log('Cancelling drawing');
    setIsDrawing(false);
  };

  return {
    handleStartDrawing,
    handleSavePolygon,
    handleDeletePolygon,
    handleColorChange,
    handleCancelDrawing
  };
};
