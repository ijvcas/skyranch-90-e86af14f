
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Grass, Trash2, Edit } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LotForm from './LotForm';
import { useState } from 'react';

interface LotCardProps {
  lot: Lot;
  onClick: (lotId: string) => void;
  onDelete?: (lotId: string) => void;
  calculatedAreaHectares?: number;
}

const LotCard = ({ lot, onClick, onDelete, calculatedAreaHectares }: LotCardProps) => {
  const [showEditForm, setShowEditForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'resting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      case 'property': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'lista de compra': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'por firmar': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'negociando': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'resting': return 'Descanso';
      case 'maintenance': return 'Mantenimiento';
      case 'property': return 'Propiedad';
      case 'lista de compra': return 'Lista de Compra';
      case 'por firmar': return 'Por Firmar';
      case 'negociando': return 'Negociando';
      default: return status;
    }
  };

  const getGrassConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-lime-100 text-lime-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrassConditionLabel = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Buena';
      case 'fair': return 'Regular';
      case 'poor': return 'Pobre';
      default: return condition;
    }
  };

  const displayArea = calculatedAreaHectares || lot.sizeHectares;
  const hasAreaDiscrepancy = calculatedAreaHectares && lot.sizeHectares && 
    Math.abs(calculatedAreaHectares - lot.sizeHectares) > 0.1;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle 
            className="text-lg font-semibold truncate flex-1"
            onClick={() => onClick(lot.id)}
          >
            {lot.name}
          </CardTitle>
          <div className="flex gap-1 ml-2">
            <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Editar Lote</DialogTitle>
                </DialogHeader>
                <LotForm 
                  lot={lot} 
                  onClose={() => setShowEditForm(false)} 
                />
              </DialogContent>
            </Dialog>
            
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(lot.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={getStatusColor(lot.status)}>
            {getStatusLabel(lot.status)}
          </Badge>
          {lot.grassCondition && (
            <Badge className={getGrassConditionColor(lot.grassCondition)}>
              <Grass className="w-3 h-3 mr-1" />
              {getGrassConditionLabel(lot.grassCondition)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3" onClick={() => onClick(lot.id)}>
        {lot.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{lot.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          {displayArea && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {displayArea.toFixed(1)} ha
                {hasAreaDiscrepancy && (
                  <span className="text-orange-600 text-xs ml-1">
                    (orig: {lot.sizeHectares?.toFixed(1)})
                  </span>
                )}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">
              {lot.currentAnimals || 0}
              {lot.capacity && `/${lot.capacity}`} animales
            </span>
          </div>
          
          {lot.grassType && (
            <div className="col-span-2">
              <span className="text-gray-500">Pasto: </span>
              <span className="text-gray-700">{lot.grassType}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LotCard;
