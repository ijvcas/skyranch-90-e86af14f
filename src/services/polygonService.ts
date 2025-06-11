
import { supabase } from '@/integrations/supabase/client';

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
  try {
    console.log('Saving polygon to database for lot:', lotId);
    
    // First, delete any existing polygon for this lot
    await supabase
      .from('lot_polygons')
      .delete()
      .eq('lot_id', lotId);

    // Insert the new polygon
    const { error } = await supabase
      .from('lot_polygons')
      .insert({
        lot_id: lotId,
        coordinates: coordinates,
        area_hectares: areaHectares
      });

    if (error) {
      console.error('Error saving lot polygon:', error);
      return false;
    }

    console.log('✅ Polygon saved successfully to database');
    return true;
  } catch (error) {
    console.error('Unexpected error saving polygon:', error);
    return false;
  }
};

export const getLotPolygons = async (): Promise<LotPolygon[]> => {
  try {
    console.log('Fetching polygons from database...');
    
    const { data, error } = await supabase
      .from('lot_polygons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lot polygons:', error);
      return [];
    }

    console.log('✅ Fetched polygons from database:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching polygons:', error);
    return [];
  }
};

export const deleteLotPolygon = async (lotId: string): Promise<boolean> => {
  try {
    console.log('Deleting polygon from database for lot:', lotId);
    
    const { error } = await supabase
      .from('lot_polygons')
      .delete()
      .eq('lot_id', lotId);

    if (error) {
      console.error('Error deleting lot polygon:', error);
      return false;
    }

    console.log('✅ Polygon deleted successfully from database');
    return true;
  } catch (error) {
    console.error('Unexpected error deleting polygon:', error);
    return false;
  }
};

// Migration function to move localStorage data to database
export const migrateLocalStoragePolygons = async (): Promise<void> => {
  try {
    const localData = localStorage.getItem('lotPolygons');
    if (!localData) return;

    const polygons = JSON.parse(localData);
    console.log('Migrating', polygons.length, 'polygons from localStorage to database...');

    for (const polygon of polygons) {
      if (polygon.lotId && polygon.coordinates) {
        await saveLotPolygon(polygon.lotId, polygon.coordinates, polygon.areaHectares);
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem('lotPolygons');
    console.log('✅ Migration completed, localStorage cleared');
  } catch (error) {
    console.error('Error during polygon migration:', error);
  }
};
