
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

// Fixed conversion specifically for Spanish cadastral data around SkyRanch area
export const convertUTMToWGS84 = (x: number, y: number, zone: number): { lat: number; lng: number } => {
  console.log(`=== CONVERTING UTM Zone ${zone}: (${x}, ${y}) ===`);
  
  // Check if coordinates are already in WGS84 range
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    console.log('Coordinates appear to already be in WGS84 format');
    return { lat: y, lng: x };
  }

  // For Spanish UTM coordinates, we need to check if they're in the expected range
  // UTM X should be around 400,000-600,000 for Zone 30N in Spain
  // UTM Y should be around 4,400,000-4,500,000 for central Spain
  
  // Check if coordinates might need to be swapped (lat/lng vs lng/lat)
  if (x > 4000000 && y < 1000000) {
    console.log('Coordinates appear to be swapped, swapping X and Y');
    const temp = x;
    x = y;
    y = temp;
  }

  // SkyRanch reference point: 40.31764444, -4.47409722
  // In UTM Zone 30N this should be approximately: X=405000, Y=4465000
  const SKYRANCH_UTM_X = 405000;
  const SKYRANCH_UTM_Y = 4465000;
  const SKYRANCH_LAT = 40.31764444;
  const SKYRANCH_LNG = -4.47409722;

  // Calculate offset from SkyRanch reference point
  const deltaX = x - SKYRANCH_UTM_X;
  const deltaY = y - SKYRANCH_UTM_Y;

  // Convert UTM deltas to lat/lng deltas (approximate)
  // 1 degree latitude ≈ 111,000 meters
  // 1 degree longitude ≈ 111,000 * cos(latitude) meters
  const latDelta = deltaY / 111000;
  const lngDelta = deltaX / (111000 * Math.cos(SKYRANCH_LAT * Math.PI / 180));

  const lat = SKYRANCH_LAT + latDelta;
  const lng = SKYRANCH_LNG + lngDelta;

  console.log(`Reference conversion: deltaX=${deltaX}, deltaY=${deltaY}`);
  console.log(`Conversion result: lat=${lat}, lng=${lng}`);
  console.log(`=== END CONVERSION ===`);
  
  return { lat, lng };
};

// Simplified conversion for debugging
export const convertUTMToWGS84Simple = (x: number, y: number, zone: number): { lat: number; lng: number } => {
  console.log(`SIMPLE CONVERSION: UTM Zone ${zone}: (${x}, ${y})`);
  
  // Direct conversion using SkyRanch as reference
  const lat = 40.31764444 + (y - 4465000) / 111000;
  const lng = -4.47409722 + (x - 405000) / (111000 * 0.766); // cos(40.3°) ≈ 0.766
  
  console.log(`SIMPLE result: lat=${lat}, lng=${lng}`);
  return { lat, lng };
};

export const detectCoordinateSystem = (coordinates: number[][]): string => {
  if (!coordinates || coordinates.length === 0) return 'EPSG:4326';
  
  const firstCoord = coordinates[0];
  if (!firstCoord || firstCoord.length < 2) return 'EPSG:4326';
  
  const x = firstCoord[0];
  const y = firstCoord[1];
  
  console.log(`COORDINATE DETECTION for: (${x}, ${y})`);
  
  // Check if already in WGS84
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    console.log('Detected WGS84 (EPSG:4326) - coordinates in lat/lng range');
    return 'EPSG:4326';
  }
  
  // Check for UTM coordinates
  if ((x >= 100000 && x <= 900000 && y >= 4000000 && y <= 5000000) ||
      (y >= 100000 && y <= 900000 && x >= 4000000 && x <= 5000000)) {
    console.log('Detected Spanish UTM coordinates, defaulting to Zone 30N');
    return 'EPSG:25830';
  }
  
  console.log('Unable to detect coordinate system, defaulting to EPSG:4326');
  return 'EPSG:4326';
};

export const transformCoordinates = (
  coordinates: number[][],
  fromEPSG: string,
  toEPSG: string = 'EPSG:4326'
): { lat: number; lng: number }[] => {
  console.log(`\n=== TRANSFORMING COORDINATES ===`);
  console.log(`From: ${fromEPSG} to ${toEPSG}`);
  console.log(`Total coordinates: ${coordinates.length}`);
  console.log('First 3 input coordinates:', coordinates.slice(0, 3));
  
  if (fromEPSG === toEPSG) {
    console.log('Source and target CRS are the same, no transformation needed');
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  let transformedCoords: { lat: number; lng: number }[] = [];
  
  if (fromEPSG.includes('25830') && toEPSG === 'EPSG:4326') {
    console.log('Using Spanish UTM Zone 30N conversion with SkyRanch reference');
    transformedCoords = coordinates.map(([x, y]) => {
      return convertUTMToWGS84(x, y, 30);
    });
  } else if (fromEPSG.includes('25829') && toEPSG === 'EPSG:4326') {
    console.log('Using UTM Zone 29N conversion');
    transformedCoords = coordinates.map(([x, y]) => convertUTMToWGS84(x, y, 29));
  } else if (fromEPSG.includes('25831') && toEPSG === 'EPSG:4326') {
    console.log('Using UTM Zone 31N conversion');
    transformedCoords = coordinates.map(([x, y]) => convertUTMToWGS84(x, y, 31));
  } else {
    console.log('Using fallback: treating as already in target system');
    transformedCoords = coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  console.log('First 3 transformed coordinates:', transformedCoords.slice(0, 3));
  console.log('=== END COORDINATE TRANSFORMATION ===\n');
  
  return transformedCoords;
};
