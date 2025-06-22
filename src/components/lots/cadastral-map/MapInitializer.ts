
import type { Property } from '@/services/cadastralService';

export const initializeMap = (
  selectedProperty: Property,
  mapElementId: string,
  onMapReady: (map: google.maps.Map) => void
): google.maps.Map | null => {
  const mapElement = document.getElementById(mapElementId);
  if (!mapElement) return null;

  console.log('Initializing cadastral map with center:', selectedProperty.centerLat, selectedProperty.centerLng);

  const newMap = new google.maps.Map(mapElement, {
    center: { 
      lat: selectedProperty.centerLat, 
      lng: selectedProperty.centerLng 
    },
    zoom: selectedProperty.zoomLevel || 16,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
  });

  onMapReady(newMap);
  return newMap;
};
