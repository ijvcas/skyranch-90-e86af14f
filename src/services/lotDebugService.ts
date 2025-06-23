
import { supabase } from '@/integrations/supabase/client';

export const debugCadastralParcelsData = async () => {
  try {
    console.log('🔍 Debugging cadastral parcels data...');
    
    // Get all PROPIEDAD parcels with their lot_number data
    const { data: parcels, error } = await supabase
      .from('cadastral_parcels')
      .select('id, parcel_id, display_name, lot_number, status')
      .eq('status', 'PROPIEDAD');
    
    if (error) {
      console.error('❌ Error fetching parcels:', error);
      return;
    }
    
    console.log('📊 PROPIEDAD Parcels Data:');
    parcels?.forEach(parcel => {
      console.log(`- Parcel ${parcel.parcel_id}:`);
      console.log(`  Display Name: ${parcel.display_name}`);
      console.log(`  Lot Number: ${parcel.lot_number}`);
      console.log(`  Status: ${parcel.status}`);
      console.log('---');
    });
    
    return parcels;
  } catch (error) {
    console.error('❌ Unexpected error in debugCadastralParcelsData:', error);
    return [];
  }
};

export const updateExistingLotsWithCorrectNames = async () => {
  try {
    console.log('🔄 Updating existing lot names...');
    
    // Get all auto-generated lots with their source parcel info
    const { data: lots, error: lotsError } = await supabase
      .from('lots')
      .select(`
        id,
        name,
        source_parcel_id,
        cadastral_parcels!source_parcel_id(
          parcel_id,
          display_name,
          lot_number
        )
      `)
      .eq('auto_generated', true);
    
    if (lotsError) {
      console.error('❌ Error fetching lots:', lotsError);
      return { success: false, error: lotsError };
    }
    
    if (!lots || lots.length === 0) {
      console.log('ℹ️ No auto-generated lots found to update');
      return { success: true, updated: 0 };
    }
    
    let updatedCount = 0;
    
    for (const lot of lots) {
      const parcel = (lot as any).cadastral_parcels;
      if (!parcel) continue;
      
      // Determine the correct name using the same logic as the database function
      let newName: string;
      if (parcel.lot_number && parcel.lot_number.trim() !== '') {
        newName = `Lote ${parcel.lot_number}`;
      } else {
        newName = parcel.display_name || `Lote ${parcel.parcel_id}`;
      }
      
      // Only update if the name is different
      if (lot.name !== newName) {
        console.log(`🔄 Updating lot "${lot.name}" -> "${newName}"`);
        
        const { error: updateError } = await supabase
          .from('lots')
          .update({ name: newName })
          .eq('id', lot.id);
        
        if (updateError) {
          console.error(`❌ Error updating lot ${lot.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }
    
    console.log(`✅ Updated ${updatedCount} lot names`);
    return { success: true, updated: updatedCount };
    
  } catch (error) {
    console.error('❌ Unexpected error in updateExistingLotsWithCorrectNames:', error);
    return { success: false, error };
  }
};
