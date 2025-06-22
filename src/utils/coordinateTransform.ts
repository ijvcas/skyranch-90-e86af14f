
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

// Simplified and more accurate UTM to WGS84 conversion
export const convertUTMToWGS84 = (x: number, y: number, zone: number): { lat: number; lng: number } => {
  console.log(`=== CONVERTING UTM Zone ${zone}: (${x}, ${y}) ===`);
  
  // Check if coordinates might already be in WGS84
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    console.log('Coordinates appear to already be in WGS84 format');
    return { lat: y, lng: x };
  }

  // WGS84 ellipsoid parameters
  const a = 6378137.0; // Semi-major axis
  const f = 1/298.257223563; // Flattening
  const k0 = 0.9996; // UTM scale factor
  
  // Derived constants
  const e = Math.sqrt(2*f - f*f); // First eccentricity
  const e2 = e * e;
  const e1sq = e2 / (1 - e2);
  
  // Remove false easting
  const x1 = x - 500000.0;
  
  // Central meridian for the zone
  const centralMeridian = (zone - 1) * 6 - 180 + 3;
  const centralMeridianRad = centralMeridian * Math.PI / 180;
  
  console.log(`Central meridian for zone ${zone}: ${centralMeridian}°`);
  console.log(`Adjusted X coordinate: ${x1}`);
  
  // Calculate meridional arc
  const M = y / k0;
  
  // Footprint latitude calculation
  const mu = M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256));
  
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const J1 = 3*e1/2 - 27*e1*e1*e1/32;
  const J2 = 21*e1*e1/16 - 55*e1*e1*e1*e1/32;
  const J3 = 151*e1*e1*e1/96;
  const J4 = 1097*e1*e1*e1*e1/512;
  
  const fp = mu + J1*Math.sin(2*mu) + J2*Math.sin(4*mu) + J3*Math.sin(6*mu) + J4*Math.sin(8*mu);
  
  // Calculate latitude and longitude with high precision
  const cosFp = Math.cos(fp);
  const sinFp = Math.sin(fp);
  const tanFp = Math.tan(fp);
  
  const C1 = e1sq * cosFp * cosFp;
  const T1 = tanFp * tanFp;
  const R1 = a * (1 - e2) / Math.pow(1 - e2 * sinFp * sinFp, 1.5);
  const N1 = a / Math.sqrt(1 - e2 * sinFp * sinFp);
  const D = x1 / (N1 * k0);
  
  // Latitude calculation
  const Q1 = N1 * tanFp / R1;
  const Q2 = D * D / 2;
  const Q3 = (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*e1sq) * D*D*D*D / 24;
  const Q4 = (61 + 90*T1 + 298*C1 + 45*T1*T1 - 1.6*e1sq - 3*C1*C1) * D*D*D*D*D*D / 720;
  
  const latRad = fp - Q1 * (Q2 - Q3 + Q4);
  
  // Longitude calculation
  const Q5 = D;
  const Q6 = (1 + 2*T1 + C1) * D*D*D / 6;
  const Q7 = (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*e1sq + 24*T1*T1) * D*D*D*D*D / 120;
  
  const lngRad = centralMeridianRad + (Q5 - Q6 + Q7) / cosFp;
  
  // Convert to degrees
  const lat = latRad * 180 / Math.PI;
  const lng = lngRad * 180 / Math.PI;
  
  console.log(`Conversion result: lat=${lat}, lng=${lng}`);
  console.log(`=== END CONVERSION ===`);
  
  return { lat, lng };
};

// Alternative simplified conversion for debugging
export const convertUTMToWGS84Simple = (x: number, y: number, zone: number): { lat: number; lng: number } => {
  console.log(`SIMPLE CONVERSION: UTM Zone ${zone}: (${x}, ${y})`);
  
  // Very basic approximation for debugging
  const centralMeridian = (zone - 1) * 6 - 180 + 3;
  
  // Remove false easting and northing
  const adjustedX = x - 500000;
  
  // Very rough conversion (this is just for debugging!)
  const lat = (y - 5000000) / 111320; // Approximate meters per degree
  const lng = centralMeridian + (adjustedX / (111320 * Math.cos(lat * Math.PI / 180)));
  
  console.log(`SIMPLE result: lat=${lat}, lng=${lng}`);
  return { lat, lng };
};

export const detectCoordinateSystem = (coordinates: number[][]): string => {
  if (!coordinates || coordinates.length === 0) return 'EPSG:4326';
  
  const firstCoord = coordinates[0];
  if (!firstCoord || firstCoord.length < 2) return 'EPSG:4326';
  
  const x = Math.abs(firstCoord[0]);
  const y = Math.abs(firstCoord[1]);
  
  console.log(`COORDINATE DETECTION for: (${firstCoord[0]}, ${firstCoord[1]})`);
  console.log(`Absolute values: x=${x}, y=${y}`);
  
  // Check if already in WGS84
  if (x <= 180 && y <= 90) {
    console.log('Detected WGS84 (EPSG:4326) - coordinates in lat/lng range');
    return 'EPSG:4326';
  }
  
  // Spanish UTM zones detection with enhanced logic
  if (x >= 100000 && x <= 900000 && y >= 4000000 && y <= 5000000) {
    console.log('Coordinates in Spanish UTM range');
    // More precise zone detection based on X coordinate
    if (x >= 166021 && x <= 534994) {
      console.log('Detected UTM Zone 29N (EPSG:25829) based on X range');
      return 'EPSG:25829';
    }
    if (x >= 166021 && x <= 833978) {
      console.log('Detected UTM Zone 30N (EPSG:25830) based on X range');
      return 'EPSG:25830';
    }
    if (x >= 166021 && x <= 833978) {
      console.log('Detected UTM Zone 31N (EPSG:25831) based on X range');
      return 'EPSG:25831';
    }
    
    // Default to Zone 30N if in Spanish range but unclear
    console.log('Defaulting to UTM Zone 30N for Spanish coordinates');
    return 'EPSG:25830';
  }
  
  console.log('No clear coordinate system detected, defaulting to EPSG:4326');
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
  
  // Try both conversion methods for debugging
  if (fromEPSG.includes('25830') && toEPSG === 'EPSG:4326') {
    console.log('Using UTM Zone 30N conversion');
    transformedCoords = coordinates.map(([x, y]) => {
      const precise = convertUTMToWGS84(x, y, 30);
      const simple = convertUTMToWGS84Simple(x, y, 30);
      console.log(`Coord (${x}, ${y}) -> Precise: (${precise.lat}, ${precise.lng}), Simple: (${simple.lat}, ${simple.lng})`);
      return precise; // Use precise conversion
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
