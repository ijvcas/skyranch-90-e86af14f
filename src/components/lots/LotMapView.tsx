
import React from 'react';
import WorkingGoogleMapDrawing from './WorkingGoogleMapDrawing';
import { type Lot } from '@/stores/lotStore';

interface LotMapViewProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotMapView = ({ lots, onLotSelect }: LotMapViewProps) => {
  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Mapa de Lotes con Dibujo de Polígonos
        </h2>
        <p className="text-gray-600">
          Sistema completo de dibujo usando Google Maps Drawing Tools
        </p>
      </div>
      
      <WorkingGoogleMapDrawing lots={lots} onLotSelect={onLotSelect} />
      
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-2">Instrucciones de Dibujo:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Selecciona un lote</strong> del dropdown para comenzar</li>
          <li>• <strong>Haz clic en "Dibujar Polígono"</strong> para activar el modo dibujo</li>
          <li>• <strong>El cursor cambiará a cruz</strong> cuando el modo dibujo esté activo</li>
          <li>• <strong>Haz clic en el mapa</strong> para crear cada punto del polígono</li>
          <li>• <strong>Cierra el polígono</strong> haciendo clic en el primer punto</li>
          <li>• <strong>El polígono se guardará automáticamente</strong> y aparecerá en el color del lote</li>
        </ul>
      </div>
    </div>
  );
};

export default LotMapView;
