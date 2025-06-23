
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Square } from 'lucide-react';

interface SimplifiedPolygonControlsProps {
  onClearAll: () => void;
  selectedLotId: string | null;
  onDeleteSelected: () => void;
  polygonCount: number;
}

const SimplifiedPolygonControls: React.FC<SimplifiedPolygonControlsProps> = ({
  onClearAll,
  selectedLotId,
  onDeleteSelected,
  polygonCount
}) => {
  return (
    <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border space-y-2">
      <div className="text-sm text-gray-600 mb-2">
        Lotes de pastoreo: {polygonCount}
      </div>
      
      {selectedLotId && (
        <Button
          onClick={onDeleteSelected}
          size="sm"
          variant="destructive"
          className="w-full flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar Seleccionado
        </Button>
      )}
      
      {polygonCount > 0 && (
        <Button
          onClick={onClearAll}
          size="sm"
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <Square className="w-4 h-4" />
          Limpiar Todo
        </Button>
      )}
    </div>
  );
};

export default SimplifiedPolygonControls;
