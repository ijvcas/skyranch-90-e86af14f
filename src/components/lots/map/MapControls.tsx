
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Layers, Settings, X, Palette, Ruler } from 'lucide-react';
import { LOT_COLORS, REAL_LOT_BOUNDARIES } from './mapConstants';

interface MapControlsProps {
  showControls: boolean;
  selectedLayers: {
    lots: boolean;
    labels: boolean;
  };
  selectedLot: string | null;
  lotColors: Record<string, string>;
  onToggleControls: () => void;
  onToggleLayer: (layerName: 'lots' | 'labels' | 'areas') => void;
  onUpdateLotColor: (lotId: string, color: string) => void;
}

export const MapControls = ({
  showControls,
  selectedLayers,
  selectedLot,
  lotColors,
  onToggleControls,
  onToggleLayer,
  onUpdateLotColor
}: MapControlsProps) => {
  return (
    <>
      {/* Controls Toggle Button */}
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-4 left-4 z-30 shadow-lg bg-background/95 backdrop-blur-sm"
        onClick={onToggleControls}
      >
        {showControls ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
        <span className="ml-2 hidden sm:inline">
          {showControls ? 'Ocultar' : 'Controles'}
        </span>
      </Button>

      {/* Enhanced Layer Controls */}
      {showControls && (
        <Card className="absolute top-4 left-16 z-30 shadow-xl max-w-sm bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              SkyRanch - Gestión Avanzada de Lotes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleLayer('lots')}
                className={selectedLayers.lots ? 'bg-green-50 border-green-200' : ''}
              >
                <Layers className="w-4 h-4 mr-1" />
                Polígonos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleLayer('labels')}
                className={selectedLayers.labels ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Palette className="w-4 h-4 mr-1" />
                Números
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleLayer('areas')}
                className="bg-purple-50 border-purple-200"
              >
                <Ruler className="w-4 h-4 mr-1" />
                Áreas
              </Button>
            </div>
            
            {selectedLot && (
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-3">
                  Lote {REAL_LOT_BOUNDARIES.find(l => l.id === selectedLot)?.number} - Estado de Uso:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(LOT_COLORS).map(([key, color]) => (
                    <button
                      key={key}
                      className="w-12 h-12 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-all duration-200 flex items-center justify-center"
                      style={{ backgroundColor: color }}
                      onClick={() => onUpdateLotColor(selectedLot, color)}
                      title={key === 'grazing' ? 'Pastoreo Activo' : 
                            key === 'resting' ? 'Descanso/Recuperación' : 
                            key === 'maintenance' ? 'Mantenimiento' :
                            key === 'preparation' ? 'Preparado para Rotación' :
                            key === 'reserved' ? 'Reservado/Uso Especial' : 'Estado por defecto'}
                    >
                      <span className="text-xs text-white font-bold">
                        {key === 'grazing' ? 'PA' : 
                         key === 'resting' ? 'DR' : 
                         key === 'maintenance' ? 'M' :
                         key === 'preparation' ? 'PR' :
                         key === 'reserved' ? 'RE' : 'D'}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>PA: Pastoreo Activo | DR: Descanso/Recuperación</p>
                  <p>M: Mantenimiento | PR: Preparado | RE: Reservado</p>
                </div>
              </div>
            )}

            {/* Area Information */}
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">
                💡 Haz clic en cualquier lote para ver su área y seleccionarlo
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export const MapLegend = ({ showControls }: { showControls: boolean }) => {
  if (!showControls) return null;

  return (
    <Card className="absolute bottom-4 left-4 z-30 shadow-xl bg-background/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <h4 className="text-sm font-medium mb-2">Estados de Uso de Lotes</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Badge variant="outline" className="bg-green-50 border-green-200 justify-start">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            Pastoreo Activo
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 border-yellow-200 justify-start">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            Descanso/Recuperación
          </Badge>
          <Badge variant="outline" className="bg-red-50 border-red-200 justify-start">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            Mantenimiento
          </Badge>
          <Badge variant="outline" className="bg-purple-50 border-purple-200 justify-start">
            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
            Preparado para Rotación
          </Badge>
          <Badge variant="outline" className="bg-cyan-50 border-cyan-200 justify-start">
            <div className="w-3 h-3 bg-cyan-500 rounded mr-2"></div>
            Reservado/Uso Especial
          </Badge>
          <Badge variant="outline" className="bg-gray-50 border-gray-200 justify-start">
            <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
            Estado por defecto
          </Badge>
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          <p>🗺️ Google Maps Satellite | 📏 Mediciones de área automáticas</p>
        </div>
      </CardContent>
    </Card>
  );
};
