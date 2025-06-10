
import { useState } from 'react';
import { type Lot } from '@/stores/lotStore';

export const useLotSelection = (onLotSelect: (lotId: string) => void) => {
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleLotSelection = (lot: Lot) => {
    console.log('Lot selected:', lot.id);
    setSelectedLot(lot);
    onLotSelect(lot.id);
  };

  return {
    selectedLot,
    isDrawing,
    setIsDrawing,
    handleLotSelection
  };
};
