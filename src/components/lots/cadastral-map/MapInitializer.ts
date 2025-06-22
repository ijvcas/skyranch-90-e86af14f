
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
  console.log(`🎯 Using SkyRanch coordinates: ${property.centerLat.toFixed(10)}, ${property.centerLng.toFixed(10)}`);
  
  // Use the property's center coordinates from database (already correct)
  const mapCenter = {
    lat: property.centerLat,
    lng: property.centerLng
  };

  const map = new google.maps.Map(mapElement, {
    center: mapCenter,
    zoom: 18, // Higher zoom for better parcel visibility at SkyRanch
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    mapTypeControl: true,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
      mapTypeIds: [
        google.maps.MapTypeId.SATELLITE,
        google.maps.MapTypeId.HYBRID,
        google.maps.MapTypeId.ROADMAP,
        google.maps.MapTypeId.TERRAIN
      ]
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
    // Enhanced styling for perfect parcel visibility at SkyRanch
    styles: [
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ saturation: -15 }] // Optimized saturation for white number visibility
      }
    ]
  });

  // Add fallback for map loading issues
  map.addListener('idle', () => {
    console.log('🗺️ Map is idle and ready');
    
    // Check if map tiles are loading properly
    const mapDiv = map.getDiv();
    if (mapDiv) {
      const images = mapDiv.querySelectorAll('img');
      let loadedImages = 0;
      let totalImages = images.length;
      
      if (totalImages === 0) {
        console.warn('⚠️ No map tiles found, trying to refresh map');
        // Force a refresh by slightly adjusting the center
        const center = map.getCenter();
        if (center) {
          map.setCenter({
            lat: center.lat() + 0.00001,
            lng: center.lng() + 0.00001
          });
        }
      }
    }
  });

  // Handle map loading errors
  map.addListener('tilesloaded', () => {
    console.log('✅ Map tiles loaded successfully');
  });

  console.log('✅ Map initialized at SkyRanch coordinates with optimal zoom');
  
  // Ensure map is fully ready before calling callback
  google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
    console.log('🗺️ Map tiles loaded at correct SkyRanch location - ready for precise parcel rendering');
    onMapReady(map);
  });
  
  return map;
};
