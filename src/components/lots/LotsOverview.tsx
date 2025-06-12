
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
  // Sort lots alphabetically by name
  const sortedLots = [...lots].sort((a, b) => {
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  });

  // Merge polygon data with sorted lots for display
  const enhancedLots = sortedLots.map(lot => {
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Lotes ({enhancedLots.length})
        </h3>
        <p className="text-sm text-gray-500">
          Ordenados alfabéticamente por nombre
        </p>
      </div>
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
