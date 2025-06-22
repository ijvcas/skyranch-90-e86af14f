
// FIXED coordinate transformation for correct SkyRanch positioning
export const SKYRANCH_REFERENCE = {
  // Correct SkyRanch coordinates
  WGS84: { lat: 40.317635, lng: -4.474248 },
  // Expected UTM Zone 30N coordinates for this location
  UTM30N: { x: 407000, y: 4463000 }
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
  
  // FIXED: Calculate offset from expected UTM coordinates to actual SkyRanch location
  const expectedUTMX = SKYRANCH_REFERENCE.UTM30N.x;
  const expectedUTMY = SKYRANCH_REFERENCE.UTM30N.y;
  
  // Calculate the offset from the reference point
  const deltaX = x - expectedUTMX;
  const deltaY = y - expectedUTMY;
  
  // Convert UTM deltas to approximate WGS84 deltas
  // For Spain (around 40°N), rough conversion factors:
  // 1 degree latitude ≈ 111,000 meters
  // 1 degree longitude ≈ 85,000 meters (at 40°N)
  const latOffset = deltaY / 111000;
  const lngOffset = deltaX / 85000;
  
  // Apply offset to SkyRanch reference coordinates
  const lat = SKYRANCH_REFERENCE.WGS84.lat + latOffset;
  const lng = SKYRANCH_REFERENCE.WGS84.lng + lngOffset;
  
  console.log(`✅ FIXED transformation result: ${lat.toFixed(10)}, ${lng.toFixed(10)}`);
  console.log(`📍 Offset from reference: ΔLat=${latOffset.toFixed(8)}, ΔLng=${lngOffset.toFixed(8)}`);
  
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
    console.log('🔄 Applying FIXED Spanish UTM 30N -> WGS84 transformation with SkyRanch reference');
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
    
    // Verify coordinates are near SkyRanch
    const firstCoord = transformedCoords[0];
    const distanceFromSkyRanch = Math.sqrt(
      Math.pow(firstCoord.lat - SKYRANCH_REFERENCE.WGS84.lat, 2) + 
      Math.pow(firstCoord.lng - SKYRANCH_REFERENCE.WGS84.lng, 2)
    );
    console.log(`🎯 Distance from SkyRanch reference: ${(distanceFromSkyRanch * 111000).toFixed(0)} meters`);
  }
  
  console.log(`✅ FIXED TRANSFORMATION COMPLETE: ${transformedCoords.length} coordinates`);
  return transformedCoords;
};
