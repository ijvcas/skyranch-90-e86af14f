
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { type Lot } from '@/stores/lotStore';

interface LotSelectorProps {
  lots: Lot[];
  selectedLotId: string;
  onLotSelect: (lotId: string) => void;
}

const LotSelector = ({ lots, selectedLotId, onLotSelect }: LotSelectorProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resting': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Seleccionar Lote</label>
      <Select value={selectedLotId} onValueChange={onLotSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un lote" />
        </SelectTrigger>
        <SelectContent>
          {lots.map((lot) => (
            <SelectItem key={lot.id} value={lot.id}>
              <div className="flex items-center justify-between w-full">
                <span>{lot.name}</span>
                <Badge className={`ml-2 ${getStatusColor(lot.status)}`}>
                  {lot.status === 'active' ? 'Activo' : 
                   lot.status === 'resting' ? 'Descanso' : 'Mantenimiento'}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LotSelector;
