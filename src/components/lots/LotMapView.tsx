
import React, { useState, useEffect } from 'react';
import { type Lot } from '@/stores/lotStore';
import WorkingGoogleMapDrawing from './WorkingGoogleMapDrawing';
import LotVisibilityControls from './controls/LotVisibilityControls';

interface LotMapViewProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotMapView = ({ lots, onLotSelect }: LotMapViewProps) => {
  const [visibleLotIds, setVisibleLotIds] = useState<string[]>([]);

  // Initialize with all lots visible and save/load preferences
  useEffect(() => {
    const savedVisibility = localStorage.getItem('lotMapVisibility');
    if (savedVisibility) {
      try {
        const parsed = JSON.parse(savedVisibility);
        // Only use saved visibility for lots that still exist
        const validLotIds = parsed.filter((id: string) => lots.some(lot => lot.id === id));
        setVisibleLotIds(validLotIds);
      } catch (error) {
        console.error('Error loading lot visibility preferences:', error);
        setVisibleLotIds(lots.map(lot => lot.id));
      }
    } else {
      // Default: show all lots
      setVisibleLotIds(lots.map(lot => lot.id));
    }
  }, [lots]);

  // Save visibility preferences when changed
  useEffect(() => {
    localStorage.setItem('lotMapVisibility', JSON.stringify(visibleLotIds));
  }, [visibleLotIds]);

  // Simple color generator for lots
  const getLotColor = (lotId: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];
    const index = lots.findIndex(lot => lot.id === lotId);
    return colors[index % colors.length];
  };

  // Filter lots to only show visible ones
  const visibleLots = lots.filter(lot => visibleLotIds.includes(lot.id));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Mapa Interactivo de Lotes</h3>
        <p className="text-sm text-gray-600 mb-4">
          Haz clic en "Dibujar" para crear polígonos que representen los límites de cada lote. 
          Los polígonos se guardan automáticamente en la base de datos. Usa los controles de visibilidad para mostrar u ocultar lotes específicos.
        </p>
      </div>
      
      <div className="relative">
        <WorkingGoogleMapDrawing 
          lots={visibleLots} 
          onLotSelect={onLotSelect} 
        />
        
        <LotVisibilityControls
          lots={lots}
          visibleLotIds={visibleLotIds}
          onVisibilityChange={setVisibleLotIds}
          getLotColor={getLotColor}
        />
      </div>
    </div>
  );
};

export default LotMapView;
