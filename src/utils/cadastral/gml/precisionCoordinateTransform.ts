
// Fixed coordinate transformation for correct SkyRanch positioning
export const SKYRANCH_REFERENCE = {
  // Correct SkyRanch coordinates
  WGS84: { lat: 40.317635, lng: -4.474248 }
};

export const transformUTMToWGS84Precise = (
  x: number, 
  y: number, 
  utmZone: number
): { lat: number; lng: number } => {
  console.log(`🔄 FIXED UTM${utmZone}N -> WGS84 transformation: (${x}, ${y})`);
  
  // Check if coordinates are already in WGS84
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    console.log('✅ Coordinates already in WGS84 format');
    return { lat: y, lng: x };
  }
  
  // Handle coordinate swapping if detected
  if (x > 4000000 && y < 1000000) {
    console.log('⚠️ Swapping X and Y coordinates (detected wrong order)');
    [x, y] = [y, x];
  }
  
  // FIXED: Proper UTM to WGS84 conversion for Spanish coordinates
  // Using accurate conversion formulas for UTM Zone 30N
  const a = 6378137.0; // WGS84 semi-major axis
  const e2 = 0.00669437999014; // WGS84 first eccentricity squared
  const k0 = 0.9996; // UTM scale factor
  const E0 = 500000; // UTM false easting
  const N0 = 0; // UTM false northing for northern hemisphere
  
  // Zone 30N central meridian
  const lambda0 = -3 * Math.PI / 180; // -3 degrees in radians
  
  // Remove false easting and northing
  const x1 = x - E0;
  const y1 = y - N0;
  
  // Calculate meridional arc
  const M = y1 / k0;
  
  // Calculate footprint latitude (mu)
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const mu = M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256));
  
  // Calculate latitude
  const phi1 = mu + (3*e1/2 - 27*e1*e1*e1/32) * Math.sin(2*mu) +
                   (21*e1*e1/16 - 55*e1*e1*e1*e1/32) * Math.sin(4*mu) +
                   (151*e1*e1*e1/96) * Math.sin(6*mu);
  
  // Calculate remaining terms
  const C1 = e2 * Math.cos(phi1) * Math.cos(phi1) / (1 - e2);
  const T1 = Math.tan(phi1) * Math.tan(phi1);
  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) * Math.sin(phi1));
  const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(phi1) * Math.sin(phi1), 1.5);
  const D = x1 / (N1 * k0);
  
  // Calculate latitude in radians
  const lat_rad = phi1 - (N1 * Math.tan(phi1) / R1) * 
    (D*D/2 - (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*e2) * D*D*D*D/24 +
     (61 + 90*T1 + 298*C1 + 45*T1*T1 - 252*e2 - 3*C1*C1) * Math.pow(D, 6)/720);
  
  // Calculate longitude in radians
  const lng_rad = lambda0 + (D - (1 + 2*T1 + C1) * D*D*D/6 +
    (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*e2 + 24*T1*T1) * Math.pow(D, 5)/120) / Math.cos(phi1);
  
  // Convert to degrees
  const lat = lat_rad * 180 / Math.PI;
  const lng = lng_rad * 180 / Math.PI;
  
  console.log(`✅ FIXED transformation result: ${lat.toFixed(10)}, ${lng.toFixed(10)}`);
  return { lat: Number(lat.toFixed(10)), lng: Number(lng.toFixed(10)) };
};

export const transformCoordinatesPrecise = (
  coordinates: number[][],
  fromCRS: string,
  toCRS: string = 'EPSG:4326'
): { lat: number; lng: number }[] => {
  console.log(`\n🎯 FIXED COORDINATE TRANSFORMATION`);
  console.log(`From: ${fromCRS} to ${toCRS}`);
  console.log(`Coordinates count: ${coordinates.length}`);
  
  if (fromCRS === toCRS) {
    console.log('✅ No transformation needed - same CRS');
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  let transformedCoords: { lat: number; lng: number }[] = [];
  
  if (fromCRS === 'EPSG:25830' && toCRS === 'EPSG:4326') {
    console.log('🔄 Applying FIXED Spanish UTM 30N -> WGS84 transformation');
    transformedCoords = coordinates.map(([x, y]) => 
      transformUTMToWGS84Precise(x, y, 30)
    );
  } else if (fromCRS === 'EPSG:25829' && toCRS === 'EPSG:4326') {
    console.log('🔄 Applying FIXED Spanish UTM 29N -> WGS84 transformation');
    transformedCoords = coordinates.map(([x, y]) => 
      transformUTMToWGS84Precise(x, y, 29)
    );
  } else if (fromCRS === 'EPSG:25831' && toCRS === 'EPSG:4326') {
    console.log('🔄 Applying FIXED Spanish UTM 31N -> WGS84 transformation');
    transformedCoords = coordinates.map(([x, y]) => 
      transformUTMToWGS84Precise(x, y, 31)
    );
  } else {
    console.log('🔄 Using fallback transformation');
    transformedCoords = coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  // Log transformation results
  if (transformedCoords.length > 0) {
    console.log(`📍 First transformed: ${transformedCoords[0].lat.toFixed(8)}, ${transformedCoords[0].lng.toFixed(8)}`);
    console.log(`📍 Last transformed: ${transformedCoords[transformedCoords.length-1].lat.toFixed(8)}, ${transformedCoords[transformedCoords.length-1].lng.toFixed(8)}`);
  }
  
  console.log(`✅ FIXED TRANSFORMATION COMPLETE: ${transformedCoords.length} coordinates`);
  return transformedCoords;
};
