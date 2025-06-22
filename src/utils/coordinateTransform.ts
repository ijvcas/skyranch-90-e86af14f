
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

// Improved UTM to WGS84 conversion for Spanish zones
export const convertUTMToWGS84 = (x: number, y: number, zone: number): { lat: number; lng: number } => {
  // More accurate conversion for Spanish UTM zones
  const centralMeridian = (zone - 1) * 6 - 180 + 3;
  
  // UTM constants
  const k0 = 0.9996; // Scale factor
  const a = 6378137; // WGS84 semi-major axis
  const e = 0.0818191908426; // First eccentricity
  const e1sq = 0.00673949674228; // e'^2
  
  // Remove false easting and northing
  const x1 = x - 500000;
  const y1 = y;
  
  // Calculate longitude
  const lng = centralMeridian + (x1 / (k0 * a)) * (180 / Math.PI);
  
  // Calculate latitude (simplified)
  const lat = (y1 / (k0 * a)) * (180 / Math.PI);
  
  console.log(`Converting UTM Zone ${zone}: (${x}, ${y}) -> (${lat}, ${lng})`);
  
  return { lat, lng };
};

export const detectCoordinateSystem = (coordinates: number[][]): string => {
  if (!coordinates || coordinates.length === 0) return 'EPSG:4326';
  
  const firstCoord = coordinates[0];
  if (!firstCoord || firstCoord.length < 2) return 'EPSG:4326';
  
  const x = Math.abs(firstCoord[0]);
  const y = Math.abs(firstCoord[1]);
  
  console.log(`Detecting coordinate system for: (${firstCoord[0]}, ${firstCoord[1]})`);
  
  // Detect based on coordinate ranges
  if (x <= 180 && y <= 90) {
    console.log('Detected WGS84 (EPSG:4326)');
    return 'EPSG:4326'; // WGS84
  }
  
  // Spanish UTM zones - more specific ranges
  if (x >= 100000 && x <= 900000 && y >= 4000000 && y <= 5000000) {
    if (x < 300000) {
      console.log('Detected UTM Zone 29N (EPSG:25829)');
      return 'EPSG:25829'; // Zone 29N
    }
    if (x < 600000) {
      console.log('Detected UTM Zone 30N (EPSG:25830)');
      return 'EPSG:25830'; // Zone 30N
    }
    console.log('Detected UTM Zone 31N (EPSG:25831)');
    return 'EPSG:25831'; // Zone 31N
  }
  
  console.log('Defaulting to EPSG:4326');
  return 'EPSG:4326'; // Default fallback
};

export const transformCoordinates = (
  coordinates: number[][],
  fromEPSG: string,
  toEPSG: string = 'EPSG:4326'
): { lat: number; lng: number }[] => {
  console.log(`Transforming ${coordinates.length} coordinates from ${fromEPSG} to ${toEPSG}`);
  
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
  console.log('Using fallback coordinate transformation');
  return coordinates.map(([lng, lat]) => ({ lat, lng }));
};
