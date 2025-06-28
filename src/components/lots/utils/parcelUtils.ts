
import type { CadastralParcel } from '@/services/cadastralService';

export const getParcelNumber = (parcel: CadastralParcel): string => {
  if (parcel.lotNumber) {
    return parcel.lotNumber;
  }
  
  const match = parcel.parcelId.match(/\d+/);
  return match ? match[0] : parcel.parcelId;
};

export const formatNumber = (num: number, decimals: number = 2) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const hasFinancialInfo = (parcel: CadastralParcel) => {
  return parcel.totalCost || parcel.sellerName || parcel.acquisitionDate;
};

export const isIncompletePropiedad = (parcel: CadastralParcel) => {
  return parcel.status === 'PROPIEDAD' && !hasFinancialInfo(parcel);
};
