
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Pencil, Save, Trash2, GripHorizontal, X, Info } from 'lucide-react';
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
  onCancelDrawing: () => void;
  isDrawing: boolean;
  hasPolygon?: boolean;
  currentColor?: string;
}

export const PolygonDrawer = ({
  lots,
  selectedLot,
  onLotSelect,
  onStartDrawing,
  onSavePolygon,
  onDeletePolygon,
  onColorChange,
  onCancelDrawing,
  isDrawing,
  hasPolygon = false,
  currentColor = LOT_COLORS.default
}: PolygonDrawerProps) => {
  const { position, dragRef, handleMouseDown, isDragging } = useDraggable({ x: 20, y: 100 });

  const getColorName = (color: string) => {
    const colorEntry = Object.entries(LOT_COLORS).find(([_, value]) => value === color);
    const key = colorEntry?.[0] || 'default';
    
    const names: Record<string, string> = {
      grazing: 'Pastoreo Activo',
      resting: 'Descanso',
      maintenance: 'Mantenimiento',
      preparation: 'Preparado',
      reserved: 'Reservado',
      default: 'Por defecto'
    };
    
    return names[key] || 'Por defecto';
  };

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
        {/* Current Lot Info */}
        {selectedLot && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-800">{selectedLot.name}</h4>
              {hasPolygon && (
                <Badge variant="secondary" className="text-xs">
                  Dibujado
                </Badge>
              )}
            </div>
            {hasPolygon && (
              <div className="text-xs text-blue-600 flex items-center">
                <div 
                  className="w-3 h-3 rounded mr-2 border border-white" 
                  style={{ backgroundColor: currentColor }}
                />
                Estado: {getColorName(currentColor)}
              </div>
            )}
          </div>
        )}

        {/* Drawing Instructions */}
        {isDrawing && (
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
        )}

        {/* Lot Selection */}
        {!isDrawing && (
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
        )}

        {/* Drawing & Management Controls */}
        {selectedLot && !isDrawing && (
          <>
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

            {/* Color Selection - Only show if polygon exists */}
            {hasPolygon && (
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-3 flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Estado del Lote:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(LOT_COLORS).map(([key, color]) => (
                    <button
                      key={key}
                      className={`w-full h-8 rounded border-2 shadow-md hover:scale-105 transition-transform duration-200 flex items-center justify-center ${
                        currentColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-white'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => onColorChange(color)}
                      title={getColorName(color)}
                    >
                      <span className="text-xs text-white font-bold drop-shadow">
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
            )}
          </>
        )}

        {/* Instructions */}
        {!isDrawing && !selectedLot && (
          <div className="border-t pt-3">
            <div className="flex items-start">
              <Info className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Selecciona un lote y dibuja su polígono en el mapa para definir las áreas de pastoreo
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
