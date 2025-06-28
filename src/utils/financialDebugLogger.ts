
import { formatCostPerSqm } from './financialFormatters';
import type { FinancialSummary } from './financialCalculations';
import type { CadastralParcel } from '@/services/cadastralService';

export const logFinancialCalculations = (summary: FinancialSummary, formatCurrency: (amount: number) => string): void => {
  // Detailed debugging for each parcel
  console.log('🔍 Detailed Parcel Breakdown for Cost/m² Calculation:');
  summary.validParcelsForCalculation.forEach((parcel, index) => {
    const parcelAreaSqm = (parcel.areaHectares || 0) * 10000;
    const parcelCostPerSqm = parcelAreaSqm > 0 ? (parcel.totalCost || 0) / parcelAreaSqm : 0;
    console.log(`📊 Parcel ${index + 1} (${parcel.lotNumber || parcel.parcelId}):`, {
      lotNumber: parcel.lotNumber,
      parcelId: parcel.parcelId,
      totalCost: parcel.totalCost,
      areaHectares: parcel.areaHectares,
      areaSqm: parcelAreaSqm,
      costPerSqm: parcelCostPerSqm,
      costPerSqmFormatted: formatCurrency(parcelCostPerSqm)
    });
  });

  // Summary calculation debug
  console.log('💰 Summary Calculation Debug:', {
    validParcelsCount: summary.validParcelsForCalculation.length,
    totalParcelsCount: summary.propiedadParcels.length,
    excludedParcels: summary.propiedadParcels.length - summary.validParcelsForCalculation.length,
    totalInvestment: summary.totalInvestment,
    totalOwnedArea: summary.totalOwnedArea,
    totalOwnedAreaSqm: summary.totalOwnedAreaSqm,
    avgCostPerSqm: summary.avgCostPerSqm,
    avgCostPerSqmFormatted: formatCurrency(summary.avgCostPerSqm),
    calculationFormula: `${summary.totalInvestment} ÷ ${summary.totalOwnedAreaSqm} = ${summary.avgCostPerSqm}`
  });

  // Log data integrity issues
  if (summary.parcelsWithoutCost.length > 0) {
    console.warn('⚠️ Parcels without cost data (excluded from calculation):', 
      summary.parcelsWithoutCost.map(p => ({ lotNumber: p.lotNumber, parcelId: p.parcelId, cost: p.totalCost }))
    );
  }

  if (summary.parcelsWithoutArea.length > 0) {
    console.warn('⚠️ Parcels without area data (excluded from calculation):', 
      summary.parcelsWithoutArea.map(p => ({ lotNumber: p.lotNumber, parcelId: p.parcelId, area: p.areaHectares }))
    );
  }

  // Log potential investment details
  summary.negotiatingParcels.forEach(parcel => {
    if (parcel.areaHectares) {
      if (parcel.totalCost && parcel.totalCost > 0) {
        console.log(`💰 Confirmed cost for ${parcel.lotNumber || parcel.parcelId}: ${formatCurrency(parcel.totalCost)}`);
      } else if (summary.avgCostPerSqm > 0) {
        const parcelAreaSqm = parcel.areaHectares * 10000;
        const estimatedCost = parcelAreaSqm * summary.avgCostPerSqm;
        console.log(`📊 Estimated cost for ${parcel.lotNumber || parcel.parcelId}: ${formatCurrency(estimatedCost)} (${parcel.areaHectares} ha × ${formatCostPerSqm(summary.avgCostPerSqm)}/m²)`);
      }
    }
  });

  console.log('🔮 Potential Investment Breakdown:', {
    confirmedPotentialInvestment: summary.confirmedPotentialInvestment,
    estimatedPotentialInvestment: summary.estimatedPotentialInvestment,
    totalPotentialInvestment: summary.potentialInvestment,
    potentialArea: summary.potentialArea,
    avgCostPerSqmUsed: summary.avgCostPerSqm,
    hasEstimatedCosts: summary.hasEstimatedCosts
  });
};
