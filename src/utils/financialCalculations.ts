
import type { CadastralParcel } from '@/services/cadastralService';

export interface FinancialSummary {
  // Owned properties data
  propiedadParcels: CadastralParcel[];
  validParcelsForCalculation: CadastralParcel[];
  totalInvestment: number;
  totalOwnedArea: number;
  totalOwnedAreaSqm: number;
  avgCostPerHectare: number;
  avgCostPerSqm: number;
  
  // Negotiating properties data
  negotiatingParcels: CadastralParcel[];
  potentialInvestment: number;
  confirmedPotentialInvestment: number;
  estimatedPotentialInvestment: number;
  potentialArea: number;
  hasEstimatedCosts: boolean;
  
  // Data quality info
  parcelsWithoutCost: CadastralParcel[];
  parcelsWithoutArea: CadastralParcel[];
}

export const calculateFinancialSummary = (parcels: CadastralParcel[]): FinancialSummary => {
  const propiedadParcels = parcels.filter(p => p.status === 'PROPIEDAD');
  const negotiatingParcels = parcels.filter(p => p.status === 'NEGOCIANDO');
  
  // Filter parcels that have both cost and area data for accurate calculation
  const validParcelsForCalculation = propiedadParcels.filter(p => 
    p.totalCost && p.totalCost > 0 && p.areaHectares && p.areaHectares > 0
  );
  
  // Calculate totals for owned properties (only valid parcels)
  const totalInvestment = validParcelsForCalculation.reduce((sum, p) => sum + (p.totalCost || 0), 0);
  const totalOwnedArea = validParcelsForCalculation.reduce((sum, p) => sum + (p.areaHectares || 0), 0);
  const totalOwnedAreaSqm = totalOwnedArea * 10000;
  
  // Calculate averages with validation
  const avgCostPerHectare = totalOwnedArea > 0 ? totalInvestment / totalOwnedArea : 0;
  const avgCostPerSqm = totalOwnedAreaSqm > 0 ? totalInvestment / totalOwnedAreaSqm : 0;
  
  // Enhanced potential investment calculation
  let potentialInvestment = 0;
  let confirmedPotentialInvestment = 0;
  let estimatedPotentialInvestment = 0;
  let potentialArea = 0;
  let hasEstimatedCosts = false;
  
  negotiatingParcels.forEach(parcel => {
    if (parcel.areaHectares) {
      potentialArea += parcel.areaHectares;
      
      if (parcel.totalCost && parcel.totalCost > 0) {
        confirmedPotentialInvestment += parcel.totalCost;
      } else if (avgCostPerSqm > 0) {
        const parcelAreaSqm = parcel.areaHectares * 10000;
        const estimatedCost = parcelAreaSqm * avgCostPerSqm;
        estimatedPotentialInvestment += estimatedCost;
        hasEstimatedCosts = true;
      }
    }
  });
  
  potentialInvestment = confirmedPotentialInvestment + estimatedPotentialInvestment;
  
  // Check for data integrity issues
  const parcelsWithoutCost = propiedadParcels.filter(p => !p.totalCost || p.totalCost <= 0);
  const parcelsWithoutArea = propiedadParcels.filter(p => !p.areaHectares || p.areaHectares <= 0);
  
  return {
    propiedadParcels,
    validParcelsForCalculation,
    totalInvestment,
    totalOwnedArea,
    totalOwnedAreaSqm,
    avgCostPerHectare,
    avgCostPerSqm,
    negotiatingParcels,
    potentialInvestment,
    confirmedPotentialInvestment,
    estimatedPotentialInvestment,
    potentialArea,
    hasEstimatedCosts,
    parcelsWithoutCost,
    parcelsWithoutArea
  };
};
