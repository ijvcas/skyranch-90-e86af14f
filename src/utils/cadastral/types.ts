
export interface ParsedParcel {
  parcelId: string;
  displayName?: string; // User-editable name
  lotNumber?: string; // Extracted lot number for display
  boundaryCoordinates: { lat: number; lng: number }[];
  areaHectares?: number;
  classification?: string;
  ownerInfo?: string;
  notes?: string;
  status?: ParcelStatus;
  importedFromFile?: string;
}

export interface DXFEntity {
  vertices: number[][];
  layer?: string;
  type?: string;
  handle?: string;
}

export type ParcelStatus = 'PROPIEDAD' | 'SHOPPING_LIST' | 'NEGOCIANDO';

export interface ParsingResult {
  parcels: ParsedParcel[];
  coordinateSystem: string;
  errors: string[];
  warnings: string[];
}

export const PARCEL_STATUS_COLORS = {
  PROPIEDAD: '#22c55e', // green
  SHOPPING_LIST: '#eab308', // yellow
  NEGOCIANDO: '#f97316', // orange
} as const;

export const PARCEL_STATUS_LABELS = {
  PROPIEDAD: 'Propiedad',
  SHOPPING_LIST: 'Lista de Compras',
  NEGOCIANDO: 'Negociando',
} as const;
