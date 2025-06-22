
import { supabase } from '@/integrations/supabase/client';

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
