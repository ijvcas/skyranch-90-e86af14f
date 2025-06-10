
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, X, Eye, EyeOff, Compass, RotateCcw } from 'lucide-react';

interface MapControlsProps {
  showControls: boolean;
  onToggleControls: () => void;
  showPolygons: boolean;
  showLabels: boolean;
  onTogglePolygons: () => void;
  onToggleLabels: () => void;
  onResetRotation?: () => void;
  mapRotation?: number;
}

export const MapControls = ({
  showControls,
  onToggleControls,
  showPolygons,
  showLabels,
  onTogglePolygons,
  onToggleLabels,
  onResetRotation,
  mapRotation = 0
}: MapControlsProps) => {
  return (
    <>
      {/* Main Controls Toggle Button - Bottom Left */}
      <Button
        variant="secondary"
        size="sm"
        className="absolute bottom-4 left-4 z-30 shadow-lg bg-background/95 backdrop-blur-sm"
        onClick={onToggleControls}
      >
        {showControls ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
        <span className="ml-2 hidden sm:inline">
          {showControls ? 'Ocultar' : 'Controles'}
        </span>
      </Button>

      {/* North Indicator & Reset - Positioned below Google's controls on the right */}
      <div className="absolute top-32 right-4 z-30 flex flex-col gap-2">
        {/* North Indicator - always visible */}
        <div className="bg-background/95 backdrop-blur-sm shadow-lg rounded-lg p-2 flex items-center justify-center border">
          <Compass 
            className="w-6 h-6 text-primary transition-transform duration-300" 
            style={{ transform: `rotate(${-mapRotation}deg)` }}
          />
          <span className="ml-1 text-xs font-bold">N</span>
        </div>
        
        {/* Reset Rotation Button - show when rotated more than 5 degrees */}
        {onResetRotation && Math.abs(mapRotation) > 5 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetRotation}
            className="bg-background/95 backdrop-blur-sm shadow-lg border"
            title="Resetear rotación al norte"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Layer Controls - show when controls are visible */}
      {showControls && (
        <div className="absolute bottom-16 left-4 z-30 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePolygons}
            className="bg-background/95 backdrop-blur-sm shadow-lg border"
          >
            {showPolygons ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="ml-2">Polígonos</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleLabels}
            className="bg-background/95 backdrop-blur-sm shadow-lg border"
          >
            {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="ml-2">Etiquetas</span>
          </Button>
        </div>
      )}

      {/* Rotation Instructions - show briefly when controls are first shown */}
      {showControls && (
        <div className="absolute top-4 left-4 z-30 bg-blue-50/95 backdrop-blur-sm border border-blue-200 rounded-lg p-3 max-w-sm">
          <p className="text-xs text-blue-800">
            <strong>Rotar mapa:</strong> Mantén Shift + clic y arrastra, o usa dos dedos en móvil
          </p>
        </div>
      )}
    </>
  );
};
