
import { supabase } from '@/integrations/supabase/client';

// FIXED: Update property center coordinates to correct SkyRanch location
export const updatePropertyCenterToCorrectLocation = async (): Promise<boolean> => {
  console.log('🔄 Updating property center coordinates to correct SkyRanch location...');
  
  try {
    // Update the main SkyRanch property to use correct coordinates
    const { error } = await supabase
      .from('properties')
      .update({
        center_lat: 40.101,  // CORRECTED: Where parcels actually are
        center_lng: -4.470,  // CORRECTED: Where parcels actually are
        updated_at: new Date().toISOString()
      })
      .eq('is_main_property', true);

    if (error) {
      console.error('❌ Error updating property center coordinates:', error);
      return false;
    }

    console.log('✅ Successfully updated property center to correct SkyRanch location: 40.101, -4.470');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error updating property coordinates:', error);
    return false;
  }
};

// Auto-run the coordinate fix when this module is imported
updatePropertyCenterToCorrectLocation();
