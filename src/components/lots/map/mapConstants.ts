
// SkyRanch coordinates from the images provided
export const SKYRANCH_CENTER: [number, number] = [-4.474297, 40.317645]; // 4°28'27.47"W, 40°19'3.52"N

// Real lot boundaries based on the actual aerial image layout - irregular shapes
export const REAL_LOT_BOUNDARIES = [
  {
    id: 'lot-1',
    name: 'Lote 1',
    number: 1,
    coordinates: [
      [-4.475200, 40.318200],
      [-4.474800, 40.318300],
      [-4.474400, 40.318150],
      [-4.474300, 40.317900],
      [-4.474600, 40.317800],
      [-4.474900, 40.317850],
      [-4.475100, 40.318000],
      [-4.475200, 40.318200]
    ] as [number, number][]
  },
  {
    id: 'lot-2',
    name: 'Lote 2',
    number: 2,
    coordinates: [
      [-4.474400, 40.318150],
      [-4.474000, 40.318250],
      [-4.473600, 40.318100],
      [-4.473500, 40.317850],
      [-4.473800, 40.317750],
      [-4.474300, 40.317900],
      [-4.474400, 40.318150]
    ] as [number, number][]
  },
  {
    id: 'lot-3',
    name: 'Lote 3',
    number: 3,
    coordinates: [
      [-4.474600, 40.317800],
      [-4.474300, 40.317900],
      [-4.473800, 40.317750],
      [-4.473700, 40.317500],
      [-4.474000, 40.317400],
      [-4.474400, 40.317450],
      [-4.474600, 40.317800]
    ] as [number, number][]
  },
  {
    id: 'lot-4',
    name: 'Lote 4',
    number: 4,
    coordinates: [
      [-4.473500, 40.317850],
      [-4.473200, 40.317950],
      [-4.472800, 40.317800],
      [-4.472700, 40.317550],
      [-4.473000, 40.317450],
      [-4.473700, 40.317500],
      [-4.473500, 40.317850]
    ] as [number, number][]
  },
  {
    id: 'lot-5',
    name: 'Lote 5',
    number: 5,
    coordinates: [
      [-4.474400, 40.317450],
      [-4.474000, 40.317400],
      [-4.473700, 40.317300],
      [-4.473600, 40.317100],
      [-4.473900, 40.317000],
      [-4.474300, 40.317050],
      [-4.474500, 40.317200],
      [-4.474400, 40.317450]
    ] as [number, number][]
  },
  {
    id: 'lot-6',
    name: 'Lote 6',
    number: 6,
    coordinates: [
      [-4.473700, 40.317300],
      [-4.473400, 40.317350],
      [-4.473000, 40.317200],
      [-4.472900, 40.317000],
      [-4.473200, 40.316900],
      [-4.473600, 40.317100],
      [-4.473700, 40.317300]
    ] as [number, number][]
  },
  {
    id: 'lot-7',
    name: 'Lote 7',
    number: 7,
    coordinates: [
      [-4.472800, 40.317800],
      [-4.472400, 40.317900],
      [-4.472000, 40.317700],
      [-4.471900, 40.317400],
      [-4.472200, 40.317250],
      [-4.472600, 40.317300],
      [-4.472900, 40.317550],
      [-4.472800, 40.317800]
    ] as [number, number][]
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

// Updated to use a working public token - users should replace with their own
export const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
