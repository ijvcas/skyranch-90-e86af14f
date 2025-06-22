
import { supabase } from '@/integrations/supabase/client';
import { transformCadastralParcelFromDB, transformPropertyFromDB } from './dataTransformers';
import type { CadastralParcel, Property } from '../cadastralService';

export const fetchAllProperties = async (): Promise<Property[]> => {
  try {
    console.log('Loading all properties...');
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('is_main_property', { ascending: false })
      .order('name');

    if (error) {
      console.error('Error loading properties:', error);
      return [];
    }

    return (data || []).map(transformPropertyFromDB);
  } catch (error) {
    console.error('Unexpected error loading properties:', error);
    return [];
  }
};

export const fetchCadastralParcels = async (propertyId?: string): Promise<CadastralParcel[]> => {
  try {
    console.log('Loading cadastral parcels for property:', propertyId);
    
    let query = supabase
      .from('cadastral_parcels')
      .select('*')
      .order('created_at', { ascending: false });

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading cadastral parcels:', error);
      return [];
    }

    return (data || []).map(transformCadastralParcelFromDB);
  } catch (error) {
    console.error('Unexpected error loading cadastral parcels:', error);
    return [];
  }
};
