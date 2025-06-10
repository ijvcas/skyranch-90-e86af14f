
// SkyRanch coordinates for Google Maps (lat, lng format)
export const SKYRANCH_CENTER = { lat: 40.317645, lng: -4.474297 }; // 40°19'3.52"N, 4°28'27.47"W

// Real lot boundaries based on the actual aerial image layout - irregular shapes
// Converted to Google Maps lat/lng format for Polygon overlays
export const REAL_LOT_BOUNDARIES = [
  {
    id: 'lot-1',
    name: 'Lote 1',
    number: 1,
    coordinates: [
      { lat: 40.318200, lng: -4.475200 },
      { lat: 40.318300, lng: -4.474800 },
      { lat: 40.318150, lng: -4.474400 },
      { lat: 40.317900, lng: -4.474300 },
      { lat: 40.317800, lng: -4.474600 },
      { lat: 40.317850, lng: -4.474900 },
      { lat: 40.318000, lng: -4.475100 },
      { lat: 40.318200, lng: -4.475200 }
    ]
  },
  {
    id: 'lot-2',
    name: 'Lote 2',
    number: 2,
    coordinates: [
      { lat: 40.318150, lng: -4.474400 },
      { lat: 40.318250, lng: -4.474000 },
      { lat: 40.318100, lng: -4.473600 },
      { lat: 40.317850, lng: -4.473500 },
      { lat: 40.317750, lng: -4.473800 },
      { lat: 40.317900, lng: -4.474300 },
      { lat: 40.318150, lng: -4.474400 }
    ]
  },
  {
    id: 'lot-3',
    name: 'Lote 3',
    number: 3,
    coordinates: [
      { lat: 40.317800, lng: -4.474600 },
      { lat: 40.317900, lng: -4.474300 },
      { lat: 40.317750, lng: -4.473800 },
      { lat: 40.317500, lng: -4.473700 },
      { lat: 40.317400, lng: -4.474000 },
      { lat: 40.317450, lng: -4.474400 },
      { lat: 40.317800, lng: -4.474600 }
    ]
  },
  {
    id: 'lot-4',
    name: 'Lote 4',
    number: 4,
    coordinates: [
      { lat: 40.317850, lng: -4.473500 },
      { lat: 40.317950, lng: -4.473200 },
      { lat: 40.317800, lng: -4.472800 },
      { lat: 40.317550, lng: -4.472700 },
      { lat: 40.317450, lng: -4.473000 },
      { lat: 40.317500, lng: -4.473700 },
      { lat: 40.317850, lng: -4.473500 }
    ]
  },
  {
    id: 'lot-5',
    name: 'Lote 5',
    number: 5,
    coordinates: [
      { lat: 40.317450, lng: -4.474400 },
      { lat: 40.317400, lng: -4.474000 },
      { lat: 40.317300, lng: -4.473700 },
      { lat: 40.317100, lng: -4.473600 },
      { lat: 40.317000, lng: -4.473900 },
      { lat: 40.317050, lng: -4.474300 },
      { lat: 40.317200, lng: -4.474500 },
      { lat: 40.317450, lng: -4.474400 }
    ]
  },
  {
    id: 'lot-6',
    name: 'Lote 6',
    number: 6,
    coordinates: [
      { lat: 40.317300, lng: -4.473700 },
      { lat: 40.317350, lng: -4.473400 },
      { lat: 40.317200, lng: -4.473000 },
      { lat: 40.317000, lng: -4.472900 },
      { lat: 40.316900, lng: -4.473200 },
      { lat: 40.317100, lng: -4.473600 },
      { lat: 40.317300, lng: -4.473700 }
    ]
  },
  {
    id: 'lot-7',
    name: 'Lote 7',
    number: 7,
    coordinates: [
      { lat: 40.317800, lng: -4.472800 },
      { lat: 40.317900, lng: -4.472400 },
      { lat: 40.317700, lng: -4.472000 },
      { lat: 40.317400, lng: -4.471900 },
      { lat: 40.317250, lng: -4.472200 },
      { lat: 40.317300, lng: -4.472600 },
      { lat: 40.317550, lng: -4.472900 },
      { lat: 40.317800, lng: -4.472800 }
    ]
  }
];

// Color palette for lot management
export const LOT_COLORS = {
  grazing: '#10b981', // Green
  resting: '#f59e0b',  // Amber
  maintenance: '#ef4444', // Red
  preparation: '#8b5cf6', // Purple
  reserved: '#06b6d4', // Cyan
  default: '#6b7280' // Gray
};

// Google Maps API configuration
export const GOOGLE_MAPS_CONFIG = {
  zoom: 19,
  mapTypeId: 'satellite' as google.maps.MapTypeId,
  streetViewControl: false,
  fullscreenControl: true,
  mapTypeControl: true,
  zoomControl: true,
  rotateControl: false,
  scaleControl: true
};

// Default API key message for users
export const API_KEY_INSTRUCTIONS = `
Para usar Google Maps necesitas una API key:
1. Ve a https://console.cloud.google.com/
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de Maps JavaScript
4. Crea una API key en "Credenciales"
5. Ingresa tu API key aquí
`;
