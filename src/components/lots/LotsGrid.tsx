
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';
import LotCard from './LotCard';

interface PolygonData {
  lotId: string;
  areaHectares?: number;
}

interface LotsGridProps {
  lots: Lot[];
  isLoading: boolean;
  onLotSelect: (lotId: string) => void;
  onCreateLot: () => void;
  polygonData?: PolygonData[];
}

const LotsGrid = ({ lots, isLoading, onLotSelect, onCreateLot, polygonData = [] }: LotsGridProps) => {
  if (isLoading) {
    return (
      <div className="col-span-full text-center py-8">
        <div className="text-gray-500">Cargando lotes...</div>
      </div>
    );
  }

  if (lots.length === 0) {
    return (
      <div className="col-span-full text-center py-8">
        <div className="text-gray-500 mb-4">No hay lotes registrados</div>
        <Button onClick={onCreateLot}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Crear Primer Lote
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lots.map((lot) => {
        const polygon = polygonData.find(p => p.lotId === lot.id);
        return (
          <LotCard 
            key={lot.id} 
            lot={lot} 
            onLotClick={onLotSelect}
            polygonArea={polygon?.areaHectares}
          />
        );
      })}
    </div>
  );
};

export default LotsGrid;
