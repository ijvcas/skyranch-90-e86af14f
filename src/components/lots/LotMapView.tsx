
import React from 'react';
import { type Lot } from '@/stores/lotStore';
import WorkingGoogleMapDrawing from './WorkingGoogleMapDrawing';

interface LotMapViewProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotMapView = ({ lots, onLotSelect }: LotMapViewProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Mapa Interactivo de Lotes</h3>
        <p className="text-sm text-gray-600 mb-4">
          Haz clic en "Dibujar" para crear polígonos que representen los límites de cada lote. 
          Los polígonos se guardan automáticamente en la base de datos.
        </p>
      </div>
      
      <WorkingGoogleMapDrawing 
        lots={lots} 
        onLotSelect={onLotSelect} 
      />
    </div>
  );
};

export default LotMapView;
