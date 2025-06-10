
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, X, Eye, EyeOff } from 'lucide-react';

interface MapControlsProps {
  showControls: boolean;
  onToggleControls: () => void;
  showPolygons: boolean;
  showLabels: boolean;
  onTogglePolygons: () => void;
  onToggleLabels: () => void;
}

export const MapControls = ({
  showControls,
  onToggleControls,
  showPolygons,
  showLabels,
  onTogglePolygons,
  onToggleLabels
}: MapControlsProps) => {
  return (
    <>
      {/* Main Controls Toggle Button - Top Right */}
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-4 right-4 z-30 shadow-lg bg-background/95 backdrop-blur-sm"
        onClick={onToggleControls}
      >
        {showControls ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
        <span className="ml-2 hidden sm:inline">
          {showControls ? 'Ocultar' : 'Controles'}
        </span>
      </Button>

      {/* Simple Layer Controls */}
      {showControls && (
        <div className="absolute top-16 right-4 z-30 flex flex-col gap-2">
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
