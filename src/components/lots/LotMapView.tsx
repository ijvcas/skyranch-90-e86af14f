
import React, { useState, useMemo } from 'react';
import { type Lot } from '@/stores/lotStore';
import LotMapViewModeControls, { type MapViewMode } from './LotMapViewModeControls';
import CleanGoogleMapWithDrawing from './CleanGoogleMapWithDrawing';

interface LotMapViewProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotMapView: React.FC<LotMapViewProps> = ({ lots, onLotSelect }) => {
  const [viewMode, setViewMode] = useState<MapViewMode>('combined');

  // Separate lots by type
  const { propertyLots, pastureLots } = useMemo(() => {
    const propertyLots = lots.filter(lot => lot.lotType === 'property');
    const pastureLots = lots.filter(lot => lot.lotType === 'pasture');
    return { propertyLots, pastureLots };
  }, [lots]);

  // Filter lots based on view mode
  const visibleLots = useMemo(() => {
    switch (viewMode) {
      case 'property':
        return propertyLots;
      case 'pasture':
        return pastureLots;
      case 'combined':
      default:
        return lots;
    }
  }, [lots, propertyLots, pastureLots, viewMode]);

  return (
    <div className="space-y-4">
      <LotMapViewModeControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        propertyLotsCount={propertyLots.length}
        pastureLotsCount={pastureLots.length}
      />
      
      <div className="h-[600px] w-full border rounded-lg overflow-hidden">
        <CleanGoogleMapWithDrawing 
          lots={visibleLots}
          onLotSelect={onLotSelect}
          mapMode={viewMode}
          propertyLots={propertyLots}
          pastureLots={pastureLots}
        />
      </div>
      
      {viewMode === 'property' && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          💡 <strong>Vista de Propiedad:</strong> Mostrando límites fijos de la propiedad basados en datos catastrales. 
          Estos límites definen el área disponible para crear lotes de pastoreo.
        </div>
      )}
      
      {viewMode === 'pasture' && (
        <div className="text-sm text-gray-600 bg-green-50 p-3 rounded">
          🎯 <strong>Modo Diseño de Pastoreo:</strong> Crea y edita lotes de pastoreo dentro de los límites de tu propiedad. 
          Estos lotes son totalmente editables para optimizar el manejo ganadero.
        </div>
      )}
    </div>
  );
};

export default LotMapView;
