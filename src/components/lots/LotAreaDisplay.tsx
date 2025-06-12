
import React from 'react';
import { type Lot } from '@/stores/lotStore';
import { usePolygonUtils } from '@/hooks/polygon/usePolygonUtils';

interface LotAreaDisplayProps {
  lot: Lot;
  calculatedArea?: number;
}

const LotAreaDisplay = ({ lot, calculatedArea }: LotAreaDisplayProps) => {
  const { formatArea } = usePolygonUtils();
  
  // Use the calculated area if available and different from the stored area
  const hasCalculatedArea = calculatedArea !== undefined && calculatedArea > 0;
  const hasStoredArea = lot.sizeHectares !== undefined && lot.sizeHectares > 0;
  const areasMatch = hasCalculatedArea && hasStoredArea && 
    Math.abs(calculatedArea - lot.sizeHectares!) < 0.01; // Allow small differences
  
  // Style for highlighted calculated area (when different from stored)
  const calculatedAreaStyle = hasCalculatedArea && hasStoredArea && !areasMatch
    ? "font-medium text-amber-600"
    : "font-medium text-gray-600";
    
  return (
    <div className="text-sm space-y-1">
      {/* Show only one area display - prioritize calculated area if available */}
      {hasCalculatedArea ? (
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Área:</span>
          <span className={calculatedAreaStyle}>{formatArea(calculatedArea)}</span>
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
    </div>
  );
};

export default LotAreaDisplay;
