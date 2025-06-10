
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Pencil, Save, Trash2, GripHorizontal } from 'lucide-react';
import { LOT_COLORS } from './mapConstants';
import { useDraggable } from '@/hooks/useDraggable';
import { type Lot } from '@/stores/lotStore';

interface PolygonDrawerProps {
  lots: Lot[];
  selectedLot: Lot | null;
  onLotSelect: (lot: Lot) => void;
  onStartDrawing: () => void;
  onSavePolygon: () => void;
  onDeletePolygon: () => void;
  onColorChange: (color: string) => void;
  isDrawing: boolean;
}

export const PolygonDrawer = ({
  lots,
  selectedLot,
  onLotSelect,
  onStartDrawing,
  onSavePolygon,
  onDeletePolygon,
  onColorChange,
  isDrawing
}: PolygonDrawerProps) => {
  const { position, dragRef, handleMouseDown, isDragging } = useDraggable({ x: 20, y: 100 });

  return (
    <Card 
      ref={dragRef}
      className="absolute z-30 shadow-xl max-w-sm bg-background/95 backdrop-blur-sm cursor-move"
      style={{ 
        left: position.x, 
        top: position.y,
        opacity: isDragging ? 0.8 : 1 
      }}
    >
      <CardHeader 
        className="pb-3 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <CardTitle className="text-sm flex items-center">
          <GripHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
          Diseño de Lotes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lot Selection */}
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
                {lot.name}
                {lot.sizeHectares && (
                  <Badge variant="secondary" className="ml-auto">
                    {lot.sizeHectares} ha
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Drawing Controls */}
        {selectedLot && (
          <>
            <div className="border-t pt-3">
              <div className="flex gap-2 mb-3">
                <Button
                  size="sm"
                  onClick={onStartDrawing}
                  disabled={isDrawing}
                  className="flex-1"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  {isDrawing ? 'Dibujando...' : 'Dibujar Polígono'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSavePolygon}
                  disabled={!isDrawing}
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDeletePolygon}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Color Selection */}
            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-3">Estado del Lote:</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(LOT_COLORS).map(([key, color]) => (
                  <button
                    key={key}
                    className="w-full h-8 rounded border-2 border-white shadow-md hover:scale-105 transition-transform duration-200 flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    onClick={() => onColorChange(color)}
                    title={key === 'grazing' ? 'Pastoreo Activo' : 
                          key === 'resting' ? 'Descanso' : 
                          key === 'maintenance' ? 'Mantenimiento' :
                          key === 'preparation' ? 'Preparado' :
                          key === 'reserved' ? 'Reservado' : 'Por defecto'}
                  >
                    <span className="text-xs text-white font-bold">
                      {key === 'grazing' ? 'PA' : 
                       key === 'resting' ? 'D' : 
                       key === 'maintenance' ? 'M' :
                       key === 'preparation' ? 'P' :
                       key === 'reserved' ? 'R' : 'D'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground">
            💡 Selecciona un lote y dibuja su polígono en el mapa
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
