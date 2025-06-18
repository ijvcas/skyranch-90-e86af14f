
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Layers, ChevronDown, ChevronUp, Minimize2, Building, Handshake, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Lot } from '@/stores/lotStore';

interface LotVisibilityControlsProps {
  lots: Lot[];
  visibleLotIds: string[];
  onVisibilityChange: (lotIds: string[]) => void;
  getLotColor: (lotId: string) => string;
}

const LotVisibilityControls = ({ 
  lots, 
  visibleLotIds, 
  onVisibilityChange, 
  getLotColor 
}: LotVisibilityControlsProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);

  const handleLotToggle = (lotId: string, checked: boolean) => {
    if (checked) {
      onVisibilityChange([...visibleLotIds, lotId]);
    } else {
      onVisibilityChange(visibleLotIds.filter(id => id !== lotId));
    }
  };

  const handleShowAll = () => {
    onVisibilityChange(lots.map(lot => lot.id));
  };

  const handleShowByStatus = (status: string) => {
    const lotsWithStatus = lots.filter(lot => lot.status === status);
    const lotIds = lotsWithStatus.map(lot => lot.id);
    onVisibilityChange([...new Set([...visibleLotIds, ...lotIds])]);
  };

  if (isMinimized) {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 -translate-x-40 z-30">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="outline"
          size="sm"
          className="bg-white/95 shadow-lg"
        >
          <Layers className="w-4 h-4 mr-2" />
          Visibilidad de Lotes
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 -translate-x-40 z-30 w-64">
      <Card className="shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-sm justify-between">
            <div className="flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              Visibilidad de Lotes
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-6 w-6 p-0"
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {!isCollapsed && (
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowAll}
                className="flex-1 text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Mostrar Todos
              </Button>
            </div>
            
            {/* Status filter buttons */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600">Filtros por Estado:</div>
              <div className="grid grid-cols-1 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShowByStatus('property')}
                  className="justify-start text-xs h-8"
                >
                  <Building className="w-3 h-3 mr-2" />
                  Ver Propiedad
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShowByStatus('negociando')}
                  className="justify-start text-xs h-8"
                >
                  <Handshake className="w-3 h-3 mr-2" />
                  Ver Negociando
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShowByStatus('lista de compra')}
                  className="justify-start text-xs h-8"
                >
                  <ShoppingCart className="w-3 h-3 mr-2" />
                  Ver Lista de Compra
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lots.map(lot => (
                <div key={lot.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lot-${lot.id}`}
                    checked={visibleLotIds.includes(lot.id)}
                    onCheckedChange={(checked) => handleLotToggle(lot.id, checked as boolean)}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: getLotColor(lot.id) }}
                  />
                  <Label 
                    htmlFor={`lot-${lot.id}`} 
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {lot.name}
                  </Label>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500">
              {visibleLotIds.length} de {lots.length} lotes visibles
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default LotVisibilityControls;
