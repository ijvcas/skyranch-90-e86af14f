
// SkyRanch coordinates from the images provided
export const SKYRANCH_CENTER: [number, number] = [-4.474297, 40.317645]; // 4°28'27.47"W, 40°19'3.52"N

// Real lot divisions based on the aerial image layout
export const REAL_LOT_BOUNDARIES = [
  {
    id: 'lot-1',
    name: 'Lote 1',
    number: 1,
    coordinates: [
      [-4.474850, 40.318100],
      [-4.474200, 40.318100],
      [-4.474200, 40.317800],
      [-4.474850, 40.317800],
      [-4.474850, 40.318100]
    ] as [number, number][]
  },
  {
    id: 'lot-2',
    name: 'Lote 2',
    number: 2,
    coordinates: [
      [-4.474200, 40.318100],
      [-4.473550, 40.318100],
      [-4.473550, 40.317800],
      [-4.474200, 40.317800],
      [-4.474200, 40.318100]
    ] as [number, number][]
  },
  {
    id: 'lot-3',
    name: 'Lote 3',
    number: 3,
    coordinates: [
      [-4.474850, 40.317800],
      [-4.474200, 40.317800],
      [-4.474200, 40.317500],
      [-4.474850, 40.317500],
      [-4.474850, 40.317800]
    ] as [number, number][]
  },
  {
    id: 'lot-4',
    name: 'Lote 4',
    number: 4,
    coordinates: [
      [-4.474200, 40.317800],
      [-4.473550, 40.317800],
      [-4.473550, 40.317500],
      [-4.474200, 40.317500],
      [-4.474200, 40.317800]
    ] as [number, number][]
  },
  {
    id: 'lot-5',
    name: 'Lote 5',
    number: 5,
    coordinates: [
      [-4.474850, 40.317500],
      [-4.474200, 40.317500],
      [-4.474200, 40.317200],
      [-4.474850, 40.317200],
      [-4.474850, 40.317500]
    ] as [number, number][]
  },
  {
    id: 'lot-6',
    name: 'Lote 6',
    number: 6,
    coordinates: [
      [-4.474200, 40.317500],
      [-4.473550, 40.317500],
      [-4.473550, 40.317200],
      [-4.474200, 40.317200],
      [-4.474200, 40.317500]
    ] as [number, number][]
  },
  {
    id: 'lot-7',
    name: 'Lote 7',
    number: 7,
    coordinates: [
      [-4.473550, 40.318100],
      [-4.472900, 40.318100],
      [-4.472900, 40.317200],
      [-4.473550, 40.317200],
      [-4.473550, 40.318100]
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

// Use a demo token - in production, this should come from environment variables
export const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
