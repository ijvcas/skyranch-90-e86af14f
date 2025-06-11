
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Square, Edit, Trash2, Circle, X } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';

interface SimplePolygonControlsProps {
  lots: Lot[];
  selectedLotId: string;
  isDrawing: boolean;
  polygons: Array<{ lotId: string; color: string }>;
  onStartDrawing: (lotId: string) => void;
  onStopDrawing: () => void;
  onDeletePolygon: (lotId: string) => void;
  onLotSelect: (lotId: string) => void;
  getLotColor: (lot: Lot) => string;
}

const SimplePolygonControls = ({
  lots,
  selectedLotId,
  isDrawing,
  polygons,
  onStartDrawing,
  onStopDrawing,
  onDeletePolygon,
  onLotSelect,
  getLotColor
}: SimplePolygonControlsProps) => {
  const [internalSelectedLotId, setInternalSelectedLotId] = useState<string>(selectedLotId || '');
  
  const selectedLot = lots.find(l => l.id === internalSelectedLotId);
  const hasPolygon = polygons.some(p => p.lotId === internalSelectedLotId);

  const handleLotSelection = (lotId: string) => {
    setInternalSelectedLotId(lotId);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'resting': return 'Descanso';
      case 'maintenance': return 'Mantenimiento';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'resting': return 'bg-amber-100 text-amber-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="absolute top-4 left-4 w-80 z-30 shadow-lg bg-white/95">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Square className="w-5 h-5 mr-2 text-green-600" />
          Control de Polígonos
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Lot Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Seleccionar Lote</label>
          <Select value={internalSelectedLotId} onValueChange={handleLotSelection}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un lote" />
            </SelectTrigger>
            <SelectContent>
              {lots.map((lot) => (
                <SelectItem key={lot.id} value={lot.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Circle 
                        className="w-3 h-3 mr-2" 
                        style={{ fill: getLotColor(lot), color: getLotColor(lot) }}
                      />
                      <span>{lot.name}</span>
                    </div>
                    <Badge className={`ml-2 text-xs ${getStatusColor(lot.status)}`}>
                      {getStatusLabel(lot.status)}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Lot Info */}
        {selectedLot && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{selectedLot.name}</h4>
              <Badge className={`${getStatusColor(selectedLot.status)} text-xs`}>
                {getStatusLabel(selectedLot.status)}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Circle 
                className="w-3 h-3 mr-2" 
                style={{ 
                  fill: getLotColor(selectedLot), 
                  color: getLotColor(selectedLot)
                }} 
              />
              <span>Color del polígono</span>
            </div>
          </div>
        )}

        {/* Drawing Controls */}
        <div className="space-y-3">
          {!isDrawing ? (
            <div className="space-y-2">
              <Button
                onClick={() => internalSelectedLotId && onStartDrawing(internalSelectedLotId)}
                disabled={!internalSelectedLotId}
                className={`w-full ${
                  hasPolygon 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Edit className="w-4 h-4 mr-2" />
                {hasPolygon ? 'Redibujar Polígono' : 'Dibujar Polígono'}
              </Button>
              
              {hasPolygon && (
                <Button
                  onClick={() => onDeletePolygon(internalSelectedLotId)}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Polígono
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                  <p className="text-sm font-medium text-blue-800">
                    Modo Dibujo Activo
                  </p>
                </div>
                <p className="text-xs text-blue-700">
                  Haz clic en el mapa para crear puntos del polígono. 
                  Cierra el polígono haciendo clic en el primer punto.
                </p>
              </div>
              
              <Button
                onClick={onStopDrawing}
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar Dibujo
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="pt-3 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total de lotes:</span>
            <span className="font-medium">{lots.length}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Polígonos dibujados:</span>
            <span className="font-medium text-green-600">{polygons.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplePolygonControls;
