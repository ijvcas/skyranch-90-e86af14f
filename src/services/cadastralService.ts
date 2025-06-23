
import type { ParcelStatus } from '@/utils/cadastral/types';

export interface Property {
  id: string;
  name: string;
  description?: string;
  centerLat: number;
  centerLng: number;
  zoomLevel?: number;
  isActive: boolean;
  isMainProperty: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CadastralParcel {
  id: string;
  propertyId?: string;
  parcelId: string;
  displayName?: string;
  lotNumber?: string;
  boundaryCoordinates: { lat: number; lng: number }[];
  areaHectares?: number;
  classification?: string;
  ownerInfo?: string;
  notes?: string;
  status?: ParcelStatus;
  importedFromFile?: string;
  createdAt: string;
  updatedAt: string;
}

// Re-export functions from the modular files
export { fetchAllProperties as getAllProperties } from './cadastral/cadastralQueries';
export { fetchCadastralParcels as getCadastralParcels } from './cadastral/cadastralQueries';
export { fetchCadastralParcels as getAllParcels } from './cadastral/cadastralQueries';
export { insertCadastralParcel as saveCadastralParcel } from './cadastral/cadastralMutations';
export { updateCadastralParcelById as updateCadastralParcel } from './cadastral/cadastralMutations';
export { updateCadastralParcelById as updateParcel } from './cadastral/cadastralMutations';
export { insertProperty as addProperty } from './cadastral/cadastralMutations';
