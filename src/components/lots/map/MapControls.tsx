
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
      {/* Main Controls Toggle Button - Bottom Left to avoid Google Maps controls */}
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

      {/* North Indicator & Rotation Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        {/* North Indicator */}
        <div className="bg-background/95 backdrop-blur-sm shadow-lg rounded-lg p-2 flex items-center justify-center">
          <Compass 
            className="w-6 h-6 text-primary" 
            style={{ transform: `rotate(${-mapRotation}deg)` }}
          />
          <span className="ml-1 text-xs font-bold">N</span>
        </div>
        
        {/* Reset Rotation Button */}
        {onResetRotation && Math.abs(mapRotation) > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetRotation}
            className="bg-background/95 backdrop-blur-sm shadow-lg"
            title="Resetear rotación"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Layer Controls */}
      {showControls && (
        <div className="absolute bottom-16 left-4 z-30 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePolygons}
            className="bg-background/95 backdrop-blur-sm shadow-lg"
          >
            {showPolygons ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="ml-2">Polígonos</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleLabels}
            className="bg-background/95 backdrop-blur-sm shadow-lg"
          >
            {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="ml-2">Etiquetas</span>
          </Button>
        </div>
      )}
    </>
  );
};
