
import React from 'react';
import { Palette } from 'lucide-react';
import { LOT_COLORS } from '../mapConstants';

interface ColorSelectionProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

export const ColorSelection = ({ currentColor, onColorChange }: ColorSelectionProps) => {
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
  );
};
