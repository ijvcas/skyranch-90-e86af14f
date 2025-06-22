
import { supabase } from '@/integrations/supabase/client';

export interface Property {
  id: string;
  name: string;
  description?: string;
  centerLat: number;
  centerLng: number;
  zoomLevel?: number;
  isActive: boolean;
  isMainProperty: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CadastralParcel {
  id: string;
  propertyId?: string;
  parcelId: string;
  boundaryCoordinates: { lat: number; lng: number }[];
  areaHectares?: number;
  classification?: string;
  ownerInfo?: string;
  notes?: string;
  importedFromFile?: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllProperties = async (): Promise<Property[]> => {
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

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      centerLat: Number(item.center_lat),
      centerLng: Number(item.center_lng),
      zoomLevel: item.zoom_level || 16,
      isActive: item.is_active,
      isMainProperty: item.is_main_property,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Unexpected error loading properties:', error);
    return [];
  }
};

export const getCadastralParcels = async (propertyId?: string): Promise<CadastralParcel[]> => {
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

    return (data || []).map(item => {
      let boundaryCoordinates: { lat: number; lng: number }[] = [];
      
      try {
        if (typeof item.boundary_coordinates === 'string') {
          boundaryCoordinates = JSON.parse(item.boundary_coordinates);
        } else if (Array.isArray(item.boundary_coordinates)) {
          boundaryCoordinates = item.boundary_coordinates.map((coord: any) => ({
            lat: Number(coord.lat),
            lng: Number(coord.lng)
          }));
        }
      } catch (e) {
        console.error('Error parsing boundary coordinates for parcel:', item.id, e);
      }

      return {
        id: item.id,
        propertyId: item.property_id,
        parcelId: item.parcel_id,
        boundaryCoordinates,
        areaHectares: item.area_hectares,
        classification: item.classification,
        ownerInfo: item.owner_info,
        notes: item.notes,
        importedFromFile: item.imported_from_file,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };
    });
  } catch (error) {
    console.error('Unexpected error loading cadastral parcels:', error);
    return [];
  }
};

export const saveCadastralParcel = async (parcel: Omit<CadastralParcel, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  try {
    console.log('Saving cadastral parcel:', parcel.parcelId);
    
    const { error } = await supabase
      .from('cadastral_parcels')
      .insert({
        property_id: parcel.propertyId,
        parcel_id: parcel.parcelId,
        boundary_coordinates: parcel.boundaryCoordinates,
        area_hectares: parcel.areaHectares,
        classification: parcel.classification,
        owner_info: parcel.ownerInfo,
        notes: parcel.notes,
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

export const addProperty = async (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
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
