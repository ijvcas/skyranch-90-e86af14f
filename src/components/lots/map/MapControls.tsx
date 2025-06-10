
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Layers, Settings, X, Palette } from 'lucide-react';
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
  onToggleLayer: (layerName: 'lots' | 'labels') => void;
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
        className="absolute top-4 left-4 z-30 shadow-lg"
        onClick={onToggleControls}
      >
        {showControls ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
      </Button>

      {/* Layer Controls */}
      {showControls && (
        <Card className="absolute top-4 left-16 z-30 shadow-lg max-w-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              SkyRanch - Gestión de Lotes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleLayer('lots')}
                className={selectedLayers.lots ? 'bg-green-50' : ''}
              >
                <Layers className="w-4 h-4 mr-1" />
                Lotes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleLayer('labels')}
                className={selectedLayers.labels ? 'bg-blue-50' : ''}
              >
                <Palette className="w-4 h-4 mr-1" />
                Números
              </Button>
            </div>
            
            {selectedLot && (
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">
                  Lote {REAL_LOT_BOUNDARIES.find(l => l.id === selectedLot)?.number} - Color:
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {Object.entries(LOT_COLORS).map(([key, color]) => (
                    <button
                      key={key}
                      className="w-8 h-8 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => onUpdateLotColor(selectedLot, color)}
                      title={key}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export const MapLegend = ({ showControls }: { showControls: boolean }) => {
  if (!showControls) return null;

  return (
    <Card className="absolute bottom-4 left-4 z-30 shadow-lg">
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="bg-green-50">
            <div className="w-2 h-2 bg-green-500 rounded mr-1"></div>
            Pastoreo
          </Badge>
          <Badge variant="outline" className="bg-yellow-50">
            <div className="w-2 h-2 bg-yellow-500 rounded mr-1"></div>
            Descanso
          </Badge>
          <Badge variant="outline" className="bg-red-50">
            <div className="w-2 h-2 bg-red-500 rounded mr-1"></div>
            Mantenimiento
          </Badge>
          <Badge variant="outline" className="bg-purple-50">
            <div className="w-2 h-2 bg-purple-500 rounded mr-1"></div>
            Preparación
          </Badge>
          <Badge variant="outline" className="bg-cyan-50">
            <div className="w-2 h-2 bg-cyan-500 rounded mr-1"></div>
            Reservado
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
