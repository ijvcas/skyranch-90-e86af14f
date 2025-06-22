
import { supabase } from '@/integrations/supabase/client';
import { extractLotNumberFromParcelId } from './lotNumberExtractor';
import { calculateParcelArea } from './areaCalculator';
import { updateParcelWithLotNumberAndArea } from './parcelDatabaseOps';

// ENHANCED: Batch update all parcels with proper error handling and progress tracking
export const batchUpdateAllParcels = async (propertyId: string): Promise<void> => {
  console.log('🔄 === STARTING BATCH UPDATE OF ALL PARCELS ===');
  
  try {
    // Fetch all parcels for the property
    const { data: parcels, error } = await supabase
      .from('cadastral_parcels')
      .select('*')
      .eq('property_id', propertyId);
    
    if (error) {
      console.error('❌ Error fetching parcels:', error);
      return;
    }
    
    if (!parcels || parcels.length === 0) {
      console.log('📭 No parcels found to update');
      return;
    }
    
    console.log(`📋 Found ${parcels.length} parcels to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const parcel of parcels) {
      console.log(`\n--- Processing parcel ${parcel.id} ---`);
      
      let needsUpdate = false;
      let lotNumber = parcel.lot_number;
      let areaHectares = parcel.area_hectares;
      
      // Extract lot number if missing
      if (!lotNumber && parcel.parcel_id) {
        const extractedLotNumber = extractLotNumberFromParcelId(parcel.parcel_id);
        if (extractedLotNumber) {
          lotNumber = extractedLotNumber;
          needsUpdate = true;
          console.log(`📝 Will update lot number: ${lotNumber}`);
        }
      }
      
      // FIXED: Calculate area if missing and coordinates available with proper type casting
      if (!areaHectares && parcel.boundary_coordinates) {
        // Cast boundary_coordinates from Json to the expected array type
        const coordinates = parcel.boundary_coordinates as { lat: number; lng: number }[];
        if (Array.isArray(coordinates) && coordinates.length >= 3) {
          const calculatedArea = calculateParcelArea(coordinates);
          if (calculatedArea > 0) {
            areaHectares = calculatedArea;
            needsUpdate = true;
            console.log(`📐 Will update area: ${areaHectares.toFixed(4)} ha`);
          }
        }
      }
      
      // Apply updates if needed
      if (needsUpdate && lotNumber && areaHectares) {
        const success = await updateParcelWithLotNumberAndArea(parcel.id, lotNumber, areaHectares);
        if (success) {
          updatedCount++;
          console.log(`✅ Updated parcel ${parcel.id}`);
        } else {
          console.error(`❌ Failed to update parcel ${parcel.id}`);
        }
      } else {
        skippedCount++;
        console.log(`⏭️ Skipped parcel ${parcel.id} (no updates needed or missing data)`);
      }
    }
    
    console.log(`\n🎉 === BATCH UPDATE COMPLETE ===`);
    console.log(`✅ Updated: ${updatedCount} parcels`);
    console.log(`⏭️ Skipped: ${skippedCount} parcels`);
    console.log(`📊 Total processed: ${parcels.length} parcels`);
    
  } catch (error) {
    console.error('❌ Error during batch update:', error);
  }
};
