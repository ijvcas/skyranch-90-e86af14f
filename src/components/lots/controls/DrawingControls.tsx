
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface DrawingControlsProps {
  selectedLotId: string;
  isDrawing: boolean;
  hasPolygon: boolean;
  onStartDrawing: (lotId: string) => void;
  onDeletePolygon: (lotId: string) => void;
  onCancelDrawing: () => void;
}

const DrawingControls = ({
  selectedLotId,
  isDrawing,
  hasPolygon,
  onStartDrawing,
  onDeletePolygon,
  onCancelDrawing
}: DrawingControlsProps) => {
  return (
    <div className="space-y-2">
      {!isDrawing ? (
        <div className="space-y-2">
          <Button
            onClick={() => selectedLotId && onStartDrawing(selectedLotId)}
            disabled={!selectedLotId}
            className="w-full"
            variant={hasPolygon ? "outline" : "default"}
          >
            <Edit className="w-4 h-4 mr-2" />
            {hasPolygon ? 'Redibujar' : 'Dibujar Polígono'}
          </Button>
          
          {hasPolygon && (
            <Button
              onClick={() => onDeletePolygon(selectedLotId)}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Polígono
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium mb-1">
              Modo Dibujo Activo
            </p>
            <p className="text-xs text-blue-600">
              Haz clic en el mapa para crear puntos. Cierra el polígono haciendo clic en el primer punto.
            </p>
          </div>
          
          <Button
            onClick={onCancelDrawing}
            variant="outline"
            className="w-full"
          >
            Cancelar Dibujo
          </Button>
        </div>
      )}
    </div>
  );
};

export default DrawingControls;
