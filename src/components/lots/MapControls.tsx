
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Square, Circle } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';

interface MapControlsProps {
  lots: Lot[];
  selectedLotId: string;
  isDrawing: boolean;
  lotPolygons: Array<{ lotId: string; polygon: google.maps.Polygon; color: string }>;
  onStartDrawing: (lotId: string) => void;
  onDeletePolygon: (lotId: string) => void;
  onResetView: () => void;
  onCancelDrawing: () => void;
}

const MapControls = ({
  lots,
  selectedLotId,
  isDrawing,
  lotPolygons,
  onStartDrawing,
  onDeletePolygon,
  onResetView,
  onCancelDrawing
}: MapControlsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resting': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedLot = lots.find(l => l.id === selectedLotId);
  const hasPolygon = lotPolygons.some(lp => lp.lotId === selectedLotId);

  return (
    <>
      {/* Top Left Controls - positioned to avoid Google's native controls */}
      <Card className="absolute top-4 left-4 w-80 z-10 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Square className="w-5 h-5 mr-2" />
            Control de Polígonos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lot Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Seleccionar Lote</label>
            <Select value={selectedLotId} onValueChange={() => {}}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un lote para dibujar" />
              </SelectTrigger>
              <SelectContent>
                {lots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{lot.name}</span>
                      <Badge className={`ml-2 ${getStatusColor(lot.status)}`}>
                        {lot.status === 'active' ? 'Activo' : 
                         lot.status === 'resting' ? 'Descanso' : 'Mantenimiento'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Lot Info */}
          {selectedLot && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{selectedLot.name}</h4>
                <Badge className={getStatusColor(selectedLot.status)}>
                  {selectedLot.status === 'active' ? 'Activo' : 
                   selectedLot.status === 'resting' ? 'Descanso' : 'Mantenimiento'}
                </Badge>
              </div>
              {selectedLot.description && (
                <p className="text-sm text-gray-600 mb-2">{selectedLot.description}</p>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Circle 
                  className="w-3 h-3 mr-1" 
                  style={{ 
                    fill: selectedLot.status === 'active' ? '#22c55e' : 
                          selectedLot.status === 'resting' ? '#eab308' : '#ef4444'
                  }} 
                />
                Color del polígono
              </div>
            </div>
          )}

          {/* Drawing Controls */}
          <div className="space-y-2">
            {!isDrawing ? (
              <div className="space-y-2">
                <Button
                  onClick={() => selectedLotId && onStartDrawing(selectedLotId)}
                  disabled={!selectedLotId}
                  className="w-full"
                  variant={hasPolygon ? "outline" : "default"}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  {hasPolygon ? 'Redibujar Polígono' : 'Dibujar Polígono'}
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
                    Haz clic en el mapa para crear los puntos del polígono. 
                    Haz clic en el primer punto para cerrar la forma.
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

          {/* Utility Controls */}
          <div className="pt-2 border-t">
            <Button
              onClick={onResetView}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Centrar en SkyRanch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Polygon Status List - Bottom Left */}
      {lotPolygons.length > 0 && (
        <Card className="absolute bottom-4 left-4 w-80 z-10 shadow-lg max-h-48 overflow-y-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Polígonos Dibujados ({lotPolygons.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lotPolygons.map((lp) => {
              const lot = lots.find(l => l.id === lp.lotId);
              return lot ? (
                <div key={lp.lotId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <Circle 
                      className="w-3 h-3 mr-2" 
                      style={{ fill: lp.color }} 
                    />
                    <span className="text-sm font-medium">{lot.name}</span>
                  </div>
                  <Button
                    onClick={() => onDeletePolygon(lp.lotId)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ) : null;
            })}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default MapControls;
