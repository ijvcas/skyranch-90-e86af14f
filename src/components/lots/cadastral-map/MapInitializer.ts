
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
  console.log(`🎯 Using PRECISE property center coordinates: ${property.centerLat}, ${property.centerLng}`);
  
  // Use the property's precise center coordinates from database
  const mapCenter = {
    lat: property.centerLat,
    lng: property.centerLng
  };

  const map = new google.maps.Map(mapElement, {
    center: mapCenter,
    zoom: 16, // Optimal zoom to see all parcels clearly
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
    // Enhanced styling for perfect parcel visibility
    styles: [
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ saturation: -15 }] // Optimized saturation for white number visibility
      }
    ]
  });

  console.log('✅ Map initialized at PRECISE property center coordinates with optimal zoom');
  
  // Ensure map is fully ready before calling callback
  google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
    console.log('🗺️ Map tiles loaded - ready for precise parcel rendering');
    onMapReady(map);
  });
  
  return map;
};
