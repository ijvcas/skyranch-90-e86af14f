
import { supabase } from '@/integrations/supabase/client';

export interface LotPolygon {
  id: string;
  lot_id: string;
  coordinates: { lat: number; lng: number }[];
  area_hectares?: number;
  created_at: string;
  updated_at: string;
}

// Type guard to validate coordinate objects
const isValidCoordinate = (coord: any): coord is { lat: number; lng: number } => {
  return coord && 
    typeof coord === 'object' && 
    typeof coord.lat === 'number' && 
    typeof coord.lng === 'number' &&
    !isNaN(coord.lat) && 
    !isNaN(coord.lng);
};

// Safe coordinate conversion with type validation
const parseCoordinates = (rawCoordinates: any): { lat: number; lng: number }[] => {
  try {
    let coordinates: any = rawCoordinates;
    
    // Handle string JSON
    if (typeof coordinates === 'string') {
      coordinates = JSON.parse(coordinates);
    }
    
    // Ensure it's an array
    if (!Array.isArray(coordinates)) {
      console.error('Coordinates is not an array:', typeof coordinates);
      return [];
    }
    
    // Filter and validate each coordinate
    const validCoordinates = coordinates.filter(isValidCoordinate);
    
    if (validCoordinates.length !== coordinates.length) {
      console.warn(`Filtered out ${coordinates.length - validCoordinates.length} invalid coordinates`);
    }
    
    return validCoordinates;
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return [];
  }
};

export const saveLotPolygon = async (
  lotId: string, 
  coordinates: { lat: number; lng: number }[], 
  areaHectares?: number
): Promise<boolean> => {
  try {
    console.log('Saving polygon to database for lot:', lotId, 'with area:', areaHectares);
    
    // Validate coordinates before saving
    if (!Array.isArray(coordinates) || coordinates.length < 3) {
      console.error('Invalid coordinates for polygon save:', coordinates);
      return false;
    }
    
    // First, delete any existing polygon for this lot
    await deleteLotPolygon(lotId);
    
    const { error } = await supabase
      .from('lot_polygons')
      .insert({
        lot_id: lotId,
        coordinates: coordinates,
        area_hectares: areaHectares ? Number(Number(areaHectares).toFixed(4)) : null
      });

    if (error) {
      console.error('Error saving polygon:', error);
      return false;
    }

    // Update the lot's size_hectares to match the polygon area
    if (areaHectares) {
      const formattedArea = Number(Number(areaHectares).toFixed(4));
      const { error: lotUpdateError } = await supabase
        .from('lots')
        .update({ size_hectares: formattedArea })
        .eq('id', lotId);

      if (lotUpdateError) {
        console.error('Error updating lot size:', lotUpdateError);
      } else {
        console.log('Updated lot size_hectares to:', formattedArea);
      }
    }

    console.log('Polygon saved successfully with area sync');
    return true;
  } catch (error) {
    console.error('Unexpected error saving polygon:', error);
    return false;
  }
};

export const getLotPolygons = async (): Promise<LotPolygon[]> => {
  try {
    console.log('Loading polygons from database');
    
    const { data, error } = await supabase
      .from('lot_polygons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading polygons:', error);
      return [];
    }

    console.log('Raw polygon data from database:', data);

    // Process and validate polygon data
    const polygons: LotPolygon[] = (data || []).map(item => {
      const coordinates = parseCoordinates(item.coordinates);
      
      return {
        id: item.id,
        lot_id: item.lot_id,
        coordinates: coordinates,
        area_hectares: item.area_hectares ? Number(Number(item.area_hectares).toFixed(4)) : undefined,
        created_at: item.created_at,
        updated_at: item.updated_at
      };
    }).filter(polygon => polygon.coordinates.length >= 3); // Only include valid polygons

    console.log('Processed polygons:', polygons.length);
    return polygons;
  } catch (error) {
    console.error('Unexpected error loading polygons:', error);
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
      console.error('Error deleting polygon:', error);
      return false;
    }

    console.log('Polygon deleted successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error deleting polygon:', error);
    return false;
  }
};

export const migrateLocalStoragePolygons = async (): Promise<void> => {
  try {
    console.log('Checking for localStorage polygons to migrate');
    
    const localData = localStorage.getItem('lotPolygons');
    if (!localData) {
      console.log('No localStorage data to migrate');
      return;
    }

    const polygons = JSON.parse(localData);
    console.log('Found localStorage polygons to migrate:', polygons.length);

    for (const polygon of polygons) {
      if (polygon.lotId && polygon.coordinates) {
        await saveLotPolygon(polygon.lotId, polygon.coordinates, polygon.areaHectares);
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem('lotPolygons');
    console.log('Migration completed and localStorage cleared');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

// New function to sync polygon areas with lot size_hectares fields
export const syncPolygonAreasWithLots = async (): Promise<boolean> => {
  try {
    console.log('Starting synchronization of polygon areas with lot sizes');
    
    // Get all polygons
    const polygons = await getLotPolygons();
    
    for (const polygon of polygons) {
      if (polygon.lot_id && polygon.area_hectares) {
        // Format area to 4 decimal places for consistency
        const formattedArea = Number(Number(polygon.area_hectares).toFixed(4));
        
        // Update each lot's size_hectares to match its polygon area
        const { error } = await supabase
          .from('lots')
          .update({ size_hectares: formattedArea })
          .eq('id', polygon.lot_id);
        
        if (error) {
          console.error(`Error updating size for lot ${polygon.lot_id}:`, error);
        } else {
          console.log(`Synchronized lot ${polygon.lot_id} with area ${formattedArea} ha`);
        }
      }
    }
    
    console.log('Polygon area synchronization completed');
    return true;
  } catch (error) {
    console.error('Error during polygon area synchronization:', error);
    return false;
  }
};

// Get a single lot polygon by lot ID
export const getLotPolygonByLotId = async (lotId: string): Promise<LotPolygon | null> => {
  try {
    console.log('Fetching polygon for lot:', lotId);
    
    const { data, error } = await supabase
      .from('lot_polygons')
      .select('*')
      .eq('lot_id', lotId)
      .single();

    if (error) {
      console.error('Error fetching polygon:', error);
      return null;
    }
    
    if (!data) {
      console.log('No polygon found for lot:', lotId);
      return null;
    }

    // Parse coordinates safely
    const coordinates = parseCoordinates(data.coordinates);
    
    if (coordinates.length < 3) {
      console.error('Invalid polygon coordinates for lot:', lotId);
      return null;
    }

    return {
      id: data.id,
      lot_id: data.lot_id,
      coordinates: coordinates,
      area_hectares: data.area_hectares ? Number(Number(data.area_hectares).toFixed(4)) : undefined,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Unexpected error fetching polygon:', error);
    return null;
  }
};
