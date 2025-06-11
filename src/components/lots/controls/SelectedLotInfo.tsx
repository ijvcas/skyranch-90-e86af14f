
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';

interface SelectedLotInfoProps {
  selectedLot: Lot;
}

const SelectedLotInfo = ({ selectedLot }: SelectedLotInfoProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resting': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{selectedLot.name}</h4>
        <Badge className={getStatusColor(selectedLot.status)}>
          {selectedLot.status === 'active' ? 'Activo' : 
           selectedLot.status === 'resting' ? 'Descanso' : 'Mantenimiento'}
        </Badge>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <Circle 
          className="w-3 h-3 mr-1" 
          style={{ 
            fill: selectedLot.status === 'active' ? '#22c55e' : 
                  selectedLot.status === 'resting' ? '#eab308' : '#ef4444'
          }} 
        />
        Color del polígono
      </div>
    </div>
  );
};

export default SelectedLotInfo;
