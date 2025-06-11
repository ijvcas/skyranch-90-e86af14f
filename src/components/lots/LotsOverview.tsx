
import React from 'react';
import { type Lot } from '@/stores/lotStore';
import LotStatistics from './LotStatistics';
import LotsGrid from './LotsGrid';

interface LotsOverviewProps {
  lots: Lot[];
  isLoading: boolean;
  onLotSelect: (lotId: string) => void;
  onCreateLot: () => void;
}

const LotsOverview = ({ lots, isLoading, onLotSelect, onCreateLot }: LotsOverviewProps) => {
  return (
    <div className="space-y-6">
      <LotStatistics lots={lots} />
      <LotsGrid 
        lots={lots}
        isLoading={isLoading}
        onLotSelect={onLotSelect}
        onCreateLot={onCreateLot}
      />
    </div>
  );
};

export default LotsOverview;
