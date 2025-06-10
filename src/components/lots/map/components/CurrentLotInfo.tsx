
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LOT_COLORS } from '../mapConstants';
import { type Lot } from '@/stores/lotStore';

interface CurrentLotInfoProps {
  selectedLot: Lot;
  hasPolygon: boolean;
  currentColor: string;
}

export const CurrentLotInfo = ({ selectedLot, hasPolygon, currentColor }: CurrentLotInfoProps) => {
  const getColorName = (color: string) => {
    const colorEntry = Object.entries(LOT_COLORS).find(([_, value]) => value === color);
    const key = colorEntry?.[0] || 'default';
    
    const names: Record<string, string> = {
      grazing: 'Pastoreo Activo',
      resting: 'Descanso',
      maintenance: 'Mantenimiento',
      preparation: 'Preparado',
      reserved: 'Reservado',
      default: 'Por defecto'
    };
    
    return names[key] || 'Por defecto';
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-blue-800">{selectedLot.name}</h4>
        {hasPolygon && (
          <Badge variant="secondary" className="text-xs">
            Dibujado
          </Badge>
        )}
      </div>
      {hasPolygon && (
        <div className="text-xs text-blue-600 flex items-center">
          <div 
            className="w-3 h-3 rounded mr-2 border border-white" 
            style={{ backgroundColor: currentColor }}
          />
          Estado: {getColorName(currentColor)}
        </div>
      )}
    </div>
  );
};
