
import type { ParcelStatus } from '@/utils/cadastral/types';
import type { CadastralParcel } from '../cadastralService';

export const transformCadastralParcelFromDB = (item: any): CadastralParcel => {
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
    displayName: item.display_name || undefined,
    lotNumber: item.lot_number || undefined,
    boundaryCoordinates,
    areaHectares: item.area_hectares,
    classification: item.classification,
    ownerInfo: item.owner_info,
    notes: item.notes,
    status: (item.status as ParcelStatus) || 'SHOPPING_LIST',
    importedFromFile: item.imported_from_file,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
};

export const transformPropertyFromDB = (item: any) => ({
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
});
