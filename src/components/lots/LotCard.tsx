
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Trash2 } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LotCardProps {
  lot: Lot;
  onLotClick: (lotId: string) => void;
  onDeleteLot?: (lotId: string) => void;
  polygonArea?: number;
}

const LotCard = ({ lot, onLotClick, onDeleteLot, polygonArea }: LotCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const formatArea = (areaHectares: number): string => {
    if (areaHectares < 0.01) {
      return `${(areaHectares * 10000).toFixed(0)} m²`;
    }
    return `${areaHectares.toFixed(2)} ha`;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteLot) {
      onDeleteLot(lot.id);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow relative group"
        onClick={() => onLotClick(lot.id)}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{lot.name}</CardTitle>
              {lot.description && (
                <p className="text-sm text-gray-600 mt-1">{lot.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(lot.status)}>
                {lot.status === 'active' ? 'Activo' : 
                 lot.status === 'resting' ? 'Descanso' : 'Mantenimiento'}
              </Badge>
              {onDeleteLot && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
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
            
            {/* Size - show polygon area if available, otherwise lot size */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tamaño</span>
              <div className="flex items-center">
                {polygonArea && (
                  <BarChart3 className="w-3 h-3 mr-1 text-green-600" />
                )}
                <span className="text-sm">
                  {polygonArea ? formatArea(polygonArea) : 
                   lot.sizeHectares ? `${lot.sizeHectares} ha` : 'No definido'}
                </span>
              </div>
            </div>
            
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Lote</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el lote "{lot.name}"? 
              Esta acción no se puede deshacer y se eliminarán todos los datos asociados al lote.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LotCard;
