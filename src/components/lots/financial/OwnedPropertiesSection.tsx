
import React from 'react';
import { Euro, MapPin, Calculator, TrendingUp } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';
import { formatNumber, formatCostPerSqm } from '@/utils/financialFormatters';
import type { FinancialSummary } from '@/utils/financialCalculations';

interface OwnedPropertiesSectionProps {
  summary: FinancialSummary;
}

const OwnedPropertiesSection: React.FC<OwnedPropertiesSectionProps> = ({ summary }) => {
  const { formatCurrency } = useTimezone();

  if (summary.propiedadParcels.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 border-b pb-2">Propiedades Adquiridas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Inversión Total</span>
          </div>
          <p className="text-xl font-bold text-green-900">
            {formatCurrency(summary.totalInvestment)}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Área Total</span>
          </div>
          <p className="text-xl font-bold text-blue-900">
            {formatNumber(summary.totalOwnedArea, 4)} ha
          </p>
          <p className="text-xs text-blue-700">
            ({formatNumber(summary.totalOwnedAreaSqm, 0)} m²)
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Costo/Hectárea</span>
          </div>
          <p className="text-lg font-bold text-purple-900">
            {formatCurrency(summary.avgCostPerHectare)}
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Costo/m²</span>
          </div>
          <p className="text-lg font-bold text-orange-900">
            {formatCostPerSqm(summary.avgCostPerSqm)}
          </p>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>📊 {summary.validParcelsForCalculation.length} de {summary.propiedadParcels.length} parcela(s) incluidas en cálculo</p>
        {summary.validParcelsForCalculation.length !== summary.propiedadParcels.length && (
          <p className="text-amber-600">
            ⚠️ {summary.propiedadParcels.length - summary.validParcelsForCalculation.length} parcela(s) excluidas por falta de datos de costo o área
          </p>
        )}
      </div>
    </div>
  );
};

export default OwnedPropertiesSection;
