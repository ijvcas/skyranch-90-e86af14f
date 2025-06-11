
import { supabase } from '@/integrations/supabase/client';
import { getLotPolygons } from './polygonService';

/**
 * Updates the size_hectares field in the lots table based on polygon area calculation
 */
export const syncAllLotAreasWithPolygons = async (): Promise<boolean> => {
  try {
    console.log('Starting sync of all lot areas with polygons');
    
    // Get all polygons with area data
    const polygons = await getLotPolygons();
    
    // Track sync results
    let successCount = 0;
    let failCount = 0;
    
    // Process each polygon with area
    for (const polygon of polygons) {
      if (polygon.lot_id && polygon.area_hectares) {
        const { error } = await supabase
          .from('lots')
          .update({ size_hectares: polygon.area_hectares })
          .eq('id', polygon.lot_id);
        
        if (error) {
          console.error(`Error syncing area for lot ${polygon.lot_id}:`, error);
          failCount++;
        } else {
          console.log(`Updated lot ${polygon.lot_id} with area ${polygon.area_hectares} ha`);
          successCount++;
        }
      }
    }
    
    console.log(`Area sync completed. Success: ${successCount}, Failed: ${failCount}`);
    return failCount === 0;
  } catch (error) {
    console.error('Error during lot area synchronization:', error);
    return false;
  }
};

/**
 * Retrieves polygon data including calculated areas for display in lot lists
 */
export const getPolygonDataForLots = async () => {
  try {
    const polygons = await getLotPolygons();
    
    return polygons.map(polygon => ({
      lotId: polygon.lot_id,
      areaHectares: polygon.area_hectares
    }));
  } catch (error) {
    console.error('Error retrieving polygon data for lots:', error);
    return [];
  }
};

/**
 * Updates a specific lot's size_hectares based on its polygon area
 */
export const updateLotAreaFromPolygon = async (lotId: string): Promise<boolean> => {
  try {
    // Find the polygon for this lot
    const { data, error } = await supabase
      .from('lot_polygons')
      .select('area_hectares')
      .eq('lot_id', lotId)
      .single();
    
    if (error || !data?.area_hectares) {
      console.log('No polygon with area found for lot:', lotId);
      return false;
    }
    
    // Update the lot's size_hectares
    const { error: updateError } = await supabase
      .from('lots')
      .update({ size_hectares: data.area_hectares })
      .eq('id', lotId);
    
    if (updateError) {
      console.error('Error updating lot area:', updateError);
      return false;
    }
    
    console.log(`Successfully updated lot ${lotId} with area ${data.area_hectares} ha`);
    return true;
  } catch (error) {
    console.error('Error updating lot area from polygon:', error);
    return false;
  }
};
