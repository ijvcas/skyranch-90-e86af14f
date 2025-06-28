
import React from 'react';
import { Euro, MapPin } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';
import { formatNumber, formatCostPerSqm } from '@/utils/financialFormatters';
import type { FinancialSummary } from '@/utils/financialCalculations';

interface NegotiatingPropertiesSectionProps {
  summary: FinancialSummary;
}

const NegotiatingPropertiesSection: React.FC<NegotiatingPropertiesSectionProps> = ({ summary }) => {
  const { formatCurrency } = useTimezone();

  if (summary.negotiatingParcels.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-medium text-gray-900">En Negociación</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {summary.hasEstimatedCosts ? 'Inversión Potencial (Estimada)' : 'Inversión Potencial'}
            </span>
          </div>
          <p className="text-lg font-bold text-yellow-900">
            {formatCurrency(summary.potentialInvestment)}
          </p>
          {summary.hasEstimatedCosts && summary.avgCostPerSqm > 0 && (
            <p className="text-xs text-yellow-700 mt-1">
              Basado en {formatCostPerSqm(summary.avgCostPerSqm)}/m²
            </p>
          )}
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Área Potencial</span>
          </div>
          <p className="text-lg font-bold text-amber-900">
            {formatNumber(summary.potentialArea, 4)} ha
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-sm font-medium text-gray-800">Parcelas</span>
          <p className="text-lg font-bold text-gray-900">
            {summary.negotiatingParcels.length}
          </p>
        </div>
      </div>

      {/* Breakdown of confirmed vs estimated costs */}
      {(summary.confirmedPotentialInvestment > 0 || summary.estimatedPotentialInvestment > 0) && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Desglose de Inversión Potencial:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {summary.confirmedPotentialInvestment > 0 && (
              <div>
                <span className="text-blue-600">Confirmada:</span>
                <span className="font-semibold ml-1">{formatCurrency(summary.confirmedPotentialInvestment)}</span>
              </div>
            )}
            {summary.estimatedPotentialInvestment > 0 && (
              <div>
                <span className="text-blue-600">Estimada:</span>
                <span className="font-semibold ml-1">{formatCurrency(summary.estimatedPotentialInvestment)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NegotiatingPropertiesSection;
