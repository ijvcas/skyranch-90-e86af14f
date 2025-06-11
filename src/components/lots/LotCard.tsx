
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Lot } from '@/stores/lotStore';

interface LotCardProps {
  lot: Lot;
  onLotClick: (lotId: string) => void;
}

const LotCard = ({ lot, onLotClick }: LotCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resting': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrassConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-green-400';
      case 'fair': return 'bg-yellow-400';
      case 'poor': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onLotClick(lot.id)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{lot.name}</CardTitle>
            {lot.description && (
              <p className="text-sm text-gray-600 mt-1">{lot.description}</p>
            )}
          </div>
          <Badge className={getStatusColor(lot.status)}>
            {lot.status === 'active' ? 'Activo' : 
             lot.status === 'resting' ? 'Descanso' : 'Mantenimiento'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Grass Condition */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Condición del Pasto</span>
            <div className="flex items-center">
              <div 
                className={`w-3 h-3 rounded-full mr-2 ${getGrassConditionColor(lot.grassCondition)}`}
              />
              <span className="text-sm capitalize">{lot.grassCondition}</span>
            </div>
          </div>
          
          {/* Capacity */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Ocupación</span>
            <span className="text-sm">
              {lot.currentAnimals || 0} / {lot.capacity || 0}
            </span>
          </div>
          
          {/* Size */}
          {lot.sizeHectares && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tamaño</span>
              <span className="text-sm">{lot.sizeHectares} ha</span>
            </div>
          )}
          
          {/* Progress Bar */}
          {lot.capacity && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{
                    width: `${Math.min(((lot.currentAnimals || 0) / lot.capacity) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LotCard;
