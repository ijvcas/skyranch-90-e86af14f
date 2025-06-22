
import { supabase } from '@/integrations/supabase/client';
import type { CadastralParcel } from '../cadastralService';

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
