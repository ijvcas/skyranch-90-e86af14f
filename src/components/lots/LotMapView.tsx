
import React from 'react';
import NewGoogleMapWithDrawing from './NewGoogleMapWithDrawing';
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
          Mapa de Lotes con Control de Polígonos
        </h2>
        <p className="text-gray-600">
          Dibuja polígonos para cada lote usando las herramientas de Google Maps
        </p>
      </div>
      
      <NewGoogleMapWithDrawing lots={lots} onLotSelect={onLotSelect} />
      
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-2">Instrucciones:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Selecciona un lote</strong> del dropdown para comenzar</li>
          <li>• <strong>Haz clic en "Dibujar Polígono"</strong> para activar las herramientas de Google Maps</li>
          <li>• <strong>Haz clic en el mapa</strong> para crear puntos del polígono</li>
          <li>• <strong>Cierra el polígono</strong> haciendo clic en el primer punto</li>
          <li>• Los colores cambian automáticamente según el estado del lote:</li>
          <li className="ml-4">- <span className="text-emerald-600 font-medium">Verde</span>: Lotes activos</li>
          <li className="ml-4">- <span className="text-amber-600 font-medium">Amarillo</span>: Lotes en descanso</li>
          <li className="ml-4">- <span className="text-red-600 font-medium">Rojo</span>: Lotes en mantenimiento</li>
        </ul>
      </div>
    </div>
  );
};

export default LotMapView;
