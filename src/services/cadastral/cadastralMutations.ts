
import { supabase } from '@/integrations/supabase/client';
import { transformCadastralParcelFromDB, transformCadastralParcelToDB, transformPropertyToDB, transformPropertyFromDB } from './dataTransformers';
import type { CadastralParcel, Property } from '../cadastralService';

export const insertCadastralParcel = async (parcel: Omit<CadastralParcel, 'id' | 'createdAt' | 'updatedAt'>): Promise<CadastralParcel | null> => {
  try {
    console.log('Inserting cadastral parcel:', parcel.parcelId);
    
    const parcelData = transformCadastralParcelToDB(parcel);
    
    const { data, error } = await supabase
      .from('cadastral_parcels')
      .insert(parcelData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting cadastral parcel:', error);
      return null;
    }

    return transformCadastralParcelFromDB(data);
  } catch (error) {
    console.error('Unexpected error inserting cadastral parcel:', error);
    return null;
  }
};

export const updateCadastralParcelById = async (id: string, updates: Partial<CadastralParcel>): Promise<boolean> => {
  try {
    console.log('Updating cadastral parcel:', id, updates);
    
    const updateData: any = {};
    
    if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.lotNumber !== undefined) updateData.lot_number = updates.lotNumber;
    if (updates.areaHectares !== undefined) updateData.area_hectares = updates.areaHectares;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.classification !== undefined) updateData.classification = updates.classification;
    if (updates.ownerInfo !== undefined) updateData.owner_info = updates.ownerInfo;
    
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('cadastral_parcels')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating cadastral parcel:', error);
      return false;
    }

    console.log('✅ Successfully updated cadastral parcel:', id);
    return true;
  } catch (error) {
    console.error('Unexpected error updating cadastral parcel:', error);
    return false;
  }
};

export const insertProperty = async (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property | null> => {
  try {
    console.log('Inserting property:', property.name);
    
    const propertyData = transformPropertyToDB(property);
    
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting property:', error);
      return null;
    }

    return transformPropertyFromDB(data);
  } catch (error) {
    console.error('Unexpected error inserting property:', error);
    return null;
  }
};

// FIXED: Update property center coordinates function
export const updatePropertyCenter = async (propertyId: string, centerLat: number, centerLng: number): Promise<boolean> => {
  try {
    console.log(`🔄 Updating property ${propertyId} center to: ${centerLat}, ${centerLng}`);
    
    const { error } = await supabase
      .from('properties')
      .update({
        center_lat: centerLat,
        center_lng: centerLng,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (error) {
      console.error('❌ Error updating property center:', error);
      return false;
    }

    console.log('✅ Successfully updated property center coordinates');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error updating property center:', error);
    return false;
  }
};
