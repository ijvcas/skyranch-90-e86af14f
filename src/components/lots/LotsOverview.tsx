
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
  // Merge polygon data with lots for display
  const enhancedLots = lots.map(lot => {
    const polygon = polygonData?.find(p => p.lotId === lot.id);
    if (polygon && polygon.areaHectares && (!lot.sizeHectares || polygon.areaHectares !== lot.sizeHectares)) {
      return {
        ...lot,
        calculatedAreaHectares: polygon.areaHectares
      };
    }
    return lot;
  });

  return (
    <div className="space-y-6">
      <LotStatistics lots={enhancedLots} polygonData={polygonData} />
      <LotsGrid 
        lots={enhancedLots}
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
