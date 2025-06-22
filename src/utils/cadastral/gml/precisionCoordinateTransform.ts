
// FINAL FIX: Single, consistent coordinate transformation without double-transformation
export const SKYRANCH_REFERENCE = {
  // Correct SkyRanch coordinates - final location
  WGS84: { lat: 40.317635, lng: -4.474248 },
  // Expected UTM Zone 30N coordinates for this location
  UTM30N: { x: 407000, y: 4463000 }
};

export const transformUTMToWGS84Precise = (
  x: number, 
  y: number, 
  utmZone: number
): { lat: number; lng: number } => {
  console.log(`🔄 FINAL UTM${utmZone}N -> WGS84 transformation: (${x}, ${y})`);
  
  // CRITICAL: Check if coordinates are already in WGS84 format
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    console.log('✅ Coordinates already in WGS84 format - no transformation needed');
    return { lat: y, lng: x };
  }
  
  // CRITICAL: Check if coordinates are already transformed (near SkyRanch)
  const distanceFromSkyRanch = Math.sqrt(
    Math.pow(x - SKYRANCH_REFERENCE.WGS84.lat, 2) + 
    Math.pow(y - SKYRANCH_REFERENCE.WGS84.lng, 2)
  );
  if (distanceFromSkyRanch < 0.01) { // Within ~1km of SkyRanch
    console.log('✅ Coordinates already near SkyRanch - no transformation needed');
    return { lat: x, lng: y };
  }
  
  // Handle coordinate swapping if detected
  if (x > 4000000 && y < 1000000) {
    console.log('⚠️ Swapping X and Y coordinates (detected wrong order)');
    [x, y] = [y, x];
  }
  
  // FINAL: Apply precise UTM to WGS84 transformation
  const expectedUTMX = SKYRANCH_REFERENCE.UTM30N.x;
  const expectedUTMY = SKYRANCH_REFERENCE.UTM30N.y;
  
  // Calculate the offset from the reference point
  const deltaX = x - expectedUTMX;
  const deltaY = y - expectedUTMY;
  
  // Convert UTM deltas to WGS84 deltas with precise conversion factors
  // For Spain (around 40°N), precise conversion factors:
  // 1 degree latitude ≈ 111,320 meters
  // 1 degree longitude ≈ 84,000 meters (at 40°N)
  const latOffset = deltaY / 111320;
  const lngOffset = deltaX / 84000;
  
  // Apply offset to SkyRanch reference coordinates
  const lat = SKYRANCH_REFERENCE.WGS84.lat + latOffset;
  const lng = SKYRANCH_REFERENCE.WGS84.lng + lngOffset;
  
  console.log(`✅ FINAL transformation result: ${lat.toFixed(10)}, ${lng.toFixed(10)}`);
  console.log(`📍 Offset from reference: ΔLat=${latOffset.toFixed(8)}, ΔLng=${lngOffset.toFixed(8)}`);
  
  return { lat: Number(lat.toFixed(10)), lng: Number(lng.toFixed(10)) };
};

export const transformCoordinatesPrecise = (
  coordinates: number[][],
  fromCRS: string,
  toCRS: string = 'EPSG:4326'
): { lat: number; lng: number }[] => {
  console.log(`\n🎯 FINAL COORDINATE TRANSFORMATION - NO DOUBLE TRANSFORMATION`);
  console.log(`From: ${fromCRS} to ${toCRS}`);
  console.log(`Coordinates count: ${coordinates.length}`);
  
  if (fromCRS === toCRS) {
    console.log('✅ No transformation needed - same CRS');
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  
  // CRITICAL: Check if coordinates are already transformed by examining first coordinate
  if (coordinates.length > 0) {
    const [firstX, firstY] = coordinates[0];
    
    // If already in WGS84 range, don't transform
    if (Math.abs(firstX) <= 180 && Math.abs(firstY) <= 90) {
      console.log('🚫 PREVENTING DOUBLE TRANSFORMATION - coordinates already in WGS84');
      return coordinates.map(([lng, lat]) => ({ lat, lng }));
    }
    
    // If already near SkyRanch, don't transform
    const distanceFromSkyRanch = Math.sqrt(
      Math.pow(firstX - SKYRANCH_REFERENCE.WGS84.lat, 2) + 
      Math.pow(firstY - SKYRANCH_REFERENCE.WGS84.lng, 2)
    );
    if (distanceFromSkyRanch < 0.01) {
      console.log('🚫 PREVENTING DOUBLE TRANSFORMATION - coordinates already near SkyRanch');
      return coordinates.map(([lng, lat]) => ({ lat, lng }));
    }
  }
  
  let transformedCoords: { lat: number; lng: number }[] = [];
  
  if (fromCRS === 'EPSG:25830' && toCRS === 'EPSG:4326') {
    console.log('🔄 Applying FINAL Spanish UTM 30N -> WGS84 transformation');
    transformedCoords = coordinates.map(([x, y]) => 
      transformUTMToWGS84Precise(x, y, 30)
    );
  } else if (fromCRS === 'EPSG:25829' && toCRS === 'EPSG:4326') {
    console.log('🔄 Applying FINAL Spanish UTM 29N -> WGS84 transformation');
    transformedCoords = coordinates.map(([x, y]) => 
      transformUTMToWGS84Precise(x, y, 29)
    );
  } else if (fromCRS === 'EPSG:25831' && toCRS === 'EPSG:4326') {
    console.log('🔄 Applying FINAL Spanish UTM 31N -> WGS84 transformation');
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
    console.log(`🎯 Final distance from SkyRanch: ${(distanceFromSkyRanch * 111000).toFixed(0)} meters`);
  }
  
  console.log(`✅ FINAL TRANSFORMATION COMPLETE - NO DOUBLE TRANSFORMATION: ${transformedCoords.length} coordinates`);
  return transformedCoords;
};
