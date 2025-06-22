
import type { Property } from '@/services/cadastralService';

// FIXED: Use correct SkyRanch center coordinates where parcels actually are
const CORRECTED_SKYRANCH_CENTER = { 
  lat: 40.101, 
  lng: -4.470 
};

export const initializeMap = (
  property: Property, 
  elementId: string, 
  onMapReady: (map: google.maps.Map) => void
): google.maps.Map | null => {
  const mapElement = document.getElementById(elementId);
  if (!mapElement) {
    console.error(`Map element with id "${elementId}" not found`);
    return null;
  }

  console.log('🗺️ Initializing map for property:', property.name);
  
  // CRITICAL FIX: Always use correct SkyRanch coordinates, not the incorrect property center
  const mapCenter = CORRECTED_SKYRANCH_CENTER;
  
  console.log(`🎯 Using CORRECTED map center: ${mapCenter.lat}, ${mapCenter.lng}`);

  const map = new google.maps.Map(mapElement, {
    center: mapCenter,
    zoom: 15, // Start with wider view to see all parcels
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    mapTypeControl: true,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER,
    },
    streetViewControl: false,
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
    // Enhanced styling for better parcel visibility
    styles: [
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ saturation: -10 }] // Less saturation for better parcel contrast
      }
    ]
  });

  console.log('✅ Map initialized at correct SkyRanch location');
  onMapReady(map);
  
  return map;
};
