
import { updateCadastralParcel, getCadastralParcels } from '@/services/cadastralService';
import { extractLotNumber } from './gml/lotNumberExtractor';

// Utility to extract lot number from parcel_id string
export const extractLotNumberFromParcelId = (parcelId: string): string | undefined => {
  console.log(`🔍 Extracting lot number from parcel ID: ${parcelId}`);
  
  // Create a mock element with the parcel ID as gml:id for reuse of existing logic
  const mockElement = document.createElement('div');
  mockElement.setAttribute('gml:id', parcelId);
  
  const lotNumber = extractLotNumber(mockElement);
  console.log(`✅ Extracted lot number: ${lotNumber || 'N/A'}`);
  
  return lotNumber;
};

// Calculate area from boundary coordinates
export const calculateParcelArea = (boundaryCoordinates: { lat: number; lng: number }[]): number => {
  if (!window.google?.maps?.geometry || boundaryCoordinates.length < 3) {
    return 0;
  }

  try {
    const path = boundaryCoordinates.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
    const area = google.maps.geometry.spherical.computeArea(path);
    // Convert from square meters to hectares (1 hectare = 10,000 square meters)
    return area / 10000;
  } catch (error) {
    console.error('Error calculating area:', error);
    return 0;
  }
};

// Re-process existing parcels to extract lot numbers and calculate areas
export const reprocessExistingParcels = async (propertyId: string): Promise<void> => {
  console.log('🔄 Starting re-processing of existing parcels...');
  
  try {
    const parcels = await getCadastralParcels(propertyId);
    console.log(`📋 Found ${parcels.length} parcels to process`);
    
    let updatedCount = 0;
    
    for (const parcel of parcels) {
      let needsUpdate = false;
      const updates: any = {};
      
      // Extract lot number if missing
      if (!parcel.lotNumber && parcel.parcelId) {
        const extractedLotNumber = extractLotNumberFromParcelId(parcel.parcelId);
        if (extractedLotNumber) {
          updates.lotNumber = extractedLotNumber;
          needsUpdate = true;
          console.log(`📝 Will update parcel ${parcel.parcelId} with lot number: ${extractedLotNumber}`);
        }
      }
      
      // Calculate area if missing and coordinates available
      if (!parcel.areaHectares && parcel.boundaryCoordinates?.length >= 3) {
        const calculatedArea = calculateParcelArea(parcel.boundaryCoordinates);
        if (calculatedArea > 0) {
          updates.areaHectares = calculatedArea;
          needsUpdate = true;
          console.log(`📐 Will update parcel ${parcel.parcelId} with area: ${calculatedArea.toFixed(4)} ha`);
        }
      }
      
      // Update display name if we have lot number
      if (updates.lotNumber && !parcel.displayName) {
        updates.displayName = `Parcela ${updates.lotNumber}`;
        needsUpdate = true;
      }
      
      // Apply updates if needed
      if (needsUpdate) {
        const success = await updateCadastralParcel(parcel.id, updates);
        if (success) {
          updatedCount++;
          console.log(`✅ Updated parcel ${parcel.parcelId}`);
        } else {
          console.error(`❌ Failed to update parcel ${parcel.parcelId}`);
        }
      }
    }
    
    console.log(`🎉 Re-processing complete! Updated ${updatedCount} out of ${parcels.length} parcels`);
  } catch (error) {
    console.error('❌ Error during parcel re-processing:', error);
  }
};
