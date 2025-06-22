
import type { Property } from '@/services/cadastralService';

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
  
  // CRITICAL FIX: Use the property's actual center coordinates from database
  const mapCenter = {
    lat: property.centerLat,
    lng: property.centerLng
  };
  
  console.log(`🎯 Using property center coordinates: ${mapCenter.lat}, ${mapCenter.lng}`);

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

  console.log('✅ Map initialized at property center coordinates');
  onMapReady(map);
  
  return map;
};
