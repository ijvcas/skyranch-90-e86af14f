
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Layers } from 'lucide-react';
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

  const handleHideAll = () => {
    onVisibilityChange([]);
  };

  return (
    <div className="absolute top-4 right-4 z-30 w-64">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-sm">
            <Layers className="w-4 h-4 mr-2" />
            Visibilidad de Lotes
          </CardTitle>
        </CardHeader>
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleHideAll}
              className="flex-1 text-xs"
            >
              <EyeOff className="w-3 h-3 mr-1" />
              Ocultar Todos
            </Button>
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
      </Card>
    </div>
  );
};

export default LotVisibilityControls;
