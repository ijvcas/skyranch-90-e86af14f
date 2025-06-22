
// Coordinate system transformation utilities for cadastral data
import { transformUTMToWGS84Precise, transformCoordinatesPrecise } from './cadastral/gml/precisionCoordinateTransform';

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

// CONSERVATIVE: Use the new transformation functions without aggressive validation
export const convertUTMToWGS84 = (x: number, y: number, zone: number): { lat: number; lng: number } => {
  console.log(`🔄 CONSERVATIVE UTM CONVERSION: Zone ${zone}: (${x}, ${y})`);
  return transformUTMToWGS84Precise(x, y, zone);
};

export const detectCoordinateSystem = (coordinates: number[][]): string => {
  if (!coordinates || coordinates.length === 0) return 'EPSG:4326';
  
  const firstCoord = coordinates[0];
  if (!firstCoord || firstCoord.length < 2) return 'EPSG:4326';
  
  const x = firstCoord[0];
  const y = firstCoord[1];
  
  console.log(`🔍 CONSERVATIVE COORDINATE DETECTION for: (${x}, ${y})`);
  
  // Check if already in WGS84
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    console.log('✅ Detected WGS84 (EPSG:4326) - coordinates in lat/lng range');
    return 'EPSG:4326';
  }
  
  // CONSERVATIVE: Broader ranges for Spanish UTM coordinates
  if (x >= 200000 && x <= 800000 && y >= 4000000 && y <= 5000000) {
    console.log('✅ Detected Spanish UTM coordinates, using Zone 30N (EPSG:25830)');
    return 'EPSG:25830';
  } else if (y >= 200000 && y <= 800000 && x >= 4000000 && x <= 5000000) {
    console.log('⚠️ Coordinates appear swapped, treating as Zone 30N (EPSG:25830)');
    return 'EPSG:25830';
  }
  
  console.log('⚠️ Unable to detect coordinate system, defaulting to EPSG:25830 for Spanish data');
  return 'EPSG:25830'; // Default for Spanish cadastral data
};

export const transformCoordinates = (
  coordinates: number[][],
  fromEPSG: string,
  toEPSG: string = 'EPSG:4326'
): { lat: number; lng: number }[] => {
  console.log(`\n🔄 CONSERVATIVE COORDINATE TRANSFORMATION`);
  console.log(`From: ${fromEPSG} to ${toEPSG}`);
  
  return transformCoordinatesPrecise(coordinates, fromEPSG, toEPSG);
};
