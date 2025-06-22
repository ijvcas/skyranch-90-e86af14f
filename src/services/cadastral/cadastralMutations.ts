
import { supabase } from '@/integrations/supabase/client';
import type { CadastralParcel, Property } from '../cadastralService';

export const insertCadastralParcel = async (parcel: Omit<CadastralParcel, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  try {
    console.log('Saving cadastral parcel:', parcel.parcelId);
    
    const { error } = await supabase
      .from('cadastral_parcels')
      .insert({
        property_id: parcel.propertyId,
        parcel_id: parcel.parcelId,
        display_name: parcel.displayName,
        lot_number: parcel.lotNumber,
        boundary_coordinates: parcel.boundaryCoordinates,
        area_hectares: parcel.areaHectares,
        classification: parcel.classification,
        owner_info: parcel.ownerInfo,
        notes: parcel.notes,
        status: parcel.status || 'SHOPPING_LIST',
        imported_from_file: parcel.importedFromFile
      });

    if (error) {
      console.error('Error saving cadastral parcel:', error);
      return false;
    }

    console.log('Cadastral parcel saved successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error saving cadastral parcel:', error);
    return false;
  }
};

export const updateCadastralParcelById = async (parcelId: string, updates: Partial<CadastralParcel>): Promise<boolean> => {
  try {
    console.log('Updating cadastral parcel:', parcelId, updates);
    
    const updateData: any = {};
    if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.classification !== undefined) updateData.classification = updates.classification;
    if (updates.ownerInfo !== undefined) updateData.owner_info = updates.ownerInfo;
    
    const { error } = await supabase
      .from('cadastral_parcels')
      .update(updateData)
      .eq('id', parcelId);

    if (error) {
      console.error('Error updating cadastral parcel:', error);
      return false;
    }

    console.log('Cadastral parcel updated successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error updating cadastral parcel:', error);
    return false;
  }
};

export const insertProperty = async (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  try {
    console.log('Adding new property:', property.name);
    
    const { error } = await supabase
      .from('properties')
      .insert({
        name: property.name,
        description: property.description,
        center_lat: property.centerLat,
        center_lng: property.centerLng,
        zoom_level: property.zoomLevel || 16,
        is_active: property.isActive,
        is_main_property: property.isMainProperty
      });

    if (error) {
      console.error('Error adding property:', error);
      return false;
    }

    console.log('Property added successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error adding property:', error);
    return false;
  }
};
