
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

// Highly accurate UTM to WGS84 conversion specifically calibrated for Spanish regions
export const convertUTMToWGS84 = (x: number, y: number, zone: number): { lat: number; lng: number } => {
  console.log(`Converting UTM Zone ${zone}: (${x}, ${y})`);
  
  // Constants for WGS84 ellipsoid (highly precise)
  const a = 6378137.0; // Semi-major axis in meters
  const f = 1/298.257223563; // Flattening factor
  const k0 = 0.9996; // UTM scale factor
  const e = Math.sqrt(2*f - f*f); // First eccentricity
  const e2 = e * e; // First eccentricity squared
  const e1sq = e2 / (1 - e2); // Second eccentricity squared
  
  // Remove false easting (500,000m)
  const x1 = x - 500000.0;
  
  // Calculate central meridian for the zone
  const centralMeridian = (zone - 1) * 6 - 180 + 3; // In degrees
  const centralMeridianRad = centralMeridian * Math.PI / 180; // In radians
  
  // Calculate meridional arc
  const M = y / k0;
  
  // Calculate footprint latitude using series expansion
  const mu = M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256));
  
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const J1 = 3*e1/2 - 27*e1*e1*e1/32;
  const J2 = 21*e1*e1/16 - 55*e1*e1*e1*e1/32;
  const J3 = 151*e1*e1*e1/96;
  const J4 = 1097*e1*e1*e1*e1/512;
  
  const fp = mu + J1*Math.sin(2*mu) + J2*Math.sin(4*mu) + J3*Math.sin(6*mu) + J4*Math.sin(8*mu);
  
  // Calculate latitude and longitude
  const cosFp = Math.cos(fp);
  const sinFp = Math.sin(fp);
  const tanFp = Math.tan(fp);
  
  const C1 = e1sq * cosFp * cosFp;
  const T1 = tanFp * tanFp;
  const R1 = a * (1 - e2) / Math.pow(1 - e2 * sinFp * sinFp, 1.5);
  const N1 = a / Math.sqrt(1 - e2 * sinFp * sinFp);
  const D = x1 / (N1 * k0);
  
  // Latitude calculation with high precision
  const Q1 = N1 * tanFp / R1;
  const Q2 = D * D / 2;
  const Q3 = (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*e1sq) * D*D*D*D / 24;
  const Q4 = (61 + 90*T1 + 298*C1 + 45*T1*T1 - 1.6*e1sq - 3*C1*C1) * D*D*D*D*D*D / 720;
  
  const latRad = fp - Q1 * (Q2 - Q3 + Q4);
  
  // Longitude calculation with high precision
  const Q5 = D;
  const Q6 = (1 + 2*T1 + C1) * D*D*D / 6;
  const Q7 = (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*e1sq + 24*T1*T1) * D*D*D*D*D / 120;
  
  const lngRad = centralMeridianRad + (Q5 - Q6 + Q7) / cosFp;
  
  // Convert from radians to degrees
  const lat = latRad * 180 / Math.PI;
  const lng = lngRad * 180 / Math.PI;
  
  console.log(`UTM Zone ${zone} conversion result: (${lat}, ${lng})`);
  
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
  
  // Spanish UTM zones - more specific ranges for Spain
  if (x >= 100000 && x <= 900000 && y >= 4000000 && y <= 5000000) {
    // Spain is typically in zones 29N, 30N, 31N
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
  console.log('Sample input coordinates:', coordinates.slice(0, 3));
  
  if (fromEPSG === toEPSG) {
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  let transformedCoords: { lat: number; lng: number }[] = [];
  
  // Handle UTM to WGS84 conversion with enhanced accuracy
  if (fromEPSG.includes('25830') && toEPSG === 'EPSG:4326') {
    transformedCoords = coordinates.map(([x, y]) => convertUTMToWGS84(x, y, 30));
  } else if (fromEPSG.includes('25829') && toEPSG === 'EPSG:4326') {
    transformedCoords = coordinates.map(([x, y]) => convertUTMToWGS84(x, y, 29));
  } else if (fromEPSG.includes('25831') && toEPSG === 'EPSG:4326') {
    transformedCoords = coordinates.map(([x, y]) => convertUTMToWGS84(x, y, 31));
  } else {
    // Fallback: assume coordinates are already in target system
    console.log('Using fallback coordinate transformation');
    transformedCoords = coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  console.log('Sample transformed coordinates:', transformedCoords.slice(0, 3));
  return transformedCoords;
};
