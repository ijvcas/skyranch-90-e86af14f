
import { supabase } from '@/integrations/supabase/client';

// Calculate the true center point of all cadastral parcels
export const calculateParcelsCenterPoint = async (propertyId: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    console.log('🧮 Calculating true center point of all parcels...');
    
    const { data: parcels, error } = await supabase
      .from('cadastral_parcels')
      .select('boundary_coordinates')
      .eq('property_id', propertyId);

    if (error || !parcels || parcels.length === 0) {
      console.error('❌ Error fetching parcels for center calculation:', error);
      return null;
    }

    let allLatitudes: number[] = [];
    let allLongitudes: number[] = [];

    // Collect all coordinate points from all parcels
    parcels.forEach(parcel => {
      try {
        let coordinates: { lat: number; lng: number }[] = [];
        
        if (typeof parcel.boundary_coordinates === 'string') {
          coordinates = JSON.parse(parcel.boundary_coordinates);
        } else if (Array.isArray(parcel.boundary_coordinates)) {
          coordinates = parcel.boundary_coordinates;
        }

        // Filter valid coordinates within expected SkyRanch bounds
        const validCoords = coordinates.filter(coord => 
          coord && 
          typeof coord.lat === 'number' && 
          typeof coord.lng === 'number' &&
          !isNaN(coord.lat) && 
          !isNaN(coord.lng) &&
          coord.lat >= 40.099 && coord.lat <= 40.105 && 
          coord.lng >= -4.475 && coord.lng <= -4.465
        );

        validCoords.forEach(coord => {
          allLatitudes.push(coord.lat);
          allLongitudes.push(coord.lng);
        });

      } catch (parseError) {
        console.warn('⚠️ Error parsing coordinates for parcel:', parseError);
      }
    });

    if (allLatitudes.length === 0 || allLongitudes.length === 0) {
      console.error('❌ No valid coordinates found for center calculation');
      return null;
    }

    // Calculate the geographic center (mean of all coordinates)
    const centerLat = allLatitudes.reduce((sum, lat) => sum + lat, 0) / allLatitudes.length;
    const centerLng = allLongitudes.reduce((sum, lng) => sum + lng, 0) / allLongitudes.length;

    // Calculate bounds for zoom optimization
    const minLat = Math.min(...allLatitudes);
    const maxLat = Math.max(...allLatitudes);
    const minLng = Math.min(...allLongitudes);
    const maxLng = Math.max(...allLongitudes);

    console.log(`🎯 CALCULATED TRUE CENTER: ${centerLat.toFixed(6)}, ${centerLng.toFixed(6)}`);
    console.log(`📏 Coordinate bounds: Lat ${minLat.toFixed(6)} to ${maxLat.toFixed(6)}, Lng ${minLng.toFixed(6)} to ${maxLng.toFixed(6)}`);
    console.log(`📊 Based on ${allLatitudes.length} coordinate points from ${parcels.length} parcels`);

    return {
      lat: Number(centerLat.toFixed(6)),
      lng: Number(centerLng.toFixed(6))
    };

  } catch (error) {
    console.error('❌ Unexpected error calculating parcels center:', error);
    return null;
  }
};

// Update property center coordinates in database
export const updatePropertyCenterToCalculatedCenter = async (propertyId: string): Promise<boolean> => {
  try {
    const calculatedCenter = await calculateParcelsCenterPoint(propertyId);
    
    if (!calculatedCenter) {
      console.error('❌ Could not calculate center point');
      return false;
    }

    console.log(`🔄 Updating property center to calculated coordinates: ${calculatedCenter.lat}, ${calculatedCenter.lng}`);
    
    const { error } = await supabase
      .from('properties')
      .update({
        center_lat: calculatedCenter.lat,
        center_lng: calculatedCenter.lng,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (error) {
      console.error('❌ Error updating property center:', error);
      return false;
    }

    console.log('✅ Successfully updated property center to calculated coordinates');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error updating property center:', error);
    return false;
  }
};
