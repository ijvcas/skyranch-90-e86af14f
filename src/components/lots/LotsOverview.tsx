
import React from 'react';
import { type Lot } from '@/stores/lotStore';
import LotStatistics from './LotStatistics';
import LotsGrid from './LotsGrid';

interface PolygonData {
  lotId: string;
  areaHectares?: number;
}

interface LotsOverviewProps {
  lots: Lot[];
  isLoading: boolean;
  onLotSelect: (lotId: string) => void;
  onCreateLot: () => void;
  onDeleteLot?: (lotId: string) => void;
  polygonData?: PolygonData[];
}

const LotsOverview = ({ lots, isLoading, onLotSelect, onCreateLot, onDeleteLot, polygonData }: LotsOverviewProps) => {
  return (
    <div className="space-y-6">
      <LotStatistics lots={lots} polygonData={polygonData} />
      <LotsGrid 
        lots={lots}
        isLoading={isLoading}
        onLotSelect={onLotSelect}
        onCreateLot={onCreateLot}
        onDeleteLot={onDeleteLot}
        polygonData={polygonData}
      />
    </div>
  );
};

export default LotsOverview;
