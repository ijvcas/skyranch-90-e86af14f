
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

// ENHANCED: Use the new precise transformation functions
export const convertUTMToWGS84 = (x: number, y: number, zone: number): { lat: number; lng: number } => {
  console.log(`🔄 REDIRECTING TO PRECISE UTM CONVERSION: Zone ${zone}: (${x}, ${y})`);
  return transformUTMToWGS84Precise(x, y, zone);
};

export const detectCoordinateSystem = (coordinates: number[][]): string => {
  if (!coordinates || coordinates.length === 0) return 'EPSG:4326';
  
  const firstCoord = coordinates[0];
  if (!firstCoord || firstCoord.length < 2) return 'EPSG:4326';
  
  const x = firstCoord[0];
  const y = firstCoord[1];
  
  console.log(`🔍 COORDINATE DETECTION for: (${x}, ${y})`);
  
  // Check if already in WGS84
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    console.log('✅ Detected WGS84 (EPSG:4326) - coordinates in lat/lng range');
    return 'EPSG:4326';
  }
  
  // FIXED: More specific ranges for Spanish UTM coordinates around SkyRanch area
  if ((x >= 350000 && x <= 450000 && y >= 4400000 && y <= 4500000) ||
      (y >= 350000 && y <= 450000 && x >= 4400000 && x <= 4500000)) {
    console.log('✅ Detected Spanish UTM coordinates near SkyRanch, using Zone 30N (EPSG:25830)');
    return 'EPSG:25830';
  }
  
  console.log('⚠️ Unable to detect coordinate system, defaulting to EPSG:4326');
  return 'EPSG:4326';
};

export const transformCoordinates = (
  coordinates: number[][],
  fromEPSG: string,
  toEPSG: string = 'EPSG:4326'
): { lat: number; lng: number }[] => {
  console.log(`\n🔄 REDIRECTING TO PRECISE COORDINATE TRANSFORMATION`);
  console.log(`From: ${fromEPSG} to ${toEPSG}`);
  
  return transformCoordinatesPrecise(coordinates, fromEPSG, toEPSG);
};
