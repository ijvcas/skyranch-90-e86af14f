
// Rebuilt map initializer with strict SkyRanch positioning
import { SKYRANCH_COORDINATES } from '@/utils/cadastral/coordinateSystemRebuild';
import type { Property } from '@/services/cadastralService';

export const initializeRebuildMap = (
  property: Property,
  containerId: string,
  onMapReady: (map: google.maps.Map) => void
): google.maps.Map | null => {
  console.log('🗺️ INITIALIZING REBUILD MAP AT SKYRANCH');
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Map container '${containerId}' not found`);
    return null;
  }

  // Force map to SkyRanch coordinates regardless of property settings
  const mapOptions: google.maps.MapOptions = {
    center: { 
      lat: SKYRANCH_COORDINATES.lat, 
      lng: SKYRANCH_COORDINATES.lng 
    },
    zoom: 18, // High zoom to see parcels clearly
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    gestureHandling: 'greedy',
    // Restrict map to reasonable area around SkyRanch
    restriction: {
      latLngBounds: {
        north: SKYRANCH_COORDINATES.lat + 0.01,
        south: SKYRANCH_COORDINATES.lat - 0.01,
        east: SKYRANCH_COORDINATES.lng + 0.01,
        west: SKYRANCH_COORDINATES.lng - 0.01,
      },
      strictBounds: false,
    },
  };

  console.log(`🎯 Creating map at EXACT SkyRanch coordinates: ${SKYRANCH_COORDINATES.lat}, ${SKYRANCH_COORDINATES.lng}`);
  
  const map = new google.maps.Map(container, mapOptions);
  
  // Add SkyRanch center marker for reference
  new google.maps.Marker({
    position: SKYRANCH_COORDINATES,
    map: map,
    title: 'SkyRanch Center',
    icon: {
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzEwYjk4MSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+',
      scaledSize: new google.maps.Size(16, 16),
      anchor: new google.maps.Point(8, 8),
    },
  });

  // Callback when map is ready
  google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
    console.log('✅ Rebuild map fully loaded at SkyRanch coordinates');
    onMapReady(map);
  });

  return map;
};
