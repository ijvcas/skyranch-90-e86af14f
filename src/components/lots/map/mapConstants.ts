
// SkyRanch coordinates for Google Maps (lat, lng format)
export const SKYRANCH_CENTER = { lat: 40.317645, lng: -4.474297 }; // 40°19'3.52"N, 4°28'27.47"W

// Color palette for lot management
export const LOT_COLORS = {
  grazing: '#10b981', // Green - Active grazing
  resting: '#f59e0b',  // Amber - Resting/Recovery
  maintenance: '#ef4444', // Red - Maintenance needed
  preparation: '#8b5cf6', // Purple - Prepared for rotation
  reserved: '#06b6d4', // Cyan - Reserved/Special use
  default: '#6b7280' // Gray - Default state
};

// Google Maps API configuration
export const GOOGLE_MAPS_CONFIG = {
  zoom: 19,
  mapTypeId: 'satellite' as const,
  streetViewControl: false,
  fullscreenControl: true,
  mapTypeControl: true,
  zoomControl: true,
  rotateControl: true, // Enable rotation controls
  scaleControl: true,
  tilt: 0, // Allow rotation
  gestureHandling: 'auto' // Enable all gestures including rotation
};

// Default API key message for users
export const API_KEY_INSTRUCTIONS = `
Para usar Google Maps necesitas una API key:
1. Ve a https://console.cloud.google.com/
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de Maps JavaScript
4. Crea una API key en "Credenciales"
5. Ingresa tu API key aquí

La API key se guardará para todos los usuarios.
`;

// Polygon area calculation helper
export const calculatePolygonArea = (coordinates: google.maps.LatLngLiteral[]) => {
  if (coordinates.length < 3) return 0;
  
  // Convert to Google Maps LatLng objects
  const path = coordinates.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
  
  // Calculate area using Google Maps geometry library
  return google.maps.geometry.spherical.computeArea(path);
};

// Convert area from square meters to hectares
export const metersToHectares = (area: number): number => {
  return area / 10000;
};

// Format area for display
export const formatArea = (areaInMeters: number): string => {
  const hectares = metersToHectares(areaInMeters);
  if (hectares < 0.01) {
    return `${Math.round(areaInMeters)} m²`;
  }
  return `${hectares.toFixed(2)} ha`;
};
