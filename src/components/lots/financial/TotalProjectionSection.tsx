
import React from 'react';
import { useTimezone } from '@/hooks/useTimezone';
import { formatNumber } from '@/utils/financialFormatters';
import type { FinancialSummary } from '@/utils/financialCalculations';

interface TotalProjectionSectionProps {
  summary: FinancialSummary;
}

const TotalProjectionSection: React.FC<TotalProjectionSectionProps> = ({ summary }) => {
  const { formatCurrency } = useTimezone();

  if (summary.propiedadParcels.length === 0 || summary.negotiatingParcels.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg border-t">
      <h4 className="font-medium text-gray-900 mb-2">Proyección Total</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Inversión Total Proyectada:</span>
          <p className="font-semibold">{formatCurrency(summary.totalInvestment + summary.potentialInvestment)}</p>
        </div>
        <div>
          <span className="text-gray-600">Área Total Proyectada:</span>
          <p className="font-semibold">{formatNumber(summary.totalOwnedArea + summary.potentialArea, 4)} ha</p>
        </div>
      </div>
    </div>
  );
};

export default TotalProjectionSection;
