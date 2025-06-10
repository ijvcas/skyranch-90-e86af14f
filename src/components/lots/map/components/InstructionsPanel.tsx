
import React from 'react';
import { Info } from 'lucide-react';

export const InstructionsPanel = () => {
  return (
    <div className="border-t pt-3">
      <div className="flex items-start">
        <Info className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Selecciona un lote y dibuja su polígono en el mapa para definir las áreas de pastoreo
        </p>
      </div>
    </div>
  );
};
