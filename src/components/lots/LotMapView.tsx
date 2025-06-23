
import React from 'react';
import { type Lot } from '@/stores/lotStore';
import WorkingGoogleMapDrawing from './WorkingGoogleMapDrawing';

interface LotMapViewProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotMapView: React.FC<LotMapViewProps> = ({ lots, onLotSelect }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">Mapa de Lotes</h2>
        <p className="text-gray-600 text-sm mb-4">
          Visualiza y gestiona los polígonos de tus lotes de pastoreo. 
          Los lotes auto-generados aparecen en gris claro como referencia.
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
