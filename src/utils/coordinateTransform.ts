
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

// More accurate UTM to WGS84 conversion for Spanish zones
export const convertUTMToWGS84 = (x: number, y: number, zone: number): { lat: number; lng: number } => {
  // Constants for WGS84 ellipsoid
  const a = 6378137.0; // Semi-major axis
  const f = 1/298.257223563; // Flattening
  const k0 = 0.9996; // Scale factor
  const e = Math.sqrt(2*f - f*f); // First eccentricity
  const e1sq = e*e / (1-e*e); // Second eccentricity squared
  
  // Remove false easting
  const x1 = x - 500000.0;
  
  // Calculate longitude
  const centralMeridian = (zone - 1) * 6 - 180 + 3;
  
  // More accurate latitude calculation
  const M = y / k0;
  const mu = M / (a * (1 - e*e/4 - 3*e*e*e*e/64 - 5*e*e*e*e*e*e/256));
  
  const e1 = (1 - Math.sqrt(1 - e*e)) / (1 + Math.sqrt(1 - e*e));
  const J1 = 3*e1/2 - 27*e1*e1*e1/32;
  const J2 = 21*e1*e1/16 - 55*e1*e1*e1*e1/32;
  const J3 = 151*e1*e1*e1/96;
  const J4 = 1097*e1*e1*e1*e1/512;
  
  const fp = mu + J1*Math.sin(2*mu) + J2*Math.sin(4*mu) + J3*Math.sin(6*mu) + J4*Math.sin(8*mu);
  
  const C1 = e1sq * Math.cos(fp) * Math.cos(fp);
  const T1 = Math.tan(fp) * Math.tan(fp);
  const R1 = a * (1 - e*e) / Math.pow(1 - e*e * Math.sin(fp) * Math.sin(fp), 1.5);
  const N1 = a / Math.sqrt(1 - e*e * Math.sin(fp) * Math.sin(fp));
  const D = x1 / (N1 * k0);
  
  const Q1 = N1 * Math.tan(fp) / R1;
  const Q2 = D*D / 2;
  const Q3 = (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*e1sq) * D*D*D*D / 24;
  const Q4 = (61 + 90*T1 + 298*C1 + 45*T1*T1 - 1.6*e1sq - 3*C1*C1) * D*D*D*D*D*D / 720;
  
  const lat = fp - Q1 * (Q2 - Q3 + Q4);
  
  const Q5 = D;
  const Q6 = (1 + 2*T1 + C1) * D*D*D / 6;
  const Q7 = (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*e1sq + 24*T1*T1) * D*D*D*D*D / 120;
  
  const lng = centralMeridian + (Q5 - Q6 + Q7) / Math.cos(fp);
  
  // Convert from radians to degrees
  const latDeg = lat * 180 / Math.PI;
  const lngDeg = lng * 180 / Math.PI;
  
  console.log(`Enhanced UTM conversion Zone ${zone}: (${x}, ${y}) -> (${latDeg}, ${lngDeg})`);
  
  return { lat: latDeg, lng: lngDeg };
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
  
  if (fromEPSG === toEPSG) {
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  // Handle UTM to WGS84 conversion with enhanced accuracy
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
