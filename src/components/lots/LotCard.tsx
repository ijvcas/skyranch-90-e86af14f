
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Trash } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LotAreaDisplay from './LotAreaDisplay';

interface LotCardProps {
  lot: Lot;
  onClick: (lotId: string) => void;
  onDelete?: (lotId: string) => void;
  calculatedAreaHectares?: number;
}

const LotCard = ({ lot, onClick, onDelete, calculatedAreaHectares }: LotCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'resting':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'maintenance':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'resting':
        return 'En Descanso';
      case 'maintenance':
        return 'Mantenimiento';
      case 'property':
        return 'Propiedad';
      default:
        return 'Desconocido';
    }
  };

  const getCapacityText = () => {
    if (!lot.capacity) return 'No definida';
    const currentAnimals = lot.currentAnimals || 0;
    return `${currentAnimals} / ${lot.capacity}`;
  };

  // Use calculated area from polygon if available
  const calculatedArea = calculatedAreaHectares !== undefined 
    ? calculatedAreaHectares
    : (lot as any).calculatedAreaHectares;

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={() => onClick(lot.id)}
    >
      <CardContent className="p-4 pb-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-medium text-lg text-gray-900">{lot.name}</h3>
            <Badge 
              variant="secondary" 
              className={`mt-1 font-normal ${getStatusColor(lot.status)}`}
            >
              {getStatusText(lot.status)}
            </Badge>
          </div>
          
          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete(lot.id);
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="text-sm space-y-3">
          {/* Area display with calculated from polygon */}
          <LotAreaDisplay lot={lot} calculatedArea={calculatedArea} />
          
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Capacidad:</span>
            <span className="font-medium text-gray-600">{getCapacityText()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Estado del pasto:</span>
            <span className="font-medium text-gray-600 capitalize">
              {lot.grassCondition || 'No definido'}
            </span>
          </div>
          
          {lot.grassType && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Tipo de pasto:</span>
              <span className="font-medium text-gray-600">{lot.grassType}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LotCard;
