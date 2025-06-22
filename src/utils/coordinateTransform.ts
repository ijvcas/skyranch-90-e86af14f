
// Coordinate system transformation utilities for cadastral data
export interface CoordinateSystem {
  epsg: string;
  name: string;
  proj4: string;
}

// Common Spanish coordinate systems
export const COORDINATE_SYSTEMS: Record<string, CoordinateSystem> = {
  'EPSG:25830': {
    epsg: 'EPSG:25830',
    name: 'ETRS89 / UTM zone 30N',
    proj4: '+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
  },
  'EPSG:25829': {
    epsg: 'EPSG:25829',
    name: 'ETRS89 / UTM zone 29N',
    proj4: '+proj=utm +zone=29 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
  },
  'EPSG:25831': {
    epsg: 'EPSG:25831',
    name: 'ETRS89 / UTM zone 31N',
    proj4: '+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
  },
  'EPSG:4326': {
    epsg: 'EPSG:4326',
    name: 'WGS84',
    proj4: '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'
  }
};

// Simple UTM to WGS84 conversion for Spanish zones
export const convertUTMToWGS84 = (x: number, y: number, zone: number): { lat: number; lng: number } => {
  // Simplified conversion - in a real implementation you'd use proj4js
  // This is a basic approximation for Spanish UTM zones
  const centralMeridian = (zone - 1) * 6 - 180 + 3;
  
  // Basic conversion approximation
  const lng = centralMeridian + (x - 500000) / (111320 * Math.cos(y * Math.PI / 180 / 111320));
  const lat = y / 111320;
  
  return { lat, lng };
};

export const detectCoordinateSystem = (coordinates: number[][]): string => {
  if (!coordinates || coordinates.length === 0) return 'EPSG:4326';
  
  const firstCoord = coordinates[0];
  if (!firstCoord || firstCoord.length < 2) return 'EPSG:4326';
  
  const x = firstCoord[0];
  const y = firstCoord[1];
  
  // Detect based on coordinate ranges
  if (x >= -180 && x <= 180 && y >= -90 && y <= 90) {
    return 'EPSG:4326'; // WGS84
  }
  
  // Spanish UTM zones
  if (x >= 160000 && x <= 800000 && y >= 4000000 && y <= 4900000) {
    if (x < 300000) return 'EPSG:25829'; // Zone 29N
    if (x < 600000) return 'EPSG:25830'; // Zone 30N
    return 'EPSG:25831'; // Zone 31N
  }
  
  return 'EPSG:4326'; // Default fallback
};

export const transformCoordinates = (
  coordinates: number[][],
  fromEPSG: string,
  toEPSG: string = 'EPSG:4326'
): { lat: number; lng: number }[] => {
  if (fromEPSG === toEPSG) {
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  // Handle UTM to WGS84 conversion
  if (fromEPSG.includes('25830') && toEPSG === 'EPSG:4326') {
    return coordinates.map(([x, y]) => convertUTMToWGS84(x, y, 30));
  }
  if (fromEPSG.includes('25829') && toEPSG === 'EPSG:4326') {
    return coordinates.map(([x, y]) => convertUTMToWGS84(x, y, 29));
  }
  if (fromEPSG.includes('25831') && toEPSG === 'EPSG:4326') {
    return coordinates.map(([x, y]) => convertUTMToWGS84(x, y, 31));
  }
  
  // Fallback: assume coordinates are already in target system
  return coordinates.map(([lng, lat]) => ({ lat, lng }));
};
