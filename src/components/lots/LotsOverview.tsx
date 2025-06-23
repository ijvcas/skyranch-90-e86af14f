import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import LotStatistics from './LotStatistics';
import LotsGrid from './LotsGrid';
import AnimalListEmptyState from '../animals/AnimalListEmptyState';
import LoadingState from '../LoadingState';
import PermissionGuard from '../PermissionGuard';
import { type Lot } from '@/stores/lotStore';
import CadastralSyncButton from './CadastralSyncButton';

interface LotsOverviewProps {
  lots: Lot[];
  isLoading: boolean;
  onLotSelect: (lotId: string) => void;
  onCreateLot: () => void;
  onDeleteLot: (lotId: string) => void;
  polygonData: Array<{lotId: string; areaHectares?: number}>;
}

const LotsOverview: React.FC<LotsOverviewProps> = ({
  lots,
  isLoading,
  onLotSelect,
  onCreateLot,
  onDeleteLot,
  polygonData
}) => {
  const totalLots = lots.length;
  const activeLots = lots.filter(lot => lot.status === 'active').length;
  const inactiveLots = lots.filter(lot => lot.status === 'inactive').length;
  const maintenanceLots = lots.filter(lot => lot.status === 'maintenance').length;
  const restingLots = lots.filter(lot => lot.status === 'resting').length;

  const handleSyncComplete = () => {
    // The parent component should reload lots data
    window.location.reload();
  };

  if (isLoading) {
    return <LoadingState message="Cargando lotes..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <LotStatistics lots={lots} />
        <div className="flex gap-2">
          <CadastralSyncButton onSyncComplete={handleSyncComplete} />
          <PermissionGuard permission="lots_manage">
            <Button onClick={onCreateLot} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Crear Lote</span>
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {lots.length === 0 ? (
        <AnimalListEmptyState 
          title="No hay lotes registrados"
          description="Crea tu primer lote o sincroniza con datos catastrales para comenzar"
          actionLabel="Crear Lote"
          onAction={onCreateLot}
        />
      ) : (
        <LotsGrid 
          lots={lots}
          onLotSelect={onLotSelect}
          onDeleteLot={onDeleteLot}
          polygonData={polygonData}
        />
      )}
    </div>
  );
};

export default LotsOverview;
