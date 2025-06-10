
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface PolygonControlsProps {
  hasPolygon: boolean;
  onStartDrawing: () => void;
  onDeletePolygon: () => void;
}

export const PolygonControls = ({ hasPolygon, onStartDrawing, onDeletePolygon }: PolygonControlsProps) => {
  return (
    <div className="border-t pt-3">
      <div className="flex gap-2 mb-3">
        <Button
          size="sm"
          onClick={onStartDrawing}
          className="flex-1"
          variant={hasPolygon ? "outline" : "default"}
        >
          <Pencil className="w-4 h-4 mr-1" />
          {hasPolygon ? 'Redibujar' : 'Dibujar'} Polígono
        </Button>
        {hasPolygon && (
          <Button
            size="sm"
            variant="destructive"
            onClick={onDeletePolygon}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
