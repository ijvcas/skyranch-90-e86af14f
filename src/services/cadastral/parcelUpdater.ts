
import { supabase } from '@/integrations/supabase/client';
import type { CadastralParcel } from '../cadastralService';

// Enhanced lot number extraction specifically for Spanish cadastral format
export const extractLotNumberFromParcelId = (parcelId: string): string | undefined => {
  console.log(`🔍 === EXTRACTING LOT NUMBER FROM: ${parcelId} ===`);
  
  // FIXED: Enhanced patterns for Spanish cadastral format
  const patterns = [
    // Surface format: Surface_ES.SDGC.CP.28128A00700122.1
    /Surface_ES\.SDGC\.CP\.28128A(\d{8})(?:\.(\d+))?/,
    // Direct Spanish cadastral: 28128A00700122.1
    /28128A(\d{8})(?:\.(\d+))?/,
    // Fallback for any 8-digit sequence
    /(\d{8})/
  ];
  
  for (const pattern of patterns) {
    const match = parcelId.match(pattern);
    if (match) {
      const mainNumber = match[1]; // e.g., "00700122"
      console.log(`📋 Found 8-digit sequence: ${mainNumber}`);
      
      // Extract meaningful lot number from the 8-digit sequence
      // For 00700122 -> 122, 00700007 -> 7, 00700006 -> 6, etc.
      let lotNumber = mainNumber.replace(/^0+/, ''); // Remove leading zeros
      
      // If we get an empty string (all zeros), use the last digit
      if (lotNumber.length === 0) {
        lotNumber = mainNumber.slice(-1);
      }
      
      // For very long numbers, extract the last 3 digits if they make sense
      if (lotNumber.length > 4) {
        const lastThreeMatch = mainNumber.match(/0*(\d{1,3})$/);
        if (lastThreeMatch) {
          lotNumber = lastThreeMatch[1];
        }
      }
      
      console.log(`✅ Extracted lot number: ${lotNumber}`);
      return lotNumber;
    }
  }
  
  console.log(`❌ No lot number found for: ${parcelId}`);
  return undefined;
};

// Calculate area from boundary coordinates using Google Maps geometry
export const calculateParcelArea = (boundaryCoordinates: { lat: number; lng: number }[]): number => {
  if (!window.google?.maps?.geometry || boundaryCoordinates.length < 3) {
    console.warn('Google Maps geometry not available or insufficient coordinates');
    return 0;
  }

  try {
    const path = boundaryCoordinates.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
    const area = google.maps.geometry.spherical.computeArea(path);
    // Convert from square meters to hectares (1 hectare = 10,000 square meters)
    const areaHectares = area / 10000;
    console.log(`📐 Calculated area: ${areaHectares.toFixed(4)} hectares`);
    return areaHectares;
  } catch (error) {
    console.error('Error calculating area:', error);
    return 0;
  }
};

// FIXED: Direct database update function with proper error handling
export const updateParcelWithLotNumberAndArea = async (
  parcelId: string, 
  lotNumber: string, 
  areaHectares: number
): Promise<boolean> => {
  try {
    console.log(`💾 Updating parcel ${parcelId} with lot: ${lotNumber}, area: ${areaHectares.toFixed(4)} ha`);
    
    const updates: any = {
      lot_number: lotNumber,
      area_hectares: areaHectares,
      updated_at: new Date().toISOString()
    };
    
    // Also update display name if lot number exists
    if (lotNumber) {
      updates.display_name = `Parcela ${lotNumber}`;
    }
    
    const { error } = await supabase
      .from('cadastral_parcels')
      .update(updates)
      .eq('id', parcelId);

    if (error) {
      console.error(`❌ Database error updating parcel ${parcelId}:`, error);
      return false;
    }

    console.log(`✅ Successfully updated parcel ${parcelId}`);
    return true;
  } catch (error) {
    console.error(`❌ Unexpected error updating parcel ${parcelId}:`, error);
    return false;
  }
};

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
      
      // Calculate area if missing and coordinates available
      if (!areaHectares && parcel.boundary_coordinates?.length >= 3) {
        const calculatedArea = calculateParcelArea(parcel.boundary_coordinates);
        if (calculatedArea > 0) {
          areaHectares = calculatedArea;
          needsUpdate = true;
          console.log(`📐 Will update area: ${areaHectares.toFixed(4)} ha`);
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

// Check for and remove duplicate parcels
export const removeDuplicateParcels = async (propertyId: string): Promise<void> => {
  console.log('🔍 === CHECKING FOR DUPLICATE PARCELS ===');
  
  try {
    const { data: parcels, error } = await supabase
      .from('cadastral_parcels')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true });
    
    if (error || !parcels) {
      console.error('❌ Error fetching parcels for duplicate check:', error);
      return;
    }
    
    const seenParcelIds = new Set<string>();
    const duplicateIds: string[] = [];
    
    for (const parcel of parcels) {
      if (seenParcelIds.has(parcel.parcel_id)) {
        duplicateIds.push(parcel.id);
        console.log(`🔍 Found duplicate parcel: ${parcel.parcel_id} (id: ${parcel.id})`);
      } else {
        seenParcelIds.add(parcel.parcel_id);
      }
    }
    
    if (duplicateIds.length > 0) {
      console.log(`🗑️ Removing ${duplicateIds.length} duplicate parcels...`);
      
      const { error: deleteError } = await supabase
        .from('cadastral_parcels')
        .delete()
        .in('id', duplicateIds);
      
      if (deleteError) {
        console.error('❌ Error removing duplicates:', deleteError);
      } else {
        console.log(`✅ Successfully removed ${duplicateIds.length} duplicate parcels`);
      }
    } else {
      console.log('✅ No duplicate parcels found');
    }
    
  } catch (error) {
    console.error('❌ Error during duplicate check:', error);
  }
};
