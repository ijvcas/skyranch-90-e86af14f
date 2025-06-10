
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Lot } from '@/stores/lotStore';

interface LotSelectionPanelProps {
  lots: Lot[];
  selectedLot: Lot | null;
  onLotSelect: (lot: Lot) => void;
}

export const LotSelectionPanel = ({ lots, selectedLot, onLotSelect }: LotSelectionPanelProps) => {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">Selecciona un lote para dibujar:</p>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {lots.map((lot) => (
          <Button
            key={lot.id}
            variant={selectedLot?.id === lot.id ? "default" : "outline"}
            size="sm"
            className="w-full justify-start text-left"
            onClick={() => onLotSelect(lot)}
          >
            <span className="flex-1">{lot.name}</span>
            {lot.sizeHectares && (
              <Badge variant="secondary" className="ml-2">
                {lot.sizeHectares} ha
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
