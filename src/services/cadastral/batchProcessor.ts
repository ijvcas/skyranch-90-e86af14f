
import { supabase } from '@/integrations/supabase/client';
import { calculateParcelArea, updateParcelWithLotNumberAndArea, removeDuplicateParcels } from './parcelUpdater';

// FIXED: Helper function to validate and parse boundary coordinates
const parseBoundaryCoordinates = (boundaryData: any): { lat: number; lng: number }[] => {
  if (!boundaryData) {
    return [];
  }

  try {
    // If it's already an array, validate it
    if (Array.isArray(boundaryData)) {
      return boundaryData.filter(coord => 
        coord && 
        typeof coord.lat === 'number' && 
        typeof coord.lng === 'number' &&
        !isNaN(coord.lat) && 
        !isNaN(coord.lng)
      );
    }

    // If it's a string, try to parse it as JSON
    if (typeof boundaryData === 'string') {
      const parsed = JSON.parse(boundaryData);
      if (Array.isArray(parsed)) {
        return parsed.filter(coord => 
          coord && 
          typeof coord.lat === 'number' && 
          typeof coord.lng === 'number' &&
          !isNaN(coord.lat) && 
          !isNaN(coord.lng)
        );
      }
    }

    return [];
  } catch (error) {
    console.error('Error parsing boundary coordinates:', error);
    return [];
  }
};

// Batch update all parcels with simple sequential lot numbers and areas
export const batchUpdateAllParcels = async (propertyId: string): Promise<boolean> => {
  console.log('🔄 === STARTING BATCH UPDATE WITH SEQUENTIAL LOT NUMBERS ===');
  
  try {
    // First remove duplicates
    await removeDuplicateParcels(propertyId);
    
    // Get all parcels for the property, ordered consistently
    const { data: parcels, error } = await supabase
      .from('cadastral_parcels')
      .select('*')
      .eq('property_id', propertyId)
      .order('parcel_id'); // Consistent ordering for sequential numbering
    
    if (error || !parcels) {
      console.error('❌ Error fetching parcels:', error);
      return false;
    }
    
    console.log(`📋 Found ${parcels.length} parcels to process with sequential numbering: 1, 2, 3...`);
    
    let successCount = 0;
    
    for (let index = 0; index < parcels.length; index++) {
      const parcel = parcels[index];
      console.log(`\n🔄 Processing parcel ${index + 1}/${parcels.length}: ${parcel.parcel_id}`);
      
      let needsUpdate = false;
      const updates: any = {};
      
      // FIXED: Always use simple sequential lot numbers: 1, 2, 3, 4, 5...
      const sequentialLotNumber = (index + 1).toString();
      if (!parcel.lot_number || parcel.lot_number !== sequentialLotNumber) {
        updates.lot_number = sequentialLotNumber;
        updates.display_name = `Parcela ${sequentialLotNumber}`;
        needsUpdate = true;
        console.log(`📝 Will update with sequential lot number: ${sequentialLotNumber}`);
      }
      
      // Calculate area if missing and coordinates available
      if (!parcel.area_hectares && parcel.boundary_coordinates) {
        const validCoordinates = parseBoundaryCoordinates(parcel.boundary_coordinates);
        if (validCoordinates.length >= 3) {
          const areaHectares = calculateParcelArea(validCoordinates);
          if (areaHectares > 0) {
            updates.area_hectares = areaHectares;
            needsUpdate = true;
            console.log(`📐 Will update with calculated area: ${areaHectares.toFixed(4)} ha`);
          }
        }
      }
      
      // Apply updates if needed
      if (needsUpdate) {
        const success = await updateParcelWithLotNumberAndArea(
          parcel.id, 
          updates.lot_number || parcel.lot_number, 
          updates.area_hectares || parcel.area_hectares || 0
        );
        
        if (success) {
          successCount++;
          console.log(`✅ Successfully updated parcel ${index + 1}: ${parcel.parcel_id} with lot ${updates.lot_number}`);
        } else {
          console.error(`❌ Failed to update parcel ${index + 1}: ${parcel.parcel_id}`);
        }
      } else {
        console.log(`ℹ️ Parcel ${index + 1}: ${parcel.parcel_id} already has required data`);
        successCount++;
      }
    }
    
    console.log(`\n🎉 === BATCH UPDATE COMPLETE ===`);
    console.log(`✅ Successfully processed ${successCount} out of ${parcels.length} parcels`);
    console.log(`📊 Sequential lot numbers: 1, 2, 3, 4, 5, 6... ${parcels.length}`);
    
    return successCount === parcels.length;
    
  } catch (error) {
    console.error('❌ Error during batch update:', error);
    return false;
  }
};
