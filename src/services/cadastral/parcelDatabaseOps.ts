
import { supabase } from '@/integrations/supabase/client';
import type { CadastralParcel } from '../cadastralService';
import type { ParsedParcel } from '@/utils/cadastral/types';
import { insertCadastralParcel } from './cadastralMutations';

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

// NEW: Bulk insert function for cadastral parcels
export const bulkInsertCadastralParcels = async (
  parcels: ParsedParcel[],
  propertyId: string,
  fileName: string
): Promise<boolean> => {
  try {
    console.log(`💾 Bulk inserting ${parcels.length} parcels from ${fileName}`);
    
    let successCount = 0;
    
    for (const parcel of parcels) {
      const cadastralParcel: Omit<CadastralParcel, 'id' | 'createdAt' | 'updatedAt'> = {
        propertyId,
        parcelId: parcel.parcelId,
        displayName: parcel.displayName || `Parcela ${parcel.parcelId}`,
        lotNumber: parcel.lotNumber,
        boundaryCoordinates: parcel.boundaryCoordinates,
        areaHectares: parcel.areaHectares,
        status: parcel.status || 'SHOPPING_LIST',
        classification: parcel.classification,
        ownerInfo: parcel.ownerInfo,
        notes: parcel.notes,
        importedFromFile: fileName
      };
      
      const result = await insertCadastralParcel(cadastralParcel);
      if (result) {
        successCount++;
        console.log(`✅ Inserted parcel ${successCount}/${parcels.length}: ${parcel.parcelId}`);
      } else {
        console.error(`❌ Failed to insert parcel: ${parcel.parcelId}`);
      }
    }
    
    console.log(`🎉 Bulk insert completed: ${successCount}/${parcels.length} parcels saved`);
    return successCount === parcels.length;
  } catch (error) {
    console.error('❌ Bulk insert error:', error);
    return false;
  }
};
