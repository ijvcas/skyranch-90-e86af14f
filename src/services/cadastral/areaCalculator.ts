
// Calculate area from boundary coordinates using Google Maps geometry
export const calculateParcelArea = (boundaryCoordinates: { lat: number; lng: number }[]): number => {
  if (!window.google?.maps?.geometry || boundaryCoordinates.length < 3) {
    console.warn('Google Maps geometry not available or insufficient coordinates');
    return 0;
  }

  try {
    const path = boundaryCoordinates.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
    const area = google.maps.geometry.spherical.computeArea(path);
    // Convert from square meters to hectares (1 hectare = 10,000 square meters)
    const areaHectares = area / 10000;
    console.log(`📐 Calculated area: ${areaHectares.toFixed(4)} hectares`);
    return areaHectares;
  } catch (error) {
    console.error('Error calculating area:', error);
    return 0;
  }
};
