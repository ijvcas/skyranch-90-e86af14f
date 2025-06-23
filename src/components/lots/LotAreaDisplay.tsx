
import React from 'react';
import { type Lot } from '@/stores/lotStore';
import { usePolygonUtils } from '@/hooks/polygon/usePolygonUtils';

interface LotAreaDisplayProps {
  lot: Lot;
  polygonArea?: number;
  showPolygonHint?: boolean;
}

const LotAreaDisplay = ({ lot, polygonArea, showPolygonHint = false }: LotAreaDisplayProps) => {
  const { formatArea } = usePolygonUtils();
  
  // Safety check to prevent undefined errors
  if (!lot) {
    return (
      <div className="text-sm text-gray-400 italic">
        Área: No definida
      </div>
    );
  }
  
  // Use the polygon area if available and different from the stored area
  const hasPolygonArea = polygonArea !== undefined && polygonArea > 0;
  const hasStoredArea = lot.sizeHectares !== undefined && lot.sizeHectares > 0;
  const areasMatch = hasPolygonArea && hasStoredArea && 
    Math.abs(polygonArea - lot.sizeHectares!) < 0.01; // Allow small differences
  
  // Style for highlighted calculated area (when different from stored)
  const calculatedAreaStyle = hasPolygonArea && hasStoredArea && !areasMatch
    ? "font-medium text-amber-600"
    : "font-medium text-gray-600";
    
  return (
    <div className="text-sm space-y-1">
      {/* Show only one area display - prioritize polygon area if available */}
      {hasPolygonArea ? (
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Área:</span>
          <span className={calculatedAreaStyle}>{formatArea(polygonArea)}</span>
        </div>
      ) : hasStoredArea ? (
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Área:</span>
          <span className="font-medium text-gray-600">{formatArea(lot.sizeHectares)}</span>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Área:</span>
          <span className="text-gray-400 italic">No definida</span>
        </div>
      )}
      
      {showPolygonHint && !hasPolygonArea && (
        <div className="text-xs text-gray-400 italic">
          Dibuja un polígono para calcular el área
        </div>
      )}
    </div>
  );
};

export default LotAreaDisplay;
