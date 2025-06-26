
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, MapPin, Calculator } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';
import type { CadastralParcel } from '@/services/cadastralService';

interface FinancialSummaryCardProps {
  parcels: CadastralParcel[];
}

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({ parcels }) => {
  const { formatCurrency } = useTimezone();
  
  const propiedadParcels = parcels.filter(p => p.status === 'PROPIEDAD');
  const negotiatingParcels = parcels.filter(p => p.status === 'NEGOCIANDO');
  
  // Calculate totals for owned properties
  const totalInvestment = propiedadParcels.reduce((sum, p) => sum + (p.totalCost || 0), 0);
  const totalOwnedArea = propiedadParcels.reduce((sum, p) => sum + (p.areaHectares || 0), 0);
  const totalOwnedAreaSqm = totalOwnedArea * 10000;
  
  // Calculate averages
  const avgCostPerHectare = totalOwnedArea > 0 ? totalInvestment / totalOwnedArea : 0;
  const avgCostPerSqm = totalOwnedAreaSqm > 0 ? totalInvestment / totalOwnedAreaSqm : 0;
  
  // Potential investment (negotiating parcels)
  const potentialInvestment = negotiatingParcels.reduce((sum, p) => sum + (p.totalCost || 0), 0);
  const potentialArea = negotiatingParcels.reduce((sum, p) => sum + (p.areaHectares || 0), 0);

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  if (propiedadParcels.length === 0 && negotiatingParcels.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Resumen Financiero de Tierras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Owned Properties Summary */}
        {propiedadParcels.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2">Propiedades Adquiridas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Inversión Total</span>
                </div>
                <p className="text-xl font-bold text-green-900">
                  {formatCurrency(totalInvestment)}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Área Total</span>
                </div>
                <p className="text-xl font-bold text-blue-900">
                  {formatNumber(totalOwnedArea, 4)} ha
                </p>
                <p className="text-xs text-blue-700">
                  ({formatNumber(totalOwnedAreaSqm, 0)} m²)
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Costo/Hectárea</span>
                </div>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(avgCostPerHectare)}
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Costo/m²</span>
                </div>
                <p className="text-lg font-bold text-orange-900">
                  {formatCurrency(avgCostPerSqm)}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>📊 {propiedadParcels.length} parcela(s) en propiedad</p>
            </div>
          </div>
        )}

        {/* Negotiating Properties Summary */}
        {negotiatingParcels.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-gray-900">En Negociación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Inversión Potencial</span>
                </div>
                <p className="text-lg font-bold text-yellow-900">
                  {formatCurrency(potentialInvestment)}
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Área Potencial</span>
                </div>
                <p className="text-lg font-bold text-amber-900">
                  {formatNumber(potentialArea, 4)} ha
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-800">Parcelas</span>
                <p className="text-lg font-bold text-gray-900">
                  {negotiatingParcels.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Total Potential */}
        {propiedadParcels.length > 0 && negotiatingParcels.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg border-t">
            <h4 className="font-medium text-gray-900 mb-2">Proyección Total</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Inversión Total Proyectada:</span>
                <p className="font-semibold">{formatCurrency(totalInvestment + potentialInvestment)}</p>
              </div>
              <div>
                <span className="text-gray-600">Área Total Proyectada:</span>
                <p className="font-semibold">{formatNumber(totalOwnedArea + potentialArea, 4)} ha</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;
