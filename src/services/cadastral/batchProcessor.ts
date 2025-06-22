
import { supabase } from '@/integrations/supabase/client';
import { extractLotNumberFromParcelId, calculateParcelArea, updateParcelWithLotNumberAndArea, removeDuplicateParcels } from './parcelUpdater';

// FIXED: Enhanced unique lot number generation to avoid duplicates
const generateUniqueLotNumber = (parcelId: string): string => {
  console.log(`🔍 Generating unique lot number for: ${parcelId}`);
  
  // Handle the special format: 5141313UK7654S
  if (parcelId.includes('5141313UK7654S')) {
    console.log(`✅ Special format handled: SPECIAL-1`);
    return 'SPECIAL-1';
  }
  
  // Extract cadastral area and lot number from Spanish cadastral format
  const patterns = [
    // Surface format: Surface_ES.SDGC.CP.28128A00800122.1
    /Surface_ES\.SDGC\.CP\.28128A(\d{2})(\d{6})(?:\.(\d+))?/,
    // Direct Spanish cadastral: 28128A00800122.1
    /28128A(\d{2})(\d{6})(?:\.(\d+))?/,
  ];
  
  for (const pattern of patterns) {
    const match = parcelId.match(pattern);
    if (match) {
      const area = match[1]; // e.g., "08", "81", "71", "00"
      const lotSequence = match[2]; // e.g., "00122", "00007", "00006"
      
      // Extract meaningful lot number from the 6-digit sequence
      let lotNumber = lotSequence.replace(/^0+/, ''); // Remove leading zeros
      
      // If we get an empty string (all zeros), use "0"
      if (lotNumber.length === 0) {
        lotNumber = "0";
      }
      
      // Create truly unique identifier: area-lot (e.g., "800-122", "810-7")
      const uniqueLot = `${area}0-${lotNumber}`;
      console.log(`✅ Generated unique lot: ${uniqueLot} from area ${area}, sequence ${lotSequence}`);
      return uniqueLot;
    }
  }
  
  // Fallback: try to extract any number sequence
  const numberMatch = parcelId.match(/(\d{2,})/);
  if (numberMatch) {
    const number = numberMatch[1];
    // Take first 2 digits as area, rest as lot
    if (number.length >= 4) {
      const area = number.substring(0, 2);
      const lot = number.substring(2).replace(/^0+/, '') || "0";
      const uniqueLot = `${area}0-${lot}`;
      console.log(`✅ Generated fallback unique lot: ${uniqueLot}`);
      return uniqueLot;
    }
  }
  
  console.log(`❌ Could not generate unique lot number for: ${parcelId}`);
  return '';
};

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

// Batch update all parcels with lot numbers and areas
export const batchUpdateAllParcels = async (propertyId: string): Promise<boolean> => {
  console.log('🔄 === STARTING BATCH UPDATE OF ALL PARCELS ===');
  
  try {
    // First remove duplicates
    await removeDuplicateParcels(propertyId);
    
    // Get all parcels for the property
    const { data: parcels, error } = await supabase
      .from('cadastral_parcels')
      .select('*')
      .eq('property_id', propertyId);
    
    if (error || !parcels) {
      console.error('❌ Error fetching parcels:', error);
      return false;
    }
    
    console.log(`📋 Found ${parcels.length} parcels to process`);
    
    let successCount = 0;
    
    for (const parcel of parcels) {
      console.log(`\n🔄 Processing parcel: ${parcel.parcel_id}`);
      
      let needsUpdate = false;
      const updates: any = {};
      
      // Generate unique lot number if missing or if it's a duplicate "1" or "2"
      if (!parcel.lot_number || parcel.lot_number === '1' || parcel.lot_number === '2') {
        const uniqueLotNumber = generateUniqueLotNumber(parcel.parcel_id);
        if (uniqueLotNumber) {
          updates.lot_number = uniqueLotNumber;
          updates.display_name = `Parcela ${uniqueLotNumber}`;
          needsUpdate = true;
          console.log(`📝 Will update with unique lot number: ${uniqueLotNumber}`);
        }
      }
      
      // Calculate area if missing and coordinates available
      if (!parcel.area_hectares && parcel.boundary_coordinates) {
        // FIXED: Properly parse and validate boundary coordinates
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
          console.log(`✅ Successfully updated parcel: ${parcel.parcel_id}`);
        } else {
          console.error(`❌ Failed to update parcel: ${parcel.parcel_id}`);
        }
      } else {
        console.log(`ℹ️ Parcel ${parcel.parcel_id} already has all required data`);
        successCount++;
      }
    }
    
    console.log(`\n🎉 === BATCH UPDATE COMPLETE ===`);
    console.log(`✅ Successfully processed ${successCount} out of ${parcels.length} parcels`);
    
    return successCount === parcels.length;
    
  } catch (error) {
    console.error('❌ Error during batch update:', error);
    return false;
  }
};
