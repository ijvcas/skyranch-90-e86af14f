
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';

interface DrawingInstructionsProps {
  selectedLot: Lot | null;
  onSavePolygon: () => void;
  onCancelDrawing: () => void;
}

export const DrawingInstructions = ({ 
  selectedLot, 
  onSavePolygon, 
  onCancelDrawing 
}: DrawingInstructionsProps) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <p className="text-sm font-medium text-green-800 mb-2">🖊️ Modo Dibujo Activo</p>
      <p className="text-xs text-green-600 mb-3">
        Haz clic en el mapa para comenzar a dibujar el polígono del lote <strong>{selectedLot?.name}</strong>
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onSavePolygon}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-1" />
          Guardar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancelDrawing}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
