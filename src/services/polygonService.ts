
// Temporarily disabled until lot_polygons table is created in database
// Run the SQL script in Supabase first, then regenerate types

export interface LotPolygon {
  id: string;
  lot_id: string;
  coordinates: { lat: number; lng: number }[];
  area_hectares?: number;
  created_at: string;
  updated_at: string;
}

export const saveLotPolygon = async (
  lotId: string, 
  coordinates: { lat: number; lng: number }[], 
  areaHectares?: number
): Promise<boolean> => {
  console.log('Polygon saving disabled - run SQL script first');
  return false;
};

export const getLotPolygons = async (): Promise<LotPolygon[]> => {
  console.log('Polygon loading disabled - run SQL script first');
  return [];
};

export const deleteLotPolygon = async (lotId: string): Promise<boolean> => {
  console.log('Polygon deletion disabled - run SQL script first');
  return false;
};

export const migrateLocalStoragePolygons = async (): Promise<void> => {
  console.log('Polygon migration disabled - run SQL script first');
};
