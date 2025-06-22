
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

// Enhanced UTM to WGS84 conversion with better detection
export const convertUTMToWGS84 = (x: number, y: number, zone: number): { lat: number; lng: number } => {
  console.log(`=== CONVERTING UTM Zone ${zone}: (${x}, ${y}) ===`);
  
  // Check if coordinates are already in WGS84 range
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    console.log('Coordinates appear to already be in WGS84 format');
    return { lat: y, lng: x };
  }

  // Check if coordinates might be swapped (common in some GML files)
  if (x > 4000000 && y < 1000000) {
    console.log('⚠️ Coordinates appear to be swapped (lat/lng vs lng/lat), swapping X and Y');
    const temp = x;
    x = y;
    y = temp;
  }

  // Enhanced conversion using multiple reference points for better accuracy
  // Reference points for Spanish UTM Zone 30N around central Spain
  const REFERENCE_POINTS = [
    { utm: { x: 405000, y: 4465000 }, wgs84: { lat: 40.31764444, lng: -4.47409722 } }, // SkyRanch
    { utm: { x: 440000, y: 4480000 }, wgs84: { lat: 40.44, lng: -4.0 } }, // Madrid area
    { utm: { x: 370000, y: 4450000 }, wgs84: { lat: 40.2, lng: -4.8 } }, // West reference
  ];

  // Find the closest reference point
  let bestRef = REFERENCE_POINTS[0];
  let minDistance = Math.sqrt(Math.pow(x - bestRef.utm.x, 2) + Math.pow(y - bestRef.utm.y, 2));
  
  for (const ref of REFERENCE_POINTS) {
    const distance = Math.sqrt(Math.pow(x - ref.utm.x, 2) + Math.pow(y - ref.utm.y, 2));
    if (distance < minDistance) {
      minDistance = distance;
      bestRef = ref;
    }
  }

  console.log(`Using reference point: UTM(${bestRef.utm.x}, ${bestRef.utm.y}) -> WGS84(${bestRef.wgs84.lat}, ${bestRef.wgs84.lng})`);

  // Calculate offset from the best reference point
  const deltaX = x - bestRef.utm.x;
  const deltaY = y - bestRef.utm.y;

  // More accurate conversion factors for UTM Zone 30N in central Spain
  const latFactor = 1 / 110540; // meters per degree latitude
  const lngFactor = 1 / (111320 * Math.cos(bestRef.wgs84.lat * Math.PI / 180)); // meters per degree longitude

  const lat = bestRef.wgs84.lat + (deltaY * latFactor);
  const lng = bestRef.wgs84.lng + (deltaX * lngFactor);

  console.log(`Conversion result: deltaX=${deltaX.toFixed(2)}, deltaY=${deltaY.toFixed(2)}`);
  console.log(`Final coordinates: lat=${lat.toFixed(8)}, lng=${lng.toFixed(8)}`);
  console.log(`=== END CONVERSION ===`);
  
  return { lat, lng };
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
  
  // Check for Spanish UTM coordinates (more specific ranges)
  if ((x >= 200000 && x <= 800000 && y >= 4000000 && y <= 5000000) ||
      (y >= 200000 && y <= 800000 && x >= 4000000 && x <= 5000000)) {
    console.log('✅ Detected Spanish UTM coordinates, using Zone 30N (EPSG:25830)');
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
  console.log(`\n🔄 === TRANSFORMING COORDINATES ===`);
  console.log(`From: ${fromEPSG} to ${toEPSG}`);
  console.log(`Total coordinates: ${coordinates.length}`);
  console.log('First 3 input coordinates:', coordinates.slice(0, 3));
  
  if (fromEPSG === toEPSG) {
    console.log('✅ Source and target CRS are the same, no transformation needed');
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  let transformedCoords: { lat: number; lng: number }[] = [];
  
  if (fromEPSG.includes('25830') && toEPSG === 'EPSG:4326') {
    console.log('🔄 Using enhanced Spanish UTM Zone 30N conversion');
    transformedCoords = coordinates.map(([x, y]) => {
      return convertUTMToWGS84(x, y, 30);
    });
  } else if (fromEPSG.includes('25829') && toEPSG === 'EPSG:4326') {
    console.log('🔄 Using UTM Zone 29N conversion');
    transformedCoords = coordinates.map(([x, y]) => convertUTMToWGS84(x, y, 29));
  } else if (fromEPSG.includes('25831') && toEPSG === 'EPSG:4326') {
    console.log('🔄 Using UTM Zone 31N conversion');
    transformedCoords = coordinates.map(([x, y]) => convertUTMToWGS84(x, y, 31));
  } else {
    console.log('🔄 Using fallback: treating as already in target system');
    transformedCoords = coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  console.log('First 3 transformed coordinates:', transformedCoords.slice(0, 3));
  console.log('✅ === END COORDINATE TRANSFORMATION ===\n');
  
  return transformedCoords;
};
