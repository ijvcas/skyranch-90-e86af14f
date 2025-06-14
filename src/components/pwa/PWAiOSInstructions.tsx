
import React from 'react';
import { Share } from 'lucide-react';

const PWAiOSInstructions = () => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700 flex items-center">
        <Share className="w-4 h-4 mr-2 text-blue-600" />
        Toca el botón de compartir <strong>↗</strong> y selecciona "Añadir a pantalla de inicio"
      </p>
    </div>
  );
};

export default PWAiOSInstructions;
