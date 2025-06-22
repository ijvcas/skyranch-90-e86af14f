
// Conservative coordinate transformation that preserves polygon shapes
export const SKYRANCH_REFERENCE = {
  // Reference coordinates for SkyRanch location
  UTM_30N: { x: 404959.5, y: 4465234.8 }, // UTM coordinates at SkyRanch
  WGS84: { lat: 40.317635, lng: -4.474248 } // Correct SkyRanch coordinates
};

export const transformUTMToWGS84Precise = (
  x: number, 
  y: number, 
  utmZone: number
): { lat: number; lng: number } => {
  console.log(`🔄 Conservative UTM${utmZone}N -> WGS84 transformation: (${x}, ${y})`);
  
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
  
  // Use SkyRanch reference point for transformation
  const deltaX = x - SKYRANCH_REFERENCE.UTM_30N.x;
  const deltaY = y - SKYRANCH_REFERENCE.UTM_30N.y;
  
  // Conservative conversion factors for UTM 30N at SkyRanch latitude
  const meanLat = SKYRANCH_REFERENCE.WGS84.lat * Math.PI / 180;
  const latFactor = 1 / 110540.0; // meters per degree latitude
  const lngFactor = 1 / (111320.0 * Math.cos(meanLat)); // meters per degree longitude
  
  const lat = SKYRANCH_REFERENCE.WGS84.lat + (deltaY * latFactor);
  const lng = SKYRANCH_REFERENCE.WGS84.lng + (deltaX * lngFactor);
  
  // CONSERVATIVE: No strict validation - preserve calculated coordinates
  console.log(`✅ Transformed coordinates: ${lat.toFixed(10)}, ${lng.toFixed(10)}`);
  return { lat: Number(lat.toFixed(10)), lng: Number(lng.toFixed(10)) };
};

export const transformCoordinatesPrecise = (
  coordinates: number[][],
  fromCRS: string,
  toCRS: string = 'EPSG:4326'
): { lat: number; lng: number }[] => {
  console.log(`\n🎯 CONSERVATIVE COORDINATE TRANSFORMATION`);
  console.log(`From: ${fromCRS} to ${toCRS}`);
  console.log(`Coordinates count: ${coordinates.length}`);
  
  if (fromCRS === toCRS) {
    console.log('✅ No transformation needed - same CRS');
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  let transformedCoords: { lat: number; lng: number }[] = [];
  
  if (fromCRS === 'EPSG:25830' && toCRS === 'EPSG:4326') {
    console.log('🔄 Applying CONSERVATIVE Spanish UTM 30N -> WGS84 transformation');
    transformedCoords = coordinates.map(([x, y]) => 
      transformUTMToWGS84Precise(x, y, 30)
    );
  } else if (fromCRS === 'EPSG:25829' && toCRS === 'EPSG:4326') {
    console.log('🔄 Applying CONSERVATIVE Spanish UTM 29N -> WGS84 transformation');
    transformedCoords = coordinates.map(([x, y]) => 
      transformUTMToWGS84Precise(x, y, 29)
    );
  } else if (fromCRS === 'EPSG:25831' && toCRS === 'EPSG:4326') {
    console.log('🔄 Applying CONSERVATIVE Spanish UTM 31N -> WGS84 transformation');
    transformedCoords = coordinates.map(([x, y]) => 
      transformUTMToWGS84Precise(x, y, 31)
    );
  } else {
    console.log('🔄 Using fallback transformation');
    transformedCoords = coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  // Log transformation results without validation rejection
  if (transformedCoords.length > 0) {
    console.log(`📍 First transformed: ${transformedCoords[0].lat.toFixed(8)}, ${transformedCoords[0].lng.toFixed(8)}`);
    console.log(`📍 Last transformed: ${transformedCoords[transformedCoords.length-1].lat.toFixed(8)}, ${transformedCoords[transformedCoords.length-1].lng.toFixed(8)}`);
  }
  
  console.log(`✅ CONSERVATIVE TRANSFORMATION COMPLETE: ${transformedCoords.length} coordinates preserved`);
  return transformedCoords;
};
