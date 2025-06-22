
export interface ParsedParcel {
  parcelId: string;
  boundaryCoordinates: { lat: number; lng: number }[];
  areaHectares?: number;
  classification?: string;
  ownerInfo?: string;
  notes?: string;
  coordinateSystem?: string;
}

export interface ParsingResult {
  parcels: ParsedParcel[];
  coordinateSystem: string;
  errors: string[];
  warnings: string[];
}

export interface DXFEntity {
  vertices: number[][];
  layer?: string;
  type?: string;
  handle?: string;
}
